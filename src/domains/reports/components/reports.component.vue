<script setup>
import { ref, onMounted, computed } from "vue";
import { Bar, Pie } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
} from "chart.js";
import { Eye } from "lucide-vue-next";
import { ReportsAssembler } from "../services/reports.assembler.js";
import NavBar from "../../../shared/presentation/components/nav-bar.vue";
import FooterContent from "../../../shared/presentation/components/footer-content.vue";

ChartJS.register(
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    ArcElement
);

const loading = ref(true);
const topProperties = ref([]);
const simulationsData = ref([]);
const entityData = ref([]);
const propertyConsultsData = ref([]);
const errorMessage = ref("");

// Cargar datos del backend
onMounted(async () => {
  try {
    loading.value = true;
    errorMessage.value = "";

    const [
      ,
      propsResult,
      simsResult,
      entityResult,
      propConsultsResult
    ] = await Promise.all([
      ReportsAssembler.getReportsSummary(),
      ReportsAssembler.getMostConsultedProperties(),
      ReportsAssembler.getSimulationsByMonth(12),
      ReportsAssembler.getEntitySelection(),
      ReportsAssembler.getPropertyConsultsByMonth()
    ]);

    // Usamos summaryResult por si luego mostramos tarjetas; de momento solo almacenamos listas
    topProperties.value = propsResult || [];
    simulationsData.value = simsResult || [];
    entityData.value = entityResult || [];
    propertyConsultsData.value = propConsultsResult?.data || propConsultsResult || [];
  } catch (error) {
    console.error("Error cargando reportes:", error);
    errorMessage.value = error.response?.data?.title || "No se pudieron cargar los reportes";
    if (error.response?.data?.title) {
      alert(`Error: ${error.response.data.title}`);
    }
  } finally {
    loading.value = false;
  }
});

// Datos para gráfico de barras
const simulationsByMonth = computed(() => {
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return {
    labels: simulationsData.value.map(item => `${monthNames[(item.month || 1) - 1]} ${item.year || ''}`),
    datasets: [
      {
        label: "Simulaciones",
        backgroundColor: "#377FBD",
        borderRadius: 8,
        barThickness: 26,
        data: simulationsData.value.map(item => item.count ?? 0),
      },
    ],
  };
});

// Datos para gráfico de torta - mostrar count y percentage
const entitySelection = computed(() => {
  return {
    labels: entityData.value.map(e => `${e.bankName} (${e.count || 0})`),
    datasets: [
      {
        label: "Entidades",
        backgroundColor: ["#377FBD", "#5BA3D0", "#82C4F0", "#A4D8F6", "#4dd0e1"],
        hoverOffset: 12,
        data: entityData.value.map(e => e.count ?? 0), // Usar count en lugar de percentage
      },
    ],
  };
});

const propertyConsultsByMonth = computed(() => {
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return {
    labels: propertyConsultsData.value.map(item => `${monthNames[(item.month || 1) - 1]} ${item.year || ''}`),
    datasets: [
      {
        label: "Consultas a Propiedades",
        backgroundColor: "#5BA3D0",
        borderRadius: 8,
        barThickness: 26,
        data: propertyConsultsData.value.map(item => item.count ?? 0),
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: { color: "#2D6BA1", font: { size: 13, weight: "500" } },
    },
  },
  scales: {
    x: {
      ticks: { color: "#555", font: { size: 13 } },
      grid: { display: false },
    },
    y: {
      ticks: { color: "#777", font: { size: 13 } },
      grid: { color: "#E5E9EC" },
    },
  },
};

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: { color: "#2D6BA1", font: { size: 13, weight: "500" } },
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const item = entityData.value[context.dataIndex];
          if (item) {
            return `${item.bankName}: ${item.count || 0} simulaciones (${(item.percentage || 0).toFixed(1)}%)`;
          }
          return context.label;
        }
      }
    }
  },
};

const getCurrencySymbol = (currency) => {
  return currency === 'USD' || currency === 2 ? '$' : 'S/';
};

const verDetalles = (propiedad) => {
  alert(`Detalles de la propiedad ${propiedad.code}:\n${propiedad.title || propiedad.address}\nConsultas: ${propiedad.consultCount}`);
};
</script>

