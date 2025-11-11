<script>
import apiClient from "../../../shared/infraestructure/services/api.client.js";
import { PropertiesAssembler } from "../services/properties.assembler.js";
import NavBar from "../../../shared/presentation/components/nav-bar.vue";
import FooterContent from "../../../shared/presentation/components/footer-content.vue";

export default {
  name: "PropertiesComponent",
  components: {FooterContent, NavBar},
  data() {
    return {
      properties: [],
      searchQuery: "",
      loading: true,
    };
  },
  computed: {
    filteredProperties() {
      return this.properties.filter((p) =>
          p.city.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          p.type.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          p.code.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  async mounted() {
    try {
      const response = await apiClient.get("/properties");
      this.properties = PropertiesAssembler.toEntitiesFromResponse(response);
    } catch (error) {
      console.error("Error cargando propiedades:", error);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    addProperty() {
      alert("Funcionalidad para añadir propiedad próximamente...");
    },
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
            type="text"
            placeholder="Buscar por ciudad, tipo o código..."
            class="search-input"
        />
        <button @click="addProperty" class="add-btn">+ Añadir Propiedad</button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <p>Cargando propiedades...</p>
    </div>

    <div v-else class="properties-grid">
      <div
          v-for="property in filteredProperties"
          :key="property.id"
          class="property-card"
      >
        <img :src="property.imageUrl" alt="Imagen de propiedad" class="property-image" />
        <div class="property-info">
          <h2>{{ property.code }} — {{ property.type }}</h2>
          <p class="address">{{ property.address }}</p>
          <p class="city">{{ property.city }}</p>
          <p class="area">Área: {{ property.area }} m²</p>
          <p class="price">S/ {{ property.price.toLocaleString() }}</p>
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

/* Grid de propiedades */
.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
}

.property-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(55, 127, 189, 0.15);
  overflow: hidden;
  transition: all 0.3s;
  border-left: 5px solid #377fbd;
  display: flex;
  flex-direction: column;
}

.property-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(55, 127, 189, 0.25);
}

.property-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.property-info {
  padding: 15px 20px;
}

.property-info h2 {
  font-size: 18px;
  margin-bottom: 6px;
  color: #255a8a;
}

.property-info .address,
.property-info .city,
.property-info .area {
  font-size: 14px;
  color: #444;
  margin: 3px 0;
}

.property-info .price {
  margin-top: 10px;
  font-size: 17px;
  font-weight: 600;
  color: #377fbd;
}

.loading {
  text-align: center;
  margin-top: 50px;
  color: #377fbd;
  font-weight: 500;
  font-size: 18px;
}
</style>
