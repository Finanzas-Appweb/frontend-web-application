# Guía de Migración de Componentes

## Componentes que necesitan actualización

### 1. Login.component.vue (`src/domains/authentication/components/`)

#### Cambios necesarios:
```vue
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '../services/auth.service';

const router = useRouter();
const email = ref(''); // Cambiar de username a email
const password = ref('');
const error = ref('');

const handleLogin = async () => {
  try {
    error.value = '';
    await login(email.value, password.value);
    router.push('/'); // Redirigir después de login exitoso
  } catch (err) {
    error.value = err.message;
  }
};
</script>

<template>
  <!-- Cambiar campo username por email -->
  <input v-model="email" type="email" placeholder="Email" />
  <input v-model="password" type="password" placeholder="Password" />
  <button @click="handleLogin">Iniciar Sesión</button>
  <div v-if="error" class="error">{{ error }}</div>
</template>
```

### 2. Register.component.vue (`src/domains/authentication/components/`)

#### Cambios necesarios:
```vue
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { register } from '../services/auth.service';

const router = useRouter();
const form = ref({
  username: '',
  firstName: '',
  lastName: '',
  dni: '',
  email: '',
  phone: '',
  password: ''
});
const error = ref('');

const handleRegister = async () => {
  try {
    error.value = '';
    
    // Validar DNI (8 dígitos)
    if (!/^\d{8}$/.test(form.value.dni)) {
      error.value = 'El DNI debe tener 8 dígitos';
      return;
    }
    
    await register(form.value);
    router.push('/'); // Redirigir después de registro exitoso
  } catch (err) {
    error.value = err.message;
  }
};
</script>

<template>
  <form @submit.prevent="handleRegister">
    <input v-model="form.username" placeholder="Usuario" required />
    <input v-model="form.firstName" placeholder="Nombre" required />
    <input v-model="form.lastName" placeholder="Apellido" required />
    <input v-model="form.dni" placeholder="DNI" maxlength="8" required />
    <input v-model="form.email" type="email" placeholder="Email" required />
    <input v-model="form.phone" placeholder="Teléfono" required />
    <input v-model="form.password" type="password" placeholder="Contraseña" required />
    <button type="submit">Registrarse</button>
    <div v-if="error" class="error">{{ error }}</div>
  </form>
</template>
```

### 3. clients.component.vue (`src/domains/clients/components/`)

#### Cambios necesarios:
```vue
<script setup>
import { ref, onMounted } from 'vue';
import { ClientsAssembler } from '../services/clients.assembler';
import { usePermissions } from '@/shared/composables/usePermissions';

const clients = ref([]);
const pagination = ref(null);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const error = ref('');

const { canCreateClient, canEditClient, canDeleteClient } = usePermissions();

const loadClients = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    const result = await ClientsAssembler.getClients({
      search: searchQuery.value,
      page: currentPage.value,
      pageSize: pageSize.value
    });
    
    clients.value = result.clients;
    pagination.value = result.pagination;
  } catch (err) {
    error.value = 'Error al cargar clientes: ' + err.message;
  } finally {
    loading.value = false;
  }
};

const createClient = async (clientData) => {
  try {
    loading.value = true;
    error.value = '';
    
    // clientData debe contener: firstName, lastName, email, phone, annualIncome
    await ClientsAssembler.createClient(clientData);
    await loadClients();
  } catch (err) {
    error.value = 'Error al crear cliente: ' + err.message;
  } finally {
    loading.value = false;
  }
};

const updateClient = async (id, clientData) => {
  try {
    loading.value = true;
    error.value = '';
    
    await ClientsAssembler.updateClient(id, clientData);
    await loadClients();
  } catch (err) {
    error.value = 'Error al actualizar cliente: ' + err.message;
  } finally {
    loading.value = false;
  }
};

const deleteClient = async (id) => {
  if (!confirm('¿Está seguro de eliminar este cliente?')) return;
  
  try {
    loading.value = true;
    error.value = '';
    
    await ClientsAssembler.deleteClient(id);
    await loadClients();
  } catch (err) {
    if (err.response?.status === 409) {
      error.value = 'No se puede eliminar el cliente porque tiene simulaciones asociadas';
    } else {
      error.value = 'Error al eliminar cliente: ' + err.message;
    }
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  loadClients();
};

const changePage = (page) => {
  currentPage.value = page;
  loadClients();
};

onMounted(() => loadClients());
</script>

<template>
  <div>
    <div v-if="error" class="error">{{ error }}</div>
    
    <!-- Búsqueda -->
    <div class="search-bar">
      <input 
        v-model="searchQuery" 
        placeholder="Buscar clientes..."
        @input="handleSearch"
      />
    </div>

    <!-- Botón crear (solo si tiene permisos) -->
    <button v-if="canCreateClient" @click="showCreateDialog">
      Nuevo Cliente
    </button>

    <!-- Tabla de clientes -->
    <table v-if="!loading">
      <thead>
        <tr>
          <th>Nombre Completo</th>
          <th>Email</th>
          <th>Teléfono</th>
          <th>Ingreso Anual</th>
          <th>Creado por</th>
          <th v-if="canEditClient || canDeleteClient">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="client in clients" :key="client.id">
          <td>{{ client.fullName }}</td>
          <td>{{ client.email }}</td>
          <td>{{ client.phone }}</td>
          <td>{{ client.annualIncome }}</td>
          <td>{{ client.createdByUserName }}</td>
          <td v-if="canEditClient || canDeleteClient">
            <button v-if="canEditClient" @click="editClient(client)">
              Editar
            </button>
            <button v-if="canDeleteClient" @click="deleteClient(client.id)">
              Eliminar
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Paginación -->
    <div v-if="pagination" class="pagination">
      <button 
        :disabled="!pagination.hasPreviousPage" 
        @click="changePage(currentPage - 1)"
      >
        Anterior
      </button>
      <span>Página {{ pagination.currentPage }} de {{ pagination.totalPages }}</span>
      <button 
        :disabled="!pagination.hasNextPage" 
        @click="changePage(currentPage + 1)"
      >
        Siguiente
      </button>
    </div>

    <div v-if="loading">Cargando...</div>
  </div>
</template>
```

