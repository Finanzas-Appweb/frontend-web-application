# Urbania360 - Frontend Integration Guide

## Cambios Implementados

### 1. Configuración de API
- **Variable de entorno**: Se agregó `VITE_API_URL` en `.env` apuntando a `http://localhost:5294/api/v1`
- **API Client**: Actualizado `api.client.js` para usar la variable de entorno y manejar errores ProblemDetails
- **API Service**: Completamente actualizado con todos los endpoints del backend

### 2. Servicios Actualizados

#### Autenticación (`src/domains/authentication/`)
- **Login**: `POST /auth/login` con email y password
- **Register**: `POST /auth/register` con todos los campos requeridos
- Guarda token JWT y datos del usuario en localStorage
- Funciones helper: `getCurrentUser()`, `isAuthenticated()`, `hasRole()`, etc.

#### Clientes (`src/domains/clients/`)
- **Modelo**: Actualizado con `firstName`, `lastName`, `fullName`, `createdByUserName`, `createdAtUtc`
- **CRUD completo**:
  - `GET /clients` con paginación y búsqueda
  - `GET /clients/{id}`
  - `POST /clients`
  - `PUT /clients/{id}`
  - `DELETE /clients/{id}`
- **Assembler**: Maneja paginación y transformación de DTOs

#### Propiedades (`src/domains/properties/`)
- **Modelo**: Actualizado con `title`, `district`, `province`, `type`, `areaM2`, `currency`, `images`, etc.
- **CRUD completo**:
  - `GET /properties` con paginación y búsqueda
  - `GET /properties/{id}`
  - `POST /properties` con `imagesUrl`
  - `PUT /properties/{id}`
  - `DELETE /properties/{id}`
- **Tipos**: 1 = House, 2 = Apartment
- **Monedas**: 1 = PEN, 2 = USD

#### Simulaciones (`src/domains/simulator/`)
- **Modelo completo**: Todos los campos de entrada y salida del backend
- **AmortizationItem**: Modelo para tabla de amortización
- **Validación de Bono MiVivienda**:
  - Si `applyMiViviendaBonus = false`, `bonusAmount = 0`
  - Si `applyMiViviendaBonus = true`, `bonusAmount` debe ser > 0 y < `principal`
- **CRUD**:
  - `GET /simulations` con paginación y filtro por `clientId`
  - `GET /simulations/{id}`
  - `POST /simulations`
  - `DELETE /simulations/{id}`

#### Bancos (`src/domains/banks/`)
- **Nuevo dominio** para gestión de entidades financieras
- **CRUD completo**:
  - `GET /banks`
  - `GET /banks/{id}`
  - `POST /banks`
  - `PUT /banks/{id}`
  - `DELETE /banks/{id}`
- También soporta `POST /settings/financial-entities`

#### Usuarios (`src/domains/users/`)
- **Nuevo dominio** para administración de usuarios (solo Admin)
- **Operaciones**:
  - `GET /users`
  - `GET /users/{id}`
  - `PUT /users/{id}`
- **Modelo**: Incluye `role`, `defaultCurrency`, `defaultRateType`

#### Settings (`src/domains/settings/`)
- **Profile**: `GET /settings/profile` - Perfil del usuario autenticado
- **Preferences**: `PUT /settings/preferences` - Actualizar preferencias
- **Financial Entities**: Integrado con `/banks`

#### Reportes (`src/domains/reports/`)
- **5 endpoints conectados**:
  - `GET /reports/summary`
  - `GET /reports/most-consulted-properties`
  - `GET /reports/simulations-by-month`
  - `GET /reports/entity-selection`
  - `GET /reports/property-consults-by-month`

### 3. Sistema de Permisos

#### Roles
```javascript
ROLES = {
  ADMIN: 1,   // Acceso total
  AGENT: 2,   // Gestión de propiedades, clientes y simulaciones
  USER: 3     // Usuario estándar (antes "Client")
}
```

#### Archivo de Permisos (`src/shared/utils/permissions.js`)
Funciones disponibles:
- `isAdmin()`, `isAgent()`, `isUser()`, `isAdminOrAgent()`
- `canCreateSimulation()`, `canViewAllSimulations()`, `canDeleteSimulation()`
- `canCreateClient()`, `canEditClient()`, `canDeleteClient()`
- `canCreateProperty()`, `canEditProperty()`, `canDeleteProperty()`
- `canManageBanks()`, `canManageUsers()`, `canViewReports()`
- `can(action)` - Función genérica

#### Composable Vue (`src/shared/composables/usePermissions.js`)
```vue
<script setup>
import { usePermissions } from '@/shared/composables/usePermissions';

const { 
  isAdmin, 
  canCreateProperty, 
  canManageBanks,
  can 
} = usePermissions();
</script>

<template>
  <button v-if="canCreateProperty">Crear Propiedad</button>
  <button v-if="can('bank.manage')">Gestionar Bancos</button>
</template>
```

