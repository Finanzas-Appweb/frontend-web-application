<script>
import { SimulationsAssembler } from "../services/simulations.assembler.js";
import { ClientsAssembler } from "../../clients/services/clients.assembler.js";
import { PropertiesAssembler } from "../../properties/services/properties.assembler.js";
import { BanksAssembler } from "../../banks/services/banks.assembler.js";
import NavBar from "../../../shared/presentation/components/nav-bar.vue";
import FooterContent from "../../../shared/presentation/components/footer-content.vue";

export default {
  name: "SimulatorComponent",
  components: { FooterContent, NavBar },
  data() {
    return {
      // Listas para selects
      clients: [],
      properties: [],
      banks: [],
      
      // Banco seleccionado (para mostrar info de tasas)
      selectedBank: null,
      
      // Formulario de simulación
      simulationForm: {
        clientId: "",
        propertyId: "",
        bankId: null, // null = tasa manual, number = banco seleccionado
        principal: 0,
        currency: 1, // 1 = PEN, 2 = USD
        rateType: 1, // 1 = TEA, 2 = TNA
        tea: 0,
        tna: 0,
        capitalizationPerYear: 12,
        termMonths: 240, // 20 años por defecto
        graceType: 0, // 0 = None, 1 = Total, 2 = Partial
        graceMonths: 0,
        startDate: new Date().toISOString().split('T')[0],
        applyMiViviendaBonus: false,
        bonusAmount: 0,
        lifeInsuranceRateMonthly: 0.028, // 0.028% aprox
        riskInsuranceRateAnnual: 0.025, // 0.025% aprox
        feesMonthly: 0
      },
      
      simulationResult: null,
      simulations: [],
      loading: false,
      loadingHistory: true,
      validationErrors: []
    };
  },
  async mounted() {
    await this.loadInitialData();
  },
  computed: {
    // Si hay banco seleccionado, las tasas vienen del backend automáticamente
    useBankRates() {
      return this.simulationForm.bankId && this.simulationForm.bankId > 0;
    },
    miViviendaInvalid() {
      if (!this.simulationForm.applyMiViviendaBonus) return false;
      return !this.simulationForm.bonusAmount || this.simulationForm.bonusAmount <= 0 || this.simulationForm.bonusAmount >= this.simulationForm.principal;
    },
    submitDisabled() {
      return this.loading || this.miViviendaInvalid;
    }
  },
  methods: {
    async loadInitialData() {
      try {
        // Cargar clientes
        const clientsResult = await ClientsAssembler.getClients({ pageSize: 100 });
        this.clients = clientsResult.clients;

        // Cargar propiedades
        const propsResult = await PropertiesAssembler.getProperties({ pageSize: 100 });
        this.properties = propsResult.properties;

        // Cargar bancos
        const banksResult = await BanksAssembler.getBanks();
        this.banks = banksResult;

        // Cargar historial de simulaciones
        await this.loadSimulations();
      } catch (error) {
        console.error("Error cargando datos iniciales:", error);
      }
    },

    async loadSimulations() {
      try {
        this.loadingHistory = true;
        const result = await SimulationsAssembler.getSimulations({ pageSize: 10 });
        this.simulations = result.simulations;
      } catch (error) {
        console.error("Error al cargar simulaciones:", error);
      } finally {
        this.loadingHistory = false;
      }
    },

    validateForm() {
      this.validationErrors = [];

      if (!this.simulationForm.clientId) {
        this.validationErrors.push("Debe seleccionar un cliente");
      }
      if (!this.simulationForm.propertyId) {
        this.validationErrors.push("Debe seleccionar una propiedad");
      }
      if (!this.simulationForm.principal || this.simulationForm.principal <= 0) {
        this.validationErrors.push("El monto principal debe ser mayor a 0");
      }
      
      // Si NO hay banco, validar tasas manuales
      if (!this.useBankRates) {
        if (this.simulationForm.rateType === 1 && (!this.simulationForm.tea || this.simulationForm.tea <= 0)) {
          this.validationErrors.push("La TEA debe ser mayor a 0");
        }
        if (this.simulationForm.rateType === 2 && (!this.simulationForm.tna || this.simulationForm.tna <= 0)) {
          this.validationErrors.push("La TNA debe ser mayor a 0");
        }
      }

      if (!this.simulationForm.termMonths || this.simulationForm.termMonths <= 0) {
        this.validationErrors.push("El plazo debe ser mayor a 0 meses");
      }

      // Validación de bono MiVivienda
      if (this.simulationForm.applyMiViviendaBonus) {
        if (!this.simulationForm.bonusAmount || this.simulationForm.bonusAmount <= 0) {
          this.validationErrors.push("Si aplica bono MiVivienda, el monto debe ser mayor a 0");
        } else if (this.simulationForm.bonusAmount >= this.simulationForm.principal) {
          this.validationErrors.push("El bono MiVivienda debe ser menor al monto principal");
        }
      }

      return this.validationErrors.length === 0;
    },

    async saveSimulation() {
      if (!this.validateForm()) {
        alert("Por favor corrija los siguientes errores:\n" + this.validationErrors.join("\n"));
        return;
      }

      try {
        this.loading = true;

        // Preparar datos para enviar
        const simulationData = { ...this.simulationForm };

        // Si no aplica bono, asegurar que sea 0
        if (!simulationData.applyMiViviendaBonus) {
          simulationData.bonusAmount = 0;
        }

        // Si hay banco seleccionado, el backend usa las tasas del banco
        // Si NO hay banco, enviar las tasas manuales
        if (this.useBankRates) {
          // Backend usará las tasas del banco
          simulationData.tea = null;
          simulationData.tna = null;
          simulationData.capitalizationPerYear = null;
        } else {
          // Sin banco - enviar tasas manuales
          simulationData.bankId = null;
          if (simulationData.rateType === 1) {
            simulationData.tna = null;
          } else {
            simulationData.tea = null;
          }
        }

        const result = await SimulationsAssembler.createSimulation(simulationData);
        
        this.simulationResult = result;
        alert("Simulación guardada correctamente");
        
        // Recargar historial
        await this.loadSimulations();
        
      } catch (error) {
        console.error("Error al guardar simulación:", error);
        
        if (error.response?.data?.errors) {
          const messages = Object.values(error.response.data.errors).flat().join("\n");
          alert(`Error de validación:\n${messages}`);
          return;
        }
        if (error.message && error.message.includes('MiVivienda')) {
          alert(`Error de validación: ${error.message}`);
        } else if (error.response?.data?.title) {
          alert(`Error: ${error.response.data.title}\n${error.response.data.detail || ''}`);
        } else {
          alert("Hubo un error al guardar la simulación");
        }
      } finally {
        this.loading = false;
      }
    },

    onPropertyChange() {
      // Al seleccionar una propiedad, rellenar el principal con el precio
      const property = this.properties.find(p => p.id === this.simulationForm.propertyId);
      if (property) {
        this.simulationForm.principal = property.price;
        this.simulationForm.currency = property.currency;
      }
    },

    onBankChange() {
      // Al seleccionar un banco, mostrar info de tasas
      if (this.simulationForm.bankId && this.simulationForm.bankId > 0) {
        const bank = this.banks.find(b => b.id === this.simulationForm.bankId);
        this.selectedBank = bank || null;
        // Pre-llenar tasa visible (referencia, el backend usará la real)
        if (bank) {
          this.simulationForm.tea = bank.annualRateTea;
          this.simulationForm.tna = bank.annualRateTna || 0;
        }
      } else {
        this.selectedBank = null;
        // Limpiar tasas para ingreso manual
        this.simulationForm.tea = 0;
        this.simulationForm.tna = 0;
      }
    },

    formatRate(rate) {
      if (!rate && rate !== 0) return '-';
      // Si la tasa es menor a 1, asumimos que está en decimal (0.085 = 8.5%)
      const percentage = rate < 1 ? rate * 100 : rate;
      return percentage.toFixed(2) + '%';
    },

    getRateTypeName(type) {
      return type === 1 ? 'TEA' : 'TNA';
    },

    getCurrencySymbol(currency) {
      return currency === 1 ? 'S/' : '$';
    },

    getGraceTypeName(type) {
      const types = { 0: 'Sin Gracia', 1: 'Total', 2: 'Parcial' };
      return types[type] || '-';
    },

    // Helper para obtener nombre del banco en historial (nuevo formato con objeto bank)
    getBankName(sim) {
      // Nuevo formato: sim.bank es un objeto { id, name, annualRateTea, annualRateTna }
      if (sim.bank && sim.bank.name) {
        return sim.bank.name;
      }
      // Fallback para formato antiguo (por si hay datos viejos)
      if (sim.bankName) {
        return sim.bankName;
      }
      return 'Tasa manual';
    }
  },
};
</script>

