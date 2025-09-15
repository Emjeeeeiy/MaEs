<template>
  <div class="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800 overflow-x-hidden">
    <!-- ✅ Topbar -->
    <div class="fixed top-0 left-0 right-0 z-30 shadow bg-white/90 backdrop-blur-md border-b border-gray-200">
      <AdminTopbar />
    </div>

    <div class="flex pt-16">
      <!-- ✅ Sidebar -->
      <aside
        class="hidden md:block w-64 flex-shrink-0 border-r border-gray-200 bg-white/80 backdrop-blur-xl h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar shadow-lg"
      >
        <AdminSidebar />
      </aside>

      <!-- ✅ Main Content -->
      <main
        class="flex-1 p-6 lg:p-10 space-y-12 overflow-y-auto h-[calc(100vh-4rem)] custom-scrollbar"
      >
        <!-- Dashboard Summary Cards -->
        <section
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div
            v-for="(card, i) in dashboardCards"
            :key="i"
            class="bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div class="flex items-center gap-5">
              <div
                class="p-4 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 text-green-700 shadow-inner"
              >
                <component :is="card.icon" class="w-7 h-7" />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">
                  {{ card.title }}
                </p>
                <p class="text-2xl font-bold text-gray-900 tracking-tight">
                  {{ card.value }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Export Button -->
        <div class="flex justify-end">
          <button
            @click="exportToExcel"
            class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-medium shadow-lg hover:shadow-xl active:scale-95 transition-all duration-300"
          >
            📤 Export Metrics to Excel
          </button>
        </div>

        <!-- Charts Section -->
        <section class="space-y-12">
          <!-- Revenue Trend Chart -->
          <div
            class="border border-gray-200 rounded-2xl p-6 bg-white/90 backdrop-blur-md shadow-md hover:shadow-xl transition-all duration-300"
          >
            <div
              class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
            >
              <h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
                📈 Revenue Trend (Daily)
              </h2>
              <select
                v-model="selectedWeek"
                class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              >
                <option value="">All Weeks</option>
                <option
                  v-for="week in availableWeeks"
                  :key="week.label"
                  :value="week.label"
                >
                  {{ week.label }}
                </option>
              </select>
            </div>
            <div class="h-72 sm:h-80">
              <canvas ref="revenueChartRef" class="h-full w-full" />
            </div>
          </div>

          <!-- Service Trends -->
          <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
              📊 Service Trends
            </h2>
            <button
              @click="showServiceModal = true"
              class="px-5 py-2 rounded-xl text-sm bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg active:scale-95 transition"
            >
              View Totals
            </button>
          </div>

          <!-- Service Charts -->
          <div
            v-for="(_, index) in serviceChartRefs"
            :key="index"
            class="border border-gray-200 rounded-2xl p-6 bg-white/90 backdrop-blur-md shadow-md hover:shadow-xl transition-all duration-300"
          >
            <h3 class="text-base font-medium mb-4 text-gray-700 flex items-center gap-2">
              📌 Batch {{ index + 1 }}
            </h3>
            <div class="h-72 sm:h-80">
              <canvas
                :ref="(el) => (serviceChartRefs[index] = el)"
                class="h-full w-full"
              />
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- ✅ Service Totals Modal -->
    <transition name="fade">
      <div
        v-if="showServiceModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      >
        <div
          class="bg-white/95 w-full max-w-lg p-6 rounded-2xl border border-gray-200 shadow-2xl relative animate-fadeIn"
        >
          <h2 class="text-lg font-semibold mb-5 text-gray-800">
            📋 Service Totals
          </h2>
          <button
            @click="showServiceModal = false"
            class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-lg"
          >
            ✕
          </button>
          <div
            class="max-h-96 overflow-y-auto space-y-2 custom-scrollbar pr-1"
          >
            <div
              v-for="(count, service) in sortedServiceTotals"
              :key="service"
              class="flex justify-between items-center px-4 py-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition"
            >
              <span class="text-sm text-gray-600">{{ service }}</span>
              <span class="font-semibold text-gray-900">{{ count }}</span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import Chart from 'chart.js/auto'
import * as XLSX from 'xlsx'

import AdminSidebar from '@/components/admin_sidebar.vue'
import AdminTopbar from '@/components/AdminTopbar.vue'
import { ChartBarIcon, UsersIcon, CreditCardIcon, CurrencyDollarIcon } from '@heroicons/vue/24/solid'

const db = getFirestore()

/* Refs */
const serviceChartRefs = ref([])
const revenueChartRef = ref(null)

/* Data */
const dashboardCards = ref([])
const serviceCounts = ref({})
const revenueTrend = ref({})
const selectedWeek = ref('') // ✅ default is All Weeks
const availableWeeks = ref([])

/* Charts Instances */
let serviceChartInstances = []
let revenueChartInstance = null

/* Modal State */
const showServiceModal = ref(false)
const openServiceModal = () => { showServiceModal.value = true }

const sortedServiceTotals = computed(() => {
  return Object.fromEntries(
    Object.entries(serviceCounts.value).sort((a, b) => b[1] - a[1])
  )
})

/* Utils */
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
  const start = new Date(d); start.setDate(d.getDate() - day + 1)
  const end = new Date(start); end.setDate(start.getDate() + 6)
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
  selectedWeek.value = '' // ✅ force default to "All Weeks"
}