### 4. Reglas de Permisos por Funcionalidad

#### Simulaciones
- **Crear**: Todos los roles
- **Ver todas**: Admin y Agent (User solo ve las de sus clientes)
- **Eliminar**: Admin y Agent pueden eliminar todas; User solo las de sus clientes

#### Clientes
- **Crear/Editar/Eliminar**: Todos los roles
- **Ver todos**: Admin y Agent ven todos; User solo los que creó

#### Propiedades
- **Crear/Editar**: Solo Admin y Agent
- **Ver**: Todos los roles
- **Eliminar**: Solo Admin y Agent

#### Bancos/Entidades Financieras
- **Gestión completa**: Solo Admin

#### Usuarios
- **Gestión completa**: Solo Admin

### 5. Manejo de Errores

El `api.client.js` incluye un interceptor de respuestas que maneja errores ProblemDetails:
```javascript
// El backend devuelve:
{
  "type": "https://...",
  "title": "Error title",
  "status": 400,
  "detail": "Error details",
  "traceId": "..."
}
```

### 6. Paginación

Todos los endpoints paginados devuelven:
```json
{
  "data": [ /* items */ ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 10,
    "totalCount": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## Uso en Componentes

### Ejemplo: Lista de Clientes
```vue
<script setup>
import { ref, onMounted } from 'vue';
import { ClientsAssembler } from '@/domains/clients/services/clients.assembler';
import { usePermissions } from '@/shared/composables/usePermissions';

const clients = ref([]);
const pagination = ref(null);
const { canCreateClient, canEditClient, canDeleteClient } = usePermissions();

const loadClients = async (page = 1, search = '') => {
  try {
    const result = await ClientsAssembler.getClients({ page, search });
    clients.value = result.clients;
    pagination.value = result.pagination;
  } catch (error) {
    console.error('Error al cargar clientes:', error);
  }
};

const createClient = async (clientData) => {
  try {
    const newClient = await ClientsAssembler.createClient(clientData);
    await loadClients();
  } catch (error) {
    console.error('Error al crear cliente:', error);
  }
};

onMounted(() => loadClients());
</script>

<template>
  <div>
    <button v-if="canCreateClient" @click="showCreateDialog">
      Nuevo Cliente
    </button>
    <table>
      <tr v-for="client in clients" :key="client.id">
        <td>{{ client.fullName }}</td>
        <td>{{ client.email }}</td>
        <td>
          <button v-if="canEditClient">Editar</button>
          <button v-if="canDeleteClient">Eliminar</button>
        </td>
      </tr>
    </table>
  </div>
</template>
```

### Ejemplo: Simulación con Bono MiVivienda
```vue
<script setup>
import { ref } from 'vue';
import { SimulationsAssembler } from '@/domains/simulator/services/simulations.assembler';

const simulation = ref({
  clientId: '',
  propertyId: '',
  bankId: 0,
  principal: 100000,
  currency: 1,
  rateType: 1,
  tea: 8.5,
  tna: 0,
  capitalizationPerYear: 12,
  termMonths: 240,
  graceType: 0,
  graceMonths: 0,
  startDate: '2025-01-01',
  applyMiViviendaBonus: false,
  bonusAmount: 0,
  lifeInsuranceRateMonthly: 0.01,
  riskInsuranceRateAnnual: 0.1,
  feesMonthly: 50
});

const createSimulation = async () => {
  try {
    // Validación local del bono
    if (simulation.value.applyMiViviendaBonus) {
      if (!simulation.value.bonusAmount || 
          simulation.value.bonusAmount <= 0 || 
          simulation.value.bonusAmount >= simulation.value.principal) {
        alert('El bono debe ser mayor a 0 y menor al monto principal');
        return;
      }
    }

    const result = await SimulationsAssembler.createSimulation(simulation.value);
    console.log('Simulación creada:', result);
    console.log('Cuota mensual:', result.monthlyPayment);
    console.log('TCEA:', result.tcea);
    console.log('Tabla de amortización:', result.amortizationSchedule);
  } catch (error) {
    console.error('Error al crear simulación:', error);
  }
};
</script>
```

## Próximos Pasos

1. **Actualizar componentes existentes** para usar los nuevos servicios
2. **Implementar guards de ruta** en Vue Router basados en permisos
3. **Agregar manejo de estados** con Pinia/Vuex si es necesario
4. **Implementar feedback visual** para errores de autorización (403)
5. **Agregar tests unitarios** para servicios y permisos
6. **Documentar componentes** con ejemplos de uso

## Testing

Para ejecutar el proyecto:
```bash
npm run dev
```

Para compilar producción:
```bash
npm run build
```

## Variables de Entorno

Crear archivo `.env` en la raíz:
```env
VITE_API_URL=http://localhost:5294/api/v1
```

Para producción, ajustar la URL según el entorno.
