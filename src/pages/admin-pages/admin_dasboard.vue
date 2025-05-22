<template>
  <div class="flex min-h-screen bg-gray-100">
    <admin_sidebar />

    <main class="flex-1 p-8">
      <h1 class="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>

      <loading_animation v-if="loading" />
      <div v-else>
        <!-- Dashboard Cards -->
        <section class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-10">
          <div
            v-for="(card, index) in dashboardCards"
            :key="index"
            class="bg-white border border-black rounded-2xl p-4 shadow hover:shadow-lg transition"
          >
            <div class="flex items-center space-x-4">
              <div class="p-3 rounded-full text-white" :class="card.color">
                <component :is="card.icon" class="w-6 h-6" />
              </div>
              <div>
                <p class="text-sm text-gray-500">{{ card.title }}</p>
                <p class="text-xl font-semibold text-gray-800">{{ card.value }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Charts -->
        <section class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="bg-white rounded-2xl p-6 shadow border border-gray-200">
            <h3 class="text-lg font-semibold mb-4 text-gray-700">Revenue Trend (Daily)</h3>
            <div class="h-64">
              <canvas ref="lineChart" class="w-full h-full"></canvas>
            </div>
          </div>
          <div class="bg-white rounded-2xl p-6 shadow border border-gray-200">
            <h3 class="text-lg font-semibold mb-4 text-gray-700">Department Revenue</h3>
            <div class="h-64">
              <canvas ref="pieChart" class="w-full h-full"></canvas>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { getAuth, signOut } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import Chart from "chart.js/auto";

import admin_sidebar from "@/components/admin_sidebar.vue";
import loading_animation from "@/components/loading_animation.vue";

// Heroicons
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

const logout = async () => {
  try {
    await signOut(auth);
    window.location.href = "/login";
  } catch (error) {
    console.error("Error during logout:", error);
  }
};

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
      const createdAt = data.createdAt?.seconds
        ? new Date(data.createdAt.seconds * 1000)
        : null;

      if (status === "paid") {
        totalRevenue += amount;

        // Group by day: "May 22, 2025"
        if (createdAt) {
          const day = createdAt.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          });
          if (!revenueByDay.value[day]) {
            revenueByDay.value[day] = 0;
          }
          revenueByDay.value[day] += amount;
        }
      } else if (status === "pending" || status === "not paid") {
        unpaidClaims++;
        outstandingPayments += amount;
      } else if (status === "unpaid" || status === "overdue") {
        outstandingPayments += amount;
      }

      // Service Count for Pie Chart
      if (Array.isArray(data.services)) {
        data.services.forEach((service) => {
          const name = service.serviceName || "Unknown";
          if (!serviceCounts.value[name]) {
            serviceCounts.value[name] = 0;
          }
          serviceCounts.value[name]++;
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
        if (status === "discharged") {
          dischargedPatients++;
        }
      }
    });

    dashboardCards.value = [
      {
        title: "Total Revenue",
        value: `₱${totalRevenue.toLocaleString()}`,
        icon: ChartBarIcon,
        color: "bg-yellow-400",
      },
      {
        title: "Unpaid Claims",
        value: unpaidClaims,
        icon: CreditCardIcon,
        color: "bg-red-400",
      },
      {
        title: "Outstanding Payments",
        value: `₱${outstandingPayments.toLocaleString()}`,
        icon: CreditCardIcon,
        color: "bg-purple-500",
      },
      {
        title: "Total Patients",
        value: totalPatients,
        icon: UsersIcon,
        color: "bg-blue-500",
      },
      {
        title: "Discharged Patients",
        value: dischargedPatients,
        icon: UserGroupIcon,
        color: "bg-green-500",
      },
    ];
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  }
};

const drawCharts = () => {
  if (!lineChart.value || !pieChart.value) return;

  // Line Chart - Revenue by Day
  const days = Object.keys(revenueByDay.value).sort(
    (a, b) => new Date(a) - new Date(b)
  );
  const revenues = days.map((day) => revenueByDay.value[day]);

  new Chart(lineChart.value, {
    type: "line",
    data: {
      labels: days,
      datasets: [
        {
          label: "Daily Revenue",
          data: revenues,
          borderColor: "#facc15",
          backgroundColor: "rgba(250, 204, 21, 0.2)",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        x: {
          ticks: {
            autoSkip: true,
            maxTicksLimit: 10,
          },
        },
      },
    },
  });

  // Pie Chart - Services Used
  const serviceNames = Object.keys(serviceCounts.value);
  const serviceValues = serviceNames.map((key) => serviceCounts.value[key]);
  const colors = [
    "#facc15", "#4ade80", "#3b82f6", "#fb923c", "#a78bfa", "#f472b6", "#f87171",
  ];

  new Chart(pieChart.value, {
    type: "pie",
    data: {
      labels: serviceNames,
      datasets: [
        {
          data: serviceValues,
          backgroundColor: colors.slice(0, serviceNames.length),
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
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
