<template>
    <div class="flex min-h-screen bg-gray-100">
      <!-- Sidebar -->
      <admin_sidebar />
  
      <!-- Main Content -->
      <main class="flex-1 p-8">
        <h1 class="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>
  
        <!-- Dashboard Cards -->
        <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
          <div
            v-for="(card, index) in dashboardCards"
            :key="index"
            class="bg-white border border-gray-200 rounded-2xl p-5 shadow hover:shadow-lg transition"
          >
            <div class="flex items-center space-x-4">
              <div
                class="p-3 rounded-full text-white"
                :class="card.color"
              >
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
            <h3 class="text-lg font-semibold mb-4 text-gray-700">Revenue Trend</h3>
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
      </main>
    </div>
  </template>
  
  <script>
  import { getAuth, signOut } from "firebase/auth";
  import { useRouter } from "vue-router";
  import { ref, onMounted, nextTick } from "vue";
  import Chart from "chart.js/auto";
  import admin_sidebar from "@/components/admin_sidebar.vue";
  
  // Icon imports from heroicons/vue (optional – you can swap for any icon lib you use)
  import { ChartBarIcon, UsersIcon, CreditCardIcon, UserGroupIcon } from "@heroicons/vue/24/solid";
  
  export default {
    name: "AdminDashboard",
    components: { admin_sidebar },
    setup() {
      const router = useRouter();
      const auth = getAuth();
      const lineChart = ref(null);
      const pieChart = ref(null);
  
      const dashboardCards = ref([
        {
          title: "Total Revenue",
          value: "₱2,500,000",
          icon: ChartBarIcon,
          color: "bg-yellow-400",
        },
        {
          title: "Pending Claims",
          value: "45",
          icon: CreditCardIcon,
          color: "bg-red-400",
        },
        {
          title: "Outstanding Payments",
          value: "₱450,000",
          icon: CreditCardIcon,
          color: "bg-purple-500",
        },
        {
          title: "Total Patients",
          value: "3,200",
          icon: UsersIcon,
          color: "bg-blue-500",
        },
        {
          title: "Discharged Patients",
          value: "2,000",
          icon: UserGroupIcon,
          color: "bg-green-500",
        },
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
          },
        });
  
        new Chart(pieChart.value, {
          type: "pie",
          data: {
            labels: ["Emergency", "Surgery", "Consultation", "Pharmacy"],
            datasets: [
              {
                data: [40, 25, 20, 15],
                backgroundColor: ["#facc15", "#4ade80", "#3b82f6", "#fb923c"],
              },
            ],
          },
          options: {
            maintainAspectRatio: false,
            responsive: true,
          },
        });
      };
  
      return { logout, dashboardCards, lineChart, pieChart };
    },
  };
  </script>
  