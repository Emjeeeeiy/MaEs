<!-- src/pages/admin/AdminDashboard.vue -->
<template>
  <!-- Dark, animated gradient backdrop -->
  <div class="flex min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-black text-gray-100 overflow-hidden">
    <admin_sidebar />

    <div class="flex-1 flex flex-col h-screen">
      <AdminTopbar />

      <main class="flex-1 p-6 sm:p-8 space-y-10 overflow-y-auto">
        <!-- ===== Summary cards ===== -->
        <section
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
        >
          <div
            v-for="(card, i) in dashboardCards"
            :key="i"
            class="group relative overflow-hidden rounded-2xl border border-gray-700/40 bg-[#1f1f1f]/70 backdrop-blur-md shadow-lg shadow-black/40 transition-all duration-300 hover:shadow-green-500/40 hover:border-green-500/60 hover:-translate-y-1"
          >
            <!-- Glow ring (subtle) -->
            <div
              class="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-40"
              style="box-shadow: 0 0 40px 8px rgba(34,197,94,0.25)"
            ></div>

            <!-- Card content -->
            <div class="relative z-10 flex items-center gap-4 p-5">
              <component :is="card.icon" class="w-9 h-9 text-green-400" />
              <div>
                <p class="text-sm font-medium text-gray-400 tracking-wide">
                  {{ card.title }}
                </p>
                <p class="text-xl font-extrabold text-white">
                  {{ card.value }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- ===== Export Button ===== -->
        <div class="flex justify-end">
          <button
            @click="exportToExcel"
            class="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-600/30 ring-1 ring-green-400/40 transition-transform duration-200 hover:bg-green-700 hover:shadow-green-600/50 focus:outline-none focus:ring-2 focus:ring-green-500 active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 5v14m7-7H5"
              />
            </svg>
            Export Metrics to Excel
          </button>
        </div>

        <!-- ===== Revenue Trend ===== -->
        <section class="space-y-10">
          <div
            class="rounded-2xl border border-gray-700/40 bg-[#1f1f1f]/70 backdrop-blur-md p-6 shadow-lg shadow-black/40 transition-shadow hover:shadow-green-500/40"
          >
            <div class="mb-4 flex flex-wrap items-center justify-between gap-4">
              <h2 class="text-lg font-semibold text-gray-200">
                Revenue Trend (Daily)
              </h2>

              <select
                v-model="selectedWeek"
                @change="drawCharts"
                class="rounded-md border border-gray-600 bg-[#141414] px-3 py-1.5 text-sm text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
              >
                <option
                  v-for="(label, index) in weekLabels"
                  :key="index"
                  :value="index"
                >
                  {{ label }}
                </option>
              </select>
            </div>

            <!-- Chart canvas -->
            <div class="h-72">
              <canvas ref="lineChart" class="h-full w-full" />
            </div>
          </div>

          <!-- ===== Service Trend Charts ===== -->
          <div
            v-for="(_, index) in serviceChartRefs"
            :key="index"
            class="rounded-2xl border border-gray-700/40 bg-[#1f1f1f]/70 backdrop-blur-md p-6 shadow-lg shadow-black/40 transition-shadow hover:shadow-green-500/40"
          >
            <h2 class="mb-4 text-lg font-semibold text-gray-200">
              Service Trend (Batch {{ index + 1 }})
            </h2>
            <div class="h-72">
              <canvas
                :ref="(el) => (serviceChartRefs[index] = el)"
                class="h-full w-full"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
/* -------------- Imports -------------- */
import { ref, onMounted, nextTick, computed } from 'vue'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import Chart from 'chart.js/auto'
import * as XLSX from 'xlsx'

import admin_sidebar from '@/components/admin_sidebar.vue'
import AdminTopbar from '@/components/AdminTopbar.vue'
import {
  ChartBarIcon,
  UsersIcon,
  CreditCardIcon,
  UserGroupIcon,
  CurrencyDollarIcon
} from '@heroicons/vue/24/solid'

/* -------------- Firestore refs -------------- */
const db = getFirestore()

/* -------------- Reactive refs -------------- */
const lineChart = ref(null)
const serviceChartRefs = ref([])

const dashboardCards = ref([])
const revenueByDay = ref({})
const serviceCounts = ref({})
const selectedWeek = ref(0)

/* -------------- Chart instances -------------- */
let lineChartInstance = null
let serviceChartInstances = []

/* -------------- Helpers -------------- */
const chunkServiceCounts = (obj, size = 64) => {
  const entries = Object.entries(obj)
  const chunks = []
  for (let i = 0; i < entries.length; i += size) {
    chunks.push(Object.fromEntries(entries.slice(i, i + size)))
  }
  return chunks
}

const getWeeksOfMonth = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const weeks = []

  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 7)) {
    const start = new Date(d)
    const end = new Date(d)
    end.setDate(end.getDate() + 6)
    if (end > lastDay) end.setDate(lastDay.getDate())
    weeks.push({ start, end })
  }
  return weeks
}

