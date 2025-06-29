<template>
  <div class="flex min-h-screen bg-gray-100 text-gray-800 overflow-hidden">
    <!-- Sidebar -->
    <admin_sidebar />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col h-screen">
      <!-- Admin Top-bar (feedback + notification icons) -->
      <AdminTopbar />

      <!-- Page Content -->
      <main class="flex-1 p-6 space-y-8 overflow-y-auto">
        <!-- Dashboard Cards -->
        <section
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <div
            v-for="(card, index) in dashboardCards"
            :key="index"
            class="bg-white shadow-md rounded-2xl p-5 flex items-center space-x-4 hover:shadow-lg transition"
          >
            <component :is="card.icon" class="w-8 h-8 text-green-600" />
            <div>
              <p class="text-sm text-gray-500 font-medium">{{ card.title }}</p>
              <p class="text-lg font-bold">{{ card.value }}</p>
            </div>
          </div>
        </section>

        <!-- Charts Section -->
        <section class="space-y-6">
          <!-- Line Chart -->
          <div class="bg-white p-6 rounded-2xl shadow-md">
            <h2 class="text-lg font-semibold mb-4 text-gray-700">
              Revenue Trend (Daily)
            </h2>
            <div class="h-72">
              <canvas ref="lineChart" class="w-full h-full"></canvas>
            </div>
          </div>

          <!-- Bar Chart -->
          <div class="bg-white p-6 rounded-2xl shadow-md">
            <h2 class="text-lg font-semibold mb-4 text-gray-700">
              Department Revenue
            </h2>
            <div class="h-72">
              <canvas ref="barChart" class="w-full h-full"></canvas>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import Chart from "chart.js/auto";
import admin_sidebar from "@/components/admin_sidebar.vue";
import AdminTopbar from "@/components/AdminTopbar.vue"; // ⬅️ import the top-bar

import {
  ChartBarIcon,
  UsersIcon,
  CreditCardIcon,
  UserGroupIcon,
} from "@heroicons/vue/24/solid";

const db = getFirestore();

const lineChart = ref(null);
const barChart = ref(null);
const dashboardCards = ref([]);
const loading = ref(true);

const revenueByDay = ref({});
const serviceCounts = ref({});

let lineChartInstance = null;
let barChartInstance = null;

/* ───────────── Dashboard Data ───────────── */
const fetchDashboardData = async () => {
  let totalRevenue = 0;
  let unpaidClaims = 0;
  let totalPatients = 0;
  let dischargedPatients = 0;

  revenueByDay.value = {};
  serviceCounts.value = {};

  try {
    const invoicesSnap = await getDocs(collection(db, "invoices"));
    invoicesSnap.forEach((doc) => {
      const data = doc.data();
      const status = (data.status || "").toLowerCase();
      const amount = Number(data.totalAmount || 0);
      const timestamp = data.createdAt?.seconds;

      if (timestamp) {
        const day = new Date(timestamp * 1000).toLocaleDateString("en-CA");
        revenueByDay.value[day] = (revenueByDay.value[day] || 0) + amount;
      }

      if (status === "paid") totalRevenue += amount;
      else if (["pending", "not paid", "unpaid", "overdue"].includes(status))
        unpaidClaims++;

      (data.services || []).forEach((s) => {
        const name = s.serviceName || "Unknown";
        serviceCounts.value[name] = (serviceCounts.value[name] || 0) + 1;
      });
    });

    const usersSnap = await getDocs(collection(db, "users"));
    usersSnap.forEach((doc) => {
      const data = doc.data();
      if ((data.role || "").toLowerCase() === "user") {
        totalPatients++;
        if ((data.status || "").toLowerCase() === "discharged")
          dischargedPatients++;
      }
    });

    dashboardCards.value = [
      { title: "Total Revenue", value: `₱${totalRevenue.toLocaleString()}`, icon: ChartBarIcon },
      { title: "Unpaid Claims", value: unpaidClaims, icon: CreditCardIcon },
      { title: "Total Patients", value: totalPatients, icon: UsersIcon },
      { title: "Discharged Patients", value: dischargedPatients, icon: UserGroupIcon },
    ];
  } catch (err) {
    console.error("Dashboard data error:", err);
  }
};

/* ───────────── Draw Charts ───────────── */
const drawCharts = () => {
  if (!lineChart.value || !barChart.value) return;

  if (lineChartInstance) lineChartInstance.destroy();
  if (barChartInstance) barChartInstance.destroy();

  const dates = Object.keys(revenueByDay.value).sort(
    (a, b) => new Date(a) - new Date(b)
  );
  const revenues = dates.map((d) => revenueByDay.value[d]);

  // Line
  const ctxLine = lineChart.value.getContext("2d");
  const grad = ctxLine.createLinearGradient(0, 0, 0, 300);
  grad.addColorStop(0, "rgba(34,197,94,0.4)");
  grad.addColorStop(1, "rgba(255,255,255,0)");

  lineChartInstance = new Chart(ctxLine, {
    type: "line",
    data: { labels: dates, datasets: [{ data: revenues, fill: true, backgroundColor: grad, borderColor: "#22c55e", tension: 0.4, borderWidth: 3 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: "#6b7280" }, grid: { color: "#e5e7eb" } }, y: { ticks: { color: "#6b7280", callback: v=>`₱${v.toLocaleString()}` }, grid: { color: "#e5e7eb" } } } }
  });

  // Bar
  const ctxBar = barChart.value.getContext("2d");
  barChartInstance = new Chart(ctxBar, {
    type: "bar",
    data: {
      labels: Object.keys(serviceCounts.value),
      datasets: [
        {
          data: Object.values(serviceCounts.value),
          backgroundColor: "#22c55e",
          borderRadius: 6,
          barThickness: 24,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { display: false }, y: { beginAtZero: true, ticks: { color: "#6b7280" }, grid: { color: "#e5e7eb" } } },
    },
  });
};

onMounted(async () => {
  await fetchDashboardData();
  await nextTick();
  loading.value = false;
  drawCharts();
});
</script>
