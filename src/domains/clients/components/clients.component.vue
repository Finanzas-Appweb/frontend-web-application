<script>
import apiClient from "../../../shared/infraestructure/services/api.client.js";
import { ClientsAssembler } from "../services/clients.assembler.js";
import NavBar from "../../../shared/presentation/components/nav-bar.vue";
import FooterContent from "../../../shared/presentation/components/footer-content.vue";

export default {
  name: "ClientsComponent",
  components: {FooterContent, NavBar},
  data() {
    return {
      clients: [],
      searchQuery: "",
      loading: true,
    };
  },
  computed: {
    filteredClients() {
      return this.clients.filter((client) =>
          client.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  async mounted() {
    try {
      const response = await apiClient.get("/clients");
      this.clients = ClientsAssembler.toEntitiesFromResponse(response);
    } catch (error) {
      console.error("Error cargando clientes:", error);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    addClient() {
      alert("Funcionalidad de añadir cliente próximamente...");
    },
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
            type="text"
            placeholder="Buscar cliente..."
            class="search-input"
        />
        <button @click="addClient" class="add-btn">+ Añadir Cliente</button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <p>Cargando clientes...</p>
    </div>

    <div v-else class="clients-grid">
      <div
          v-for="client in filteredClients"
          :key="client.id"
          class="client-card"
      >
        <h2>{{ client.name }}</h2>
        <p><strong>Email:</strong> {{ client.email }}</p>
        <p><strong>Teléfono:</strong> {{ client.phone }}</p>
        <p><strong>Ingreso anual:</strong> S/ {{ client.annualIncome.toLocaleString() }}</p>
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

/* Grid de clientes */
.clients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.client-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(55, 127, 189, 0.15);
  padding: 20px;
  transition: all 0.3s;
  border-left: 5px solid #377fbd;
}

.client-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(55, 127, 189, 0.25);
}

.client-card h2 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #255a8a;
}

.client-card p {
  margin: 5px 0;
  font-size: 14px;
  color: #333;
}

.loading {
  text-align: center;
  margin-top: 50px;
  color: #377fbd;
  font-weight: 500;
  font-size: 18px;
}
</style>
