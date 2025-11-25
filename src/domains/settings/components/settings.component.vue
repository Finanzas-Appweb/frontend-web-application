<script setup>
import { ref, reactive, onMounted } from "vue"
import { SettingsAssembler } from "../services/settings.assembler.js"
import { BanksAssembler } from "../../banks/services/banks.assembler.js"
import { usePermissions } from "../../../shared/composables/usePermissions.js"
import NavBar from "../../../shared/presentation/components/nav-bar.vue"
import FooterContent from "../../../shared/presentation/components/footer-content.vue"

const permissions = usePermissions()

// Datos
const profile = ref({})
const financialEntities = ref([])
const preferences = reactive({
  defaultCurrency: 1,
  defaultRateType: 1,
})
const loading = ref(true)
const errorMessage = ref("")

// Modal de añadir/editar entidad
const showEntityModal = ref(false)
const isEditingEntity = ref(false)
const entityForm = reactive({ 
  id: null,
  name: "", 
  annualRateTea: 0,
  annualRateTna: 0,
  effectiveFrom: ""
})

// Cargar datos iniciales
onMounted(async () => {
  try {
    loading.value = true
    errorMessage.value = ""
    
    // Cargar perfil y preferencias
    const profileData = await SettingsAssembler.getProfile()
    profile.value = profileData
    preferences.defaultCurrency = profileData.defaultCurrency || 1
    preferences.defaultRateType = profileData.defaultRateType || 1
    
    // Cargar entidades financieras para TODOS los usuarios (visibles)
    await loadFinancialEntities()
  } catch (error) {
    console.error("Error cargando configuraciones:", error)
    errorMessage.value = error.response?.data?.title || "No se pudo cargar la configuración"
  } finally {
    loading.value = false
  }
})

const loadFinancialEntities = async () => {
  try {
    const result = await BanksAssembler.getBanks()
    financialEntities.value = result
  } catch (error) {
    console.error("Error cargando entidades:", error)
  }
}

// Guardar preferencias
const savePreferences = async () => {
  try {
    await SettingsAssembler.updatePreferences(preferences)
    alert("Preferencias guardadas correctamente")
  } catch (error) {
    console.error("Error al guardar preferencias:", error)
    if (error.response?.data?.title) {
      alert(`Error: ${error.response.data.title}`)
    }
  }
}

// Añadir entidad
const openAddEntity = () => {
  isEditingEntity.value = false
  entityForm.id = null
  entityForm.name = ""
  entityForm.annualRateTea = 0
  entityForm.annualRateTna = 0
  entityForm.effectiveFrom = new Date().toISOString().split('T')[0]
  showEntityModal.value = true
}

const openEditEntity = (entity) => {
  isEditingEntity.value = true
  entityForm.id = entity.id
  entityForm.name = entity.name
  entityForm.annualRateTea = entity.annualRateTea
  entityForm.annualRateTna = entity.annualRateTna || 0
  entityForm.effectiveFrom = entity.effectiveFrom ? entity.effectiveFrom.split('T')[0] : ""
  showEntityModal.value = true
}

const saveEntity = async () => {
  try {
    if (isEditingEntity.value) {
      await BanksAssembler.updateBank(entityForm.id, {
        name: entityForm.name,
        annualRateTea: entityForm.annualRateTea,
        annualRateTna: entityForm.annualRateTna,
        effectiveFrom: entityForm.effectiveFrom
      })
      alert("Entidad actualizada correctamente")
    } else {
      await BanksAssembler.createBank({
        name: entityForm.name,
        annualRateTea: entityForm.annualRateTea,
        annualRateTna: entityForm.annualRateTna,
        effectiveFrom: entityForm.effectiveFrom
      })
      alert("Entidad creada correctamente")
    }
    showEntityModal.value = false
    await loadFinancialEntities()
  } catch (error) {
    console.error("Error al guardar entidad:", error)
    if (error.response?.data?.title) {
      alert(`Error: ${error.response.data.title}`)
    }
  }
}

const deleteEntity = async (entity) => {
  if (!confirm(`¿Estás seguro de eliminar la entidad ${entity.name}?`)) {
    return
  }
  try {
    await BanksAssembler.deleteBank(entity.id)
    alert("Entidad eliminada correctamente")
    await loadFinancialEntities()
  } catch (error) {
    console.error("Error al eliminar entidad:", error)
    if (error.response?.data?.title) {
      alert(`Error: ${error.response.data.title}`)
    }
  }
}

// Helper para formatear tasa como porcentaje (el backend envía decimal ej: 0.085 = 8.5%)
const formatRate = (rate) => {
  if (!rate && rate !== 0) return '-'
  // Si la tasa es menor a 1, asumimos que está en decimal (0.085 = 8.5%)
  const percentage = rate < 1 ? rate * 100 : rate
  return percentage.toFixed(2) + '%'
}
</script>