### 4. properties.component.vue (`src/domains/properties/components/`)

#### Cambios necesarios:
```vue
<script setup>
import { ref, onMounted } from 'vue';
import { PropertiesAssembler } from '../services/properties.assembler';
import { usePermissions } from '@/shared/composables/usePermissions';

const properties = ref([]);
const pagination = ref(null);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const error = ref('');

const { canCreateProperty, canEditProperty, canDeleteProperty } = usePermissions();

const loadProperties = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    const result = await PropertiesAssembler.getProperties({
      search: searchQuery.value,
      page: currentPage.value,
      pageSize: pageSize.value
    });
    
    properties.value = result.properties;
    pagination.value = result.pagination;
  } catch (err) {
    error.value = 'Error al cargar propiedades: ' + err.message;
  } finally {
    loading.value = false;
  }
};

const createProperty = async (propertyData) => {
  try {
    loading.value = true;
    error.value = '';
    
    // propertyData debe contener: code, title, address, district, province,
    // type, areaM2, price, currency, imagesUrl (array)
    await PropertiesAssembler.createProperty(propertyData);
    await loadProperties();
  } catch (err) {
    error.value = 'Error al crear propiedad: ' + err.message;
  } finally {
    loading.value = false;
  }
};

const updateProperty = async (id, propertyData) => {
  try {
    loading.value = true;
    error.value = '';
    
    await PropertiesAssembler.updateProperty(id, propertyData);
    await loadProperties();
  } catch (err) {
    error.value = 'Error al actualizar propiedad: ' + err.message;
  } finally {
    loading.value = false;
  }
};

const deleteProperty = async (id) => {
  if (!confirm('¿Está seguro de eliminar esta propiedad?')) return;
  
  try {
    loading.value = true;
    error.value = '';
    
    await PropertiesAssembler.deleteProperty(id);
    await loadProperties();
  } catch (err) {
    if (err.response?.status === 409) {
      error.value = 'No se puede eliminar la propiedad porque tiene simulaciones asociadas';
    } else {
      error.value = 'Error al eliminar propiedad: ' + err.message;
    }
  } finally {
    loading.value = false;
  }
};

const getPropertyTypeName = (type) => {
  const types = {
    1: 'Casa',
    2: 'Departamento',
    3: 'Oficina',
    4: 'Local Comercial'
  };
  return types[type] || 'Desconocido';
};

const getCurrencySymbol = (currency) => {
  return currency === 1 ? 'S/.' : '$';
};

onMounted(() => loadProperties());
</script>

<template>
  <div>
    <!-- Botón crear (solo Admin/Agent) -->
    <button v-if="canCreateProperty" @click="showCreateDialog">
      Nueva Propiedad
    </button>

    <!-- Tabla de propiedades -->
    <table v-if="!loading">
      <thead>
        <tr>
          <th>Código</th>
          <th>Título</th>
          <th>Dirección</th>
          <th>Tipo</th>
          <th>Área (m²)</th>
          <th>Precio</th>
          <th>Consultas</th>
          <th v-if="canEditProperty || canDeleteProperty">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="property in properties" :key="property.id">
          <td>{{ property.code }}</td>
          <td>{{ property.title }}</td>
          <td>{{ property.address }}, {{ property.district }}</td>
          <td>{{ getPropertyTypeName(property.type) }}</td>
          <td>{{ property.areaM2 }}</td>
          <td>{{ getCurrencySymbol(property.currency) }} {{ property.price.toLocaleString() }}</td>
          <td>{{ property.consultsCount }}</td>
          <td v-if="canEditProperty || canDeleteProperty">
            <button v-if="canEditProperty" @click="editProperty(property)">
              Editar
            </button>
            <button v-if="canDeleteProperty" @click="deleteProperty(property.id)">
              Eliminar
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
```

