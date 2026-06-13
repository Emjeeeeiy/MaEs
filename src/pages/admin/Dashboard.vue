<template>
  <AdminLayout>
    <div class="min-h-screen bg-gray-50/50 dark:bg-[#121212] p-4 sm:p-6 text-gray-900 dark:text-gray-100 font-sans">
      
      <!-- Header -->
      <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-5 border-b border-gray-200/60 dark:border-gray-800/60">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Komprehensibong pagsusuri ng iyong system performance.</p>
        </div>
        
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <div class="relative flex-1 sm:flex-none">
            <select
              v-model="selectedWeek"
              class="w-full sm:w-44 appearance-none pl-3 pr-8 py-2 text-xs bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition"
            >
              <option value="">All Time</option>
              <option v-for="week in availableWeeks" :key="week.label" :value="week.label">
                {{ week.label }}
              </option>
            </select>
            <ChevronDownIcon class="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <button 
            @click="exportToExcel"
            class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold tracking-wide shadow-lg shadow-green-500/20 transition-all active:scale-95"
          >
            <DownloadIcon class="w-3.5 h-3.5" />
            <span>Export Reports</span>
          </button>
        </div>
      </header>

      <!-- KPI Cards -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div 
          v-for="(card, i) in dashboardCards"
          :key="i"
          class="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 group"
        >
          <div class="flex justify-between items-start">
            <div class="space-y-1">
              <p class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{{ card.title }}</p>
              <h3 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{{ card.value }}</h3>
              <p v-if="card.trend" class="text-[10px] flex items-center gap-1" :class="card.trend > 0 ? 'text-green-500' : 'text-rose-500'">
                <TrendingUpIcon v-if="card.trend > 0" class="w-3 h-3" />
                <TrendingDownIcon v-else class="w-3 h-3" />
                {{ Math.abs(card.trend) }}% from last month
              </p>
            </div>
            <div class="p-3 rounded-xl transition-colors" :class="card.colorClass || 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'">
              <component :is="card.icon" class="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      <!-- Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        <!-- Revenue Trend -->
        <div class="lg:col-span-2 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                <TrendingUpIcon class="w-4 h-4" />
              </div>
              <h2 class="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Revenue Trend (Daily)</h2>
            </div>
          </div>
          <div class="h-72">
            <canvas ref="revenueChartRef" />
          </div>
        </div>

        <!-- Appointment Distribution -->
        <div class="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg">
              <CalendarIcon class="w-4 h-4" />
            </div>
            <h2 class="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Appointment Status</h2>
          </div>
          <div class="h-72 relative flex items-center justify-center">
            <canvas ref="appointmentChartRef" />
          </div>
        </div>

        <!-- User Growth -->
        <div class="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
              <UsersIcon class="w-4 h-4" />
            </div>
            <h2 class="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">User Growth</h2>
          </div>
          <div class="h-64">
            <canvas ref="userGrowthChartRef" />
          </div>
        </div>

        <!-- Service Trends Batch -->
        <div class="lg:col-span-2 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <ActivityIcon class="w-4 h-4" />
              </div>
              <h2 class="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Service Volume Analysis</h2>
            </div>
            <button @click="showServiceModal = true" class="text-[10px] font-bold text-green-600 hover:text-green-700 uppercase tracking-widest transition-colors">Detailed View</button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="(_, index) in serviceChartRefs" :key="index" class="space-y-2">
              <p class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Batch {{ index + 1 }}</p>
              <div class="h-40">
                <canvas :ref="(el) => (serviceChartRefs[index] = el)" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity Tables -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <!-- Newest Appointments -->
        <div class="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <div class="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/30 dark:bg-[#1a1a1a]/30">
            <h2 class="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <ClockIcon class="w-4 h-4 text-green-500" /> Recent Appointments
            </h2>
            <RouterLink to="/admin-appointment" class="text-[10px] font-bold text-green-600 hover:underline uppercase tracking-widest">View All</RouterLink>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="text-gray-400 dark:text-gray-500 border-b border-gray-50 dark:border-gray-800 uppercase tracking-tighter">
                  <th class="px-5 py-3 font-semibold">User</th>
                  <th class="px-5 py-3 font-semibold">Service</th>
                  <th class="px-5 py-3 font-semibold">Date</th>
                  <th class="px-5 py-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
                <tr v-for="appt in recentAppointments" :key="appt.id" class="hover:bg-gray-50/50 dark:hover:bg-[#252525]/30 transition-colors">
                  <td class="px-5 py-3">
                    <p class="font-bold text-gray-800 dark:text-gray-200 truncate max-w-30">{{ appt.email.split('@')[0] }}</p>
                    <p class="text-[10px] text-gray-400 truncate max-w-30">{{ appt.email }}</p>
                  </td>
                  <td class="px-5 py-3 text-gray-600 dark:text-gray-400 truncate max-w-37.5">
                    {{ appt.services?.[0]?.serviceName || 'N/A' }}
                    <span v-if="appt.services?.length > 1" class="text-[9px] bg-gray-100 dark:bg-gray-800 px-1 rounded ml-1">+{{ appt.services.length - 1 }}</span>
                  </td>
                  <td class="px-5 py-3 text-gray-500">{{ appt.date }}</td>
                  <td class="px-5 py-3 text-right">
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase" :class="getStatusClass(appt.status)">
                      {{ appt.status }}
                    </span>
                  </td>
                </tr>
                <tr v-if="!recentAppointments.length">
                  <td colspan="4" class="px-5 py-8 text-center text-gray-400 italic">No recent appointments found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Newest Members -->
        <div class="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <div class="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/30 dark:bg-[#1a1a1a]/30">
            <h2 class="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <UserPlusIcon class="w-4 h-4 text-blue-500" /> Newest Members
            </h2>
            <RouterLink to="/admin-management" class="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest">View All</RouterLink>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="text-gray-400 dark:text-gray-500 border-b border-gray-50 dark:border-gray-800 uppercase tracking-tighter">
                  <th class="px-5 py-3 font-semibold">User Info</th>
                  <th class="px-5 py-3 font-semibold">Role</th>
                  <th class="px-5 py-3 font-semibold">Joined Date</th>
                  <th class="px-5 py-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
                <tr v-for="u in recentUsers" :key="u.id" class="hover:bg-gray-50/50 dark:hover:bg-[#252525]/30 transition-colors">
                  <td class="px-5 py-3 flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[10px]">
                      {{ u.username?.[0]?.toUpperCase() || 'U' }}
                    </div>
                    <div>
                      <p class="font-bold text-gray-800 dark:text-gray-200 truncate max-w-30">{{ u.username || 'Anonymous' }}</p>
                      <p class="text-[10px] text-gray-400 truncate max-w-30">{{ u.email }}</p>
                    </div>
                  </td>
                  <td class="px-5 py-3 capitalize font-medium" :class="u.role === 'admin' ? 'text-rose-500' : 'text-gray-500'">{{ u.role }}</td>
                  <td class="px-5 py-3 text-gray-500">{{ formatDateSimple(u.createdAt) }}</td>
                  <td class="px-5 py-3 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <div class="w-1.5 h-1.5 rounded-full" :class="u.status === 'deactivated' ? 'bg-rose-500' : 'bg-green-500'"></div>
                      <span class="text-[10px] font-bold uppercase tracking-tight">{{ u.status || 'Active' }}</span>
                    </div>
                  </td>
                </tr>
                <tr v-if="!recentUsers.length">
                  <td colspan="4" class="px-5 py-8 text-center text-gray-400 italic">No new members recently.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Service Totals Modal -->
      <div v-if="showServiceModal" class="fixed inset-0 z-100 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm transition-opacity" @click="showServiceModal = false"></div>
        
        <div class="bg-white dark:bg-[#1e1e1e] w-full max-w-md p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl relative z-10 scale-in-center">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-widest">
              <PieChartIcon class="w-4 h-4 text-green-500" /> Service Analytics
            </h2>
            <button 
              @click="showServiceModal = false"
              class="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#252525] transition-all"
            >
              <XIcon class="w-4 h-4" />
            </button>
          </div>

          <div class="max-h-96 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            <div 
              v-for="(count, service) in sortedServiceTotals"
              :key="service"
              class="flex justify-between items-center px-4 py-3 bg-gray-50 dark:bg-[#252525] rounded-2xl hover:ring-2 hover:ring-green-500/20 transition-all text-xs"
            >
              <span class="font-bold text-gray-700 dark:text-gray-300">{{ service }}</span>
              <div class="flex items-center gap-3">
                <div class="h-1.5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div class="h-full bg-green-500 rounded-full" :style="{ width: `${(count / Object.values(serviceCounts)[0] * 100) || 0}%` }"></div>
                </div>
                <span class="font-black text-gray-900 dark:text-white">{{ count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import AdminLayout from '@/components/AdminLayout.vue'
import Chart from 'chart.js/auto'

import { 
  ChevronDown as ChevronDownIcon, 
  Download as DownloadIcon, 
  TrendingUp as TrendingUpIcon, 
  TrendingDown as TrendingDownIcon,
  BarChart3 as BarChart3Icon, 
  PieChart as PieChartIcon, 
  X as XIcon,
  DollarSign as DollarSignIcon,
  AlertCircle as AlertCircleIcon,
  Users as UsersIcon,
  CreditCard as CreditCardIcon,
  Calendar as CalendarIcon,
  Activity as ActivityIcon,
  Clock as ClockIcon,
  UserPlus as UserPlusIcon
} from 'lucide-vue-next'

const db = getFirestore()
const serviceChartRefs = ref([])
const revenueChartRef = ref(null)
const appointmentChartRef = ref(null)
const userGrowthChartRef = ref(null)

const dashboardCards = ref([])
const serviceCounts = ref({})
const revenueTrend = ref({})
const appointmentStats = ref({ Pending: 0, Approved: 0, Declined: 0 })
const userRegistrations = ref({})

const recentAppointments = ref([])
const recentUsers = ref([])

const selectedWeek = ref('')
const availableWeeks = ref([])
const showServiceModal = ref(false)

let serviceChartInstances = []
let revenueChartInstance = null
let appointmentChartInstance = null
let userGrowthChartInstance = null

const sortedServiceTotals = computed(() =>
  Object.fromEntries(Object.entries(serviceCounts.value).sort((a, b) => b[1] - a[1]))
)

const chunkServiceCounts = (obj, size = 64) => {
  const entries = Object.entries(obj)
  const chunks = []
  for (let i = 0; i < entries.length; i += size)
    chunks.push(Object.fromEntries(entries.slice(i, i + size)))
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
    to: end.toISOString().split('T')[0],
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
  selectedWeek.value = ''
}

function getFilteredData(dataMap) {
  if (!selectedWeek.value) return dataMap
  const week = availableWeeks.value.find((w) => w.label === selectedWeek.value)
  if (!week) return dataMap
  const filtered = {}
  for (const [date, value] of Object.entries(dataMap)) {
    if (date >= week.from && date <= week.to) filtered[date] = value
  }
  return filtered
}

async function fetchDashboardData() {
  let totalRevenue = 0,
    unpaidClaims = 0,
    totalPatients = 0,
    totalUnpaidAmount = 0
  
  serviceCounts.value = {}
  revenueTrend.value = {}
  appointmentStats.value = { Pending: 0, Approved: 0, Declined: 0 }
  userRegistrations.value = {}

  try {
    // Fetch Invoices
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

      if (['pending', 'not paid', 'unpaid', 'overdue'].includes(status)) unpaidClaims++
      if (status === 'not paid') totalUnpaidAmount += amount

      for (const s of d.services || []) {
        const name = s.serviceName || 'Unknown'
        serviceCounts.value[name] = (serviceCounts.value[name] || 0) + 1
      }
    })

    // Fetch Users
    const userSnap = await getDocs(collection(db, 'users'))
    userSnap.forEach((doc) => {
      const u = doc.data()
      if ((u.role || '').toLowerCase() === 'user') totalPatients++
      
      const ts = u.createdAt?.seconds || (u.createdAt ? new Date(u.createdAt).getTime() / 1000 : null)
      if (ts) {
        const dateStr = new Date(ts * 1000).toISOString().split('T')[0]
        userRegistrations.value[dateStr] = (userRegistrations.value[dateStr] || 0) + 1
      }
    })

    // Fetch Appointments
    const apptSnap = await getDocs(collection(db, 'appointments'))
    apptSnap.forEach(doc => {
      const a = doc.data()
      const status = a.status || 'Pending'
      appointmentStats.value[status] = (appointmentStats.value[status] || 0) + 1
    })

    // KPI Cards
    dashboardCards.value = [
      { title: 'Total Revenue', value: `₱${totalRevenue.toLocaleString()}`, icon: DollarSignIcon, trend: 12, colorClass: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' },
      { title: 'Pending Claims', value: unpaidClaims, icon: AlertCircleIcon, trend: -5, colorClass: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' },
      { title: 'Total Patients', value: totalPatients, icon: UsersIcon, trend: 8, colorClass: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
      { title: 'Unpaid Amount', value: `₱${totalUnpaidAmount.toLocaleString()}`, icon: CreditCardIcon, colorClass: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400' },
    ]

    // Fetch Recent Activity
    const qAppt = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'), limit(5))
    const qUser = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(5))
    
    const [snapAppt, snapUser] = await Promise.all([getDocs(qAppt), getDocs(qUser)])
    
    recentAppointments.value = snapAppt.docs.map(d => ({ id: d.id, ...d.data() }))
    recentUsers.value = snapUser.docs.map(d => ({ id: d.id, ...d.data() }))

  } catch (err) {
    console.error('Dashboard data error:', err)
  }
}

async function drawCharts() {
  // Destroy existing
  [...serviceChartInstances, revenueChartInstance, appointmentChartInstance, userGrowthChartInstance].forEach(c => c?.destroy())
  serviceChartInstances = []

  // Revenue Chart
  if (revenueChartRef.value) {
    const filtered = getFilteredData(revenueTrend.value)
    const labels = Object.keys(filtered).sort()
    const values = labels.map(d => filtered[d])
    revenueChartInstance = new Chart(revenueChartRef.value.getContext('2d'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Revenue',
          data: values,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#3b82f6',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#9ca3af' } },
          y: { beginAtZero: true, grid: { color: 'rgba(156, 163, 175, 0.1)' }, ticks: { font: { size: 10 }, color: '#9ca3af' } }
        }
      }
    })
  }

  // Appointment Status (Doughnut)
  if (appointmentChartRef.value) {
    const stats = appointmentStats.value
    appointmentChartInstance = new Chart(appointmentChartRef.value.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Pending', 'Approved', 'Declined'],
        datasets: [{
          data: [stats.Pending, stats.Approved, stats.Declined],
          backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10, weight: 'bold' }, padding: 20, usePointStyle: true, color: '#9ca3af' } }
        }
      }
    })
  }

  // User Growth (Bar)
  if (userGrowthChartRef.value) {
    const filtered = getFilteredData(userRegistrations.value)
    const labels = Object.keys(filtered).sort()
    const values = labels.map(d => filtered[d])
    userGrowthChartInstance = new Chart(userGrowthChartRef.value.getContext('2d'), {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'New Users',
          data: values,
          backgroundColor: '#8b5cf6',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#9ca3af' } },
          y: { beginAtZero: true, grid: { color: 'rgba(156, 163, 175, 0.1)' }, ticks: { stepSize: 1, font: { size: 10 }, color: '#9ca3af' } }
        }
      }
    })
  }

  // Service Trends Batching
  const chunks = chunkServiceCounts(serviceCounts.value, 6)
  serviceChartRefs.value = new Array(chunks.length)
  chunks.forEach((chunk, index) => {
    nextTick(() => {
      const ref = serviceChartRefs.value[index]
      if (!ref) return
      const chart = new Chart(ref.getContext('2d'), {
        type: 'line',
        data: {
          labels: Object.keys(chunk),
          datasets: [{
            data: Object.values(chunk),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { x: { display: false }, y: { beginAtZero: true, display: false } }
        }
      })
      serviceChartInstances.push(chart)
    })
  })
}

const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
    case 'approved': return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
    case 'declined': return 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
    default: return 'bg-gray-50 dark:bg-gray-800 text-gray-500'
  }
}

const formatDateSimple = (ts) => {
  if (!ts) return 'N/A'
  const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

async function exportToExcel() {
  const XLSX = await import('xlsx');
  const workbook = XLSX.utils.book_new()
  
  const kpiData = dashboardCards.value.map(c => ({ Metric: c.title, Value: c.value }))
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(kpiData), 'KPIs')
  
  const revData = Object.entries(revenueTrend.value).map(([Date, Amount]) => ({ Date, Amount }))
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(revData), 'Revenue')

  XLSX.writeFile(workbook, `MaEs_Admin_Report_${new Date().toISOString().split('T')[0]}.xlsx`)
}

onMounted(async () => {
  await fetchDashboardData()
  prepareWeeks()
  await nextTick()
  drawCharts()
})

watch(selectedWeek, drawCharts)
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; }

.scale-in-center {
  animation: scale-in-center 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
}
@keyframes scale-in-center {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
