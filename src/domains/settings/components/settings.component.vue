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
    
    // Cargar entidades financieras
    if (permissions.canManageBanks.value) {
      await loadFinancialEntities()
    }
  } catch (error) {
    console.error("Error cargando configuraciones:", error)
    errorMessage.value = error.response?.data?.title || "No se pudo cargar la configuración"
    if (error.response?.data?.title) {
      alert(`Error: ${error.response.data.title}`)
    }
  } finally {
    loading.value = false
  }
})

const loadFinancialEntities = async () => {
  try {
    const result = await SettingsAssembler.getFinancialEntities()
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
  entityForm.effectiveFrom = new Date().toISOString().split('T')[0]
  showEntityModal.value = true
}

const openEditEntity = (entity) => {
  isEditingEntity.value = true
  entityForm.id = entity.id
  entityForm.name = entity.name
  entityForm.annualRateTea = entity.annualRateTea
  entityForm.effectiveFrom = entity.effectiveFrom ? entity.effectiveFrom.split('T')[0] : ""
  showEntityModal.value = true
}

const saveEntity = async () => {
  try {
    if (isEditingEntity.value) {
      await BanksAssembler.updateBank(entityForm.id, {
        name: entityForm.name,
        annualRateTea: entityForm.annualRateTea,
        effectiveFrom: entityForm.effectiveFrom
      })
      alert("Entidad actualizada correctamente")
    } else {
      await BanksAssembler.createBank({
        name: entityForm.name,
        annualRateTea: entityForm.annualRateTea,
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
</script>

<template>
  <nav-bar></nav-bar>
  <div class="settings-page">
    <h1 class="page-title">Settings</h1>

    <div v-if="loading" class="loading-container">
      <p>Cargando configuración...</p>
    </div>
    <div v-else-if="errorMessage" class="loading-container">
      <p>{{ errorMessage }}</p>
    </div>
    <div v-else class="settings-content">
      <div class="top-section">
        <div class="profile-card">
          <h2>Mi Perfil</h2>
          <div class="profile-avatar">{{ profile.firstName?.charAt(0) }}{{ profile.lastName?.charAt(0) }}</div>
          <div class="profile-fields">
            <div class="field"><span class="label">Usuario:</span> <span>{{ profile.username }}</span></div>
            <div class="field"><span class="label">Nombres:</span> <span>{{ profile.firstName }}</span></div>
            <div class="field"><span class="label">Apellidos:</span> <span>{{ profile.lastName }}</span></div>
            <div class="field"><span class="label">DNI:</span> <span>{{ profile.dni }}</span></div>
            <div class="field"><span class="label">Teléfono:</span> <span>{{ profile.phone }}</span></div>
            <div class="field"><span class="label">Correo:</span> <span>{{ profile.email }}</span></div>
            <div class="field"><span class="label">Rol:</span> <span>{{ profile.roleText || permissions.roleText.value }}</span></div>
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

      <div v-if="permissions.canManageBanks.value" class="financial-card">
        <div class="card-header">
          <h2>Entidades Financieras</h2>
          <button class="add-btn" @click="openAddEntity">+ Añadir Entidad</button>
        </div>
        <table v-if="financialEntities.length > 0" class="financial-table">
          <thead>
          <tr>
            <th>Entidad</th>
            <th>Tasa Anual (TEA %)</th>
            <th>Vigente Desde</th>
            <th>Acciones</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="entity in financialEntities" :key="entity.id">
            <td>{{ entity.name }}</td>
            <td>{{ entity.annualRateTea?.toFixed(2) }}%</td>
            <td>{{ entity.effectiveFrom ? new Date(entity.effectiveFrom).toLocaleDateString('es-PE') : '-' }}</td>
            <td>
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
            <label>Tasa Anual (TEA %):</label>
            <input v-model.number="entityForm.annualRateTea" type="number" step="0.01" required />
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
  margin-bottom: 20px;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.top-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.profile-card, .defaults-card, .financial-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 24px rgba(0,0,0,0.08);
}

.profile-card h2, .defaults-card h2, .financial-card h2 {
  margin: 0 0 16px;
  color: #255a8a;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #377FBD, #5BA3D0);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 42px;
  font-weight: 800;
  margin: 10px auto 20px;
}

.profile-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.field {
  background: #f6f9fc;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #e4ecf4;
  color: #1f2937;
  font-size: 14px;
}

.label {
  color: #255a8a;
  font-weight: 700;
  margin-right: 4px;
}

.defaults-card .form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 14px;
  color: #1f2937;
}

.defaults-card select {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #0f172a;
  font-weight: 600;
}

.save-preferences-btn {
  width: 100%;
  background: #377fbd;
  color: #fff;
  border: none;
  padding: 12px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease;
}

.save-preferences-btn:hover {
  background: #2d6ba1;
}

.financial-card {
  padding: 20px 24px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.add-btn {
  background-color:#10b981;
  border:none;
  padding:0.6rem 1.2rem;
  border-radius:0.5rem;
  cursor:pointer;
  color:white;
  font-size: 14px;
  font-weight: 600;
}
.add-btn:hover {
  background-color:#059669;
}

.financial-table {
  width:100%;
  border-collapse:collapse;
  margin-top:1rem;
}
.financial-table th, .financial-table td {
  text-align:left;
  padding: 12px 10px;
  border-bottom: 1px solid #e5e7eb;
}
.financial-table th {
  color:#1e3a8a;
  font-weight: 700;
  background: #f0f4f8;
}
.icon-btn {
  background:none;
  border:none;
  cursor:pointer;
  color:#1e3a8a;
  font-size:1rem;
  margin-right:0.5rem;
}
.icon-btn.delete {
  color:#ef4444;
}

.modal-backdrop {
  position: fixed;
  inset:0;
  background: rgba(0,0,0,0.2);
  display:flex;
  justify-content:center;
  align-items:center;
  z-index:1000;
}
.modal {
  background:#f0f8ff;
  padding:2rem;
  border-radius:1rem;
  width:400px;
  color:#1e3a8a;
}
.save-btn {
  background:#3b82f6;
  color:white;
  border:none;
  padding:0.5rem 1rem;
  border-radius:0.5rem;
  cursor:pointer;
  margin-top:1rem;
}
.cancel-btn { background:#ef4444; color:white; border:none; padding:0.5rem 1rem; border-radius:0.5rem; cursor:pointer; margin-top:0.5rem;  }
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
  padding: 20px;
  color: #666;
  font-style: italic;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 1rem;
}

@media (max-width: 1024px) {
  .top-section {
    grid-template-columns: 1fr;
  }
  .profile-fields {
    grid-template-columns: 1fr;
  }
}
</style>
