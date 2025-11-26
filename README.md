# 🏢 Urbania360 - Simulador Financiero Inmobiliario

Sistema de gestión hipotecaria y simulación de créditos inmobiliarios desarrollado en Vue.js.

**Proyecto Final**: Curso 1ASI0642 - Finanzas e Ingeniería Económica

## 🌟 Características Principales

### 🔐 Autenticación
- Login y registro con JWT
- Roles: Admin, Agent, User
- Control de permisos por rol

### 👥 Gestión de Clientes
- CRUD completo de clientes
- Búsqueda y paginación
- Filtrado por usuario (según permisos)
- Seguimiento de ingreso anual

### 🏠 Gestión de Propiedades
- CRUD completo de propiedades inmobiliarias
- Múltiples imágenes por propiedad
- Tipos: Casa, Departamento, Oficina, Local Comercial
- Soporte para PEN (Soles) y USD (Dólares)
- Contador de consultas

### 💰 Simulador Financiero
- **Método Francés** de amortización
- **Tasas**: TEA (Tasa Efectiva Anual) y TNA (Tasa Nominal Anual)
- **Período de Gracia**: Total, Parcial o Sin gracia
- **Bono MiVivienda** con validación automática
- **Seguros**: Vida y Desgravamen
- **Indicadores**: VAN, TIR, TCEA, TEM
- **Tabla de Amortización** completa con todas las cuotas

### 📊 Panel de Reportes
- Resumen general de operaciones
- Propiedades más consultadas
- Simulaciones por mes
- Selección de entidades financieras
- Gráficos interactivos con Chart.js

### ⚙️ Configuración
- Perfil de usuario
- Preferencias (moneda y tipo de tasa por defecto)
- Gestión de entidades financieras (Admin)
- Gestión de usuarios (Admin)

## 🚀 Stack Tecnológico

- **Vue 3** con `<script setup>`
- **Vite** - Build tool y dev server
- **Vue Router** - Enrutamiento SPA
- **Axios** - Cliente HTTP
- **PrimeVue** - Componentes UI
- **Vue i18n** - Internacionalización
- **Chart.js + vue-chartjs** - Visualización de datos

## 📋 Pre-requisitos

- **Node.js** 18 o superior
- **npm** o **yarn**
- **Backend API** corriendo en `http://localhost:5294/api/v1`

## 🔧 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

### Dependencias Principales

```bash
npm install
npm install vue-chartjs chart.js
npm install @faker-js/faker
```

## ⚙️ Configuración

Crear archivo `.env` en la raíz:

```env
VITE_API_URL=http://localhost:5294/api/v1
```

## 🏃‍♂️ Ejecutar el Proyecto

### Modo Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Acceder a http://localhost:5173
```

### Build de Producción

```bash
# Compilar para producción
npm run build

# Vista previa del build
npm run preview
```

## 📁 Estructura del Proyecto

```
src/
├── domains/                    # Módulos por dominio (DDD)
│   ├── authentication/         # Login, Register
│   │   ├── components/        # Componentes Vue
│   │   └── services/          # Lógica de negocio
│   ├── clients/               # Gestión de clientes
│   │   ├── components/        
│   │   ├── model/            # Entidades
│   │   └── services/         # Assemblers y API calls
│   ├── properties/            # Gestión de propiedades
│   ├── simulator/             # Simulaciones hipotecarias
│   ├── banks/                # Entidades financieras
│   ├── users/                # Gestión de usuarios (Admin)
│   ├── settings/             # Perfil y configuración
│   └── reports/              # Reportes y estadísticas
├── shared/
│   ├── components/           # Componentes reutilizables
│   ├── composables/          # Composables de Vue
│   │   └── usePermissions.js # Control de permisos
│   ├── infrastructure/       
│   │   └── services/         # API Client y Service
│   └── utils/
│       └── permissions.js    # Lógica de permisos
├── router/                   # Configuración de rutas
├── locales/                  # Traducciones (es/en)
├── views/                    # Vistas principales
└── main.js                   # Entry point
```

## 🔐 Autenticación y Roles

### Sistema de Autenticación
- **JWT Token** guardado en `localStorage`
- Header `Authorization: Bearer {token}` en todas las peticiones
- Endpoints:
  - `POST /auth/login` (email + password)
  - `POST /auth/register` (datos completos)

### Roles del Sistema

| Rol | Valor | Permisos |
|-----|-------|----------|
| **Admin** | 1 | Acceso total, gestión de usuarios y bancos |
| **Agent** | 2 | Gestión de propiedades, clientes y simulaciones |
| **User** | 3 | Solo sus clientes y simulaciones |

### Control de Permisos

```vue
<script setup>
import { usePermissions } from '@/shared/composables/usePermissions';

