/**
 * Excel Service - Exportación de datos a Excel
 * Usa ExcelJS (alternativa segura a xlsx/SheetJS)
 */
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

/**
 * Exporta la simulación completa a un archivo Excel
 * @param {Object} simulation - Objeto de simulación con todos los datos
 */
export const exportSimulationToExcel = async (simulation) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Urbania360';
    workbook.created = new Date();

    // --- Hoja 1: Resumen de la Simulación ---
    const summarySheet = workbook.addWorksheet('Resumen');
    
    // Configurar ancho de columnas
    summarySheet.columns = [
        { width: 35 },
        { width: 25 }
    ];

    // Título
    summarySheet.addRow(['RESUMEN DE SIMULACIÓN HIPOTECARIA']);
    summarySheet.getRow(1).font = { bold: true, size: 14 };
    summarySheet.mergeCells('A1:B1');
    summarySheet.addRow([]);

    // Información General
    addSectionHeader(summarySheet, 'Información General');
    addDataRow(summarySheet, 'Cliente', simulation.clientName || '-');
    addDataRow(summarySheet, 'Propiedad', simulation.propertyTitle || '-');
    addDataRow(summarySheet, 'Banco', simulation.bank?.name || 'Tasa manual');
    addDataRow(summarySheet, 'Fecha de Creación', simulation.createdAtUtc ? new Date(simulation.createdAtUtc).toLocaleDateString('es-PE') : '-');
    summarySheet.addRow([]);

    // Datos del Crédito
    addSectionHeader(summarySheet, 'Datos del Crédito');
    addDataRow(summarySheet, 'Monto Principal', formatCurrency(simulation.principal, simulation.currency));
    addDataRow(summarySheet, 'Moneda', simulation.currency === 1 ? 'Soles (PEN)' : 'Dólares (USD)');
    addDataRow(summarySheet, 'Tipo de Tasa', simulation.rateType === 1 ? 'TEA' : 'TNA');
    addDataRow(summarySheet, 'TEA', simulation.tea ? formatPercent(simulation.tea) : '-');
    addDataRow(summarySheet, 'TNA', simulation.tna ? formatPercent(simulation.tna) : '-');
    addDataRow(summarySheet, 'Capitalización/Año', simulation.capitalizationPerYear || '-');
    addDataRow(summarySheet, 'Plazo (meses)', simulation.termMonths);
    addDataRow(summarySheet, 'Fecha de Inicio', simulation.startDate || '-');
    summarySheet.addRow([]);

    // Período de Gracia
    addSectionHeader(summarySheet, 'Período de Gracia');
    addDataRow(summarySheet, 'Tipo de Gracia', getGraceTypeName(simulation.graceType));
    addDataRow(summarySheet, 'Meses de Gracia', simulation.graceMonths || 0);
    summarySheet.addRow([]);

    // Bono MiVivienda
    addSectionHeader(summarySheet, 'Bono MiVivienda');
    addDataRow(summarySheet, 'Aplica Bono', simulation.applyMiViviendaBonus ? 'Sí' : 'No');
    addDataRow(summarySheet, 'Monto del Bono', simulation.applyMiViviendaBonus ? formatCurrency(simulation.bonusAmount, simulation.currency) : '-');
    summarySheet.addRow([]);

    // Seguros y Comisiones
    addSectionHeader(summarySheet, 'Seguros y Comisiones');
    addDataRow(summarySheet, 'Seguro Desgravamen (mensual)', formatPercent(simulation.lifeInsuranceRateMonthly));
    addDataRow(summarySheet, 'Seguro Inmueble (anual)', formatPercent(simulation.riskInsuranceRateAnnual));
    addDataRow(summarySheet, 'Comisiones Mensuales', formatCurrency(simulation.feesMonthly, simulation.currency));
    summarySheet.addRow([]);

    // Resultados
    addSectionHeader(summarySheet, 'Resultados');
    addDataRow(summarySheet, 'TEM (Tasa Efectiva Mensual)', formatPercent(simulation.tem));
    addDataRow(summarySheet, 'Cuota Mensual', formatCurrency(simulation.monthlyPayment, simulation.currency));
    addDataRow(summarySheet, 'TCEA', formatPercent(simulation.tcea));
    addDataRow(summarySheet, 'VAN', formatCurrency(simulation.van, simulation.currency));
    addDataRow(summarySheet, 'TIR', formatPercent(simulation.tir));
    addDataRow(summarySheet, 'Intereses Totales', formatCurrency(simulation.totalInterest, simulation.currency));
    addDataRow(summarySheet, 'Costo Total', formatCurrency(simulation.totalCost, simulation.currency));

    // --- Hoja 2: Tabla de Amortización ---
    if (simulation.amortizationSchedule && simulation.amortizationSchedule.length > 0) {
        const amortSheet = workbook.addWorksheet('Cronograma');
        
        // Configurar columnas
        amortSheet.columns = [
            { header: 'Período', key: 'period', width: 10 },
            { header: 'Fecha Vencimiento', key: 'dueDate', width: 16 },
            { header: 'Saldo Inicial', key: 'openingBalance', width: 15 },
            { header: 'Interés', key: 'interest', width: 12 },
            { header: 'Amortización', key: 'principal', width: 14 },
            { header: 'Cuota', key: 'installment', width: 12 },
            { header: 'Seguro Desgravamen', key: 'lifeInsurance', width: 17 },
            { header: 'Seguro Inmueble', key: 'riskInsurance', width: 15 },
            { header: 'Comisiones', key: 'fees', width: 12 },
            { header: 'Saldo Final', key: 'closingBalance', width: 15 }
        ];

        // Estilo del header
        const headerRow = amortSheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF377FBD' }
        };
        headerRow.alignment = { horizontal: 'center' };

        // Agregar datos
        simulation.amortizationSchedule.forEach(item => {
            amortSheet.addRow({
                period: item.period,
                dueDate: item.dueDate ? new Date(item.dueDate).toLocaleDateString('es-PE') : '-',
                openingBalance: roundNumber(item.openingBalance),
                interest: roundNumber(item.interest),
                principal: roundNumber(item.principal),
                installment: roundNumber(item.installment),
                lifeInsurance: roundNumber(item.lifeInsurance),
                riskInsurance: roundNumber(item.riskInsurance),
                fees: roundNumber(item.fees),
                closingBalance: roundNumber(item.closingBalance)
            });
        });

        // Agregar fila de totales
        const totals = calculateTotals(simulation.amortizationSchedule);
        amortSheet.addRow({});
        const totalsRow = amortSheet.addRow({
            period: 'TOTALES',
            dueDate: '',
            openingBalance: '',
            interest: roundNumber(totals.totalInterest),
            principal: roundNumber(totals.totalPrincipal),
            installment: roundNumber(totals.totalInstallment),
            lifeInsurance: roundNumber(totals.totalLifeInsurance),
            riskInsurance: roundNumber(totals.totalRiskInsurance),
            fees: roundNumber(totals.totalFees),
            closingBalance: ''
        });
        totalsRow.font = { bold: true };
        totalsRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF0F9FF' }
        };

        // Aplicar bordes a todas las celdas de datos
        amortSheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            }
        });
    }

    // Generar nombre del archivo
    const clientName = (simulation.clientName || 'simulacion').replace(/[^a-zA-Z0-9]/g, '_');
    const date = new Date().toISOString().split('T')[0];
    const fileName = `Simulacion_${clientName}_${date}.xlsx`;

    // Generar buffer y descargar
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    saveAs(blob, fileName);
};