### 5. simulator.component.vue (`src/domains/simulator/components/`)

#### Cambios necesarios:
```vue
<script setup>
import { ref, computed, onMounted } from 'vue';
import { SimulationsAssembler } from '../services/simulations.assembler';
import { ClientsAssembler } from '../../clients/services/clients.assembler';
import { PropertiesAssembler } from '../../properties/services/properties.assembler';
import { BanksAssembler } from '../../banks/services/banks.assembler';
import { usePermissions } from '@/shared/composables/usePermissions';

const { canCreateSimulation } = usePermissions();

const clients = ref([]);
const properties = ref([]);
const banks = ref([]);
const loading = ref(false);
const error = ref('');

const simulation = ref({
  clientId: '',
  propertyId: '',
  bankId: null,
  principal: 100000,
  currency: 1, // 1 = PEN, 2 = USD
  rateType: 1, // 1 = TEA, 2 = TNA
  tea: 8.5,
  tna: 0,
  capitalizationPerYear: 12,
  termMonths: 240,
  graceType: 0, // 0 = None, 1 = Total, 2 = Partial
  graceMonths: 0,
  startDate: new Date().toISOString().split('T')[0],
  applyMiViviendaBonus: false,
  bonusAmount: 0,
  lifeInsuranceRateMonthly: 0.01,
  riskInsuranceRateAnnual: 0.1,
  feesMonthly: 50
});

const result = ref(null);

const bonusError = computed(() => {
  if (!simulation.value.applyMiViviendaBonus) return '';
  
  if (!simulation.value.bonusAmount || simulation.value.bonusAmount <= 0) {
    return 'El bono debe ser mayor a 0';
  }
  
  if (simulation.value.bonusAmount >= simulation.value.principal) {
    return 'El bono debe ser menor al monto principal';
  }
  
  return '';
});

const loadData = async () => {
  try {
    const [clientsResult, propertiesResult, banksResult] = await Promise.all([
      ClientsAssembler.getClients({ pageSize: 100 }),
      PropertiesAssembler.getProperties({ pageSize: 100 }),
      BanksAssembler.getBanks()
    ]);
    
    clients.value = clientsResult.clients;
    properties.value = propertiesResult.properties;
    banks.value = banksResult;
  } catch (err) {
    error.value = 'Error al cargar datos: ' + err.message;
  }
};

const createSimulation = async () => {
  if (bonusError.value) {
    error.value = bonusError.value;
    return;
  }
  
  try {
    loading.value = true;
    error.value = '';
    
    result.value = await SimulationsAssembler.createSimulation(simulation.value);
  } catch (err) {
    error.value = 'Error al crear simulación: ' + err.message;
  } finally {
    loading.value = false;
  }
};

const toggleBonus = () => {
  if (!simulation.value.applyMiViviendaBonus) {
    simulation.value.bonusAmount = 0;
  }
};

onMounted(() => loadData());
</script>

<template>
  <div>
    <form v-if="canCreateSimulation" @submit.prevent="createSimulation">
      <div v-if="error" class="error">{{ error }}</div>
      
      <!-- Cliente -->
      <select v-model="simulation.clientId" required>
        <option value="">Seleccionar cliente</option>
        <option v-for="client in clients" :key="client.id" :value="client.id">
          {{ client.fullName }}
        </option>
      </select>

      <!-- Propiedad -->
      <select v-model="simulation.propertyId" required>
        <option value="">Seleccionar propiedad</option>
        <option v-for="property in properties" :key="property.id" :value="property.id">
          {{ property.title }} - {{ property.address }}
        </option>
      </select>

      <!-- Banco -->
      <select v-model.number="simulation.bankId" required>
        <option :value="null">Seleccionar banco</option>
        <option v-for="bank in banks" :key="bank.id" :value="bank.id">
          {{ bank.name }} - TEA: {{ bank.annualRateTea }}%
        </option>
      </select>

      <!-- Monto principal -->
      <input 
        v-model.number="simulation.principal" 
        type="number" 
        min="1" 
        placeholder="Monto principal"
        required
      />

      <!-- Moneda -->
      <select v-model.number="simulation.currency">
        <option :value="1">Soles (PEN)</option>
        <option :value="2">Dólares (USD)</option>
      </select>

      <!-- Tipo de tasa -->
      <select v-model.number="simulation.rateType">
        <option :value="1">TEA</option>
        <option :value="2">TNA</option>
      </select>

      <!-- TEA o TNA -->
      <input 
        v-if="simulation.rateType === 1"
        v-model.number="simulation.tea" 
        type="number" 
        step="0.01"
        placeholder="TEA (%)"
        required
      />
      <input 
        v-else
        v-model.number="simulation.tna" 
        type="number" 
        step="0.01"
        placeholder="TNA (%)"
        required
      />

      <!-- Capitalización -->
      <input 
        v-model.number="simulation.capitalizationPerYear" 
        type="number" 
        min="1" 
        max="365"
        placeholder="Capitalización por año"
        required
      />

      <!-- Plazo -->
      <input 
        v-model.number="simulation.termMonths" 
        type="number" 
        min="1" 
        max="600"
        placeholder="Plazo (meses)"
        required
      />

      <!-- Tipo de gracia -->
      <select v-model.number="simulation.graceType">
        <option :value="0">Sin período de gracia</option>
        <option :value="1">Gracia total</option>
        <option :value="2">Gracia parcial</option>
      </select>

      <!-- Meses de gracia -->
      <input 
        v-if="simulation.graceType > 0"
        v-model.number="simulation.graceMonths" 
        type="number" 
        min="1" 
        max="120"
        placeholder="Meses de gracia"
      />

      <!-- Fecha de inicio -->
      <input 
        v-model="simulation.startDate" 
        type="date" 
        required
      />

      <!-- Bono MiVivienda -->
      <label>
        <input 
          v-model="simulation.applyMiViviendaBonus" 
          type="checkbox"
          @change="toggleBonus"
        />
        Aplicar Bono MiVivienda
      </label>

      <input 
        v-if="simulation.applyMiViviendaBonus"
        v-model.number="simulation.bonusAmount" 
        type="number" 
        min="1"
        :max="simulation.principal - 1"
        placeholder="Monto del bono"
        required
      />
      <div v-if="bonusError" class="error">{{ bonusError }}</div>

      <!-- Seguros y comisiones -->
      <input 
        v-model.number="simulation.lifeInsuranceRateMonthly" 
        type="number" 
        step="0.0001"
        placeholder="Seguro de vida mensual (%)"
      />

      <input 
        v-model.number="simulation.riskInsuranceRateAnnual" 
        type="number" 
        step="0.01"
        placeholder="Seguro de desgravamen anual (%)"
      />

      <input 
        v-model.number="simulation.feesMonthly" 
        type="number" 
        min="0"
        placeholder="Comisiones mensuales"
      />

      <button type="submit" :disabled="loading || !!bonusError">
        Simular
      </button>
    </form>

    <!-- Resultados -->
    <div v-if="result" class="results">
      <h2>Resultados de la Simulación</h2>
      <div class="summary">
        <p>Cliente: {{ result.clientName }}</p>
        <p>Propiedad: {{ result.propertyTitle }}</p>
        <p>Banco: {{ result.bankName }}</p>
        <p>Cuota Mensual: {{ result.monthlyPayment.toFixed(2) }}</p>
        <p>TEM: {{ (result.tem * 100).toFixed(4) }}%</p>
        <p>TCEA: {{ (result.tcea * 100).toFixed(2) }}%</p>
        <p>VAN: {{ result.van.toFixed(2) }}</p>
        <p>TIR: {{ (result.tir * 100).toFixed(4) }}%</p>
        <p>Total Intereses: {{ result.totalInterest.toFixed(2) }}</p>
        <p>Costo Total: {{ result.totalCost.toFixed(2) }}</p>
      </div>

      <!-- Tabla de amortización -->
      <table class="amortization-table">
        <thead>
          <tr>
            <th>Cuota</th>
            <th>Fecha</th>
            <th>Saldo Inicial</th>
            <th>Interés</th>
            <th>Amortización</th>
            <th>Cuota</th>
            <th>Seguro Vida</th>
            <th>Seguro Desgrav.</th>
            <th>Comisiones</th>
            <th>Saldo Final</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in result.amortizationSchedule" :key="item.period">
            <td>{{ item.period }}</td>
            <td>{{ new Date(item.dueDate).toLocaleDateString() }}</td>
            <td>{{ item.openingBalance.toFixed(2) }}</td>
            <td>{{ item.interest.toFixed(2) }}</td>
            <td>{{ item.principal.toFixed(2) }}</td>
            <td>{{ item.installment.toFixed(2) }}</td>
            <td>{{ item.lifeInsurance.toFixed(2) }}</td>
            <td>{{ item.riskInsurance.toFixed(2) }}</td>
            <td>{{ item.fees.toFixed(2) }}</td>
            <td>{{ item.closingBalance.toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
```

