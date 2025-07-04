<template>
  <div class="flex min-h-screen bg-[#1a1a1a] text-gray-100 overflow-hidden">
    <admin_sidebar />
    <div class="flex-1 flex flex-col h-screen">
      <AdminTopbar />
      <main class="flex-1 p-6 space-y-8 overflow-y-auto">
        <!-- Summary cards -->
        <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

        <!-- Revenue Trend with Week Selector -->
        <section class="space-y-6">
          <div class="bg-[#222] p-6 rounded-xl shadow-md">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-semibold text-gray-200">Revenue Trend (Daily)</h2>
              <select v-model="selectedWeek" @change="drawCharts" class="bg-[#1a1a1a] text-white text-sm border border-gray-600 rounded px-2 py-1">
                <option v-for="(label, index) in weekLabels" :key="index" :value="index">
                  {{ label }}
                </option>
              </select>
            </div>
            <div class="h-72">
              <canvas ref="lineChart" class="w-full h-full"></canvas>
            </div>
          </div>

          <!-- Dynamic Service Trend Charts -->
          <div
            v-for="(refName, index) in serviceChartRefs"
            :key="index"
            class="bg-[#222] p-6 rounded-xl shadow-md"
          >
            <h2 class="text-lg font-semibold mb-4 text-gray-200">
              Service Trend (Batch {{ index + 1 }})
            </h2>
            <div class="h-72">
              <canvas :ref="(el) => serviceChartRefs[index] = el" class="w-full h-full"></canvas>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import Chart from 'chart.js/auto'
import admin_sidebar from '@/components/admin_sidebar.vue'
import AdminTopbar from '@/components/AdminTopbar.vue'
import { ChartBarIcon, UsersIcon, CreditCardIcon, UserGroupIcon } from '@heroicons/vue/24/solid'

const db = getFirestore()
const lineChart = ref(null)
const serviceChartRefs = ref([])

const dashboardCards = ref([])
const revenueByDay = ref({})
const serviceCounts = ref({})
const selectedWeek = ref(0)

let lineChartInstance = null
let serviceChartInstances = []

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
  const weeks = []
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  let start = new Date(firstDay)
  while (start <= lastDay) {
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    if (end > lastDay) end.setDate(lastDay.getDate())
    weeks.push({ start: new Date(start), end: new Date(end) })
    start.setDate(start.getDate() + 7)
  }
  return weeks
}

const weekLabels = computed(() => {
  return getWeeksOfMonth().map((w, i) => {
    const s = w.start.toLocaleDateString('en-CA')
    const e = w.end.toLocaleDateString('en-CA')
    return `Week ${i + 1}: ${s} to ${e}`
  })
})

const fetchDashboardData = async () => {
  let totalRevenue = 0
  let unpaidClaims = 0
  let totalPatients = 0
  let dischargedPatients = 0

  revenueByDay.value = {}
  serviceCounts.value = {}

  try {
    const invSnap = await getDocs(collection(db, 'invoices'))
    invSnap.forEach((doc) => {
      const d = doc.data()
      const status = (d.status || '').toLowerCase()
      const amount = Number(d.totalAmount || 0)

      if (status === 'paid' && d.approvedAt?.seconds) {
        const day = new Date(d.approvedAt.seconds * 1000).toLocaleDateString('en-CA')
        revenueByDay.value[day] = (revenueByDay.value[day] || 0) + amount
        totalRevenue += amount
      }

      if (['pending', 'not paid', 'unpaid', 'overdue'].includes(status)) unpaidClaims++

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
        if ((u.status || '').toLowerCase() === 'discharged') dischargedPatients++
      }
    })

    dashboardCards.value = [
      { title: 'Total Revenue', value: `₱${totalRevenue.toLocaleString()}`, icon: ChartBarIcon },
      { title: 'Unpaid Claims', value: unpaidClaims, icon: CreditCardIcon },
      { title: 'Total Patients', value: totalPatients, icon: UsersIcon },
      { title: 'Discharged Patients', value: dischargedPatients, icon: UserGroupIcon }
    ]
  } catch (err) {
    console.error('Dashboard data error:', err)
  }
}

const drawCharts = () => {
  if (lineChartInstance) lineChartInstance.destroy()

  const ctx = lineChart.value.getContext('2d')
  const weeks = getWeeksOfMonth()
  const week = weeks[selectedWeek.value] || {}

  const allDates = Object.keys(revenueByDay.value).sort((a, b) => new Date(a) - new Date(b))
  const filteredDates = allDates.filter((d) => {
    const date = new Date(d)
    return week.start <= date && date <= week.end
  })

  const values = filteredDates.map((d) => revenueByDay.value[d])

  const gradient = ctx.createLinearGradient(0, 0, 0, 300)
  gradient.addColorStop(0, 'rgba(34,197,94,0.4)')
  gradient.addColorStop(1, 'rgba(34,197,94,0)')

  lineChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: filteredDates,
      datasets: [{
        data: values,
        fill: true,
        backgroundColor: gradient,
        borderColor: '#22c55e',
        tension: 0.4,
        borderWidth: 3
      }]
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
            callback: v => `₱${v.toLocaleString()}`
          },
          grid: { color: '#374151' }
        }
      }
    }
  })

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
}

onMounted(async () => {
  await fetchDashboardData()
  await nextTick()
  drawCharts()
})
</script>