/**
 * Agrega una cabecera de sección
 */
const addSectionHeader = (sheet, text) => {
    const row = sheet.addRow([text]);
    row.font = { bold: true, color: { argb: 'FF0369A1' } };
};

/**
 * Agrega una fila de datos (label: value)
 */
const addDataRow = (sheet, label, value) => {
    sheet.addRow([label, value]);
};

/**
 * Calcula totales de la tabla de amortización
 */
const calculateTotals = (schedule) => {
    return schedule.reduce((acc, item) => ({
        totalInterest: acc.totalInterest + (item.interest || 0),
        totalPrincipal: acc.totalPrincipal + (item.principal || 0),
        totalInstallment: acc.totalInstallment + (item.installment || 0),
        totalLifeInsurance: acc.totalLifeInsurance + (item.lifeInsurance || 0),
        totalRiskInsurance: acc.totalRiskInsurance + (item.riskInsurance || 0),
        totalFees: acc.totalFees + (item.fees || 0),
    }), {
        totalInterest: 0,
        totalPrincipal: 0,
        totalInstallment: 0,
        totalLifeInsurance: 0,
        totalRiskInsurance: 0,
        totalFees: 0,
    });
};

/**
 * Formatea un número como moneda
 */
const formatCurrency = (value, currency) => {
    if (value === null || value === undefined) return '-';
    const symbol = currency === 1 ? 'S/' : '$';
    return `${symbol} ${roundNumber(value).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Formatea un número como porcentaje
 */
const formatPercent = (value) => {
    if (value === null || value === undefined) return '-';
    // Si el valor es menor a 1, asumimos que está en decimal
    const percent = value < 1 ? value * 100 : value;
    return `${percent.toFixed(4)}%`;
};

/**
 * Redondea un número a 2 decimales
 */
const roundNumber = (value) => {
    if (value === null || value === undefined) return 0;
    return Math.round(value * 100) / 100;
};

/**
 * Obtiene el nombre del tipo de gracia
 */
const getGraceTypeName = (type) => {
    const types = { 0: 'Sin Gracia', 1: 'Parcial', 2: 'Total' };
    return types[type] || '-';
};

export default {
    exportSimulationToExcel
};