### 6. settings.component.vue (`src/domains/settings/components/`)

#### Cambios necesarios:
```vue
<script setup>
import { ref, onMounted } from 'vue';
import { SettingsAssembler } from '../services/settings.assembler';
import { BanksAssembler } from '../../banks/services/banks.assembler';
import { usePermissions } from '@/shared/composables/usePermissions';

const { isAdmin, canManageBanks } = usePermissions();

const profile = ref(null);
const financialEntities = ref([]);
const preferences = ref({
  defaultCurrency: 1,
  defaultRateType: 1
});
const loading = ref(false);
const error = ref('');

const loadProfile = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    profile.value = await SettingsAssembler.getProfile();
    preferences.value = {
      defaultCurrency: profile.value.defaultCurrency,
      defaultRateType: profile.value.defaultRateType
    };
  } catch (err) {
    error.value = 'Error al cargar perfil: ' + err.message;
  } finally {
    loading.value = false;
  }
};

const loadFinancialEntities = async () => {
  try {
    financialEntities.value = await SettingsAssembler.getFinancialEntities();
  } catch (err) {
    error.value = 'Error al cargar entidades financieras: ' + err.message;
  }
};

const updatePreferences = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    await SettingsAssembler.updatePreferences(preferences.value);
    alert('Preferencias actualizadas correctamente');
  } catch (err) {
    error.value = 'Error al actualizar preferencias: ' + err.message;
  } finally {
    loading.value = false;
  }
};

const createBank = async (bankData) => {
  try {
    loading.value = true;
    error.value = '';
    
    await BanksAssembler.createBank(bankData);
    await loadFinancialEntities();
  } catch (err) {
    error.value = 'Error al crear banco: ' + err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadProfile();
  loadFinancialEntities();
});
</script>

<template>
  <div>
    <div v-if="error" class="error">{{ error }}</div>

    <!-- Perfil del usuario -->
    <section v-if="profile">
      <h2>Perfil</h2>
      <p>Usuario: {{ profile.username }}</p>
      <p>Nombre: {{ profile.firstName }} {{ profile.lastName }}</p>
      <p>Email: {{ profile.email }}</p>
      <p>Teléfono: {{ profile.phone }}</p>
      <p>DNI: {{ profile.dni }}</p>
      <p>Rol: {{ profile.roleText }}</p>
    </section>

    <!-- Preferencias -->
    <section>
      <h2>Preferencias</h2>
      <form @submit.prevent="updatePreferences">
        <select v-model.number="preferences.defaultCurrency">
          <option :value="1">Soles (PEN)</option>
          <option :value="2">Dólares (USD)</option>
        </select>

        <select v-model.number="preferences.defaultRateType">
          <option :value="1">TEA</option>
          <option :value="2">TNA</option>
        </select>

        <button type="submit" :disabled="loading">
          Guardar Preferencias
        </button>
      </form>
    </section>

    <!-- Entidades financieras (solo Admin) -->
    <section v-if="canManageBanks">
      <h2>Entidades Financieras</h2>
      <button @click="showCreateBankDialog">Agregar Banco</button>
      
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>TEA Anual (%)</th>
            <th>Vigencia desde</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entity in financialEntities" :key="entity.id">
            <td>{{ entity.name }}</td>
            <td>{{ entity.annualRateTea }}</td>
            <td>{{ new Date(entity.effectiveFrom).toLocaleDateString() }}</td>
            <td>
              <button @click="editBank(entity)">Editar</button>
              <button @click="deleteBank(entity.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>
```