<template>
  <nav-bar></nav-bar>
  <div class="reports-view">
    <h1>Reportes Generales</h1>

    <div v-if="loading" class="loading-container">
      <p>Cargando reportes...</p>
    </div>
    <div v-else-if="errorMessage" class="loading-container">
      <p>{{ errorMessage }}</p>
    </div>

    <!-- CONTENEDOR PRINCIPAL -->
    <div v-else class="reports-layout">
      <!-- FILA SUPERIOR -->
      <div class="top-row">
        <!-- 🏠 Propiedades más consultadas -->
        <div class="report-card">
          <h2>Propiedades más consultadas</h2>
          <div class="table-wrapper">
            <table v-if="topProperties.length > 0">
              <thead>
              <tr>
                <th>Código</th>
                <th>Título</th>
                <th>Precio</th>
                <th>Consultas</th>
                <th></th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="prop in topProperties" :key="prop.propertyId || prop.code">
                <td>{{ prop.code }}</td>
                <td>{{ prop.title }}</td>
                <td>{{ getCurrencySymbol(prop.currency) }} {{ prop.price?.toLocaleString() }}</td>
                <td><strong>{{ prop.consultCount }}</strong></td>
                <td class="eye-cell" @click="verDetalles(prop)">
                  <Eye class="eye-icon" />
                </td>
              </tr>
              </tbody>
            </table>
            <p v-else class="no-data-small">No hay datos de propiedades consultadas</p>
          </div>
        </div>

        <!-- 🏦 Selección de Entidades Financieras -->
        <div class="report-card">
          <h2>Selección de Entidades Financieras</h2>
          <div v-if="entityData.length > 0" class="chart-wrapper">
            <Pie :data="entitySelection" :options="pieChartOptions" />
          </div>
          <p v-else class="no-data-small">No hay datos de selección de entidades</p>
        </div>
      </div>

      <!-- FILA INFERIOR -->
      <div class="bottom-row">
        <!-- 📊 Simulaciones por mes -->
        <div class="report-card">
          <h2>Simulaciones por Mes</h2>
          <div v-if="simulationsData.length > 0" class="chart-wrapper">
            <Bar :data="simulationsByMonth" :options="chartOptions" />
          </div>
          <p v-else class="no-data-small">No hay datos de simulaciones</p>
        </div>

        <div class="report-card" v-if="propertyConsultsData.length">
          <h2>Consultas de Propiedades por Mes</h2>
          <div class="chart-wrapper">
            <Bar :data="propertyConsultsByMonth" :options="chartOptions" />
          </div>
        </div>
      </div>
    </div>
  </div>
  <footer-content></footer-content>
</template>

<style scoped>
.reports-view {
  background: #f8fbfd;
  min-height: 100vh;
  padding: 40px 50px;
  font-family: "Roboto", sans-serif;
}

.reports-view h1 {
  color: #2d6ba1;
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 35px;
  text-align: center;
}

/* NUEVO LAYOUT */
.reports-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 30px;
}

.top-row {
  display: flex;
  gap: 30px;
}

.top-row .report-card {
  flex: 1; /* 50% cada una */
}

.bottom-row .report-card {
  width: 100%; /* 100% debajo */
}
.bottom-row {
  display: flex;
  gap: 30px;
}
.bottom-row .report-card:last-child {
  flex: 1;
}

/* TARJETAS */
.report-card {
  background: #fff;
  border-radius: 20px;
  padding: 25px 30px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.report-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(55, 127, 189, 0.25);
}

.report-card h2 {
  color: #377fbd;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  text-align: left;
}

/* TABLA */
.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: left;
  color: #2d6ba1;
  font-weight: 600;
  padding: 10px 8px;
  border-bottom: 2px solid #e0e6ed;
}

td {
  padding: 10px 8px;
  font-size: 14px;
  color: #444;
  border-bottom: 1px solid #eef1f4;
}

tr:hover {
  background-color: #f5f9fc;
}

.eye-cell {
  text-align: center;
  cursor: pointer;
}

.eye-icon {
  color: #377fbd;
  width: 20px;
  height: 20px;
  transition: transform 0.2s, color 0.2s;
}

.eye-icon:hover {
  transform: scale(1.15);
  color: #2d6ba1;
}

/* GRÁFICOS */
.chart-wrapper {
  height: 320px;
  position: relative;
}

/* ===== RESPONSIVE STYLES ===== */
@media (max-width: 1024px) {
  .top-row {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .reports-container {
    padding: 20px 15px;
  }

  .reports-container > h1 {
    font-size: 22px;
  }

  .report-card {
    padding: 20px;
    border-radius: 12px;
  }

  .report-card h2 {
    font-size: 16px;
  }

  .chart-wrapper {
    height: 250px;
  }

  table {
    font-size: 13px;
  }

  th, td {
    padding: 8px 6px;
  }
}

@media (max-width: 480px) {
  .reports-container {
    padding: 15px 10px;
  }

  .reports-container > h1 {
    font-size: 20px;
  }

  .report-card {
    padding: 15px;
  }

  .chart-wrapper {
    height: 200px;
  }

  th, td {
    padding: 6px 4px;
    font-size: 12px;
  }
}

.loading-container {
  text-align: center;
  padding: 50px;
  color: #377FBD;
  font-size: 18px;
}

.no-data-small {
  text-align: center;
  padding: 30px;
  color: #666;
  font-style: italic;
  font-size: 14px;
}
</style>