<template>
  <nav-bar></nav-bar>
  <div class="settings-page">
    <h1 class="page-title">Configuración</h1>

    <div v-if="loading" class="loading-container">
      <p>Cargando configuración...</p>
    </div>
    <div v-else-if="errorMessage" class="loading-container">
      <p>{{ errorMessage }}</p>
    </div>
    <div v-else class="settings-content">
      <div class="top-section">
        <!-- Perfil agrandado -->
        <div class="profile-card">
          <h2>Mi Perfil</h2>
          <div class="profile-header">
            <div class="profile-avatar">{{ profile.firstName?.charAt(0) }}{{ profile.lastName?.charAt(0) }}</div>
            <div class="profile-name">
              <h3>{{ profile.firstName }} {{ profile.lastName }}</h3>
              <span class="role-badge">{{ profile.roleText || permissions.roleText.value }}</span>
            </div>
          </div>
          <div class="profile-fields">
            <div class="field">
              <span class="label">👤 Usuario:</span> 
              <span class="value">{{ profile.username }}</span>
            </div>
            <div class="field">
              <span class="label">🪪 DNI:</span> 
              <span class="value">{{ profile.dni }}</span>
            </div>
            <div class="field">
              <span class="label">📧 Correo:</span> 
              <span class="value">{{ profile.email }}</span>
            </div>
            <div class="field">
              <span class="label">📱 Teléfono:</span> 
              <span class="value">{{ profile.phone || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="defaults-card">
          <h2>Valores por Defecto</h2>
          <div class="form-group">
            <label>Moneda por defecto:</label>
            <select v-model.number="preferences.defaultCurrency">
              <option :value="1">Soles (PEN)</option>
              <option :value="2">Dólares (USD)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Tipo de tasa por defecto:</label>
            <select v-model.number="preferences.defaultRateType">
              <option :value="1">TEA (Tasa Efectiva Anual)</option>
              <option :value="2">TNA (Tasa Nominal Anual)</option>
            </select>
          </div>
          <button class="save-preferences-btn" @click="savePreferences">Guardar Preferencias</button>
        </div>
      </div>

      <!-- Bancos visibles para TODOS, pero solo editable por Admin/Agent -->
      <div class="financial-card">
        <div class="card-header">
          <h2>Entidades Financieras</h2>
          <button v-if="permissions.canManageBanks.value" class="add-btn" @click="openAddEntity">+ Añadir Entidad</button>
        </div>
        <table v-if="financialEntities.length > 0" class="financial-table">
          <thead>
          <tr>
            <th>Entidad</th>
            <th>TEA</th>
            <th>TNA</th>
            <th>Vigente Desde</th>
            <th v-if="permissions.canManageBanks.value">Acciones</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="entity in financialEntities" :key="entity.id">
            <td>{{ entity.name }}</td>
            <td>{{ formatRate(entity.annualRateTea) }}</td>
            <td>{{ formatRate(entity.annualRateTna) }}</td>
            <td>{{ entity.effectiveFrom ? new Date(entity.effectiveFrom).toLocaleDateString('es-PE') : '-' }}</td>
            <td v-if="permissions.canManageBanks.value">
              <button class="icon-btn" @click="openEditEntity(entity)" title="Editar">✏️</button>
              <button class="icon-btn delete" @click="deleteEntity(entity)" title="Eliminar">🗑️</button>
            </td>
          </tr>
          </tbody>
        </table>
        <p v-else class="no-data-small">No hay entidades financieras registradas</p>
      </div>
    </div>

    <!-- Modal añadir/editar entidad -->
    <div v-if="showEntityModal" class="modal-backdrop" @click.self="showEntityModal = false">
      <div class="modal">
        <h3>{{ isEditingEntity ? 'Editar Entidad' : 'Añadir Entidad' }}</h3>
        <form @submit.prevent="saveEntity">
          <div class="form-group">
            <label>Nombre de la Entidad:</label>
            <input v-model="entityForm.name" required />
          </div>
          <div class="form-group">
            <label>TEA (Tasa Efectiva Anual %):</label>
            <input v-model.number="entityForm.annualRateTea" type="number" step="0.0001" min="0" required placeholder="Ej: 0.085 para 8.5%" />
            <small class="hint">Ingrese en decimal. Ej: 0.085 = 8.5%</small>
          </div>
          <div class="form-group">
            <label>TNA (Tasa Nominal Anual %):</label>
            <input v-model.number="entityForm.annualRateTna" type="number" step="0.0001" min="0" required placeholder="Ej: 0.0817 para 8.17%" />
            <small class="hint">Ingrese en decimal. Ej: 0.0817 = 8.17%</small>
          </div>
          <div class="form-group">
            <label>Vigente Desde:</label>
            <input v-model="entityForm.effectiveFrom" type="date" required />
          </div>
          <div class="modal-actions">
            <button type="submit" class="save-btn">{{ isEditingEntity ? 'Actualizar' : 'Añadir' }}</button>
            <button type="button" @click="showEntityModal=false" class="cancel-btn">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <footer-content></footer-content>
</template>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: #eef2f6;
  padding: 30px 40px;
  font-family: 'Roboto', sans-serif;
}

.page-title {
  text-align: center;
  color: #255a8a;
  font-size: 30px;
  font-weight: 800;
  margin-bottom: 25px;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.top-section {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 25px;
}

.profile-card, .defaults-card, .financial-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 10px 24px rgba(0,0,0,0.08);
}

.profile-card h2, .defaults-card h2, .financial-card h2 {
  margin: 0 0 20px;
  color: #255a8a;
  font-size: 20px;
}

/* Perfil mejorado */
.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e4ecf4;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #377FBD, #5BA3D0);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 800;
  flex-shrink: 0;
}

