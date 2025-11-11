<script setup>
import { ref, reactive, onMounted } from "vue"
import { Profile } from "../model/profile.entity.js"
import { FinancialEntity } from "../model/financialEntity.entity.js"
import { SettingsAssembler } from "../services/settings.assembler.js"
import { faker } from "@faker-js/faker"
import NavBar from "../../../shared/presentation/components/nav-bar.vue";
import FooterContent from "../../../shared/presentation/components/footer-content.vue";

const profileImage = faker.image.avatar()

// Datos
const profile = ref(new Profile())
const financialEntities = ref([])
const settings = reactive({
  defaultCurrency: "PEN",
  defaultRateType: "promedio",
})

// Modal de editar perfil
const showProfileModal = ref(false)
const editableProfile = reactive({})

// Modal de añadir entidad
const showAddEntityModal = ref(false)
const newEntity = reactive({ name: "", rate: "" })

// Cargar datos iniciales
onMounted(async () => {
  const data = await SettingsAssembler.getSettings()
  profile.value = data.profile
  financialEntities.value = data.financialEntities
  settings.defaultCurrency = data.defaultCurrency
  settings.defaultRateType = data.defaultRateType
})

// Editar perfil
const openEditProfile = () => {
  Object.assign(editableProfile, profile.value)
  showProfileModal.value = true
}
const saveProfile = () => {
  Object.assign(profile.value, editableProfile)
  showProfileModal.value = false
}

// Añadir entidad
const openAddEntity = () => {
  newEntity.name = ""
  newEntity.rate = ""
  showAddEntityModal.value = true
}
const addEntity = () => {
  financialEntities.value.push(new FinancialEntity({
    id: Date.now(),
    name: newEntity.name,
    rate: newEntity.rate
  }))
  showAddEntityModal.value = false
}

// Editar o borrar entidad
const editEntity = (entity) => {
  const name = prompt("Editar nombre de entidad:", entity.name)
  if (name !== null) entity.name = name
  const rate = prompt("Editar tasa:", entity.rate)
  if (rate !== null) entity.rate = rate
}
const deleteEntity = (id) => {
  financialEntities.value = financialEntities.value.filter(e => Number(e.id) !== Number(id))
}

// Guardar configuración
const saveSettings = async () => {
  await SettingsAssembler.saveSettings({
    profile: profile.value,
    financialEntities: financialEntities.value,
    defaultCurrency: settings.defaultCurrency,
    defaultRateType: settings.defaultRateType
  })
  alert("Configuración guardada correctamente.")
}
</script>

<template>
  <nav-bar></nav-bar>
  <div class="tittle">
    <h1><strong>SETTINGS</strong></h1>
  </div>
  <div class="settings-container">
    <!-- Panel izquierdo -->
    <div class="left-panel">
      <div class="profile-card">
        <h2>Mi Perfil</h2>
        <img :src="profileImage" alt="Foto de perfil" class="profile-image" />
        <div class="profile-info">
          <div class="info-item"><label>Usuario:</label> <span>{{ profile.username }}</span></div>
          <div class="info-item"><label>Nombres:</label> <span>{{ profile.firstName }}</span></div>
          <div class="info-item"><label>Apellidos:</label> <span>{{ profile.lastName }}</span></div>
          <div class="info-item"><label>DNI:</label> <span>{{ profile.dni }}</span></div>
          <div class="info-item"><label>Teléfono:</label> <span>{{ profile.phone }}</span></div>
          <div class="info-item"><label>Correo:</label> <span>{{ profile.email }}</span></div>
        </div>
        <button class="edit-btn" @click="openEditProfile">Editar</button>
      </div>
    </div>

    <!-- Panel derecho -->
    <div class="right-panel">
      <div class="defaults-card">
        <h2>Valores por Defecto</h2>
        <div class="form-group">
          <label>Moneda por defecto:</label>
          <select v-model="settings.defaultCurrency">
            <option value="PEN">Soles (PEN)</option>
            <option value="USD">Dólares (USD)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Tipo de tasa de cambio:</label>
          <select v-model="settings.defaultRateType">
            <option value="promedio">Promedio</option>
            <option value="venta">Venta</option>
            <option value="compra">Compra</option>
          </select>
        </div>
      </div>

      <div class="financial-card">
        <h2>Entidades Financieras</h2>
        <table class="financial-table">
          <thead>
          <tr><th>Entidad</th><th>Tasa</th><th>Acciones</th></tr>
          </thead>
          <tbody>
          <tr v-for="entity in financialEntities" :key="entity.id">
            <td>{{ entity.name }}</td>
            <td>{{ entity.rate }}</td>
            <td>
              <button class="icon-btn" @click="editEntity(entity)">✏️</button>
              <button class="icon-btn delete" @click="deleteEntity(entity.id)">🗑️</button>
            </td>
          </tr>
          </tbody>
        </table>
        <button class="add-btn" @click="openAddEntity">Añadir Entidad</button>
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

    <!-- Modal añadir entidad -->
    <div v-if="showAddEntityModal" class="modal-backdrop">
      <div class="modal">
        <h3>Añadir Entidad</h3>
        <div class="form-group"><label>Nombre:</label><input v-model="newEntity.name" /></div>
        <div class="form-group"><label>Tasa:</label><input v-model="newEntity.rate" /></div>
        <button @click="addEntity" class="save-btn">Añadir</button>
        <button @click="showAddEntityModal=false" class="cancel-btn">Cancelar</button>
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
.profile-image { border-radius: 50%; width: 120px; height: 120px; margin-bottom: 1rem; }
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
.add-btn {
  background-color:#10b981;
  border:none;
  padding:0.6rem 1.2rem;
  border-radius:0.5rem;
  cursor:pointer;
  margin-top:1rem;
  color:white;
}
.add-btn:hover {
  background-color:#059669;
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
</style>
