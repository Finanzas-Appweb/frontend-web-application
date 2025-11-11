<script>
import apiClient from "../../../shared/infraestructure/services/api.client.js";
import { SimulationsAssembler } from "../services/simulations.assembler.js";
import NavBar from "../../../shared/presentation/components/nav-bar.vue";
import FooterContent from "../../../shared/presentation/components/footer-content.vue";

export default {
  name: "SimulatorComponent",
  components: {FooterContent, NavBar},
  data() {
    return {
      simulationInput: {
        monto: "",
        plazo: "",
        moneda: "soles",
        tipoTasa: "efectiva",
        tasa: "",
        periodoGracia: "",
      },
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
      if (
          !this.simulationInput.monto ||
          !this.simulationInput.plazo ||
          !this.simulationInput.tasa
      ) {
        alert("Por favor completa todos los campos requeridos.");
        return;
      }

      this.loading = true;
      const tasaMensual = this.simulationInput.tasa / 100 / 12;
      const n = this.simulationInput.plazo * 12;
      const cuota =
          (this.simulationInput.monto * tasaMensual) /
          (1 - Math.pow(1 + tasaMensual, -n));

      this.simulationResult = {
        cuotaMensual: cuota.toFixed(2),
        van: (cuota * n - this.simulationInput.monto).toFixed(2),
        tir: this.simulationInput.tasa,
        tcea: (this.simulationInput.tasa * 1.05).toFixed(2),
        costoTotal: (cuota * n).toFixed(2),
      };

      this.loading = false;
    },
    async saveSimulation() {
      if (!this.simulationResult) {
        alert("Primero realiza una simulación.");
        return;
      }

      const simulation = {
        clientId: 1,
        propertyId: 1,
        simulationInput: this.simulationInput,
        simulationOutput: this.simulationResult,
        createdAt: new Date().toISOString(),
      };

      try {
        await apiClient.post("/simulations", simulation);
        alert("Simulación guardada correctamente.");
        this.loadSimulations(); // recargar historial
      } catch (error) {
        console.error("Error al guardar simulación:", error);
      }
    },
  },
};
</script>

<template>
  <nav-bar></nav-bar>
  <div class="simulator-container">
    <div class="header-section">
      <h1>Simulador de Crédito</h1>
    </div>

    <div class="simulator-content">
      <div class="form-section">
        <h2>Datos de la Simulación</h2>

        <div class="form-grid">
          <div class="input-group">
            <label>Monto (S/)</label>
            <input v-model.number="simulationInput.monto" type="number" />
          </div>

          <div class="input-group">
            <label>Plazo (años)</label>
            <input v-model.number="simulationInput.plazo" type="number" />
          </div>

          <div class="input-group">
            <label>Tasa (%)</label>
            <input v-model.number="simulationInput.tasa" type="number" />
          </div>

          <div class="input-group">
            <label>Moneda</label>
            <select v-model="simulationInput.moneda">
              <option value="soles">Soles</option>
              <option value="dólares">Dólares</option>
            </select>
          </div>

          <div class="input-group">
            <label>Tipo de Tasa</label>
            <select v-model="simulationInput.tipoTasa">
              <option value="efectiva">Efectiva</option>
              <option value="nominal">Nominal</option>
            </select>
          </div>

          <div class="input-group">
            <label>Periodo de Gracia</label>
            <select v-model="simulationInput.periodoGracia">
              <option value="sin gracia">Sin gracia</option>
              <option value="3 meses">3 meses</option>
              <option value="6 meses">6 meses</option>
            </select>
          </div>
        </div>

        <button @click="simulate" class="simulate-btn" :disabled="loading">
          {{ loading ? "Calculando..." : "Simular Crédito" }}
        </button>
      </div>

      <div v-if="simulationResult" class="result-section">
        <h2>Resultado de la Simulación</h2>

        <div class="result-card">
          <p><strong>Cuota Mensual:</strong> S/ {{ simulationResult.cuotaMensual }}</p>
          <p><strong>TCEA:</strong> {{ simulationResult.tcea }}%</p>
          <p><strong>TIR:</strong> {{ simulationResult.tir }}%</p>
          <p><strong>VAN:</strong> S/ {{ simulationResult.van }}</p>
          <p><strong>Costo Total:</strong> S/ {{ simulationResult.costoTotal }}</p>
        </div>

        <button @click="saveSimulation" class="save-btn">
          Guardar Simulación
        </button>
      </div>
    </div>

    <!-- Historial de simulaciones -->
    <div class="history-section">
      <h2>Historial de Simulaciones</h2>

      <div v-if="loadingHistory" class="loading">Cargando historial...</div>

      <table v-else class="history-table">
        <thead>
        <tr>
          <th>Cliente</th>
          <th>Monto (S/)</th>
          <th>Plazo (años)</th>
          <th>Tasa (%)</th>
          <th>Cuota (S/)</th>
          <th>Fecha</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="sim in simulations" :key="sim.id">
          <td>{{ sim.clientId }}</td>
          <td>{{ sim.simulationInput.monto }}</td>
          <td>{{ sim.simulationInput.plazo }}</td>
          <td>{{ sim.simulationInput.tasa }}</td>
          <td>{{ sim.simulationOutput.cuotaMensual }}</td>
          <td>{{ new Date(sim.createdAt).toLocaleDateString() }}</td>
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

.header-section {
  margin-bottom: 25px;
}

.header-section h1 {
  font-size: 28px;
  font-weight: 600;
  color: #255a8a;
}

.simulator-content {
  display: flex;
  gap: 40px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.form-section {
  flex: 1;
  background: white;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(55, 127, 189, 0.15);
  padding: 25px 30px;
}

.form-section h2 {
  color: #255a8a;
  margin-bottom: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.input-group label {
  font-weight: 500;
  color: #255a8a;
  margin-bottom: 6px;
  font-size: 14px;
}

.input-group input,
.input-group select {
  padding: 10px;
  border: 2px solid #cfd8dc;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s;
}

.input-group input:focus,
.input-group select:focus {
  border-color: #377fbd;
}

.simulate-btn {
  margin-top: 25px;
  background-color: #377fbd;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px 18px;
  font-size: 16px;
  cursor: pointer;
  transition: 0.3s;
  box-shadow: 0 4px 12px rgba(55, 127, 189, 0.3);
}

.simulate-btn:hover {
  background-color: #2d6ba1;
}

.result-section {
  flex: 1;
  background: white;
  border-radius: 15px;
  padding: 25px 30px;
  box-shadow: 0 8px 20px rgba(55, 127, 189, 0.15);
}

.result-section h2 {
  color: #255a8a;
  margin-bottom: 15px;
}

.result-card {
  border-left: 5px solid #377fbd;
  background: #f0f7fc;
  border-radius: 10px;
  padding: 15px 20px;
  font-size: 15px;
  color: #333;
}

.save-btn {
  margin-top: 20px;
  background-color: #2d6ba1;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 18px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: 0.3s;
}

.save-btn:hover {
  background-color: #255a8a;
}

/* Tabla de historial */
.history-section {
  margin-top: 50px;
}

.history-section h2 {
  color: #255a8a;
  margin-bottom: 15px;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(55, 127, 189, 0.15);
}

.history-table th,
.history-table td {
  padding: 12px 15px;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
}

.history-table th {
  background-color: #377fbd;
  color: white;
  font-weight: 500;
}

.history-table tr:hover {
  background-color: #f0f7fc;
}

.loading {
  color: #377fbd;
  font-weight: 500;
}
</style>
