<script>
import { PropertiesAssembler } from "../services/properties.assembler.js";
import { usePermissions } from "../../../shared/composables/usePermissions.js";
import NavBar from "../../../shared/presentation/components/nav-bar.vue";
import FooterContent from "../../../shared/presentation/components/footer-content.vue";

export default {
  name: "PropertiesComponent",
  components: {FooterContent, NavBar},
  setup() {
    const permissions = usePermissions();
    return { permissions };
  },
  data() {
    return {
      properties: [],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0
      },
      searchQuery: "",
      loading: true,
      showModal: false,
      isEditing: false,
      propertyForm: {
        title: "",
        address: "",
        district: "",
        province: "",
        type: 1,
        areaM2: 0,
        price: 0,
        currency: 1,
        imagesUrl: ""
      },
      editingPropertyId: null,
    };
  },
  async mounted() {
    await this.loadProperties();
  },
  methods: {
    async loadProperties() {
      try {
        this.loading = true;
        const result = await PropertiesAssembler.getProperties({
          search: this.searchQuery,
          page: this.pagination.currentPage,
          pageSize: this.pagination.pageSize
        });
        this.properties = result.properties;
        this.pagination = result.pagination;
      } catch (error) {
        console.error("Error cargando propiedades:", error);
        if (error.response?.data?.title) {
          alert(`Error: ${error.response.data.title}`);
        }
      } finally {
        this.loading = false;
      }
    },

    async searchProperties() {
      this.pagination.currentPage = 1;
      await this.loadProperties();
    },

    async changePage(page) {
      this.pagination.currentPage = page;
      await this.loadProperties();
    },

    getPropertyType(type) {
      return type === 1 ? 'Casa' : 'Departamento';
    },

    getCurrencySymbol(currency) {
      return currency === 1 ? 'S/' : '$';
    },

    openAddModal() {
      this.isEditing = false;
      this.propertyForm = {
        title: "",
        address: "",
        district: "",
        province: "",
        type: 1,
        areaM2: 0,
        price: 0,
        currency: 1,
        imagesUrl: ""
      };
      this.showModal = true;
    },

    async openEditModal(property) {
      this.isEditing = true;
      this.editingPropertyId = property.id;
      this.propertyForm = {
        title: property.title,
        address: property.address,
        district: property.district,
        province: property.province,
        type: property.type,
        areaM2: property.areaM2,
        price: property.price,
        currency: property.currency,
        imagesUrl: property.imagesUrl || ""
      };
      this.showModal = true;
    },

    async saveProperty() {
      try {
        if (this.isEditing) {
          await PropertiesAssembler.updateProperty(this.editingPropertyId, this.propertyForm);
          alert("Propiedad actualizada correctamente");
        } else {
          await PropertiesAssembler.createProperty(this.propertyForm);
          alert("Propiedad creada correctamente");
        }
        this.showModal = false;
        await this.loadProperties();
      } catch (error) {
        console.error("Error al guardar propiedad:", error);
        if (error.response?.data?.title) {
          alert(`Error: ${error.response.data.title}`);
        } else {
          alert("Error al guardar la propiedad");
        }
      }
    },

    async deleteProperty(property) {
      if (!confirm(`¿Estás seguro de eliminar la propiedad ${property.code}?`)) {
        return;
      }
      try {
        await PropertiesAssembler.deleteProperty(property.id);
        alert("Propiedad eliminada correctamente");
        await this.loadProperties();
      } catch (error) {
        console.error("Error al eliminar propiedad:", error);
        if (error.response?.status === 409) {
          alert("No se puede eliminar la propiedad porque tiene simulaciones asociadas");
        } else if (error.response?.data?.title) {
          alert(`Error: ${error.response.data.title}`);
        } else {
          alert("Error al eliminar la propiedad");
        }
      }
    },

    closeModal() {
      this.showModal = false;
    }
  },
};
</script>

