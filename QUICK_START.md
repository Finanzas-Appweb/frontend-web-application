# 🚀 Quick Start - Urbania360

## ⚡ Inicio Rápido (5 minutos)

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
```bash
# Crear archivo .env
echo "VITE_API_URL=http://localhost:5294/api/v1" > .env
```

### 3. Iniciar Backend
Asegúrate de que el backend esté corriendo en `http://localhost:5294`

### 4. Iniciar Frontend
```bash
npm run dev
```

✅ **Listo!** Accede a http://localhost:5173

---

## 🔐 Credenciales de Prueba

Después de registrar usuarios, puedes probar con estos roles:

### Admin
- Email: `admin@urbania360.com`
- Password: (la que registres)
- **Permisos**: Acceso total al sistema

### Agent
- Email: `agent@urbania360.com`
- Password: (la que registres)
- **Permisos**: Gestión de propiedades y clientes

### User
- Email: `user@urbania360.com`
- Password: (la que registres)
- **Permisos**: Solo sus clientes y simulaciones

---

## 📋 Flujo de Trabajo Típico

### 1️⃣ Registro/Login
```
1. Ve a /login
2. Si no tienes cuenta, haz clic en "Registrarse"
3. Completa el formulario (username, nombre, apellido, DNI, email, teléfono, password)
4. Después del registro, serás redirigido al dashboard
```

### 2️⃣ Crear un Cliente
```
1. Ve a /clients
2. Clic en "Nuevo Cliente"
3. Completa: firstName, lastName, email, phone, annualIncome
4. Guardar
```

### 3️⃣ Crear una Propiedad (Admin/Agent)
```
1. Ve a /properties
2. Clic en "Nueva Propiedad"
3. Completa: código, título, dirección, distrito, provincia, tipo, área, precio, moneda
4. Opcionalmente agrega URLs de imágenes
5. Guardar
```

### 4️⃣ Crear una Simulación
```
1. Ve a /simulator
2. Selecciona cliente, propiedad y banco
3. Ingresa monto principal, tipo de moneda, tipo de tasa
4. Configura TEA/TNA, plazo en meses
5. Opcionalmente agrega período de gracia
6. Si aplica Bono MiVivienda:
   - Marca el checkbox
   - Ingresa monto del bono (> 0 y < principal)
7. Ingresa seguros y comisiones
8. Clic en "Simular"
9. Revisa:
   - Cuota mensual
   - TCEA
   - VAN, TIR
   - Tabla de amortización completa
```

### 5️⃣ Ver Reportes
```
1. Ve a /reports
2. Visualiza:
   - Resumen general
   - Propiedades más consultadas
   - Simulaciones por mes
   - Selección de entidades financieras
   - Gráficos interactivos
```

---

## 🎯 Endpoints Más Usados

### Autenticación
```javascript
// Login
POST /auth/login
{ email: "user@example.com", password: "pass123" }

// Register
POST /auth/register
{
  username: "usuario",
  firstName: "Juan",
  lastName: "Pérez",
  dni: "12345678",
  email: "juan@example.com",
  phone: "987654321",
  password: "pass123"
}
```

### Clientes
```javascript
// Listar con paginación
GET /clients?page=1&pageSize=10&search=Juan

// Crear
POST /clients
{
  firstName: "Juan",
  lastName: "Pérez",
  email: "juan@example.com",
  phone: "987654321",
  annualIncome: 60000
}
```

### Simulaciones
```javascript
// Crear
POST /simulations
{
  clientId: "uuid",
  propertyId: "uuid",
  bankId: 1,
  principal: 100000,
  currency: 1,
  rateType: 1,
  tea: 8.5,
  capitalizationPerYear: 12,
  termMonths: 240,
  graceType: 0,
  graceMonths: 0,
  startDate: "2025-01-01",
  applyMiViviendaBonus: false,
  bonusAmount: 0,
  lifeInsuranceRateMonthly: 0.01,
  riskInsuranceRateAnnual: 0.1,
  feesMonthly: 50
}
```

---

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar dev server
npm run build            # Build de producción
npm run preview          # Preview del build

# Testing (si está configurado)
npm run test            # Ejecutar tests
npm run test:watch      # Tests en watch mode

# Linting (si está configurado)
npm run lint            # Ejecutar linter
npm run lint:fix        # Fix automático
```

---

## 📁 Archivos Importantes

| Archivo | Para qué sirve |
|---------|----------------|
| `.env` | Variables de entorno (API URL) |
| `src/main.js` | Entry point de la aplicación |
| `src/router/index.js` | Configuración de rutas |
| `src/shared/infraestructure/services/api.service.js` | Todos los endpoints |
| `src/shared/utils/permissions.js` | Lógica de permisos |
| `src/shared/composables/usePermissions.js` | Composable de permisos |

---

## 🐛 Troubleshooting Rápido

### Error: Cannot connect to API
```bash
# Verificar que el backend esté corriendo
curl http://localhost:5294/api/v1

# Verificar variable de entorno
cat .env
# Debe mostrar: VITE_API_URL=http://localhost:5294/api/v1

# Reiniciar el dev server
Ctrl+C
npm run dev
```

### Error: CORS
```
El backend debe tener CORS configurado para aceptar requests de http://localhost:5173
```

### Error: 401 Unauthorized
```bash
# Hacer logout y login nuevamente
localStorage.clear()
# Luego hacer login en la UI
```

### Error: Build fails
```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# Limpiar cache de Vite
rm -rf .vite

# Build nuevamente
npm run build
```

---

## 📚 Documentación Completa

Para más detalles, consulta:

| Documento | Descripción |
|-----------|-------------|
| `BACKEND_INTEGRATION_SUMMARY.md` | Resumen ejecutivo |
| `INTEGRATION_GUIDE.md` | Guía completa de integración |
| `COMPONENT_MIGRATION_GUIDE.md` | Cómo actualizar componentes |
| `TESTING_CHECKLIST.md` | Checklist de testing |
| `DEPLOYMENT.md` | Cómo desplegar |
| `README_NEW.md` | README completo |

---

## 💡 Tips

### Usar Permisos en Componentes
```vue
<script setup>
import { usePermissions } from '@/shared/composables/usePermissions';
const { canCreateProperty, isAdmin } = usePermissions();
</script>

<template>
  <button v-if="canCreateProperty">Nueva Propiedad</button>
  <section v-if="isAdmin">Admin Panel</section>
</template>
```

### Llamar a la API
```javascript
import { ClientsAssembler } from '@/domains/clients/services/clients.assembler';

// En un método async
try {
  const result = await ClientsAssembler.getClients({ page: 1 });
  console.log(result.clients);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Validar Bono MiVivienda
```javascript
// Validación automática en el assembler
if (applyMiViviendaBonus) {
  // bonusAmount debe ser > 0 y < principal
  // Si es inválido, el assembler lanzará un error
}
```

---

## 🎉 ¡Ya estás listo!

Ahora puedes:
1. ✅ Registrar usuarios con diferentes roles
2. ✅ Crear clientes y propiedades
3. ✅ Ejecutar simulaciones hipotecarias
4. ✅ Ver reportes y estadísticas
5. ✅ Gestionar el sistema según tu rol

**¡Disfruta desarrollando con Urbania360!** 🚀
