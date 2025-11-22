# Testing Checklist - Urbania360 Frontend

## Pre-requisitos
- [ ] Backend corriendo en `http://localhost:5294`
- [ ] Variable `VITE_API_URL` configurada
- [ ] Frontend corriendo en `http://localhost:5173`

## 1. Autenticación

### Register
- [ ] Formulario de registro muestra todos los campos (username, firstName, lastName, dni, email, phone, password)
- [ ] Validación de DNI (8 dígitos)
- [ ] Registro exitoso guarda token en localStorage
- [ ] Registro exitoso guarda datos de usuario en localStorage
- [ ] Registro exitoso redirige a dashboard
- [ ] Error 400 muestra mensaje claro
- [ ] Campos vacíos muestran validación

### Login
- [ ] Formulario usa email (no username)
- [ ] Login exitoso guarda token
- [ ] Login exitoso guarda datos de usuario
- [ ] Login exitoso redirige a dashboard
- [ ] Error 401 muestra "credenciales incorrectas"
- [ ] Email inválido muestra error

### Logout
- [ ] Logout elimina token de localStorage
- [ ] Logout elimina datos de usuario
- [ ] Logout redirige a login

## 2. Clientes

### Listar Clientes
- [ ] GET /clients carga correctamente
- [ ] Muestra firstName, lastName, fullName
- [ ] Muestra email, phone, annualIncome
- [ ] Muestra createdByUserName
- [ ] Paginación funciona correctamente
- [ ] Búsqueda filtra resultados
- [ ] Admin/Agent ven todos los clientes
- [ ] User solo ve sus clientes

### Crear Cliente
- [ ] Botón visible para todos los roles
- [ ] Formulario tiene firstName, lastName, email, phone, annualIncome
- [ ] POST /clients crea correctamente
- [ ] Validación de email funciona
- [ ] Error 400 muestra detalles
- [ ] Lista se actualiza después de crear

### Editar Cliente
- [ ] Botón visible según permisos
- [ ] Formulario carga datos existentes
- [ ] PUT /clients/{id} actualiza correctamente
- [ ] Lista se actualiza después de editar

### Eliminar Cliente
- [ ] Botón visible según permisos
- [ ] Confirmación antes de eliminar
- [ ] DELETE /clients/{id} elimina correctamente
- [ ] Error 409 si tiene simulaciones
- [ ] Lista se actualiza después de eliminar
- [ ] Error 403 si User intenta eliminar cliente de otro

## 3. Propiedades

### Listar Propiedades
- [ ] GET /properties carga correctamente
- [ ] Muestra code, title, address, district, province
- [ ] Muestra type (Casa/Departamento)
- [ ] Muestra areaM2, price, currency
- [ ] Muestra consultsCount
- [ ] Paginación funciona
- [ ] Búsqueda funciona
- [ ] Todos los roles pueden ver

### Crear Propiedad
- [ ] Botón SOLO visible para Admin/Agent
- [ ] Formulario completo con todos los campos
- [ ] Campo imagesUrl acepta múltiples URLs
- [ ] POST /properties crea correctamente
- [ ] Validación de campos requeridos
- [ ] User NO puede crear (botón oculto)

### Editar Propiedad
- [ ] Botón SOLO visible para Admin/Agent
- [ ] PUT /properties/{id} actualiza
- [ ] User NO puede editar

### Eliminar Propiedad
- [ ] Botón SOLO visible para Admin/Agent
- [ ] DELETE /properties/{id} elimina
- [ ] Error 409 si tiene simulaciones
- [ ] User NO puede eliminar

## 4. Simulaciones

### Listar Simulaciones
- [ ] GET /simulations carga correctamente
- [ ] Muestra clientName, propertyTitle, bankName
- [ ] Muestra monthlyPayment, tcea
- [ ] Admin/Agent ven todas
- [ ] User solo ve simulaciones de sus clientes
- [ ] Filtro por clientId funciona
- [ ] Paginación funciona