<template>
  <nav-bar></nav-bar>
  <div class="properties-container">
    <div class="header-section">
      <h1>Propiedades</h1>
      <div class="actions">
        <input
            v-model="searchQuery"
            @keyup.enter="searchProperties"
            type="text"
            placeholder="Buscar por código, título, distrito..."
            class="search-input"
        />
        <button @click="searchProperties" class="search-btn">Buscar</button>
        <button v-if="permissions.canCreateProperty.value" @click="openAddModal" class="add-btn">+ Añadir Propiedad</button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <p>Cargando propiedades...</p>
    </div>

    <div v-else-if="properties.length === 0" class="no-data">
      <p>No se encontraron propiedades</p>
    </div>

    <div v-else class="table-wrapper">
      <table class="properties-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Título</th>
            <th>Ubicación</th>
            <th>Tipo</th>
            <th>Área</th>
            <th>Precio</th>
            <th>Consultas</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="property in properties" :key="property.id">
            <td>{{ property.code }}</td>
            <td>{{ property.title }}</td>
            <td>{{ property.district }}, {{ property.province }}</td>
            <td>{{ getPropertyType(property.type) }}</td>
            <td>{{ property.areaM2 }} m²</td>
            <td>{{ getCurrencySymbol(property.currency) }} {{ property.price?.toLocaleString() }}</td>
            <td>{{ property.consultsCount || 0 }}</td>
            <td class="actions-cell">
              <button v-if="permissions.canUpdateProperty.value" @click="openEditModal(property)" class="btn-icon edit-btn" title="Editar">✏️</button>
              <button v-if="permissions.canDeleteProperty.value" @click="deleteProperty(property)" class="btn-icon delete-btn" title="Eliminar">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginación -->
      <div v-if="pagination.totalPages > 1" class="pagination">
        <button 
          @click="changePage(pagination.currentPage - 1)" 
          :disabled="!pagination.hasPreviousPage"
          class="page-btn"
        >
          ← Anterior
        </button>
        <span class="page-info">
          Página {{ pagination.currentPage }} de {{ pagination.totalPages }} 
          ({{ pagination.totalCount }} propiedades)
        </span>
        <button 
          @click="changePage(pagination.currentPage + 1)" 
          :disabled="!pagination.hasNextPage"
          class="page-btn"
        >
          Siguiente →
        </button>
      </div>
    </div>

    <!-- Modal de Crear/Editar Propiedad -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-content">
        <h2>{{ isEditing ? 'Editar Propiedad' : 'Nueva Propiedad' }}</h2>
        <form @submit.prevent="saveProperty">
          <div class="form-group">
            <label>Título *</label>
            <input v-model="propertyForm.title" type="text" required />
          </div>
          <div class="form-group">
            <label>Dirección *</label>
            <input v-model="propertyForm.address" type="text" required />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Distrito *</label>
              <input v-model="propertyForm.district" type="text" required />
            </div>
            <div class="form-group">
              <label>Provincia *</label>
              <input v-model="propertyForm.province" type="text" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Tipo *</label>
              <select v-model.number="propertyForm.type" required>
                <option :value="1">Casa</option>
                <option :value="2">Departamento</option>
              </select>
            </div>
            <div class="form-group">
              <label>Área (m²) *</label>
              <input v-model.number="propertyForm.areaM2" type="number" step="0.01" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Precio *</label>
              <input v-model.number="propertyForm.price" type="number" step="0.01" required />
            </div>
            <div class="form-group">
              <label>Moneda *</label>
              <select v-model.number="propertyForm.currency" required>
                <option :value="1">Soles (PEN)</option>
                <option :value="2">Dólares (USD)</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>URL de Imagen(es)</label>
            <input v-model="propertyForm.imagesUrl" type="text" placeholder="URL separadas por comas" />
            <small>Ingresa una o más URLs de imágenes separadas por comas</small>
          </div>
          <div class="modal-actions">
            <button type="submit" class="save-btn">{{ isEditing ? 'Actualizar' : 'Crear' }}</button>
            <button type="button" @click="closeModal" class="cancel-btn">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <footer-content></footer-content>
</template>

<style scoped>
.properties-container {
  padding: 40px 60px;
  background: #f8fafc;
  min-height: 100vh;
  font-family: "Roboto", sans-serif;
  color: #1a1a1a;
}

/* Header */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.header-section h1 {
  font-size: 28px;
  font-weight: 600;
  color: #255a8a;
}

.actions {
  display: flex;
  gap: 15px;
}

.search-input {
  padding: 10px 15px;
  border: 2px solid #cfd8dc;
  border-radius: 10px;
  font-size: 15px;
  outline: none;
  transition: 0.3s;
}

.search-input:focus {
  border-color: #377fbd;
}

.add-btn {
  background-color: #377fbd;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 18px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: 0.3s;
  box-shadow: 0 4px 12px rgba(55, 127, 189, 0.3);
}

.add-btn:hover {
  background-color: #2d6ba1;
  transform: translateY(-1px);
}

.search-btn {
  background-color: #5ba3d0;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 18px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: 0.3s;
}

.search-btn:hover {
  background-color: #4a92bf;
}

/* Tabla */
.table-wrapper {
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.properties-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
}

.properties-table thead th {
  background-color: #377fbd;
  color: white;
  padding: 15px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
}

.properties-table tbody td {
  padding: 12px 15px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  color: #333;
}

.properties-table tbody tr:hover {
  background-color: #f0f9ff;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 5px;
  transition: transform 0.2s;
}

.btn-icon:hover {
  transform: scale(1.2);
}

.edit-btn {
  color: #377fbd;
}

.delete-btn {
  color: #ef4444;
}

/* Paginación */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  padding: 15px;
}

.page-btn {
  background-color: #377fbd;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 14px;
  transition: 0.2s;
}

.page-btn:hover:not(:disabled) {
  background-color: #2d6ba1;
}

.page-btn:disabled {
  background-color: #cbd5e1;
  cursor: not-allowed;
}

.page-info {
  color: #64748b;
  font-size: 14px;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 30px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  color: #255a8a;
  margin-bottom: 25px;
  font-size: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.form-group label {
  color: #475569;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-group input, .form-group select {
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: 0.2s;
}

.form-group input:focus, .form-group select:focus {
  border-color: #377fbd;
  outline: none;
}

.form-group small {
  color: #64748b;
  font-size: 12px;
  margin-top: 5px;
}

.modal-actions {
  display: flex;
  gap: 15px;
  margin-top: 25px;
}

.save-btn {
  flex: 1;
  background-color: #377fbd;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.save-btn:hover {
  background-color: #2d6ba1;
}

.cancel-btn {
  flex: 1;
  background-color: #e5e7eb;
  color: #475569;
  border: none;
  border-radius: 10px;
  padding: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.cancel-btn:hover {
  background-color: #cbd5e1;
}

.loading {
  text-align: center;
  margin-top: 50px;
  color: #377fbd;
  font-weight: 500;
  font-size: 18px;
}

.no-data {
  text-align: center;
  margin-top: 50px;
  color: #666;
  font-size: 16px;
}
</style>
