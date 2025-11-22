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

// Modal de editar perfil
const showProfileModal = ref(false)
const editableProfile = reactive({})

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
    
    // Cargar perfil y preferencias
    const profileData = await SettingsAssembler.getProfile()
    profile.value = profileData
    
    const preferencesData = await SettingsAssembler.getPreferences()
    preferences.defaultCurrency = preferencesData.defaultCurrency
    preferences.defaultRateType = preferencesData.defaultRateType
    
    // Cargar entidades financieras
    if (permissions.canManageBanks.value) {
      await loadFinancialEntities()
    }
  } catch (error) {
    console.error("Error cargando configuraciones:", error)
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
    financialEntities.value = result.data
  } catch (error) {
    console.error("Error cargando entidades:", error)
  }
}

// Editar perfil
const openEditProfile = () => {
  Object.assign(editableProfile, profile.value)
  showProfileModal.value = true
}

const saveProfile = async () => {
  try {
    await SettingsAssembler.updateProfile(editableProfile)
    Object.assign(profile.value, editableProfile)
    showProfileModal.value = false
    alert("Perfil actualizado correctamente")
  } catch (error) {
    console.error("Error al actualizar perfil:", error)
    if (error.response?.data?.title) {
      alert(`Error: ${error.response.data.title}`)
    }
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
  <div class="tittle">
    <h1><strong>CONFIGURACIÓN</strong></h1>
  </div>

  <div v-if="loading" class="loading-container">
    <p>Cargando configuración...</p>
  </div>

  <div v-else class="settings-container">
    <!-- Panel izquierdo -->
    <div class="left-panel">
      <div class="profile-card">
        <h2>Mi Perfil</h2>
        <div class="profile-avatar">{{ profile.firstName?.charAt(0) }}{{ profile.lastName?.charAt(0) }}</div>
        <div class="profile-info">
          <div class="info-item"><label>Usuario:</label> <span>{{ profile.username }}</span></div>
          <div class="info-item"><label>Nombres:</label> <span>{{ profile.firstName }}</span></div>
          <div class="info-item"><label>Apellidos:</label> <span>{{ profile.lastName }}</span></div>
          <div class="info-item"><label>DNI:</label> <span>{{ profile.dni }}</span></div>
          <div class="info-item"><label>Teléfono:</label> <span>{{ profile.phone }}</span></div>
          <div class="info-item"><label>Correo:</label> <span>{{ profile.email }}</span></div>
        </div>
        <button class="edit-btn" @click="openEditProfile">Editar Perfil</button>
      </div>
    </div>

    <!-- Panel derecho -->
    <div class="right-panel">
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

      <div v-if="permissions.canManageBanks.value" class="financial-card">
        <div class="card-header">
          <h2>Entidades Financieras</h2>
          <button class="add-btn" @click="openAddEntity">+ Añadir</button>
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

    <!-- Modal editar perfil -->
    <div v-if="showProfileModal" class="modal-backdrop">
      <div class="modal">
        <h3>Editar Perfil</h3>
        <div class="form-group" v-for="(value, key) in editableProfile" :key="key">
          <label>{{ key }}:</label>
          <input v-model="editableProfile[key]" />
        </div>
        <button @click="saveProfile" class="save-btn">Guardar</button>
        <button @click="showProfileModal=false" class="cancel-btn">Cancelar</button>
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
.settings-container {
  display: flex;
  gap: 2rem;
  padding: 2rem;
  font-family: 'Roboto', sans-serif;
  color: #1e3a8a;
  background-color: rgba(195, 195, 195, 0.53);
}

/* Panel izquierdo */
.left-panel { width: 50%; }
.profile-card {
  background-color: #ffffff;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.profile-avatar { 
  border-radius: 50%; 
  width: 120px; 
  height: 120px; 
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #377FBD, #5BA3D0);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: 600;
}
.profile-info { width: 100%; margin-top: 1rem; }
.info-item { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
.info-item label { color: #3b82f6; font-weight: 500; }
.edit-btn { background-color: #3b82f6; border:none; padding:0.6rem 1.2rem; border-radius:0.5rem; cursor:pointer; margin-top:1rem; color:white; }
.edit-btn:hover { background-color:#2563eb; }

/* Panel derecho */
.right-panel {
  width:50%;
  display:flex;
  flex-direction:column;
  gap:1.5rem;
}
.defaults-card, .financial-card {
  background-color: #ffffff;
  border-radius:1rem;
  padding:1.5rem;
}
.form-group {
  display:flex;
  flex-direction:column;
  margin-top:1rem;
}
.form-group input, .form-group select {
  padding:0.5rem;
  border-radius:0.5rem;
  border:1px solid #3b82f6;
  background: #c8c8c8;
  color:#1e3a8a;
}
.financial-table {
  width:100%;
  border-collapse:collapse;
  margin-top:1rem;
}
.financial-table th {
  color:#1e3a8a;
  padding:0.7rem;
  text-align:left;
}
.financial-table td {
  padding:0.7rem;
  text-align:left;
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
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h2 {
  margin: 0;
}

.add-btn {
  background-color:#10b981;
  border:none;
  padding:0.6rem 1.2rem;
  border-radius:0.5rem;
  cursor:pointer;
  color:white;
  font-size: 14px;
  font-weight: 500;
}
.add-btn:hover {
  background-color:#059669;
}

.save-preferences-btn {
  background-color:#377fbd;
  border:none;
  padding:0.7rem 1.5rem;
  border-radius:0.5rem;
  cursor:pointer;
  margin-top:1.5rem;
  color:white;
  width: 100%;
  font-size: 15px;
  font-weight: 600;
}
.save-preferences-btn:hover {
  background-color:#2d6ba1;
}

/* Modal */
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
.tittle{
  display:flex;
  justify-content:center;
  align-items:center;
  font-family: "Roboto", sans-serif;
  margin-top: 10px;
  font-size: 20px;
}

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
</style>