const weekLabels = computed(() =>
  getWeeksOfMonth().map((w, i) => {
    const s = w.start.toLocaleDateString('en-CA')
    const e = w.end.toLocaleDateString('en-CA')
    return `Week ${i + 1}: ${s} to ${e}`
  })
)

/* -------------- Fetch & compute dashboard metrics -------------- */
async function fetchDashboardData() {
  let totalRevenue = 0
  let unpaidClaims = 0
  let totalPatients = 0
  let dischargedPatients = 0
  let totalUnpaidAmount = 0

  revenueByDay.value = {}
  serviceCounts.value = {}

  try {
    const invSnap = await getDocs(collection(db, 'invoices'))
    invSnap.forEach((doc) => {
      const d = doc.data()
      const status = (d.status || '').toLowerCase()
      const amount = Number(d.totalAmount || 0)

      if (status === 'paid' && d.approvedAt?.seconds) {
        const day = new Date(d.approvedAt.seconds * 1000).toLocaleDateString(
          'en-CA'
        )
        revenueByDay.value[day] = (revenueByDay.value[day] || 0) + amount
        totalRevenue += amount
      }

      if (['pending', 'not paid', 'unpaid', 'overdue'].includes(status))
        unpaidClaims++
      if (status === 'not paid') totalUnpaidAmount += amount

      for (const s of d.services || []) {
        const name = s.serviceName || 'Unknown'
        serviceCounts.value[name] = (serviceCounts.value[name] || 0) + 1
      }
    })

    const userSnap = await getDocs(collection(db, 'users'))
    userSnap.forEach((doc) => {
      const u = doc.data()
      if ((u.role || '').toLowerCase() === 'user') {
        totalPatients++
        if ((u.status || '').toLowerCase() === 'discharged')
          dischargedPatients++
      }
    })

    dashboardCards.value = [
      {
        title: 'Total Revenue',
        value: `₱${totalRevenue.toLocaleString()}`,
        icon: ChartBarIcon
      },
      { title: 'Unpaid Claims', value: unpaidClaims, icon: CreditCardIcon },
      { title: 'Total Patients', value: totalPatients, icon: UsersIcon },
      {
        title: 'Discharged Patients',
        value: dischargedPatients,
        icon: UserGroupIcon
      },
      {
        title: 'Total Unpaid Amount',
        value: `₱${totalUnpaidAmount.toLocaleString()}`,
        icon: CurrencyDollarIcon
      }
    ]
  } catch (err) {
    console.error('Dashboard data error:', err)
  }
}

/* -------------- Chart rendering -------------- */
function drawCharts() {
  /* ---- Revenue line chart ---- */
  if (lineChartInstance) lineChartInstance.destroy()

  const ctx = lineChart.value.getContext('2d')
  const { start, end } = getWeeksOfMonth()[selectedWeek.value] || {}

  const labels = Object.keys(revenueByDay.value)
    .filter((d) => {
      const dt = new Date(d)
      return start <= dt && dt <= end
    })
    .sort((a, b) => new Date(a) - new Date(b))
  const values = labels.map((d) => revenueByDay.value[d])

  const gradient = ctx.createLinearGradient(0, 0, 0, 300)
  gradient.addColorStop(0, 'rgba(34,197,94,0.4)')
  gradient.addColorStop(1, 'rgba(34,197,94,0)')

  lineChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          data: values,
          fill: true,
          backgroundColor: gradient,
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
          ticks: {
            color: '#9ca3af',
            callback: (v) => `₱${v.toLocaleString()}`
          },
          grid: { color: '#374151' }
        }
      }
    }
  })

  /* ---- Service trend chunked line charts ---- */
  serviceChartInstances.forEach((c) => c?.destroy())
  serviceChartInstances = []

  const chunks = chunkServiceCounts(serviceCounts.value, 64)
  serviceChartRefs.value = new Array(chunks.length)

  chunks.forEach((chunk, index) => {
    nextTick(() => {
      const ref = serviceChartRefs.value[index]
      if (!ref) return

      const ctx = ref.getContext('2d')
      const labels = Object.keys(chunk)
      const values = Object.values(chunk)

      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              data: values,
              label: 'Requests',
              borderColor: '#22c55e',
              backgroundColor: 'rgba(34,197,94,0.2)',
              borderWidth: 2,
              tension: 0.3,
              fill: true,
              pointRadius: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.parsed.y} requests`
              }
            }
          },
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
      serviceChartInstances.push(chart)
    })
  })
}

/* -------------- Export to Excel -------------- */
function exportToExcel() {
  const data = dashboardCards.value.map((c) => ({
    Metric: c.title,
    Value: c.value
  }))
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dashboard Metrics')
  XLSX.writeFile(workbook, 'MaEsPayTrack_Admin_Dashboard.xlsx')
}

/* -------------- Lifecycle -------------- */
onMounted(async () => {
  await fetchDashboardData()
  await nextTick()
  drawCharts()
})
</script>

<style scoped>
/* Optional: subtle scrolling momentum for WebKit */
main::-webkit-scrollbar {
  width: 6px;
}
main::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 3px;
}
</style>