.profile-name h3 {
  margin: 0 0 8px;
  color: #1f2937;
  font-size: 22px;
  font-weight: 700;
}

.role-badge {
  background: linear-gradient(135deg, #377FBD, #5BA3D0);
  color: white;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.profile-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.field {
  background: #f6f9fc;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid #e4ecf4;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field .label {
  color: #255a8a;
  font-weight: 700;
  font-size: 13px;
}

.field .value {
  color: #1f2937;
  font-size: 15px;
  font-weight: 500;
}

.defaults-card .form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  color: #1f2937;
}

.defaults-card .form-group label {
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 14px;
}

.defaults-card select {
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #0f172a;
  font-weight: 600;
  font-size: 14px;
}

.save-preferences-btn {
  width: 100%;
  background: #377fbd;
  color: #fff;
  border: none;
  padding: 14px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-top: 10px;
}

.save-preferences-btn:hover {
  background: #2d6ba1;
}

.financial-card {
  padding: 25px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.add-btn {
  background-color:#10b981;
  border:none;
  padding: 10px 18px;
  border-radius: 8px;
  cursor:pointer;
  color:white;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.2s;
}
.add-btn:hover {
  background-color:#059669;
}

.financial-table {
  width:100%;
  border-collapse:collapse;
}
.financial-table th, .financial-table td {
  text-align:left;
  padding: 14px 12px;
  border-bottom: 1px solid #e5e7eb;
}
.financial-table th {
  color:#1e3a8a;
  font-weight: 700;
  background: #f0f4f8;
  font-size: 14px;
}
.financial-table td {
  font-size: 14px;
  color: #374151;
}
.icon-btn {
  background:none;
  border:none;
  cursor:pointer;
  color:#1e3a8a;
  font-size:1.1rem;
  margin-right:0.5rem;
  padding: 4px;
  transition: transform 0.2s;
}
.icon-btn:hover {
  transform: scale(1.15);
}
.icon-btn.delete {
  color:#ef4444;
}

.modal-backdrop {
  position: fixed;
  inset:0;
  background: rgba(0,0,0,0.3);
  display:flex;
  justify-content:center;
  align-items:center;
  z-index:1000;
}
.modal {
  background:#ffffff;
  padding: 28px;
  border-radius: 16px;
  width: 440px;
  color:#1e3a8a;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}
.modal h3 {
  margin: 0 0 20px;
  font-size: 20px;
}
.modal .form-group {
  margin-bottom: 16px;
}
.modal .form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 14px;
  color: #1e3a8a;
}
.modal .form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}
.modal .form-group .hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}
.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}
.save-btn {
  background:#3b82f6;
  color:white;
  border:none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor:pointer;
  font-weight: 600;
  font-size: 14px;
  flex: 1;
}
.cancel-btn { 
  background:#ef4444; 
  color:white; 
  border:none; 
  padding: 10px 20px; 
  border-radius: 8px; 
  cursor:pointer; 
  font-weight: 600;
  font-size: 14px;
  flex: 1;
}
.save-btn:hover { background:#2563eb; }
.cancel-btn:hover { background:#b91c1c; }

.loading-container {
  text-align: center;
  padding: 50px;
  color: #377FBD;
  font-size: 18px;
}

.no-data-small {
  text-align: center;
  padding: 30px;
  color: #666;
  font-style: italic;
  font-size: 14px;
}

@media (max-width: 1024px) {
  .top-section {
    grid-template-columns: 1fr;
  }
  .profile-fields {
    grid-template-columns: 1fr;
  }
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>
