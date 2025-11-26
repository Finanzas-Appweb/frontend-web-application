/**
 * Excel Service - Exportación de datos a Excel
 * Usa la librería SheetJS (xlsx)
 */
import * as XLSX from 'xlsx';

/**
 * Exporta la simulación completa a un archivo Excel
 * @param {Object} simulation - Objeto de simulación con todos los datos
 */
export const exportSimulationToExcel = (simulation) => {
    const workbook = XLSX.utils.book_new();

    // --- Hoja 1: Resumen de la Simulación ---
    const summaryData = [
        ['RESUMEN DE SIMULACIÓN HIPOTECARIA'],
        [''],
        ['Información General'],
        ['Cliente', simulation.clientName || '-'],
        ['Propiedad', simulation.propertyTitle || '-'],
        ['Banco', simulation.bank?.name || 'Tasa manual'],
        ['Fecha de Creación', simulation.createdAtUtc ? new Date(simulation.createdAtUtc).toLocaleDateString('es-PE') : '-'],
        [''],
        ['Datos del Crédito'],
        ['Monto Principal', formatCurrency(simulation.principal, simulation.currency)],
        ['Moneda', simulation.currency === 1 ? 'Soles (PEN)' : 'Dólares (USD)'],
        ['Tipo de Tasa', simulation.rateType === 1 ? 'TEA' : 'TNA'],
        ['TEA', simulation.tea ? formatPercent(simulation.tea) : '-'],
        ['TNA', simulation.tna ? formatPercent(simulation.tna) : '-'],
        ['Capitalización/Año', simulation.capitalizationPerYear || '-'],
        ['Plazo (meses)', simulation.termMonths],
        ['Fecha de Inicio', simulation.startDate || '-'],
        [''],
        ['Período de Gracia'],
        ['Tipo de Gracia', getGraceTypeName(simulation.graceType)],
        ['Meses de Gracia', simulation.graceMonths || 0],
        [''],
        ['Bono MiVivienda'],
        ['Aplica Bono', simulation.applyMiViviendaBonus ? 'Sí' : 'No'],
        ['Monto del Bono', simulation.applyMiViviendaBonus ? formatCurrency(simulation.bonusAmount, simulation.currency) : '-'],
        [''],
        ['Seguros y Comisiones'],
        ['Seguro Desgravamen (mensual)', formatPercent(simulation.lifeInsuranceRateMonthly)],
        ['Seguro Inmueble (anual)', formatPercent(simulation.riskInsuranceRateAnnual)],
        ['Comisiones Mensuales', formatCurrency(simulation.feesMonthly, simulation.currency)],
        [''],
        ['Resultados'],
        ['TEM (Tasa Efectiva Mensual)', formatPercent(simulation.tem)],
        ['Cuota Mensual', formatCurrency(simulation.monthlyPayment, simulation.currency)],
        ['TCEA', formatPercent(simulation.tcea)],
        ['VAN', formatCurrency(simulation.van, simulation.currency)],
        ['TIR', formatPercent(simulation.tir)],
        ['Intereses Totales', formatCurrency(simulation.totalInterest, simulation.currency)],
        ['Costo Total', formatCurrency(simulation.totalCost, simulation.currency)],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Ajustar ancho de columnas
    summarySheet['!cols'] = [{ wch: 30 }, { wch: 25 }];
    
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');

    // --- Hoja 2: Tabla de Amortización ---
    if (simulation.amortizationSchedule && simulation.amortizationSchedule.length > 0) {
        const amortizationHeaders = [
            'Período',
            'Fecha Vencimiento',
            'Saldo Inicial',
            'Interés',
            'Amortización',
            'Cuota',
            'Seguro Desgravamen',
            'Seguro Inmueble',
            'Comisiones',
            'Saldo Final'
        ];

        const amortizationData = [amortizationHeaders];

        simulation.amortizationSchedule.forEach(item => {
            amortizationData.push([
                item.period,
                item.dueDate ? new Date(item.dueDate).toLocaleDateString('es-PE') : '-',
                roundNumber(item.openingBalance),
                roundNumber(item.interest),
                roundNumber(item.principal),
                roundNumber(item.installment),
                roundNumber(item.lifeInsurance),
                roundNumber(item.riskInsurance),
                roundNumber(item.fees),
                roundNumber(item.closingBalance)
            ]);
        });

        // Agregar fila de totales
        const totals = calculateTotals(simulation.amortizationSchedule);
        amortizationData.push([]);
        amortizationData.push([
            'TOTALES',
            '',
            '',
            roundNumber(totals.totalInterest),
            roundNumber(totals.totalPrincipal),
            roundNumber(totals.totalInstallment),
            roundNumber(totals.totalLifeInsurance),
            roundNumber(totals.totalRiskInsurance),
            roundNumber(totals.totalFees),
            ''
        ]);

        const amortizationSheet = XLSX.utils.aoa_to_sheet(amortizationData);
        
        // Ajustar ancho de columnas
        amortizationSheet['!cols'] = [
            { wch: 10 },  // Período
            { wch: 15 },  // Fecha
            { wch: 15 },  // Saldo Inicial
            { wch: 12 },  // Interés
            { wch: 14 },  // Amortización
            { wch: 12 },  // Cuota
            { wch: 16 },  // Seguro Desgravamen
            { wch: 14 },  // Seguro Inmueble
            { wch: 12 },  // Comisiones
            { wch: 15 },  // Saldo Final
        ];

        XLSX.utils.book_append_sheet(workbook, amortizationSheet, 'Cronograma');
    }

    // Generar nombre del archivo
    const clientName = (simulation.clientName || 'simulacion').replace(/[^a-zA-Z0-9]/g, '_');
    const date = new Date().toISOString().split('T')[0];
    const fileName = `Simulacion_${clientName}_${date}.xlsx`;

    // Descargar archivo
    XLSX.writeFile(workbook, fileName);
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