const { 
  isAdmin,              // true si es Admin
  isAgent,              // true si es Agent
  canCreateProperty,    // true si puede crear propiedades
  canManageBanks        // true si puede gestionar bancos
} = usePermissions();
</script>

<template>
  <button v-if="isAdmin">Panel Admin</button>
  <button v-if="canCreateProperty">Nueva Propiedad</button>
  <button v-if="canManageBanks">Gestionar Bancos</button>
</template>
```

## 💻 Uso de Servicios (API)

### Ejemplo: Gestión de Clientes

```javascript
import { ClientsAssembler } from '@/domains/clients/services/clients.assembler';

// Listar con paginación y búsqueda
const result = await ClientsAssembler.getClients({ 
  search: 'Juan', 
  page: 1, 
  pageSize: 10 
});

console.log(result.clients);      // Array de clientes
console.log(result.pagination);   // { currentPage, totalPages, ... }

// Crear cliente
const newClient = await ClientsAssembler.createClient({
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'juan@example.com',
  phone: '987654321',
  annualIncome: 60000
});

// Actualizar
await ClientsAssembler.updateClient(id, clientData);

// Eliminar
await ClientsAssembler.deleteClient(id);
```

### Ejemplo: Simulación Hipotecaria

```javascript
import { SimulationsAssembler } from '@/domains/simulator/services/simulations.assembler';

const simulation = await SimulationsAssembler.createSimulation({
  clientId: 'uuid-del-cliente',
  propertyId: 'uuid-de-propiedad',
  bankId: 1,
  principal: 150000,        // Monto del préstamo
  currency: 1,             // 1 = PEN, 2 = USD
  rateType: 1,             // 1 = TEA, 2 = TNA
  tea: 8.5,                // 8.5%
  capitalizationPerYear: 12,
  termMonths: 240,         // 20 años
  graceType: 0,            // 0 = Sin gracia, 1 = Total, 2 = Parcial
  graceMonths: 0,
  startDate: '2025-01-01',
  applyMiViviendaBonus: true,
  bonusAmount: 35000,      // Debe ser > 0 y < principal
  lifeInsuranceRateMonthly: 0.01,
  riskInsuranceRateAnnual: 0.1,
  feesMonthly: 50
});

