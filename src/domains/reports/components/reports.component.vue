<script setup>
import { ref } from "vue";
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

// 🧾 Datos de ejemplo
const topProperties = ref([
  { code: "P0001", address: "Av. Primavera 540, Surco", consultas: 58 },
  { code: "P0002", address: "Calle Las Orquídeas 210, Miraflores", consultas: 45 },
  { code: "P0003", address: "Jr. Los Álamos 890, La Molina", consultas: 39 },
  { code: "P0004", address: "Av. Colonial 3050, Lima Cercado", consultas: 22 },
]);

const simulationsByMonth = {
  labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
  datasets: [
    {
      label: "Simulaciones",
      backgroundColor: "#377FBD",
      borderRadius: 8,
      barThickness: 26,
      data: [14, 18, 22, 19, 25, 30, 27, 35, 33, 28, 31, 24],
    },
  ],
};

const entitySelection = {
  labels: ["BCP", "Interbank", "BBVA", "Scotiabank"],
  datasets: [
    {
      label: "Entidades",
      backgroundColor: ["#377FBD", "#5BA3D0", "#82C4F0", "#A4D8F6"],
      hoverOffset: 12,
      data: [40, 25, 20, 15],
    },
  ],
};

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

const verDetalles = (propiedad) => {
  alert(`Detalles de la propiedad ${propiedad.code}:\n${propiedad.address}`);
};
</script>

<template>
  <nav-bar></nav-bar>
  <div class="reports-view">
    <h1>Reportes Generales</h1>

    <!-- CONTENEDOR PRINCIPAL -->
    <div class="reports-layout">
      <!-- FILA SUPERIOR -->
      <div class="top-row">
        <!-- 🏠 Propiedades más consultadas -->
        <div class="report-card">
          <h2>Propiedades más consultadas</h2>
          <div class="table-wrapper">
            <table>
              <thead>
              <tr>
                <th>Código</th>
                <th>Dirección</th>
                <th>Consultas</th>
                <th></th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="prop in topProperties" :key="prop.code">
                <td>{{ prop.code }}</td>
                <td>{{ prop.address }}</td>
                <td>{{ prop.consultas }}</td>
                <td class="eye-cell" @click="verDetalles(prop)">
                  <Eye class="eye-icon" />
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 🏦 Selección de Entidades Financieras -->
        <div class="report-card">
          <h2>Selección de Entidades Financieras</h2>
          <div class="chart-wrapper">
            <Pie :data="entitySelection" :options="chartOptions" />
          </div>
        </div>
      </div>

      <!-- FILA INFERIOR -->
      <div class="bottom-row">
        <!-- 📊 Simulaciones por mes -->
        <div class="report-card">
          <h2>Simulaciones por Mes</h2>
          <div class="chart-wrapper">
            <Bar :data="simulationsByMonth" :options="chartOptions" />
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

/* RESPONSIVE */
@media (max-width: 1024px) {
  .top-row {
    flex-direction: column;
  }
}
</style>
