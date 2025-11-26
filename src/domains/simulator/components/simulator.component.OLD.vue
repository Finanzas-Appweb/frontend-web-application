<script>
import apiClient from "../../../shared/infraestructure/services/api.client.js";
import { SimulationsAssembler } from "../services/simulations.assembler.js";
import NavBar from "../../../shared/presentation/components/nav-bar.vue";
import FooterContent from "../../../shared/presentation/components/footer-content.vue";

export default {
  name: "SimulatorComponent",
  components: { FooterContent, NavBar },
  data() {
    return {
      // Datos de entrada del usuario
      simulationInput: {
        monto: 500000,        // Valor del Inmueble
        cuotaInicial: 50000,  // Nuevo
        bonoMiVivienda: 0,    // Nuevo
        plazo: 20,
        moneda: "soles",
        tipoTasa: "efectiva",
        tasa: 8.5,            // Tasa Anual
        periodoGracia: 0,     // Meses numéricos
        tipoPeriodoGracia: "sin gracia", // Nuevo enum
        seguroDesgravamen: 0.028, // % Mensual aprox
        seguroInmueble: 0.025,    // % Mensual aprox
      },
      ingresoMensualCliente: 15000, // Dato extra para calcular el Ratio Deuda/Ingreso

      simulationResult: null,
      simulations: [],
      loading: false,
      loadingHistory: true,
    };
  },
  async mounted() {
    await this.loadSimulations();
  },
  methods: {
    async loadSimulations() {
      try {
        const response = await apiClient.get("/simulations");
        this.simulations = SimulationsAssembler.toEntitiesFromResponse(response);
      } catch (error) {
        console.error("Error al cargar simulaciones:", error);
      } finally {
        this.loadingHistory = false;
      }
    },

    async simulate() {
      // 1. Validaciones básicas
      if (
          !this.simulationInput.monto ||
          !this.simulationInput.plazo ||
          !this.simulationInput.tasa
      ) {
        alert("Por favor completa los campos principales (Monto, Plazo, Tasa).");
        return;
      }

      this.loading = true;

      // 2. Obtener valores numéricos limpios
      const valorInmueble = parseFloat(this.simulationInput.monto);
      const inicial = parseFloat(this.simulationInput.cuotaInicial) || 0;
      const bono = parseFloat(this.simulationInput.bonoMiVivienda) || 0;

      // 3. Calcular Monto del Préstamo (Capital)
      const montoPrestamo = valorInmueble - inicial - bono;

      if (montoPrestamo <= 0) {
        alert("La cuota inicial y bonos superan el valor del inmueble.");
        this.loading = false;
        return;
      }

      // 4. Conversión de Tasa Anual a Mensual
      let tasaMensual = 0;
      if (this.simulationInput.tipoTasa === 'efectiva') {
        // Fórmula: (1 + TEA)^(1/12) - 1
        tasaMensual = Math.pow(1 + (this.simulationInput.tasa / 100), 1 / 12) - 1;
      } else {
        // Nominal: TNA / 12
        tasaMensual = (this.simulationInput.tasa / 100) / 12;
      }

      const totalMeses = this.simulationInput.plazo * 12;
      const mesesGracia = parseInt(this.simulationInput.periodoGracia) || 0;
      const mesesPagar = totalMeses - mesesGracia;

      // 5. Cálculo de Cuota Base (Amortización Francés)
      // Nota: Simplificado para el ejemplo. Si hay gracia total, el capital aumenta.
      // Aquí asumimos gracia simple o periodo muerto para visualización rápida.
      let cuotaBase = 0;
      if (mesesPagar > 0) {
        cuotaBase = (montoPrestamo * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -mesesPagar));
      }

      // 6. Cálculo de Seguros (Aproximación Mensual)
      // Desgravamen suele ser sobre saldo deudor, Inmueble sobre valor propiedad.
      // Para la "Cuota Mensual" referencial usamos el valor inicial.
      const costoSeguroDesg = montoPrestamo * (this.simulationInput.seguroDesgravamen / 100);
      const costoSeguroInm = valorInmueble * (this.simulationInput.seguroInmueble / 100);

      const cuotaTotalMensual = cuotaBase + costoSeguroDesg + costoSeguroInm;

      // 7. Métricas Financieras Adicionales
      const totalPagado = (cuotaTotalMensual * mesesPagar);
      const interesesTotales = totalPagado - montoPrestamo;
      const porcentajeFinanciado = (montoPrestamo / valorInmueble) * 100;

      // Ratio Deuda / Ingreso
      const ratio = this.ingresoMensualCliente > 0
          ? (cuotaTotalMensual / this.ingresoMensualCliente).toFixed(2)
          : 0;

      // Calcular fecha final
      const fechaFin = new Date();
      fechaFin.setMonth(fechaFin.getMonth() + totalMeses);

      // 8. Construir Objeto Resultado (Mapeado al API Fake)
      this.simulationResult = {
        cuotaMensual: cuotaTotalMensual.toFixed(2),
        tcea: (this.simulationInput.tasa * 1.02).toFixed(2), // Referencial (+ costos)
        tir: this.simulationInput.tasa,
        van: (totalPagado - montoPrestamo).toFixed(2), // Valor presente neto simplificado
        costoTotal: totalPagado.toFixed(2),

        // --- Nuevos Campos ---
        montoPrestamo: montoPrestamo.toFixed(2),
        interesesTotales: interesesTotales.toFixed(2),
        porcentajeFinanciado: porcentajeFinanciado.toFixed(2),
        fechaFinCredito: fechaFin.toLocaleDateString('es-PE', { year: 'numeric', month: 'long' }),
        ratioDeudaIngreso: ratio
      };

      this.loading = false;
    },

    async saveSimulation() {
      if (!this.simulationResult) {
        alert("Primero realiza una simulación.");
        return;
      }

      // Estructura exacta para el POST según tu ApiFake
      const simulationPayload = {
        clientId: 1, // Harcoded por ahora (simulando usuario logueado)
        propertyId: 1, // Harcoded por ahora
        simulationInput: {
          ...this.simulationInput,
          // Convertimos a string o number según requiera tu backend/json
          periodoGracia: `${this.simulationInput.periodoGracia} meses`
        },
        simulationOutput: this.simulationResult,
        createdAt: new Date().toISOString(),
      };

      try {
        await apiClient.post("/simulations", simulationPayload);
        alert("Simulación guardada correctamente.");
        this.loadSimulations(); // recargar historial
      } catch (error) {
        console.error("Error al guardar simulación:", error);
        alert("Hubo un error al guardar.");
      }
    },
  },
};
</script>

