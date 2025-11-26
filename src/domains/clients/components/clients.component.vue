<script>
import { ClientsAssembler } from "../services/clients.assembler.js";
import { usePermissions } from "../../../shared/composables/usePermissions.js";
import NavBar from "../../../shared/presentation/components/nav-bar.vue";
import FooterContent from "../../../shared/presentation/components/footer-content.vue";

export default {
  name: "ClientsComponent",
  components: {FooterContent, NavBar},
  setup() {
    const permissions = usePermissions();
    return { permissions };
  },
  data() {
    return {
      clients: [],
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
      clientForm: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        annualIncome: 0
      },
      editingClientId: null,
    };
  },
  async mounted() {
    await this.loadClients();
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
    async loadClients() {
      try {
        this.loading = true;
        this.errorMessage = "";
        const result = await ClientsAssembler.getClients({
          search: this.searchQuery,
          page: this.pagination.currentPage,
          pageSize: this.pagination.pageSize
        });
        this.clients = result.clients;
        this.pagination = result.pagination;
      } catch (error) {
        console.error("Error cargando clientes:", error);
        this.errorMessage = error.response?.data?.title || "No se pudo cargar la lista de clientes";
        if (error.response?.data?.title) {
          alert(`Error: ${error.response.data.title}`);
        }
      } finally {
        this.loading = false;
      }
    },

    async searchClients() {
      this.pagination.currentPage = 1;
      await this.loadClients();
    },

    async changePage(page) {
      this.pagination.currentPage = page;
      await this.loadClients();
    },

    openAddModal() {
      this.isEditing = false;
      this.clientForm = {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        annualIncome: 0
      };
      this.showModal = true;
    },

    async openEditModal(client) {
      this.isEditing = true;
      this.editingClientId = client.id;
      this.clientForm = {
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone,
        annualIncome: client.annualIncome
      };
      this.showModal = true;
    },

    async saveClient() {
      try {
        if (this.isEditing) {
          await ClientsAssembler.updateClient(this.editingClientId, this.clientForm);
          alert("Cliente actualizado correctamente");
        } else {
          await ClientsAssembler.createClient(this.clientForm);
          alert("Cliente creado correctamente");
        }
        this.showModal = false;
        await this.loadClients();
      } catch (error) {
        console.error("Error al guardar cliente:", error);
        if (error.response?.data?.title) {
          alert(`Error: ${error.response.data.title}`);
        } else {
          alert("Error al guardar el cliente");
        }
      }
    },

    async deleteClient(client) {
      if (!confirm(`¿Estás seguro de eliminar al cliente ${client.fullName}?`)) {
        return;
      }
      try {
        await ClientsAssembler.deleteClient(client.id);
        alert("Cliente eliminado correctamente");
        await this.loadClients();
      } catch (error) {
        console.error("Error al eliminar cliente:", error);
        if (error.response?.status === 409) {
          alert("No se puede eliminar el cliente porque tiene simulaciones asociadas");
          return;
        }
        if (error.response?.data?.title) {
          alert(`Error: ${error.response.data.title}`);
        } else {
          alert("Error al eliminar el cliente");
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
  <div class="clients-container">
    <div class="header-section">
      <h1>Clientes</h1>
      <div class="actions">
        <input
            v-model="searchQuery"
            @keyup.enter="searchClients"
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            class="search-input"
        />
        <button @click="searchClients" class="search-btn">Buscar</button>
        <button v-if="permissions.canCreateClient.value" @click="openAddModal" class="add-btn">+ Añadir Cliente</button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <p>Cargando clientes...</p>
    </div>

    <div v-else-if="errorMessage" class="error">
      <p>{{ errorMessage }}</p>
    </div>

    <div v-else-if="clients.length === 0" class="no-data">
      <p>No se encontraron clientes</p>
    </div>

    <div v-else>
      <div class="cards-grid">
        <div v-for="client in clients" :key="client.id" class="client-card">
          <div class="card-header">
            <h3>{{ client.fullName }}</h3>
            <div class="card-actions">
              <button v-if="permissions.canEditClient.value" class="btn-icon edit-btn" @click="openEditModal(client)" title="Editar">✏️</button>
              <button v-if="permissions.canDeleteClient.value" class="btn-icon delete-btn" @click="deleteClient(client)" title="Eliminar">🗑️</button>
            </div>
          </div>
          <p><strong>Email:</strong> {{ client.email }}</p>
          <p><strong>Teléfono:</strong> {{ client.phone }}</p>
          <p><strong>Ingreso anual:</strong> S/ {{ client.annualIncome?.toLocaleString() || '0' }}</p>
          <small v-if="client.createdByUserName" class="created-by">Creado por: {{ client.createdByUserName }}</small>
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
          ({{ pagination.totalCount }} clientes)
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

    <!-- Modal de Crear/Editar Cliente -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-content">
        <h2>{{ isEditing ? 'Editar Cliente' : 'Nuevo Cliente' }}</h2>
        <form @submit.prevent="saveClient">
          <div class="form-row">
            <div class="form-group">
              <label>Nombres *</label>
              <input v-model="clientForm.firstName" type="text" required />
            </div>
            <div class="form-group">
              <label>Apellidos *</label>
              <input v-model="clientForm.lastName" type="text" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Teléfono *</label>
              <input v-model="clientForm.phone" type="tel" required />
            </div>
          </div>
          <div class="form-group">
            <label>Email *</label>
            <input v-model="clientForm.email" type="email" required />
          </div>
          <div class="form-group">
            <label>Ingreso Anual (S/) *</label>
            <input v-model.number="clientForm.annualIncome" type="number" step="0.01" required />
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
.clients-container {
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

.client-card {
  background: #ffffff;
  border-radius: 15px;
  padding: 18px;
  box-shadow: 0 6px 16px rgba(55, 127, 189, 0.18);
  border-left: 6px solid #377fbd;
}

.client-card h3 {
  margin: 0;
  color: #255a8a;
  font-size: 18px;
  font-weight: 700;
}

.client-card p {
  margin: 6px 0;
  color: #334155;
  font-size: 14px;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.created-by {
  display: block;
  margin-top: 8px;
  color: #6b7280;
}

.error {
  text-align: center;
  margin-top: 30px;
  color: #c53030;
  font-weight: 600;
}

/* ===== RESPONSIVE STYLES ===== */

/* Tablets */
@media (max-width: 1024px) {
  .clients-container {
    padding: 25px 30px;
  }

  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .search-input {
    flex: 1;
    min-width: 200px;
  }

  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

/* Mobile */
@media (max-width: 768px) {
  .clients-container {
    padding: 20px 15px;
  }

  .header-section h1 {
    font-size: 22px;
  }

  .actions {
    flex-direction: column;
    gap: 10px;
  }

  .search-input {
    width: 100%;
  }

  .search-btn, .add-btn {
    width: 100%;
    text-align: center;
  }

  .cards-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .client-card {
    padding: 15px;
  }

  .client-card h3 {
    font-size: 16px;
  }

  /* Modal responsive */
  .modal-content {
    width: 95%;
    max-width: 95%;
    padding: 20px;
    margin: 10px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-content h2 {
    font-size: 20px;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions button {
    width: 100%;
  }

  /* Pagination */
  .pagination {
    flex-wrap: wrap;
    justify-content: center;
    gap: 5px;
  }

  .pagination button {
    padding: 8px 12px;
    font-size: 13px;
  }
}

/* Small mobile */
@media (max-width: 480px) {
  .clients-container {
    padding: 15px 10px;
  }

  .header-section h1 {
    font-size: 20px;
  }

  .client-card {
    padding: 12px;
  }

  .client-card h3 {
    font-size: 15px;
  }

  .client-card p {
    font-size: 13px;
  }
}
</style>
