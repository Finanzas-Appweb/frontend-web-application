<script>
import { ref, onMounted, watch } from "vue";
import { ReportsAssembler } from "../domains/reports/services/reports.assembler.js";
import { Chart, registerables } from "chart.js";
import NavBar from "../shared/presentation/components/nav-bar.vue";
import FooterContent from "../shared/presentation/components/footer-content.vue";

Chart.register(...registerables);

export default {
  name: "Home",
  components: {FooterContent, NavBar},
  setup() {
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
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
    const errorMessage = ref("");
    const chartsReady = ref(false);

    let barChartInstance = null;
    let pieChartInstance = null;

    const loadData = async () => {
      try {
        loading.value = true;
        errorMessage.value = "";
        
        const [
          summaryData,
          simsByMonthData,
          entitySelectionData
        ] = await Promise.all([
          ReportsAssembler.getReportsSummary(),
          ReportsAssembler.getSimulationsByMonth(12),
          ReportsAssembler.getEntitySelection()
        ]);

        statistics.value = summaryData?.statistics || statistics.value;
        lastActivities.value = summaryData?.lastActivities?.slice(0, 5) || [];
        simulationsByMonth.value = simsByMonthData || [];
        entitySelection.value = entitySelectionData || [];

      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
        errorMessage.value = err.response?.data?.title || "No se pudieron cargar los reportes";
      } finally {
        loading.value = false;
        chartsReady.value = true;
      }
    };

    const createCharts = () => {
      // Destruir charts anteriores si existen
      if (barChartInstance) {
        barChartInstance.destroy();
        barChartInstance = null;
      }
      if (pieChartInstance) {
        pieChartInstance.destroy();
        pieChartInstance = null;
      }

      // Esperar un frame para asegurar que el DOM esté listo
      setTimeout(() => {
        if (simulationsByMonth.value.length > 0) {
          const ctx1 = document.getElementById("barChart");
          if (ctx1) {
            barChartInstance = new Chart(ctx1.getContext("2d"), {
              type: "bar",
              data: {
                labels: simulationsByMonth.value.map(m => `${monthNames[(m.month || 1) - 1]} ${m.year || ''}`),
                datasets: [
                  {
                    label: "Simulaciones",
                    data: simulationsByMonth.value.map(m => m.count ?? 0),
                    backgroundColor: "#4fc3f7",
                    borderRadius: 5,
                  },
                ],
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: true, position: 'bottom' } },
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
                labels: entitySelection.value.map(e => `${e.bankName} (${e.count || 0})`),
                datasets: [
                  {
                    data: entitySelection.value.map(e => e.count ?? e.percentage ?? 0),
                    backgroundColor: ["#29b6f6", "#81d4fa", "#03a9f4", "#0288d1", "#4dd0e1"],
                  },
                ],
              },
              options: { 
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const item = entitySelection.value[context.dataIndex];
                        return `${item.bankName}: ${item.count || 0} (${(item.percentage || 0).toFixed(1)}%)`;
                      }
                    }
                  }
                }
              },
            });
          }
        }
      }, 100);
    };

    // Watch para crear charts cuando chartsReady cambie y loading sea false
    watch([chartsReady, loading], ([ready, isLoading]) => {
      if (ready && !isLoading) {
        createCharts();
      }
    });

    onMounted(() => {
      loadData();
    });

    return { statistics, lastActivities, loading, errorMessage, simulationsByMonth, entitySelection };
  },
};
</script>

<template>
  <nav-bar></nav-bar>
  <div class="home-container">
    <div v-if="loading" class="loading-container">
      <p>Cargando dashboard...</p>
    </div>

    <div v-else-if="errorMessage" class="error-container">
      <p>{{ errorMessage }}</p>
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
          <div class="chart-wrapper">
            <canvas v-if="simulationsByMonth.length" id="barChart"></canvas>
            <p v-else class="no-data">No hay datos de simulaciones por mes</p>
          </div>
        </div>
        <div class="chart-card">
          <h3>Selección de entidades</h3>
          <div class="chart-wrapper">
            <canvas v-if="entitySelection.length" id="pieChart"></canvas>
            <p v-else class="no-data">No hay datos de entidades</p>
          </div>
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
.chart-wrapper {
  height: 280px;
  position: relative;
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

.error-container {
  text-align: center;
  padding: 40px;
  color: #c53030;
  font-weight: 600;
}

/* ===== RESPONSIVE STYLES ===== */

@media (max-width: 1024px) {
  .charts-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .home-container {
    padding: 1rem;
  }

  .stats-cards {
    flex-direction: column;
    gap: 0.75rem;
  }

  .card {
    padding: 1rem;
  }

  .card h3 {
    font-size: 0.9rem;
  }

  .card p {
    font-size: 1.5rem;
  }

  .table-container {
    overflow-x: auto;
  }

  table {
    font-size: 0.85rem;
    min-width: 500px;
  }

  th, td {
    padding: 0.5rem;
  }

  .chart-wrapper {
    height: 220px;
  }

  .buttons-container {
    flex-direction: column;
  }

  .btn {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .home-container {
    padding: 0.75rem;
  }

  .card {
    padding: 0.75rem;
  }

  .card h3 {
    font-size: 0.8rem;
  }

  .card p {
    font-size: 1.25rem;
  }

  .chart-wrapper {
    height: 180px;
  }

  .chart-card h3, .table-container h3 {
    font-size: 0.9rem;
  }
}
</style>
