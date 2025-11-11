<script>
import { ref, onMounted } from "vue";
import ApiService from "../shared/infraestructure/services/api.service.js";
import { Chart, registerables } from "chart.js";
import NavBar from "../shared/presentation/components/nav-bar.vue";
import FooterContent from "../shared/presentation/components/footer-content.vue";

Chart.register(...registerables);

export default {
  name: "Home",
  components: {FooterContent, NavBar},
  setup() {
    const dashboardStats = ref({});
    const recentSimulations = ref([]);
    const simulationsByMonth = ref([]);
    const entitySelection = ref([]);
    const clients = ref([]);

    const loadData = async () => {
      try {
        // Dashboard stats
        const statsResp = await ApiService.getDashboardStats();
        dashboardStats.value = statsResp.data;

        // Clientes
        const clientsResp = await ApiService.getClients();
        clients.value = clientsResp.data;

        // Últimas simulaciones
        const simsResp = await ApiService.getSimulations();
        recentSimulations.value = simsResp.data
            .map(sim => ({
              ...sim,
              client: clients.value.find(c => c.id == sim.clientId),
            }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        // Gráficos
        const simsByMonthResp = await ApiService.getSimulationsByMonthReport();
        simulationsByMonth.value = simsByMonthResp.data;

        const entitySelectionResp = await ApiService.getEntitySelectionReport();
        entitySelection.value = entitySelectionResp.data;

        createCharts();
      } catch (err) {
        console.error(err);
      }
    };

    const createCharts = () => {
      if (simulationsByMonth.value.length && entitySelection.value.length) {
        // Bar chart
        const ctx1 = document.getElementById("barChart").getContext("2d");
        new Chart(ctx1, {
          type: "bar",
          data: {
            labels: simulationsByMonth.value.map(m => m.month),
            datasets: [
              {
                label: "Simulaciones",
                data: simulationsByMonth.value.map(m => m.count),
                backgroundColor: "#4fc3f7",
                borderRadius: 5,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } },
          },
        });

        // Pie chart
        const ctx2 = document.getElementById("pieChart").getContext("2d");
        new Chart(ctx2, {
          type: "pie",
          data: {
            labels: entitySelection.value.map(e => e.name),
            datasets: [
              {
                data: entitySelection.value.map(e => e.percentage),
                backgroundColor: ["#29b6f6", "#81d4fa", "#03a9f4", "#0288d1"],
              },
            ],
          },
          options: { responsive: true },
        });
      }
    };

    onMounted(() => {
      loadData();
    });

    return { dashboardStats, recentSimulations };
  },
};
</script>

<template>
  <nav-bar></nav-bar>
  <div class="home-container">
    <!-- Cartas de estadísticas -->
    <div class="stats-cards">
      <div class="card">
        <h3>Clientes</h3>
        <p>{{ dashboardStats.clientsCount || 0 }}</p>
      </div>
      <div class="card">
        <h3>Simulaciones este mes</h3>
        <p>{{ dashboardStats.simulationsThisMonth || 0 }}</p>
      </div>
      <div class="card">
        <h3>Propiedades</h3>
        <p>{{ dashboardStats.propertiesCount || 0 }}</p>
      </div>
    </div>

    <!-- Tabla de últimos movimientos -->
    <div class="table-container">
      <h3>Últimas simulaciones</h3>
      <table>
        <thead>
        <tr>
          <th>Fecha</th>
          <th>Acción</th>
          <th>Usuario</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="sim in recentSimulations" :key="sim.id">
          <td>{{ new Date(sim.createdAt).toLocaleDateString() }}</td>
          <td>Simulación de crédito</td>
          <td>{{ sim.client?.name || sim.clientId }}</td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Gráficos -->
    <div class="charts-container">
      <div class="chart-card">
        <h3>Simulaciones por mes</h3>
        <canvas id="barChart"></canvas>
      </div>
      <div class="chart-card">
        <h3>Selección de entidades</h3>
        <canvas id="pieChart"></canvas>
      </div>
    </div>

    <!-- Botones -->
    <div class="buttons-container">
      <button class="btn">Simular un crédito</button>
      <button class="btn">Gestionar clientes</button>
    </div>
  </div>
  <footer-content></footer-content>
</template>

<style scoped>
.home-container {
  background-color: #ffffff;
  padding: 2rem;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Stats cards */
.stats-cards {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}
.card {
  flex: 1;
  background-color: #e1f5fe;
  color: #0277bd;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}
.card h3 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}
.card p {
  font-size: 1.75rem;
  font-weight: bold;
}

/* Table */
.table-container {
  background-color: #e1f5fe;
  padding: 1rem;
  border-radius: 0.75rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.table-container h3 {
  margin-bottom: 1rem;
  color: #0277bd;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  padding: 0.75rem;
  text-align: left;
}
th {
  background-color: #b3e5fc;
  color: #01579b;
  font-weight: 600;
}
tr:nth-child(even) {
  background-color: #f0f8ff;
}

/* Charts */
.charts-container {

  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}
.chart-card {
  background-color: #e1f5fe;
  padding: 1rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.chart-card h3 {
  margin-bottom: 1rem;
  color: #0277bd;
  text-align: center;
}

/* Buttons */
.buttons-container {
  display: flex;
  gap: 1rem;
}
.btn {
  flex: 1;
  background-color: #03a9f4;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}
.btn:hover {
  background-color: #0288d1;
}
</style>
