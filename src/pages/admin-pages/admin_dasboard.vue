<template>
  <div class="flex flex-col min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-black text-gray-100 overflow-hidden">
    <!-- Fixed Full Width Topbar -->
    <div class="fixed top-0 left-0 right-0 z-30">
      <AdminTopbar />
    </div>

    <div class="flex pt-16 h-full">
      <!-- Sidebar (fixed width, full height below topbar) -->
      <div class="w-64 flex-shrink-0 border-r border-gray-800 bg-[#1a1a1a] h-[calc(100vh-4rem)] overflow-y-auto">
        <admin_sidebar />
      </div>

      <!-- Main Content Area -->
      <main class="flex-1 p-6 sm:p-8 space-y-10 overflow-y-auto h-[calc(100vh-4rem)]">
        <!-- Summary Cards -->
        <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="(card, i) in dashboardCards"
            :key="i"
            class="group relative overflow-hidden rounded-2xl border border-gray-700/40 bg-[#1f1f1f]/70 backdrop-blur-md shadow-lg shadow-black/40 transition-all duration-300 hover:shadow-green-500/40 hover:border-green-500/60 hover:-translate-y-1"
          >
            <div
              class="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-40"
              style="box-shadow: 0 0 40px 8px rgba(34,197,94,0.25)"
            ></div>

            <div class="relative z-10 flex items-center gap-4 p-6">
              <component :is="card.icon" class="w-10 h-10 text-green-400" />
              <div>
                <p class="text-sm font-medium text-gray-400 tracking-wide">{{ card.title }}</p>
                <p class="text-2xl font-extrabold text-white">{{ card.value }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Export Button -->
        <div class="flex justify-end">
          <button
            @click="exportToExcel"
            class="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-600/30 ring-1 ring-green-400/40 transition-transform duration-200 hover:bg-green-700 hover:shadow-green-600/50 focus:outline-none focus:ring-2 focus:ring-green-500 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14m7-7H5" />
            </svg>
            Export Metrics to Excel
          </button>
        </div>

        <!-- Charts Section -->
        <section class="space-y-10">
          <!-- Revenue Trend -->
          <div class="rounded-2xl border border-gray-700/40 bg-[#1f1f1f]/70 backdrop-blur-md p-6 shadow-lg shadow-black/40 hover:shadow-green-500/40 transition-shadow">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-200">Revenue Trend (Daily)</h2>
              <select
                v-model="selectedWeek"
                class="bg-gray-800 text-gray-100 border border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:ring focus:border-green-500"
              >
                <option value="">All Weeks</option>
                <option v-for="week in availableWeeks" :key="week.label" :value="week.label">
                  {{ week.label }}
                </option>
              </select>
            </div>
            <div class="h-72">
              <canvas ref="revenueChartRef" class="h-full w-full" />
            </div>
          </div>

          <!-- Service Trends -->
          <div
            v-for="(_, index) in serviceChartRefs"
            :key="index"
            class="rounded-2xl border border-gray-700/40 bg-[#1f1f1f]/70 backdrop-blur-md p-6 shadow-lg shadow-black/40 transition-shadow hover:shadow-green-500/40"
          >
            <h2 class="mb-4 text-lg font-semibold text-gray-200">Service Trend (Batch {{ index + 1 }})</h2>
            <div class="h-72">
              <canvas :ref="(el) => (serviceChartRefs[index] = el)" class="h-full w-full" />
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import Chart from 'chart.js/auto'
import * as XLSX from 'xlsx'

import admin_sidebar from '@/components/admin_sidebar.vue'
import AdminTopbar from '@/components/AdminTopbar.vue'
import {
  ChartBarIcon,
  UsersIcon,
  CreditCardIcon,
  CurrencyDollarIcon
} from '@heroicons/vue/24/solid'

const db = getFirestore()

const serviceChartRefs = ref([])
const revenueChartRef = ref(null)

const dashboardCards = ref([])
const serviceCounts = ref({})
const revenueTrend = ref({})

const selectedWeek = ref('')
const availableWeeks = ref([])

let serviceChartInstances = []
let revenueChartInstance = null

const chunkServiceCounts = (obj, size = 64) => {
  const entries = Object.entries(obj)
  const chunks = []
  for (let i = 0; i < entries.length; i += size) {
    chunks.push(Object.fromEntries(entries.slice(i, i + size)))
  }
  return chunks
}

function getWeekRange(dateStr) {
  const d = new Date(dateStr)
  const day = d.getDay() || 7
  const start = new Date(d)
  start.setDate(d.getDate() - day + 1)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return {
    label: `${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`,
    from: start.toISOString().split('T')[0],
    to: end.toISOString().split('T')[0]
  }
}

function prepareWeeks() {
  const dates = Object.keys(revenueTrend.value).sort()
  const seen = new Set()
  const weeks = []

  for (const dateStr of dates) {
    const { label } = getWeekRange(dateStr)
    if (!seen.has(label)) {
      seen.add(label)
      weeks.push({ label, ...getWeekRange(dateStr) })
    }
  }

  availableWeeks.value = weeks
  selectedWeek.value = weeks.at(-1)?.label || ''
}

function getFilteredRevenueData() {
  if (!selectedWeek.value) return revenueTrend.value

  const week = availableWeeks.value.find((w) => w.label === selectedWeek.value)
  if (!week) return revenueTrend.value

  const filtered = {}
  for (const [date, value] of Object.entries(revenueTrend.value)) {
    if (date >= week.from && date <= week.to) {
      filtered[date] = value
    }
  }
  return filtered
}

async function fetchDashboardData() {
  let totalRevenue = 0
  let unpaidClaims = 0
  let totalPatients = 0
  let totalUnpaidAmount = 0
  serviceCounts.value = {}
  revenueTrend.value = {}

  try {
    const invSnap = await getDocs(collection(db, 'invoices'))
    invSnap.forEach((doc) => {
      const d = doc.data()
      const status = (d.status || '').toLowerCase()
      const amount = Number(d.totalAmount || 0)

      if (status === 'paid') {
        totalRevenue += amount

        // ✅ Use approvedAt or fallback to submittedAt
        const ts = d.approvedAt?.seconds || d.submittedAt?.seconds
        if (ts) {
          const dateStr = new Date(ts * 1000).toISOString().split('T')[0]
          revenueTrend.value[dateStr] = (revenueTrend.value[dateStr] || 0) + amount
        }
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
      if ((u.role || '').toLowerCase() === 'user') totalPatients++
    })

    dashboardCards.value = [
      { title: 'Total Revenue', value: `₱${totalRevenue.toLocaleString()}`, icon: ChartBarIcon },
      { title: 'Unpaid Claims', value: unpaidClaims, icon: CreditCardIcon },
      { title: 'Total Patients', value: totalPatients, icon: UsersIcon },
      { title: 'Total Unpaid Amount', value: `₱${totalUnpaidAmount.toLocaleString()}`, icon: CurrencyDollarIcon }
    ]
  } catch (err) {
    console.error('Dashboard data error:', err)
  }
}

function drawCharts() {
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
          datasets: [{
            data: values,
            label: 'Requests',
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34,197,94,0.2)',
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointRadius: 2
          }]
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

  nextTick(() => {
    if (revenueChartInstance) revenueChartInstance.destroy()
    if (!revenueChartRef.value) return

    const ctx = revenueChartRef.value.getContext('2d')
    const filtered = getFilteredRevenueData()
    const labels = Object.keys(filtered).sort()
    const values = labels.map((d) => filtered[d])

    revenueChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: values,
          label: 'Revenue',
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.15)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ₱${ctx.parsed.y.toLocaleString()}`
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#9ca3af' },
            grid: { color: '#374151' }
          },
          y: {
            beginAtZero: true,
            ticks: { color: '#9ca3af' },
            grid: { color: '#374151' }
          }
        }
      }
    })
  })
}

function exportToExcel() {
  const metricsData = dashboardCards.value.map((c) => ({
    Metric: c.title,
    Value: c.value
  }))

  const revenueData = Object.entries(getFilteredRevenueData())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({
      Date: date,
      Revenue: `₱${amount.toLocaleString()}`
    }))

  const metricsSheet = XLSX.utils.json_to_sheet(metricsData)
  const revenueSheet = XLSX.utils.json_to_sheet(revenueData)

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, metricsSheet, 'Dashboard Metrics')
  XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Daily Revenue Trend')

  XLSX.writeFile(workbook, 'MaEsPayTrack_Admin_Dashboard.xlsx')
}

onMounted(async () => {
  await fetchDashboardData()
  prepareWeeks()
  await nextTick()
  drawCharts()
})

watch(selectedWeek, () => {
  drawCharts()
})
</script>


<style scoped>
main::-webkit-scrollbar {
  width: 6px;
}
main::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 3px;
}
</style>