<template>
  <nav-bar></nav-bar>
  <div class="simulator-container">
    <div class="header-section">
      <h1>Simulador Hipotecario</h1>
      <p>Crea simulaciones de crédito conectadas al backend</p>
    </div>

    <div class="simulator-content">
      <div class="form-section">
        <h2>Datos del Crédito</h2>

        <div class="form-grid">
          <div class="input-group">
            <label>Cliente *</label>
            <select v-model="simulationForm.clientId" required>
              <option value="">Seleccione un cliente</option>
              <option v-for="client in clients" :key="client.id" :value="client.id">
                {{ client.fullName }}
              </option>
            </select>
          </div>

          <div class="input-group">
            <label>Propiedad *</label>
            <select v-model="simulationForm.propertyId" @change="onPropertyChange" required>
              <option value="">Seleccione una propiedad</option>
              <option v-for="property in properties" :key="property.id" :value="property.id">
                {{ property.code }} - {{ property.title }}
              </option>
            </select>
          </div>

          <div class="input-group">
            <label>Banco (opcional)</label>
            <select v-model.number="simulationForm.bankId" @change="onBankChange">
              <option :value="null">-- Tasa manual --</option>
              <option v-for="bank in banks" :key="bank.id" :value="bank.id">
                {{ bank.name }}
              </option>
            </select>
          </div>

          <!-- Info del banco seleccionado -->
          <div v-if="selectedBank" class="bank-info-card">
            <h4>{{ selectedBank.name }}</h4>
            <div class="bank-rates">
              <span><strong>TEA:</strong> {{ formatRate(selectedBank.annualRateTea) }}</span>
              <span><strong>TNA:</strong> {{ formatRate(selectedBank.annualRateTna) }}</span>
            </div>
            <small class="hint">Las tasas se aplicarán automáticamente del banco</small>
          </div>

          <div class="input-group">
            <label>Monto Principal *</label>
            <input v-model.number="simulationForm.principal" type="number" step="0.01" required />
          </div>

          <div class="input-group">
            <label>Moneda *</label>
            <select v-model.number="simulationForm.currency">
              <option :value="1">Soles (PEN)</option>
              <option :value="2">Dólares (USD)</option>
            </select>
          </div>

          <div class="input-group">
            <label>Tipo de Tasa *</label>
            <select v-model.number="simulationForm.rateType" :disabled="useBankRates">
              <option :value="1">TEA (Tasa Efectiva Anual)</option>
              <option :value="2">TNA (Tasa Nominal Anual)</option>
            </select>
            <small v-if="useBankRates" class="hint">Se usará según selección con tasa del banco</small>
          </div>

          <div class="input-group" v-if="!useBankRates">
            <label>{{ simulationForm.rateType === 1 ? 'TEA (%)' : 'TNA (%)' }} *</label>
            <input 
              v-if="simulationForm.rateType === 1" 
              v-model.number="simulationForm.tea" 
              type="number" 
              step="0.0001" 
              placeholder="Ej: 0.085 para 8.5%"
              required 
            />
            <input 
              v-else 
              v-model.number="simulationForm.tna" 
              type="number" 
              step="0.0001"
              placeholder="Ej: 0.0817 para 8.17%"
              required 
            />
            <small class="hint">Ingrese en decimal. Ej: 0.085 = 8.5%</small>
          </div>

          <div class="input-group">
            <label>Capitalización al Año</label>
            <input v-model.number="simulationForm.capitalizationPerYear" type="number" />
          </div>

          <div class="input-group">
            <label>Plazo (meses) *</label>
            <input v-model.number="simulationForm.termMonths" type="number" required />
          </div>

          <div class="input-group">
            <label>Tipo de Gracia</label>
            <select v-model.number="simulationForm.graceType">
              <option :value="0">Sin Gracia</option>
              <option :value="1">Total</option>
              <option :value="2">Parcial</option>
            </select>
          </div>

          <div class="input-group">
            <label>Meses de Gracia</label>
            <input v-model.number="simulationForm.graceMonths" type="number" :disabled="simulationForm.graceType === 0" />
          </div>

          <div class="input-group">
            <label>Fecha de Inicio</label>
            <input v-model="simulationForm.startDate" type="date" />
          </div>

          <div class="input-group checkbox-group">
            <label>
              <input type="checkbox" v-model="simulationForm.applyMiViviendaBonus" />
              Aplicar Bono MiVivienda
            </label>
          </div>

          <div class="input-group" v-if="simulationForm.applyMiViviendaBonus">
            <label>Monto Bono MiVivienda *</label>
            <input v-model.number="simulationForm.bonusAmount" type="number" step="0.01" />
            <small>Debe ser mayor a 0 y menor al monto principal</small>
            <small v-if="miViviendaInvalid" class="error-text">Monto de bono inválido según las reglas del backend</small>
          </div>

          <div class="input-group">
            <label>Seguro Desgravamen (% mensual)</label>
            <input v-model.number="simulationForm.lifeInsuranceRateMonthly" type="number" step="0.001" />
          </div>

          <div class="input-group">
            <label>Seguro Inmueble (% anual)</label>
            <input v-model.number="simulationForm.riskInsuranceRateAnnual" type="number" step="0.001" />
          </div>

          <div class="input-group">
            <label>Comisiones Mensuales</label>
            <input v-model.number="simulationForm.feesMonthly" type="number" step="0.01" />
          </div>
        </div>

        <button @click="saveSimulation" class="simulate-btn" :disabled="submitDisabled">
          {{ loading ? "Guardando..." : "Guardar Simulación" }}
        </button>
        <div v-if="validationErrors.length" class="validation-box">
          <p>Por favor corrige:</p>
          <ul>
            <li v-for="(err, idx) in validationErrors" :key="idx">{{ err }}</li>
          </ul>
        </div>
      </div>

      <div v-if="simulationResult" class="result-section">
        <h2>Resultados</h2>

        <div class="main-result">
          <span class="label">Cuota Mensual</span>
          <span class="amount">{{ getCurrencySymbol(simulationResult.currency) }} {{ simulationResult.monthlyPayment?.toFixed(2) }}</span>
        </div>

        <div class="details-grid">
          <div class="detail-item">
            <span>TEM:</span>
            <strong>{{ simulationResult.tem?.toFixed(4) }}%</strong>
          </div>
          <div class="detail-item">
            <span>TCEA:</span>
            <strong>{{ simulationResult.tcea?.toFixed(2) }}%</strong>
          </div>
          <div class="detail-item">
            <span>TIR:</span>
            <strong>{{ simulationResult.tir?.toFixed(2) }}%</strong>
          </div>
          <div class="detail-item">
            <span>VAN:</span>
            <strong>{{ getCurrencySymbol(simulationResult.currency) }} {{ simulationResult.van?.toFixed(2) }}</strong>
          </div>
          <div class="detail-item">
            <span>Intereses Totales:</span>
            <strong>{{ getCurrencySymbol(simulationResult.currency) }} {{ simulationResult.totalInterest?.toFixed(2) }}</strong>
          </div>
          <div class="detail-item">
            <span>Costo Total:</span>
            <strong>{{ getCurrencySymbol(simulationResult.currency) }} {{ simulationResult.totalCost?.toFixed(2) }}</strong>
          </div>
        </div>

        <div v-if="simulationResult.amortizationSchedule?.length" class="schedule-section">
          <h3>Tabla de Amortización</h3>
          <div class="schedule-wrapper">
            <table>
              <thead>
              <tr>
                <th>Período</th>
                <th>Fecha</th>
                <th>Cuota</th>
                <th>Interés</th>
                <th>Amortización</th>
                <th>Saldo</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="item in simulationResult.amortizationSchedule" :key="item.id || item.period">
                <td>{{ item.period }}</td>
                <td>{{ item.dueDate ? new Date(item.dueDate).toLocaleDateString('es-PE') : '-' }}</td>
                <td>{{ getCurrencySymbol(simulationResult.currency) }} {{ item.installment?.toFixed(2) }}</td>
                <td>{{ getCurrencySymbol(simulationResult.currency) }} {{ item.interest?.toFixed(2) }}</td>
                <td>{{ getCurrencySymbol(simulationResult.currency) }} {{ item.principal?.toFixed(2) }}</td>
                <td>{{ getCurrencySymbol(simulationResult.currency) }} {{ item.closingBalance?.toFixed(2) }}</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div class="history-section">
      <h2>Historial de Simulaciones</h2>
      <div v-if="loadingHistory" class="loading">Cargando datos...</div>
      <table v-else-if="simulations.length > 0" class="history-table">
        <thead>
        <tr>
          <th>Fecha</th>
          <th>Cliente</th>
          <th>Propiedad</th>
          <th>Banco</th>
          <th>Principal</th>
          <th>Plazo</th>
          <th>Tasa</th>
          <th>Cuota Mensual</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="sim in simulations" :key="sim.id">
          <td>{{ new Date(sim.createdAtUtc).toLocaleDateString('es-PE') }}</td>
          <td>{{ sim.clientName }}</td>
          <td>{{ sim.propertyTitle }}</td>
          <td>{{ getBankName(sim) }}</td>
          <td>{{ getCurrencySymbol(sim.currency) }} {{ sim.principal?.toLocaleString() }}</td>
          <td>{{ sim.termMonths }} meses</td>
          <td>{{ getRateTypeName(sim.rateType) }}: {{ formatRate(sim.rateType === 1 ? sim.tea : sim.tna) }}</td>
          <td class="highlight">{{ getCurrencySymbol(sim.currency) }} {{ sim.monthlyPayment?.toFixed(2) }}</td>
        </tr>
        </tbody>
      </table>
      <p v-else class="no-data">No hay simulaciones registradas</p>
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.input-group { display: flex; flex-direction: column; }

