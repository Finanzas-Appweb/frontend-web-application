<script>
import { ref, onMounted } from "vue";
import { ReportsAssembler } from "../domains/reports/services/reports.assembler.js";
import { Chart, registerables } from "chart.js";
import NavBar from "../shared/presentation/components/nav-bar.vue";
import FooterContent from "../shared/presentation/components/footer-content.vue";

Chart.register(...registerables);

export default {
  name: "Home",
  components: {FooterContent, NavBar},
  setup() {
    const statistics = ref({
      registeredClients: 0,
      totalUsers: 0,
      totalProperties: 0,
      totalSimulations: 0
    });
    const lastActivities = ref([]);
    const simulationsByMonth = ref([]);
    const entitySelection = ref([]);
    const loading = ref(true);

    let barChartInstance = null;
    let pieChartInstance = null;

    const loadData = async () => {
      try {
        loading.value = true;
        
        // Cargar resumen del dashboard
        const summaryData = await ReportsAssembler.getReportsSummary();
        statistics.value = summaryData.statistics;
        lastActivities.value = summaryData.lastActivities.slice(0, 5);

        // Cargar datos para gráficos
        const simsByMonthData = await ReportsAssembler.getSimulationsByMonth(6);
        simulationsByMonth.value = simsByMonthData.data;

        const entitySelectionData = await ReportsAssembler.getEntitySelection();
        entitySelection.value = entitySelectionData.data;

        // Esperar a que el DOM esté listo
        setTimeout(() => {
          createCharts();
        }, 100);
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        if (err.response?.data?.title) {
          alert(`Error: ${err.response.data.title}`);
        }
      } finally {
        loading.value = false;
      }
    };

    const createCharts = () => {
      // Destruir charts anteriores si existen
      if (barChartInstance) barChartInstance.destroy();
      if (pieChartInstance) pieChartInstance.destroy();

      if (simulationsByMonth.value.length > 0) {
        const ctx1 = document.getElementById("barChart");
        if (ctx1) {
          const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
          barChartInstance = new Chart(ctx1.getContext("2d"), {
            type: "bar",
            data: {
              labels: simulationsByMonth.value.map(m => `${monthNames[m.month - 1]} ${m.year}`),
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
        }
      }

      if (entitySelection.value.length > 0) {
        const ctx2 = document.getElementById("pieChart");
        if (ctx2) {
          pieChartInstance = new Chart(ctx2.getContext("2d"), {
            type: "pie",
            data: {
              labels: entitySelection.value.map(e => e.bankName),
              datasets: [
                {
                  data: entitySelection.value.map(e => e.percentage),
                  backgroundColor: ["#29b6f6", "#81d4fa", "#03a9f4", "#0288d1", "#4dd0e1"],
                },
              ],
            },
            options: { 
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom'
                }
              }
            },
          });
        }
      }
    };

    onMounted(() => {
      loadData();
    });

    return { statistics, lastActivities, loading };
  },
};
</script>

<template>
  <nav-bar></nav-bar>
  <div class="home-container">
    <div v-if="loading" class="loading-container">
      <p>Cargando dashboard...</p>
    </div>

    <template v-else>
      <!-- Cartas de estadísticas -->
      <div class="stats-cards">
        <div class="card">
          <h3>Clientes</h3>
          <p>{{ statistics.registeredClients }}</p>
        </div>
        <div class="card">
          <h3>Simulaciones Totales</h3>
          <p>{{ statistics.totalSimulations }}</p>
        </div>
        <div class="card">
          <h3>Propiedades</h3>
          <p>{{ statistics.totalProperties }}</p>
        </div>
        <div class="card">
          <h3>Usuarios</h3>
          <p>{{ statistics.totalUsers }}</p>
        </div>
      </div>

      <!-- Tabla de últimas actividades -->
      <div class="table-container">
        <h3>Últimas Actividades</h3>
        <table v-if="lastActivities.length > 0">
          <thead>
          <tr>
            <th>Fecha</th>
            <th>Acción</th>
            <th>Entidad</th>
            <th>Usuario</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="activity in lastActivities" :key="activity.id">
            <td>{{ new Date(activity.createdAt).toLocaleString('es-PE', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            }) }}</td>
            <td>{{ activity.action }}</td>
            <td>{{ activity.entity }}</td>
            <td>{{ activity.userName }}</td>
          </tr>
          </tbody>
        </table>
        <p v-else class="no-data">No hay actividades recientes</p>
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
        <button class="btn" @click="$router.push('/simulator')">Simular un crédito</button>
        <button class="btn" @click="$router.push('/clients')">Gestionar clientes</button>
      </div>
    </template>
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

.loading-container {
  text-align: center;
  padding: 50px;
  color: #377FBD;
  font-size: 18px;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #666;
  font-style: italic;
}
</style>