<template>
  <nav-bar></nav-bar>
  <div class="simulator-container">
    <div class="header-section">
      <h1>Simulador Hipotecario Pro</h1>
      <p>Calcula tu cuota incluyendo seguros y bonos del estado.</p>
    </div>

    <div class="simulator-content">
      <div class="form-section">
        <h2>Datos del Crédito</h2>

        <div class="form-grid">
          <div class="input-group">
            <label>Valor Inmueble (S/)</label>
            <input v-model.number="simulationInput.monto" type="number" placeholder="500000" />
          </div>

          <div class="input-group">
            <label>Cuota Inicial (S/)</label>
            <input v-model.number="simulationInput.cuotaInicial" type="number" placeholder="50000" />
          </div>

          <div class="input-group">
            <label>Bono MiVivienda (S/)</label>
            <input v-model.number="simulationInput.bonoMiVivienda" type="number" placeholder="0" />
          </div>

          <div class="input-group">
            <label>Plazo (años)</label>
            <input v-model.number="simulationInput.plazo" type="number" placeholder="20" />
          </div>

          <div class="input-group">
            <label>Tasa de Interés (%)</label>
            <input v-model.number="simulationInput.tasa" type="number" step="0.1" placeholder="8.5" />
          </div>

          <div class="input-group">
            <label>Tipo de Tasa</label>
            <select v-model="simulationInput.tipoTasa">
              <option value="efectiva">Efectiva Anual (TEA)</option>
              <option value="nominal">Nominal Anual (TNA)</option>
            </select>
          </div>

          <div class="input-group">
            <label>Seg. Desgravamen (% mes)</label>
            <input v-model.number="simulationInput.seguroDesgravamen" type="number" step="0.001" />
          </div>

          <div class="input-group">
            <label>Seg. Inmueble (% mes)</label>
            <input v-model.number="simulationInput.seguroInmueble" type="number" step="0.001" />
          </div>

          <div class="input-group">
            <label>Periodo de Gracia</label>
            <div class="gracia-controls">
              <select v-model="simulationInput.periodoGracia" style="width: 40%">
                <option :value="0">0 meses</option>
                <option :value="3">3 meses</option>
                <option :value="6">6 meses</option>
              </select>
              <select v-model="simulationInput.tipoPeriodoGracia" style="width: 55%">
                <option value="sin gracia">N/A</option>
                <option value="total">Total (Suma Cap.)</option>
                <option value="parcial">Parcial (Paga Int.)</option>
              </select>
            </div>
          </div>

          <div class="input-group full-width">
            <label>Tu Ingreso Mensual (Referencial)</label>
            <input v-model.number="ingresoMensualCliente" type="number" />
          </div>
        </div>

        <button @click="simulate" class="simulate-btn" :disabled="loading">
          {{ loading ? "Calculando..." : "Calcular Cuota" }}
        </button>
      </div>

      <div v-if="simulationResult" class="result-section">
        <h2>Resumen Financiero</h2>

        <div class="main-result">
          <span class="label">Cuota Mensual Estimada</span>
          <span class="amount">S/ {{ simulationResult.cuotaMensual }}</span>
        </div>

        <div class="details-grid">
          <div class="detail-item">
            <span>Monto Préstamo:</span>
            <strong>S/ {{ simulationResult.montoPrestamo }}</strong>
          </div>
          <div class="detail-item">
            <span>Financiamiento:</span>
            <strong>{{ simulationResult.porcentajeFinanciado }}%</strong>
          </div>
          <div class="detail-item">
            <span>TCEA Ref.:</span>
            <strong>{{ simulationResult.tcea }}%</strong>
          </div>
          <div class="detail-item">
            <span>Intereses Totales:</span>
            <strong>S/ {{ simulationResult.interesesTotales }}</strong>
          </div>
          <div class="detail-item">
            <span>Ratio Deuda/Ingreso:</span>
            <strong :class="{'warning': simulationResult.ratioDeudaIngreso > 0.4}">
              {{ (simulationResult.ratioDeudaIngreso * 100).toFixed(1) }}%
            </strong>
          </div>
          <div class="detail-item">
            <span>Fin del Crédito:</span>
            <strong>{{ simulationResult.fechaFinCredito }}</strong>
          </div>
        </div>

        <div class="total-cost">
          Costo Total (Capital + Int + Seg): S/ {{ simulationResult.costoTotal }}
        </div>

        <button @click="saveSimulation" class="save-btn">
          Guardar Simulación
        </button>
      </div>
    </div>

    <div class="history-section">
      <h2>Historial Reciente</h2>
      <div v-if="loadingHistory" class="loading">Cargando datos...</div>
      <table v-else class="history-table">
        <thead>
        <tr>
          <th>Fecha</th>
          <th>Inmueble</th>
          <th>Inicial</th>
          <th>Préstamo</th>
          <th>Cuota</th>
          <th>TCEA</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="sim in simulations" :key="sim.id">
          <td>{{ new Date(sim.createdAt).toLocaleDateString() }}</td>
          <td>S/ {{ sim.simulationInput.monto }}</td>
          <td>S/ {{ sim.simulationInput.cuotaInicial || 0 }}</td>
          <td>S/ {{ sim.simulationOutput.montoPrestamo || '-' }}</td>
          <td class="highlight">S/ {{ sim.simulationOutput.cuotaMensual }}</td>
          <td>{{ sim.simulationOutput.tcea }}%</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
  <footer-content></footer-content>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

