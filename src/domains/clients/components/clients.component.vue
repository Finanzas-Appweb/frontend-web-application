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
      showModal: false,
      isEditing: false,
      clientForm: {
        firstName: "",
        lastName: "",
        dni: "",
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
  methods: {
    async loadClients() {
      try {
        this.loading = true;
        const result = await ClientsAssembler.getClients({
          search: this.searchQuery,
          page: this.pagination.currentPage,
          pageSize: this.pagination.pageSize
        });
        this.clients = result.clients;
        this.pagination = result.pagination;
      } catch (error) {
        console.error("Error cargando clientes:", error);
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
        dni: "",
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
        dni: client.dni,
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
            placeholder="Buscar por nombre, email o DNI..."
            class="search-input"
        />
        <button @click="searchClients" class="search-btn">Buscar</button>
        <button v-if="permissions.canCreateClient.value" @click="openAddModal" class="add-btn">+ Añadir Cliente</button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <p>Cargando clientes...</p>
    </div>

    <div v-else-if="clients.length === 0" class="no-data">
      <p>No se encontraron clientes</p>
    </div>

    <div v-else class="table-wrapper">
      <table class="clients-table">
        <thead>
          <tr>
            <th>Nombre Completo</th>
            <th>DNI</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Ingreso Anual</th>
            <th>Creado Por</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="client in clients" :key="client.id">
            <td>{{ client.fullName }}</td>
            <td>{{ client.dni }}</td>
            <td>{{ client.email }}</td>
            <td>{{ client.phone }}</td>
            <td>S/ {{ client.annualIncome?.toLocaleString() || '0' }}</td>
            <td>{{ client.createdByUserName }}</td>
            <td class="actions-cell">
              <button v-if="permissions.canUpdateClient.value" @click="openEditModal(client)" class="btn-icon edit-btn" title="Editar">✏️</button>
              <button v-if="permissions.canDeleteClient.value" @click="deleteClient(client)" class="btn-icon delete-btn" title="Eliminar">🗑️</button>
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
          ({{ pagination.totalCount }} clientes)
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
              <label>DNI *</label>
              <input v-model="clientForm.dni" type="text" maxlength="8" required />
            </div>
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

.clients-table {
  width: 100%;
  border-collapse: collapse;
}

.clients-table thead th {
  background-color: #377fbd;
  color: white;
  padding: 15px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
}

.clients-table tbody td {
  padding: 12px 15px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  color: #333;
}

.clients-table tbody tr:hover {
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
