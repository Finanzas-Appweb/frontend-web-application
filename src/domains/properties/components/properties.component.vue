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
      errorMessage: "",
      showModal: false,
      isEditing: false,
      propertyForm: {
        code: "",
        title: "",
        description: "",
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
  computed: {
    hasPrevious() {
      return this.pagination?.hasPreviousPage ?? this.pagination.currentPage > 1;
    },
    hasNext() {
      return this.pagination?.hasNextPage ?? this.pagination.currentPage < this.pagination.totalPages;
    }
  },
  methods: {
    async loadProperties() {
      try {
        this.loading = true;
        this.errorMessage = "";
        const result = await PropertiesAssembler.getProperties({
          search: this.searchQuery,
          page: this.pagination.currentPage,
          pageSize: this.pagination.pageSize
        });
        this.properties = result.properties;
        this.pagination = result.pagination;
      } catch (error) {
        console.error("Error cargando propiedades:", error);
        this.errorMessage = error.response?.data?.title || "No se pudo cargar la lista de propiedades";
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
      const types = {
        1: 'Casa',
        2: 'Departamento',
        3: 'Terreno',
        4: 'Local',
        5: 'Oficina'
      };
      return types[type] || 'Otro';
    },

    getCurrencySymbol(currency) {
      return currency === 1 ? 'S/' : '$';
    },

    openAddModal() {
      this.isEditing = false;
      this.propertyForm = {
        code: "",
        title: "",
        description: "",
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
        code: property.code,
        title: property.title,
        description: property.description || "",
        address: property.address,
        district: property.district,
        province: property.province,
        type: property.type,
        areaM2: property.areaM2,
        price: property.price,
        currency: property.currency,
        imagesUrl: Array.isArray(property.imagesUrl) ? property.imagesUrl.join(', ') : (property.images?.map(img => img.url).join(', ') || "")
      };
      this.showModal = true;
    },

    async saveProperty() {
      try {
        const payload = {
          ...this.propertyForm,
          imagesUrl: (this.propertyForm.imagesUrl || "")
              .split(",")
              .map((u) => u.trim())
              .filter((u) => !!u)
        };
        if (this.isEditing) {
          await PropertiesAssembler.updateProperty(this.editingPropertyId, payload);
          alert("Propiedad actualizada correctamente");
        } else {
          await PropertiesAssembler.createProperty(payload);
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

    <div v-else-if="errorMessage" class="error">
      <p>{{ errorMessage }}</p>
    </div>

    <div v-else-if="properties.length === 0" class="no-data">
      <p>No se encontraron propiedades</p>
    </div>

    <div v-else>
      <div class="cards-grid">
        <div v-for="property in properties" :key="property.id" class="property-card">
          <div class="image-wrapper">
            <img :src="(property.images?.[0]?.url) || property.imagesUrl?.[0] || 'https://via.placeholder.com/300x180?text=Imagen+de+propiedad'" alt="Imagen de propiedad">
          </div>
          <div class="card-body">
            <div class="card-header">
              <div>
                <p class="code">{{ property.code }}</p>
                <h3>{{ property.title }}</h3>
              </div>
              <div class="card-actions">
                <button v-if="permissions.canEditProperty.value" class="btn-icon edit-btn" @click="openEditModal(property)" title="Editar">✏️</button>
                <button v-if="permissions.canDeleteProperty.value" class="btn-icon delete-btn" @click="deleteProperty(property)" title="Eliminar">🗑️</button>
              </div>
            </div>
            <p class="address">{{ property.address }}</p>
            <p class="address">{{ property.district }}, {{ property.province }}</p>
            <p v-if="property.description" class="description">{{ property.description }}</p>
            <p class="meta">Área: {{ property.areaM2 }} m²</p>
            <p class="price">{{ getCurrencySymbol(property.currency) }} {{ property.price?.toLocaleString() }}</p>
            <p class="meta">Consultas: {{ property.consultsCount || 0 }}</p>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <div v-if="pagination.totalPages > 1" class="pagination">
        <button 
          @click="changePage(pagination.currentPage - 1)" 
          :disabled="!hasPrevious"
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
          :disabled="!hasNext"
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
            <label>Código *</label>
            <input v-model="propertyForm.code" type="text" required />
          </div>
          <div class="form-group">
            <label>Título *</label>
            <input v-model="propertyForm.title" type="text" required />
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <textarea 
              v-model="propertyForm.description" 
              rows="3" 
              maxlength="1000"
              placeholder="Descripción de la propiedad (máx. 1000 caracteres)"
            ></textarea>
            <small>{{ propertyForm.description?.length || 0 }} / 1000 caracteres</small>
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

.form-group input, .form-group select, .form-group textarea {
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: 0.2s;
  font-family: inherit;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
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

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.property-card {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(55, 127, 189, 0.15);
  border: 1px solid #e5eff8;
  display: flex;
  flex-direction: column;
}

.image-wrapper {
  width: 100%;
  height: 150px;
  background: #e5f2fb;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.code {
  color: #255a8a;
  font-weight: 700;
  margin: 0;
}

.card-body h3 {
  margin: 2px 0 6px;
  color: #1f2937;
  font-size: 17px;
}

.address {
  margin: 0;
  color: #4b5563;
  font-size: 14px;
}

.description {
  margin: 6px 0;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta {
  margin: 2px 0;
  color: #6b7280;
  font-size: 13px;
}

.price {
  margin: 6px 0 2px;
  color: #255a8a;
  font-weight: 700;
  font-size: 16px;
}

.error {
  text-align: center;
  margin-top: 30px;
  color: #c53030;
  font-weight: 600;
}
</style>
