<template>
  <div class="flex min-h-screen bg-gray-100 text-gray-800 overflow-hidden">
    <!-- Sidebar -->
    <admin_sidebar />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col h-screen">
      <!-- Header -->
      <header class="bg-white shadow p-6 flex justify-between items-center">
        <h1 class="text-3xl font-bold text-green-700">Admin</h1>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-6 space-y-8 overflow-y-auto">
        <!-- Dashboard Cards -->
        <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
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

        <!-- Combined Charts Section -->
        <section class="space-y-6">
          <!-- Line Chart -->
          <div class="bg-white p-6 rounded-2xl shadow-md">
            <h2 class="text-lg font-semibold mb-4 text-gray-700">Revenue Trend (Daily)</h2>
            <div class="h-72">
              <canvas ref="lineChart" class="w-full h-full"></canvas>
            </div>
          </div>

          <!-- Pie Chart -->
          <div class="bg-white p-6 rounded-2xl shadow-md">
            <h2 class="text-lg font-semibold mb-4 text-gray-700">Department Revenue</h2>
            <div class="relative h-72">
              <canvas ref="pieChart" class="w-full h-full" />
              <div class="absolute inset-0 flex items-center justify-center pointer-events-none"></div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import Chart from "chart.js/auto";

import admin_sidebar from "@/components/admin_sidebar.vue";
import {
  ChartBarIcon,
  UsersIcon,
  CreditCardIcon,
  UserGroupIcon,
} from "@heroicons/vue/24/solid";

const auth = getAuth();
const db = getFirestore();

const lineChart = ref(null);
const pieChart = ref(null);
const dashboardCards = ref([]);
const loading = ref(true);

const revenueByDay = ref({});
const serviceCounts = ref({});

let lineChartInstance = null;
let pieChartInstance = null;

const fetchDashboardData = async () => {
  let totalRevenue = 0;
  let unpaidClaims = 0;
  let outstandingPayments = 0;
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
        const date = new Date(timestamp * 1000);
        const day = date.toLocaleDateString("en-CA");
        if (!revenueByDay.value[day]) revenueByDay.value[day] = 0;
        revenueByDay.value[day] += amount;
      }

      if (status === "paid") {
        totalRevenue += amount;
      } else if (["pending", "not paid", "unpaid", "overdue"].includes(status)) {
        unpaidClaims++;
        outstandingPayments += amount;
      }

      if (Array.isArray(data.services)) {
        data.services.forEach((service) => {
          const name = service.serviceName || "Unknown";
          serviceCounts.value[name] = (serviceCounts.value[name] || 0) + 1;
        });
      }
    });

    const usersSnap = await getDocs(collection(db, "users"));
    usersSnap.forEach((doc) => {
      const data = doc.data();
      const role = (data.role || "").toLowerCase();
      const status = (data.status || "").toLowerCase();

      if (role === "user") {
        totalPatients++;
        if (status === "discharged") dischargedPatients++;
      }
    });

    dashboardCards.value = [
      {
        title: "Total Revenue",
        value: `₱${totalRevenue.toLocaleString()}`,
        icon: ChartBarIcon,
      },
      {
        title: "Unpaid Claims",
        value: unpaidClaims,
        icon: CreditCardIcon,
      },
      {
        title: "Outstanding Payments",
        value: `₱${outstandingPayments.toLocaleString()}`,
        icon: CreditCardIcon,
      },
      {
        title: "Total Patients",
        value: totalPatients,
        icon: UsersIcon,
      },
      {
        title: "Discharged Patients",
        value: dischargedPatients,
        icon: UserGroupIcon,
      },
    ];
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  }
};

const drawCharts = () => {
  if (!lineChart.value || !pieChart.value) return;

  if (lineChartInstance) lineChartInstance.destroy();
  if (pieChartInstance) pieChartInstance.destroy();

  const sortedDates = Object.keys(revenueByDay.value).sort(
    (a, b) => new Date(a) - new Date(b)
  );
  const revenues = sortedDates.map((day) => revenueByDay.value[day]);

  const ctx = lineChart.value.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, "rgba(34, 197, 94, 0.4)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  lineChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: sortedDates,
      datasets: [
        {
          label: "Daily Revenue",
          data: revenues,
          fill: true,
          backgroundColor: gradient,
          borderColor: "#22c55e",
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: "#22c55e",
          pointBorderColor: "#fff",
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1000,
        easing: "easeOutQuart",
      },
      scales: {
        x: {
          ticks: { color: "#6b7280", font: { weight: "500" } },
          grid: { color: "#e5e7eb" },
        },
        y: {
          ticks: {
            color: "#6b7280",
            callback: (val) => `₱${val.toLocaleString()}`,
          },
          grid: { color: "#e5e7eb" },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => ` ₱${ctx.raw.toLocaleString()}`,
          },
          backgroundColor: "#1f2937",
          titleColor: "#facc15",
          bodyColor: "#f9fafb",
          padding: 10,
        },
        legend: {
          display: false,
        },
      },
    },
  });

  const serviceNames = Object.keys(serviceCounts.value);
  const serviceValues = serviceNames.map((name) => serviceCounts.value[name]);

  pieChartInstance = new Chart(pieChart.value, {
    type: "pie",
    data: {
      labels: serviceNames,
      datasets: [
        {
          data: serviceValues,
          borderColor: "#ffffff",
          borderWidth: 3,
          backgroundColor: [
            "#4ade80", "#3b82f6", "#fb923c", "#a78bfa", "#f472b6",
            "#facc15", "#f87171", "#14b8a6", "#8b5cf6", "#f59e0b", "#10b981"
          ],
          hoverOffset: 16,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        animateScale: true,
        animateRotate: true,
        easing: "easeOutBounce",
        duration: 1000,
      },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#374151",
            font: { size: 14, weight: "500" },
            padding: 20,
            boxWidth: 18,
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const label = ctx.label || "";
              const value = ctx.raw || 0;
              return ` ${label}: ₱${value.toLocaleString()}`;
            },
          },
          backgroundColor: "#111827",
          titleColor: "#facc15",
          bodyColor: "#f9fafb",
          borderColor: "#facc15",
          borderWidth: 1,
          padding: 10,
        },
      },
    },
  });
};

onMounted(async () => {
  await fetchDashboardData();
  await nextTick();
  loading.value = false;
  await nextTick();
  drawCharts();
});
</script>