### Crear Simulación
- [ ] Formulario muestra todos los campos
- [ ] Dropdowns cargan clientes, propiedades, bancos
- [ ] Validación de campos numéricos
- [ ] Checkbox "Aplicar Bono MiVivienda" funciona
- [ ] Validación de bono:
  - [ ] Si aplica, bonusAmount > 0
  - [ ] Si aplica, bonusAmount < principal
  - [ ] Si no aplica, bonusAmount = 0
- [ ] POST /simulations crea correctamente
- [ ] Resultados muestran:
  - [ ] monthlyPayment
  - [ ] tem, tcea
  - [ ] van, tir
  - [ ] totalInterest, totalCost
- [ ] Tabla de amortización muestra todos los períodos
- [ ] Tabla tiene todas las columnas

### Eliminar Simulación
- [ ] DELETE /simulations/{id} funciona
- [ ] Admin/Agent pueden eliminar todas
- [ ] User solo puede eliminar de sus clientes
- [ ] Error 403 si User intenta eliminar de otro

## 5. Bancos (Admin only)

### Listar Bancos
- [ ] GET /banks carga correctamente
- [ ] Muestra name, annualRateTea, effectiveFrom
- [ ] Solo Admin ve la sección
- [ ] Agent/User NO ven esta sección

### Crear Banco
- [ ] POST /banks funciona (Admin only)
- [ ] Validación de campos
- [ ] Lista se actualiza

### Editar Banco
- [ ] PUT /banks/{id} funciona (Admin only)
- [ ] Campos se cargan correctamente

### Eliminar Banco
- [ ] DELETE /banks/{id} funciona (Admin only)
- [ ] Error 409 si tiene simulaciones

## 6. Usuarios (Admin only)

### Listar Usuarios
- [ ] GET /users carga correctamente (Admin only)
- [ ] Muestra username, firstName, lastName, dni, email, phone, role
- [ ] Solo Admin ve esta sección
- [ ] Agent/User NO ven usuarios

### Editar Usuario
- [ ] PUT /users/{id} funciona (Admin only)
- [ ] NO permite cambiar role
- [ ] Actualiza defaultCurrency, defaultRateType

## 7. Settings/Profile

### Ver Perfil
- [ ] GET /settings/profile carga datos del usuario autenticado
- [ ] Muestra username, email, role, etc.
- [ ] Muestra defaultCurrency, defaultRateType

### Actualizar Preferencias
- [ ] PUT /settings/preferences funciona
- [ ] Actualiza defaultCurrency
- [ ] Actualiza defaultRateType

### Entidades Financieras (en Settings)
- [ ] Solo Admin ve esta sección
- [ ] Usa POST /settings/financial-entities
- [ ] Lista se carga con GET /banks

## 8. Reportes

### Resumen
- [ ] GET /reports/summary carga datos
- [ ] Muestra métricas generales

### Propiedades Más Consultadas
- [ ] GET /reports/most-consulted-properties funciona
- [ ] Muestra ranking de propiedades

### Simulaciones por Mes
- [ ] GET /reports/simulations-by-month funciona
- [ ] Muestra gráfico/tabla mensual

### Selección de Entidades
- [ ] GET /reports/entity-selection funciona
- [ ] Muestra distribución de bancos

### Consultas por Mes
- [ ] GET /reports/property-consults-by-month funciona
- [ ] Datos correctos

## 9. Permisos y Roles

### Admin (role = 1)
- [ ] Ve todos los clientes
- [ ] Ve todas las propiedades
- [ ] Ve todas las simulaciones
- [ ] Puede crear/editar/eliminar propiedades
- [ ] Puede gestionar bancos
- [ ] Puede gestionar usuarios
- [ ] Ve todos los reportes

### Agent (role = 2)
- [ ] Ve todos los clientes
- [ ] Ve todas las propiedades
- [ ] Ve todas las simulaciones
- [ ] Puede crear/editar/eliminar propiedades
- [ ] NO puede gestionar bancos
- [ ] NO puede gestionar usuarios
- [ ] Ve todos los reportes

