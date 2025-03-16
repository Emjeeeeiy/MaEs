<template>
  <div class="dashboard-wrapper">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="profile-section">
        <div class="profile-icon">A</div>
        <h3 class="username">{{ username }}</h3>
        <p class="role-text">{{ role }}</p>
      </div>

      <nav class="nav-links">
        <router-link to="/admin-management" class="nav-button"
          >Manage Users</router-link
        >
        <router-link to="/AdminInvoices" class="nav-button"
          >Invoice Management</router-link
        >
        <router-link to="/claims-management" class="nav-button"
          >Claims Management</router-link
        >
        <!-- <router-link to="/patient-management" class="nav-button">Patient Management</router-link> -->
        <button @click="logout" class="logout-button">Log Out</button>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="dashboard-content">
      <h1 class="dashboard-title">Admin Dashboard</h1>

      <!-- Dashboard Cards -->
      <section class="dashboard-cards">
        <div class="card" v-for="(card, index) in dashboardCards" :key="index">
          <h3 style="color: white">{{ card.title }}</h3>
          <p style="color: yellow">{{ card.value }}</p>
        </div>
      </section>

      <!-- Charts Section -->
      <section class="charts-container">
        <div class="chart-card small-chart-card">
          <h3>Revenue Trend</h3>
          <div class="chart-container">
            <canvas ref="lineChart"></canvas>
          </div>
        </div>
        <div class="chart-card small-chart-card">
          <h3>Department Revenue</h3>
          <div class="chart-container">
            <canvas ref="pieChart"></canvas>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "vue-router";
import { ref, onMounted, nextTick } from "vue";
import Chart from "chart.js/auto";

export default {
  name: "AdminDashboard",
  setup() {
    const router = useRouter();
    const auth = getAuth();
    const username = ref("Admin");
    const role = ref("Administrator");
    const lineChart = ref(null);
    const pieChart = ref(null);

    const dashboardCards = ref([
      { title: "Total Revenue", value: "$2,500,000" },
      { title: "Pending Claims", value: "45" },
      { title: "Outstanding Payments", value: "$450,000" },
      { title: "Total Patients", value: "3,200" },
      { title: "Discharged Patients", value: "2,000" },
    ]);

    const logout = async () => {
      try {
        await signOut(auth);
        router.push("/login");
      } catch (error) {
        console.error("Error during logout:", error);
      }
    };

    onMounted(async () => {
      await nextTick();
      drawCharts();
    });

    const drawCharts = () => {
      if (!lineChart.value || !pieChart.value) return;

      new Chart(lineChart.value, {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            {
              label: "Revenue",
              data: [10000, 15000, 20000, 18000, 22000, 25000],
              borderColor: "#ffcc00",
              backgroundColor: "rgba(255, 204, 0, 0.2)",
              borderWidth: 2,
              fill: true,
            },
          ],
        },
        options: {
          maintainAspectRatio: true,
          responsive: true,
          aspectRatio: 2,
        },
      });

      new Chart(pieChart.value, {
        type: "pie",
        data: {
          labels: ["Emergency", "Surgery", "Consultation", "Pharmacy"],
          datasets: [
            {
              data: [40, 25, 20, 15],
              backgroundColor: ["#ffcc00", "#66bb6a", "#42a5f5", "#ff7043"],
            },
          ],
        },
        options: {
          maintainAspectRatio: true,
          responsive: true,
          aspectRatio: 1,
        },
      });
    };

    return { logout, dashboardCards, username, role, lineChart, pieChart };
  },
};
</script>

<style scoped>
body {
  background-color: #0f1624;
  color: #ffffff;
  font-family: "Poppins", sans-serif;
}

.dashboard-wrapper {
  display: flex;
  height: 100vh;
  background: #0f1624;
}

.sidebar {
  width: 280px;
  background: #121826;
  padding: 30px;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 4px 0 10px rgba(255, 255, 255, 0.1);
}

.profile-section {
  text-align: center;
  margin-bottom: 20px;
}

.profile-icon {
  width: 60px;
  height: 60px;
  background: #ffcc00;
  color: #121826;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
}

.nav-button {
  display: block;
  background: #1e2a47;
  padding: 12px;
  margin: 10px 0;
  border-radius: 6px;
  text-align: center;
  color: white;
  width: 100%;
  transition: 0.3s;
  text-decoration: none;
}

.nav-button:hover {
  background: #384b7e;
}

.logout-button {
  background: #d62828;
  padding: 12px;
  border-radius: 6px;
  width: 100%;
  color: white;
  transition: 0.3s;
}

.logout-button:hover {
  background: #e63946;
}

.dashboard-content {
  flex-grow: 1;
  padding: 30px;
  background: #121826;
  margin-left: 20px;
  border-radius: 12px;
  box-shadow: 4px 0 10px rgba(255, 255, 255, 0.1);
}

.dashboard-title {
  color: #ffcc00;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
}

.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.card {
  background: #1e2a47;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(255, 255, 255, 0.1);
  text-align: center;
  transition: transform 0.3s ease-in-out;
}

.card:hover {
  transform: translateY(-5px);
}
.charts-container {
  display: flex;
  gap: 20px;
  margin-top: 30px;
  justify-content: center;
}

.chart-card {
  background: #1e2a47;
  padding: 15px;
  border-radius: 10px;
  width: 40%;
  box-shadow: 0 4px 10px rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #ffffff;
  transition: transform 0.3s ease-in-out;
}

.chart-card:hover {
  transform: scale(1.05);
}

.chart-card canvas {
  max-width: 100%;
  height: auto;
}

.invoice-status {
  font-weight: bold;
  padding: 5px 10px;
  border-radius: 5px;
}

.invoice-status.paid {
  background-color: #28a745;
  color: white;
}

.invoice-status.pending {
  background-color: #d62828;
  color: white;
}
</style>