.simulator-container {
  padding: 40px 60px;
  background: #f8fafc;
  min-height: 100vh;
  font-family: "Roboto", sans-serif;
  color: #1a1a1a;
}

.header-section { margin-bottom: 30px; }
.header-section h1 { font-size: 28px; font-weight: 700; color: #255a8a; margin-bottom: 5px; }
.header-section p { color: #64748b; font-size: 16px; }

.simulator-content {
  display: flex;
  gap: 40px;
  align-items: flex-start;
  flex-wrap: wrap;
  margin-bottom: 50px;
}

.form-section {
  flex: 2;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  padding: 30px;
}

.form-section h2, .result-section h2 {
  color: #255a8a;
  margin-bottom: 25px;
  font-size: 20px;
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 10px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
}

.input-group { display: flex; flex-direction: column; }
.input-group.full-width { grid-column: 1 / -1; }

.input-group label {
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-group input, .input-group select {
  padding: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s;
  background: #f8fafc;
  color: #1e293b;
}

.input-group input:focus, .input-group select:focus {
  border-color: #377fbd;
  background: #fff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(55, 127, 189, 0.1);
}

.gracia-controls { display: flex; gap: 10px; justify-content: space-between; }

.simulate-btn {
  width: 100%;
  margin-top: 30px;
  background-color: #377fbd;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 15px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}
.simulate-btn:hover { background-color: #255a8a; transform: translateY(-1px); }

/* Resultados */
.result-section {
  flex: 1;
  min-width: 300px;
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border-top: 5px solid #377fbd;
}

.main-result {
  text-align: center;
  background: #f0f9ff;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  border: 1px solid #bae6fd;
}
.main-result .label { display: block; font-size: 14px; color: #0369a1; margin-bottom: 5px; }
.main-result .amount { display: block; font-size: 32px; font-weight: 800; color: #0284c7; }

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.detail-item { display: flex; flex-direction: column; font-size: 14px; }
.detail-item span { color: #64748b; margin-bottom: 2px; }
.detail-item strong { color: #334155; font-weight: 600; }
.detail-item strong.warning { color: #ef4444; }

.total-cost {
  text-align: center;
  font-size: 13px;
  color: #64748b;
  padding-top: 15px;
  border-top: 1px dashed #cbd5e1;
}

.save-btn {
  width: 100%;
  margin-top: 20px;
  background-color: #e2e8f0;
  color: #475569;
  border: none;
  border-radius: 10px;
  padding: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}
.save-btn:hover { background-color: #cbd5e1; color: #1e293b; }

/* Tabla Historial */
.history-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  font-size: 14px;
}

.history-table th { background-color: #f1f5f9; color: #475569; font-weight: 600; padding: 15px; text-align: left; }
.history-table td { padding: 15px; border-bottom: 1px solid #f1f5f9; color: #334155; }
.history-table tr:last-child td { border-bottom: none; }
.history-table .highlight { font-weight: 700; color: #377fbd; }

@media (max-width: 768px) {
  .simulator-content { flex-direction: column; }
  .result-section { width: 100%; }
}
</style>