### User (role = 3)
- [ ] Solo ve sus clientes
- [ ] Ve todas las propiedades
- [ ] Solo ve simulaciones de sus clientes
- [ ] NO puede crear/editar/eliminar propiedades
- [ ] NO puede gestionar bancos
- [ ] NO puede gestionar usuarios
- [ ] Ve reportes (filtrados por backend)

## 10. Manejo de Errores

### Errores HTTP
- [ ] 400 Bad Request muestra mensaje del ProblemDetails
- [ ] 401 Unauthorized redirige a login
- [ ] 403 Forbidden muestra "No autorizado"
- [ ] 404 Not Found muestra "No encontrado"
- [ ] 409 Conflict muestra mensaje específico
- [ ] 500 Server Error muestra mensaje genérico

### Validaciones Frontend
- [ ] Campos requeridos muestran error
- [ ] Email inválido muestra error
- [ ] DNI debe tener 8 dígitos
- [ ] Bono MiVivienda valida correctamente
- [ ] Números negativos no permitidos

## 11. UX y Loading States

### Loading
- [ ] Spinner/loading durante peticiones
- [ ] Botones deshabilitados durante carga
- [ ] No permite doble submit

### Feedback
- [ ] Mensaje de éxito después de crear/editar
- [ ] Mensaje de error claro
- [ ] Confirmación antes de eliminar

### Navegación
- [ ] Redirecciones correctas después de acciones
- [ ] Guards de ruta funcionan
- [ ] Rutas protegidas requieren auth

## 12. Build y Deployment

### Development
- [ ] `npm run dev` inicia sin errores
- [ ] Hot reload funciona
- [ ] Sin warnings en consola

### Production Build
- [ ] `npm run build` completa sin errores
- [ ] Archivos generados en /dist
- [ ] Sin errores en build
- [ ] Tamaño de bundle razonable

### Environment
- [ ] Variable VITE_API_URL funciona
- [ ] Diferentes configs para dev/prod
- [ ] .env.example documentado

## 13. Seguridad

### Tokens
- [ ] JWT guardado en localStorage
- [ ] Token enviado en Authorization header
- [ ] Token removido en logout
- [ ] Renovación de token (si implementado)

### Datos Sensibles
- [ ] Passwords no expuestos en logs
- [ ] No se muestra token en consola
- [ ] Headers correctos en requests

## 14. Compatibilidad

### Navegadores
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

### Responsive
- [ ] Tablas se adaptan a mobile
- [ ] Formularios usables en mobile
- [ ] Navegación mobile funcional

## 15. Performance

### Tiempos de Carga
- [ ] Páginas cargan en < 3 segundos
- [ ] Paginación evita cargas masivas
- [ ] Búsqueda no sobrecarga servidor

### Optimizaciones
- [ ] Lazy loading de rutas (si implementado)
- [ ] Debounce en búsquedas
- [ ] Cache de datos cuando apropiado

---

## Checklist Rápido

### ✅ Funcionalidades Core
- [ ] Login funciona
- [ ] Registro funciona
- [ ] Clientes CRUD completo
- [ ] Propiedades CRUD completo
- [ ] Simulaciones funcionan
- [ ] Tabla de amortización correcta
- [ ] Permisos por rol implementados

### ✅ Configuración
- [ ] .env configurado
- [ ] API URL correcta
- [ ] Build sin errores

### ✅ Testing Manual
- [ ] Probado como Admin
- [ ] Probado como Agent
- [ ] Probado como User
- [ ] Errores manejan correctamente

---

## Notas de Testing

Registrar cualquier bug encontrado con:
- Descripción del error
- Pasos para reproducir
- Rol del usuario
- Respuesta del backend (si aplica)
- Mensaje de error mostrado

## Herramientas Recomendadas

- **Browser DevTools**: Network tab para ver requests
- **Vue DevTools**: Para debugging de componentes
- **Postman**: Para probar endpoints directamente
- **Jest/Vitest**: Para tests unitarios (si se implementan)
