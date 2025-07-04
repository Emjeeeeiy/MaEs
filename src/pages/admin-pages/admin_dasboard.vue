<!-- Admin Dashboard – FULL FILE (updated to use approvedAt for daily revenue) -->
<template>
  <div class="flex min-h-screen bg-[#1a1a1a] text-gray-100 overflow-hidden">
    <!-- Sidebar -->
    <admin_sidebar />

    <!-- Main -->
    <div class="flex-1 flex flex-col h-screen">
      <!-- Top‑bar -->
      <AdminTopbar />

      <!-- Content -->
      <main class="flex-1 p-6 space-y-8 overflow-y-auto">
        <!-- Summary cards -->
        <section
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <div
            v-for="(card, i) in dashboardCards"
            :key="i"
            class="bg-[#222] shadow-lg rounded-xl p-5 flex items-center space-x-4 hover:shadow-green-500/30 transition"
          >
            <component :is="card.icon" class="w-8 h-8 text-green-400" />
            <div>
              <p class="text-sm text-gray-400 font-medium">{{ card.title }}</p>
              <p class="text-lg font-bold text-white">{{ card.value }}</p>
            </div>
          </div>
        </section>

        <!-- Charts -->
        <section class="space-y-6">
          <!-- Line chart -->
          <div class="bg-[#222] p-6 rounded-xl shadow-md">
            <h2 class="text-lg font-semibold mb-4 text-gray-200">
              Revenue Trend (Daily)
            </h2>
            <div class="h-72">
              <canvas ref="lineChart" class="w-full h-full"></canvas>
            </div>
          </div>

          <!-- Bar chart -->
          <div class="bg-[#222] p-6 rounded-xl shadow-md">
            <h2 class="text-lg font-semibold mb-4 text-gray-200">
              Service Trend
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
import { ref, onMounted, nextTick } from 'vue'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import Chart from 'chart.js/auto'
import admin_sidebar from '@/components/admin_sidebar.vue'
import AdminTopbar from '@/components/AdminTopbar.vue'
import {
  ChartBarIcon,
  UsersIcon,
  CreditCardIcon,
  UserGroupIcon
} from '@heroicons/vue/24/solid'

/* ------------------------------------------------------------------ */
/*  Firestore + reactive state                                        */
/* ------------------------------------------------------------------ */
const db = getFirestore()
const lineChart = ref(null)
const barChart  = ref(null)

const dashboardCards = ref([])
const revenueByDay   = ref({})   // key = YYYY‑MM‑DD, value = sum ₱
const serviceCounts  = ref({})   // key = serviceName, value = count

let lineChartInstance = null
let barChartInstance  = null

/* ------------------------------------------------------------------ */
/*  Fetch dashboard metrics                                           */
/* ------------------------------------------------------------------ */
const fetchDashboardData = async () => {
  let totalRevenue        = 0   // Paid invoices
  let unpaidClaims        = 0
  let totalPatients       = 0
  let dischargedPatients  = 0

  revenueByDay.value = {}
  serviceCounts.value = {}

  try {
    /* --------- Invoices ------------------------------------------ */
    const invSnap = await getDocs(collection(db, 'invoices'))

    invSnap.forEach((dSnap) => {
      const d       = dSnap.data()
      const status  = String(d.status || '').toLowerCase()
      const amount  = Number(d.totalAmount || 0)

      /* --- daily revenue by APPROVED DATE (approvedAt) ------------ */
      if (status === 'paid' && d.approvedAt?.seconds) {
        const day = new Date(d.approvedAt.seconds * 1000).toLocaleDateString(
          'en-CA'
        ) // YYYY‑MM‑DD
        revenueByDay.value[day] =
          (revenueByDay.value[day] || 0) + amount
        totalRevenue += amount
      }

      /* unpaid / pending / etc. */
      if (['pending', 'not paid', 'unpaid', 'overdue'].includes(status))
        unpaidClaims++

      /* service frequency (all statuses) */
      ;(d.services || []).forEach((s) => {
        const name = s.serviceName || 'Unknown'
        serviceCounts.value[name] = (serviceCounts.value[name] || 0) + 1
      })
    })

    /* --------- Users --------------------------------------------- */
    const userSnap = await getDocs(collection(db, 'users'))
    userSnap.forEach((uSnap) => {
      const u = uSnap.data()
      if ((u.role || '').toLowerCase() === 'user') {
        totalPatients++
        if ((u.status || '').toLowerCase() === 'discharged')
          dischargedPatients++
      }
    })

    /* --------- Summary cards ------------------------------------- */
    dashboardCards.value = [
      {
        title: 'Total Revenue',
        value: `₱${totalRevenue.toLocaleString()}`,
        icon: ChartBarIcon
      },
      {
        title: 'Unpaid Claims',
        value: unpaidClaims,
        icon: CreditCardIcon
      },
      {
        title: 'Total Patients',
        value: totalPatients,
        icon: UsersIcon
      },
      {
        title: 'Discharged Patients',
        value: dischargedPatients,
        icon: UserGroupIcon
      }
    ]
  } catch (err) {
    console.error('Dashboard data error:', err)
  }
}

/* ------------------------------------------------------------------ */
/*  Draw / refresh charts                                             */
/* ------------------------------------------------------------------ */
const drawCharts = () => {
  if (!lineChart.value || !barChart.value) return

  /* destroy old chart instances */
  lineChartInstance && lineChartInstance.destroy()
  barChartInstance  && barChartInstance.destroy()

  /* --------- Line Chart (Daily Revenue by approvedAt) ------------- */
  const dates = Object.keys(revenueByDay.value).sort(
    (a, b) => new Date(a) - new Date(b)
  )
  const revenues = dates.map((d) => revenueByDay.value[d])

  const ctxLine = lineChart.value.getContext('2d')
  const grad    = ctxLine.createLinearGradient(0, 0, 0, 300)
  grad.addColorStop(0, 'rgba(34,197,94,0.4)')
  grad.addColorStop(1, 'rgba(34,197,94,0)')

  lineChartInstance = new Chart(ctxLine, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          data: revenues,
          fill: true,
          backgroundColor: grad,
          borderColor: '#22c55e',
          tension: 0.4,
          borderWidth: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
        y: {
          ticks: { color: '#9ca3af', callback: (v) => `₱${v.toLocaleString()}` },
          grid: { color: '#374151' }
        }
      }
    }
  })

  /* --------- Bar Chart (Service Frequency) ----------------------- */
  const ctxBar = barChart.value.getContext('2d')
  barChartInstance = new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels: Object.keys(serviceCounts.value),
      datasets: [
        {
          data: Object.values(serviceCounts.value),
          backgroundColor: '#22c55e',
          borderRadius: 6,
          barThickness: 24
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false },
        y: {
          beginAtZero: true,
          ticks: { color: '#9ca3af' },
          grid: { color: '#374151' }
        }
      }
    }
  })
}

/* ------------------------------------------------------------------ */
onMounted(async () => {
  await fetchDashboardData()
  await nextTick()
  drawCharts()
})
</script>