.input-group label {
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
  font-size: 13px;
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

.input-group input:disabled, .input-group select:disabled {
  background: #e2e8f0;
  cursor: not-allowed;
  color: #64748b;
}

.input-group small {
  color: #64748b;
  font-size: 12px;
  margin-top: 5px;
}

.input-group .hint {
  color: #0369a1;
  font-style: italic;
}

/* Bank info card cuando se selecciona un banco */
.bank-info-card {
  grid-column: span 2;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #7dd3fc;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bank-info-card h4 {
  margin: 0;
  color: #0369a1;
  font-size: 16px;
  font-weight: 600;
}

.bank-info-card .bank-rates {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.bank-info-card .bank-rates span {
  font-size: 14px;
  color: #334155;
}

.bank-info-card .bank-rates strong {
  color: #0284c7;
}

.error-text {
  color: #c53030;
  font-weight: 600;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
  cursor: pointer;
}

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
.simulate-btn:hover:not(:disabled) { background-color: #255a8a; transform: translateY(-1px); }
.simulate-btn:disabled { background-color: #cbd5e1; cursor: not-allowed; }

.validation-box {
  margin-top: 16px;
  background: #fef2f2;
  border: 1px solid #fecdd3;
  color: #b91c1c;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
}

.validation-box ul {
  margin: 8px 0 0 18px;
}

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

/* Tabla Historial */
.history-section h2 {
  color: #255a8a;
  margin-bottom: 20px;
  font-size: 22px;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  font-size: 14px;
}

.history-table th { 
  background-color: #377fbd; 
  color: white; 
  font-weight: 600; 
  padding: 15px; 
  text-align: left; 
}
.history-table td { 
  padding: 15px; 
  border-bottom: 1px solid #f1f5f9; 
  color: #334155; 
}
.history-table tr:last-child td { border-bottom: none; }
.history-table .highlight { font-weight: 700; color: #377fbd; }

.loading {
  text-align: center;
  padding: 30px;
  color: #377fbd;
  font-size: 16px;
}

.no-data {
  text-align: center;
  padding: 30px;
  color: #666;
  font-size: 16px;
}

.schedule-section {
  margin-top: 20px;
}

.schedule-wrapper {
  max-height: 260px;
  overflow: auto;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}

.schedule-section table {
  width: 100%;
  border-collapse: collapse;
}

.schedule-section th, .schedule-section td {
  padding: 10px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 13px;
  text-align: left;
}

.schedule-section th {
  background: #f1f5f9;
  color: #255a8a;
  font-weight: 700;
}

@media (max-width: 768px) {
  .simulator-content { flex-direction: column; }
  .result-section { width: 100%; }
  .form-grid { grid-template-columns: 1fr; }
}
</style>