// Resultados
console.log(simulation.monthlyPayment);     // Cuota mensual
console.log(simulation.tcea);               // TCEA
console.log(simulation.van);                // Valor Actual Neto
console.log(simulation.tir);                // Tasa Interna de Retorno
console.log(simulation.amortizationSchedule); // Tabla completa
```

## 📊 Estructura de Datos

### Cliente
```javascript
{
  id: "uuid",
  firstName: "Juan",
  lastName: "Pérez",
  fullName: "Juan Pérez",
  email: "juan@example.com",
  phone: "987654321",
  annualIncome: 60000,
  createdByUserName: "admin",
  createdAtUtc: "2025-01-01T00:00:00Z"
}
```

### Propiedad
```javascript
{
  id: "uuid",
  code: "PROP-001",
  title: "Casa en Miraflores",
  address: "Av. Principal 123",
  district: "Miraflores",
  province: "Lima",
  type: 1,              // 1 = Casa, 2 = Departamento
  areaM2: 120,
  price: 250000,
  currency: 1,          // 1 = PEN, 2 = USD
  images: [{ id: 1, url: "..." }],
  consultsCount: 15
}
```

### Simulación (Resultado)
```javascript
{
  id: "uuid",
  clientName: "Juan Pérez",
  propertyTitle: "Casa en Miraflores",
  bankName: "Banco X",
  monthlyPayment: 1234.56,
  tem: 0.0067,          // Tasa Efectiva Mensual
  tcea: 9.25,           // TCEA %
  van: -1500.00,
  tir: 0.0065,
  totalInterest: 100000,
  totalCost: 250000,
  amortizationSchedule: [
    {
      period: 1,
      dueDate: "2025-02-01",
      openingBalance: 150000,
      interest: 1000,
      principal: 234.56,
      installment: 1234.56,
      lifeInsurance: 15,
      riskInsurance: 125,
      fees: 50,
      closingBalance: 149765.44
    },
    // ... más períodos
  ]
}
```

## 🧪 Testing

### Testing Manual
Ver **[TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)** para el checklist completo.

### Tests Automatizados (si están configurados)
```bash
npm run test
```

## 📚 Documentación Adicional

| Archivo | Descripción |
|---------|-------------|
| **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** | Guía completa de integración con el backend |
| **[COMPONENT_MIGRATION_GUIDE.md](./COMPONENT_MIGRATION_GUIDE.md)** | Ejemplos de actualización de componentes |
| **[BACKEND_INTEGRATION_SUMMARY.md](./BACKEND_INTEGRATION_SUMMARY.md)** | Resumen ejecutivo de la integración |
| **[DEPLOYMENT.md](./DEPLOYMENT.md)** | Guía de despliegue (Docker, Vercel, Netlify, Azure) |
| **[TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)** | Checklist completo de testing |

## 🚢 Deployment

### Docker
```bash
docker build -t urbania360-frontend .
docker run -p 80:80 urbania360-frontend
```

### Vercel / Netlify
```bash
npm run build
# Subir carpeta dist/
```

Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para más detalles.

## 🐛 Troubleshooting

### Error de Conexión con Backend
- ✅ Verificar que `VITE_API_URL` esté correcto en `.env`
- ✅ Confirmar que el backend está corriendo en el puerto 5294
- ✅ Revisar CORS en el backend

### Problemas de Autenticación
- ✅ Verificar que el token esté en `localStorage`
- ✅ Confirmar que el header `Authorization` se envía
- ✅ Revisar expiración del token

### Build Errors
- ✅ Limpiar `node_modules` y reinstalar: `rm -rf node_modules && npm install`
- ✅ Limpiar cache de Vite: `rm -rf .vite`
- ✅ Verificar versión de Node.js (debe ser 18+)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Abre un Pull Request

## 📝 Convenciones de Código

- Usar `<script setup>` en componentes Vue
- Servicios usan patrón **Assembler**
- Control de permisos con `usePermissions()`
- Manejo de errores con try/catch
- Nombres en español para entidades de negocio
- camelCase para variables JavaScript
- PascalCase para componentes Vue

## 📄 Licencia

Este proyecto es parte de un trabajo académico para el curso de Finanzas e Ingeniería Económica.

## 👨‍💻 Créditos

Desarrollado como Trabajo Final del curso **1ASI0642 - Finanzas e Ingeniería Económica**.

## 🔗 Enlaces

- **Backend API**: `http://localhost:5294`
- **Swagger/OpenAPI**: `http://localhost:5294/swagger`
- **Frontend Dev**: `http://localhost:5173`

---

**⚠️ Importante**: Asegúrate de tener el backend corriendo antes de iniciar el frontend.
