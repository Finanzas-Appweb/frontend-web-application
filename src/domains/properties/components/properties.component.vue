<script>
import { PropertiesAssembler } from "../services/properties.assembler.js";
import { usePermissions } from "../../../shared/composables/usePermissions.js";
import { uploadMultipleImages, validateImageFile, getThumbnailUrl } from "../../../shared/services/cloudinary.service.js";
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
      
      // Estado para subida de imágenes
      uploadedImages: [],
      uploadingImages: false,
      uploadProgress: {},
      dragOver: false,
      maxImages: 5,

      // Modal de detalle de propiedad
      showDetailModal: false,
      selectedProperty: null,
      loadingDetail: false
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

    getPropertyImage(property) {
      // Prioridad: thumbnailUrl del backend > primera imagen del array > primera URL
      if (property.thumbnailUrl) {
        return property.thumbnailUrl;
      }
      if (property.images && property.images.length > 0 && property.images[0].url) {
        return property.images[0].url;
      }
      if (property.imagesUrl && property.imagesUrl.length > 0) {
        return property.imagesUrl[0];
      }
      return null;
    },

    onImageError(event) {
      // Si la imagen falla, ocultar el elemento
      event.target.style.display = 'none';
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
      this.uploadedImages = [];
      this.uploadProgress = {};
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
        imagesUrl: ""
      };
      // Cargar imágenes existentes
      this.uploadedImages = [];
      if (property.images && property.images.length > 0) {
        this.uploadedImages = property.images.map(img => ({
          url: img.url,
          existing: true
        }));
      } else if (property.imagesUrl && property.imagesUrl.length > 0) {
        this.uploadedImages = property.imagesUrl.map(url => ({
          url: url,
          existing: true
        }));
      }
      this.uploadProgress = {};
      this.showModal = true;
    },

    async saveProperty() {
      try {
        const payload = {
          ...this.propertyForm,
          imagesUrl: this.uploadedImages.map(img => img.url).filter(u => !!u)
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
      this.uploadedImages = [];
      this.uploadProgress = {};
    },

    // Métodos para subida de imágenes con Cloudinary
    onDragOver(event) {
      event.preventDefault();
      this.dragOver = true;
    },

    onDragLeave() {
      this.dragOver = false;
    },

    onDrop(event) {
      event.preventDefault();
      this.dragOver = false;
      const files = event.dataTransfer.files;
      this.handleFiles(files);
    },

    onFileSelect(event) {
      const files = event.target.files;
      this.handleFiles(files);
      // Reset input para permitir seleccionar el mismo archivo
      event.target.value = '';
    },

    async handleFiles(files) {
      if (!files || files.length === 0) return;

      const remainingSlots = this.maxImages - this.uploadedImages.length;
      if (remainingSlots <= 0) {
        alert(`Ya tienes ${this.maxImages} imágenes. Elimina alguna para agregar más.`);
        return;
      }

      const filesToUpload = Array.from(files).slice(0, remainingSlots);

      // Validar archivos
      for (const file of filesToUpload) {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          alert(`${file.name}: ${validation.error}`);
          return;
        }
      }

      try {
        this.uploadingImages = true;
        
        const result = await uploadMultipleImages(filesToUpload, {
          maxImages: this.maxImages,
          onFileProgress: (index, progress) => {
            this.uploadProgress[index] = progress;
          },
          onFileComplete: (index, result) => {
            if (result.success) {
              this.uploadedImages.push({
                url: result.result.url,
                publicId: result.result.publicId,
                existing: false
              });
            }
          }
        });

        if (result.errors.length > 0) {
          const errorMessages = result.errors.map(e => `${e.fileName}: ${e.error}`).join('\n');
          alert(`Algunas imágenes no se pudieron subir:\n${errorMessages}`);
        }

      } catch (error) {
        console.error("Error subiendo imágenes:", error);
        alert(error.message || "Error al subir imágenes");
      } finally {
        this.uploadingImages = false;
        this.uploadProgress = {};
      }
    },

    removeImage(index) {
      this.uploadedImages.splice(index, 1);
    },

    getThumbnail(url) {
      return getThumbnailUrl(url, 150, 100);
    },

    // ===== Modal de Detalle =====
    async openPropertyDetail(property) {
      try {
        this.loadingDetail = true;
        this.showDetailModal = true;
        // Cargar datos completos de la propiedad
        const fullProperty = await PropertiesAssembler.getProperty(property.id);
        this.selectedProperty = fullProperty;
      } catch (error) {
        console.error("Error cargando detalle de propiedad:", error);
        alert("Error al cargar los detalles de la propiedad");
        this.showDetailModal = false;
      } finally {
        this.loadingDetail = false;
      }
    },

    closeDetailModal() {
      this.showDetailModal = false;
      this.selectedProperty = null;
    },

    editFromDetail() {
      if (this.selectedProperty) {
        this.closeDetailModal();
        this.openEditModal(this.selectedProperty);
      }
    },

    async deleteFromDetail() {
      if (this.selectedProperty) {
        const property = this.selectedProperty;
        this.closeDetailModal();
        await this.deleteProperty(property);
      }
    },

    getPropertyImages(property) {
      const images = [];
      if (property.images && property.images.length > 0) {
        images.push(...property.images.map(img => img.url));
      } else if (property.imagesUrl && property.imagesUrl.length > 0) {
        images.push(...property.imagesUrl);
      } else if (property.thumbnailUrl) {
        images.push(property.thumbnailUrl);
      }
      return images;
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
        <div v-for="property in properties" :key="property.id" class="property-card" @click="openPropertyDetail(property)">
          <div class="image-wrapper">
            <img 
              v-if="getPropertyImage(property)" 
              :src="getPropertyImage(property)" 
              alt="Imagen de propiedad"
              @error="onImageError"
            />
            <div v-else class="no-image-placeholder">
              <span>📷</span>
              <span>Sin imagen</span>
            </div>
          </div>
          <div class="card-body">
            <div class="card-header">
              <div>
                <p class="code">{{ property.code }}</p>
                <h3>{{ property.title }}</h3>
              </div>
              <div class="card-actions" @click.stop>
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
            <label>Imágenes (máx. {{ maxImages }})</label>
            
            <!-- Área de drop / selección -->
            <div 
              class="image-upload-area"
              :class="{ 'drag-over': dragOver, 'disabled': uploadedImages.length >= maxImages || uploadingImages }"
              @dragover="onDragOver"
              @dragleave="onDragLeave"
              @drop="onDrop"
              @click="$refs.fileInput.click()"
            >
              <input 
                ref="fileInput"
                type="file" 
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                :disabled="uploadedImages.length >= maxImages || uploadingImages"
                @change="onFileSelect"
                style="display: none;"
              />
              <div v-if="uploadingImages" class="upload-status">
                <span class="spinner"></span>
                <span>Subiendo imágenes...</span>
              </div>
              <div v-else-if="uploadedImages.length >= maxImages" class="upload-status">
                <span>Límite de {{ maxImages }} imágenes alcanzado</span>
              </div>
              <div v-else class="upload-prompt">
                <span class="upload-icon">📷</span>
                <span>Arrastra imágenes aquí o haz clic para seleccionar</span>
                <small>JPEG, PNG, GIF, WebP (máx. 10MB cada una)</small>
              </div>
            </div>

            <!-- Vista previa de imágenes -->
            <div v-if="uploadedImages.length > 0" class="images-preview">
              <div v-for="(img, index) in uploadedImages" :key="index" class="preview-item">
                <img :src="getThumbnail(img.url)" :alt="'Imagen ' + (index + 1)" />
                <button type="button" class="remove-image-btn" @click="removeImage(index)" title="Eliminar imagen">
                  ✕
                </button>
              </div>
            </div>
            
            <small>{{ uploadedImages.length }} de {{ maxImages }} imágenes</small>
          </div>
          <div class="modal-actions">
            <button type="submit" class="save-btn">{{ isEditing ? 'Actualizar' : 'Crear' }}</button>
            <button type="button" @click="closeModal" class="cancel-btn">Cancelar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de Detalle de Propiedad -->
    <div v-if="showDetailModal" class="modal-backdrop" @click.self="closeDetailModal">
      <div class="modal-content detail-modal">
        <div v-if="loadingDetail" class="loading-detail">
          <span class="spinner-large"></span>
          <p>Cargando detalles...</p>
        </div>
        <div v-else-if="selectedProperty">
          <!-- Header -->
          <div class="detail-header">
            <div>
              <span class="detail-code">{{ selectedProperty.code }}</span>
              <h2>{{ selectedProperty.title }}</h2>
            </div>
            <button class="close-btn" @click="closeDetailModal">✕</button>
          </div>

          <!-- Galería de imágenes -->
          <div class="detail-gallery" v-if="getPropertyImages(selectedProperty).length > 0">
            <div class="gallery-main">
              <img :src="getPropertyImages(selectedProperty)[0]" alt="Imagen principal" />
            </div>
            <div class="gallery-thumbs" v-if="getPropertyImages(selectedProperty).length > 1">
              <img 
                v-for="(img, idx) in getPropertyImages(selectedProperty)" 
                :key="idx" 
                :src="getThumbnail(img)" 
                alt="Thumbnail"
                class="thumb-img"
              />
            </div>
          </div>
          <div v-else class="detail-no-image">
            <span>📷</span>
            <span>Sin imágenes disponibles</span>
          </div>

          <!-- Info Grid -->
          <div class="detail-info-grid">
            <div class="info-item">
              <span class="info-label">📍 Dirección</span>
              <span class="info-value">{{ selectedProperty.address }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">🏘️ Ubicación</span>
              <span class="info-value">{{ selectedProperty.district }}, {{ selectedProperty.province }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">🏠 Tipo</span>
              <span class="info-value">{{ getPropertyType(selectedProperty.type) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">📐 Área</span>
              <span class="info-value">{{ selectedProperty.areaM2 }} m²</span>
            </div>
            <div class="info-item price-item">
              <span class="info-label">💰 Precio</span>
              <span class="info-value price-value">{{ getCurrencySymbol(selectedProperty.currency) }} {{ selectedProperty.price?.toLocaleString() }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">📊 Consultas</span>
              <span class="info-value">{{ selectedProperty.consultsCount || 0 }}</span>
            </div>
          </div>

          <!-- Descripción -->
          <div v-if="selectedProperty.description" class="detail-description">
            <h3>Descripción</h3>
            <p>{{ selectedProperty.description }}</p>
          </div>

          <!-- Acciones -->
          <div class="detail-actions">
            <button v-if="permissions.canEditProperty.value" class="action-btn edit-action" @click="editFromDetail">
              ✏️ Editar
            </button>
            <button v-if="permissions.canDeleteProperty.value" class="action-btn delete-action" @click="deleteFromDetail">
              🗑️ Eliminar
            </button>
          </div>
        </div>
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
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.property-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(55, 127, 189, 0.25);
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

.no-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e5f2fb 0%, #d1e8f8 100%);
  color: #64748b;
}

.no-image-placeholder span:first-child {
  font-size: 32px;
  margin-bottom: 5px;
}

.no-image-placeholder span:last-child {
  font-size: 12px;
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

/* Estilos para subida de imágenes */
.image-upload-area {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 30px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #f8fafc;
}

.image-upload-area:hover:not(.disabled) {
  border-color: #377fbd;
  background: #f0f9ff;
}

.image-upload-area.drag-over {
  border-color: #377fbd;
  background: #e0f2fe;
  transform: scale(1.01);
}

.image-upload-area.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #64748b;
}

.upload-prompt .upload-icon {
  font-size: 32px;
}

.upload-prompt small {
  font-size: 12px;
  color: #94a3b8;
}

.upload-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #377fbd;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e0e0e0;
  border-top-color: #377fbd;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.images-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 15px;
}

.preview-item {
  position: relative;
  width: 100px;
  height: 70px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  background: rgba(220, 38, 38, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-image-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

/* ===== Modal de Detalle de Propiedad ===== */
.detail-modal {
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
}

.loading-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 15px;
  color: #377fbd;
}

.spinner-large {
  width: 40px;
  height: 40px;
  border: 3px solid #e0e0e0;
  border-top-color: #377fbd;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.detail-header h2 {
  margin: 5px 0 0;
  color: #1f2937;
  font-size: 22px;
}

.detail-code {
  background: #377fbd;
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.close-btn {
  background: #f1f5f9;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #e2e8f0;
}

.detail-gallery {
  margin-bottom: 20px;
}

.gallery-main {
  width: 100%;
  height: 280px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 10px;
}

.gallery-main img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-thumbs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.thumb-img {
  width: 70px;
  height: 50px;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.thumb-img:hover {
  opacity: 1;
}

.detail-no-image {
  background: linear-gradient(135deg, #e5f2fb 0%, #d1e8f8 100%);
  height: 180px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #64748b;
  margin-bottom: 20px;
}

.detail-no-image span:first-child {
  font-size: 48px;
}

.detail-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.info-item {
  background: #f8fafc;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.info-label {
  display: block;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
}

.info-value {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.price-item {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-color: #7dd3fc;
}

.price-value {
  color: #0369a1;
  font-size: 18px;
}

.detail-description {
  margin-bottom: 20px;
}

.detail-description h3 {
  color: #255a8a;
  font-size: 16px;
  margin: 0 0 10px;
}

.detail-description p {
  color: #475569;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
}

.detail-actions {
  display: flex;
  gap: 12px;
  padding-top: 15px;
  border-top: 1px solid #e2e8f0;
}

.action-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.edit-action {
  background: #377fbd;
  color: white;
}

.edit-action:hover {
  background: #2d6ba1;
}

.delete-action {
  background: #fee2e2;
  color: #dc2626;
}

.delete-action:hover {
  background: #fecaca;
}
</style>