### 7. reports.component.vue (`src/domains/reports/components/`)

#### Cambios necesarios:
```vue
<script setup>
import { ref, onMounted } from 'vue';
import { ReportsAssembler } from '../services/reports.assembler';
import { usePermissions } from '@/shared/composables/usePermissions';

const { canViewReports } = usePermissions();

const summary = ref(null);
const mostConsulted = ref([]);
const simulationsByMonth = ref([]);
const entitySelection = ref([]);
const propertyConsults = ref([]);
const loading = ref(false);
const error = ref('');

const loadAllReports = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    const [
      summaryData,
      consultedData,
      simMonthData,
      entityData,
      propConsultsData
    ] = await Promise.all([
      ReportsAssembler.getReportsSummary(),
      ReportsAssembler.getMostConsultedProperties(),
      ReportsAssembler.getSimulationsByMonth(),
      ReportsAssembler.getEntitySelection(),
      ReportsAssembler.getPropertyConsultsByMonth()
    ]);
    
    summary.value = summaryData;
    mostConsulted.value = consultedData;
    simulationsByMonth.value = simMonthData;
    entitySelection.value = entityData;
    propertyConsults.value = propConsultsData;
  } catch (err) {
    error.value = 'Error al cargar reportes: ' + err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (canViewReports.value) {
    loadAllReports();
  }
});
</script>

<template>
  <div v-if="canViewReports">
    <div v-if="error" class="error">{{ error }}</div>

    <!-- Resumen -->
    <section v-if="summary">
      <h2>Resumen General</h2>
      <div class="summary-cards">
        <!-- Mostrar métricas del resumen -->
      </div>
    </section>

    <!-- Propiedades más consultadas -->
    <section>
      <h2>Propiedades Más Consultadas</h2>
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Dirección</th>
            <th>Consultas</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prop in mostConsulted" :key="prop.id">
            <td>{{ prop.code }}</td>
            <td>{{ prop.address }}</td>
            <td>{{ prop.consultas }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Simulaciones por mes -->
    <section>
      <h2>Simulaciones por Mes</h2>
      <table>
        <thead>
          <tr>
            <th>Mes</th>
            <th>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in simulationsByMonth" :key="item.id">
            <td>{{ item.month }}</td>
            <td>{{ item.count }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Selección de entidades -->
    <section>
      <h2>Selección de Entidades Financieras</h2>
      <table>
        <thead>
          <tr>
            <th>Entidad</th>
            <th>Porcentaje</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entity in entitySelection" :key="entity.id">
            <td>{{ entity.name }}</td>
            <td>{{ entity.percentage }}%</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
  <div v-else>
    <p>No tienes permisos para ver los reportes</p>
  </div>
</template>
```

## Actualizaciones del Router

### router/index.js

Agregar guards de autenticación:

```javascript
import { createRouter, createWebHistory } from 'vue-router';
import { isAuthenticated, hasRole, ROLES } from '@/shared/utils/permissions';

const routes = [
  // ... rutas existentes
  
  {
    path: '/users',
    component: () => import('@/domains/users/components/users.component.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login');
  } else if (to.meta.requiresAdmin && !hasRole(ROLES.ADMIN)) {
    next('/'); // Redirigir a home si no es Admin
  } else {
    next();
  }
});

export default router;
```

## Notas Finales

1. **Manejo de errores**: Todos los componentes deben mostrar mensajes de error claros cuando el backend devuelve 400, 401, 403, 404 o 409
2. **Loading states**: Mostrar indicadores de carga mientras se esperan respuestas del backend
3. **Validación**: Implementar validación en el frontend antes de enviar datos al backend
4. **Paginación**: Todos los listados deben soportar paginación
5. **Búsqueda**: Implementar búsqueda en clientes y propiedades
6. **Confirmaciones**: Pedir confirmación antes de eliminar registros