function getFilteredRevenueData() {
  if (!selectedWeek.value) return revenueTrend.value
  const week = availableWeeks.value.find((w) => w.label === selectedWeek.value)
  if (!week) return revenueTrend.value
  const filtered = {}
  for (const [date, value] of Object.entries(revenueTrend.value)) {
    if (date >= week.from && date <= week.to) filtered[date] = value
  }
  return filtered
}

/* Fetch Dashboard Data */
async function fetchDashboardData() {
  let totalRevenue = 0, unpaidClaims = 0, totalPatients = 0, totalUnpaidAmount = 0
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
        const ts = d.approvedAt?.seconds || d.submittedAt?.seconds
        if (ts) {
          const dateStr = new Date(ts * 1000).toISOString().split('T')[0]
          revenueTrend.value[dateStr] = (revenueTrend.value[dateStr] || 0) + amount
        }
      }

      if (['pending','not paid','unpaid','overdue'].includes(status)) unpaidClaims++
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

/* Draw Charts */
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
        data: { labels, datasets: [{ data: values, label: 'Requests', borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.2)', borderWidth: 2, tension: 0.3, fill: true, pointRadius: 2 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ` ${ctx.parsed.y} requests` } } }, scales: { x: { display: false }, y: { beginAtZero: true, ticks: { color: '#9ca3af' }, grid: { color: '#e5e7eb' } } } }
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
      data: { labels, datasets: [{ data: values, label: 'Revenue', borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.15)', borderWidth: 2, tension: 0.4, fill: true, pointRadius: 2 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ` ₱${ctx.parsed.y.toLocaleString()}` } } }, scales: { x: { ticks: { color: '#9ca3af' }, grid: { color: '#e5e7eb' } }, y: { beginAtZero: true, ticks: { color: '#9ca3af' }, grid: { color: '#e5e7eb' } } } }
    })
  })
}

/* Export Metrics */
function exportToExcel() {
  const metricsData = dashboardCards.value.map((c) => ({ Metric: c.title, Value: c.value }))
  const revenueData = Object.entries(getFilteredRevenueData()).sort(([a],[b]) => a.localeCompare(b)).map(([date, amount]) => ({ Date: date, Revenue: `₱${amount.toLocaleString()}` }))
  const metricsSheet = XLSX.utils.json_to_sheet(metricsData)
  const revenueSheet = XLSX.utils.json_to_sheet(revenueData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, metricsSheet, 'Dashboard Metrics')
  XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Daily Revenue Trend')
  XLSX.writeFile(workbook, 'MaEsPayTrack_Admin_Dashboard.xlsx')
}

/* Mount */
onMounted(async () => {
  await fetchDashboardData()
  prepareWeeks()
  await nextTick()
  drawCharts()
})

watch(selectedWeek, drawCharts)
</script>
