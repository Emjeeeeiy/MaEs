<template>
  <AdminLayout>
    <div class="min-h-screen bg-gray-50/50 dark:bg-[#121212] p-4 sm:p-6 text-gray-900 dark:text-gray-100 font-sans">
      
      <!-- Header -->
      <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-5 border-b border-gray-200/60 dark:border-gray-800/60">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Comprehensive analysis of your system performance.</p>
        </div>
        
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <div class="relative flex-1 sm:flex-none">
            <select
              v-model="selectedWeek"
              class="w-full sm:w-44 appearance-none pl-3 pr-8 py-2 text-xs bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition shadow-sm"
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

      <!-- KPI Cards: Optimized 5-column Grid -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div 
          v-for="(card, i) in dashboardCards"
          :key="i"
          class="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group"
        >
          <div class="flex justify-between items-start">
            <div class="space-y-1 min-w-0 flex-1">
              <p class="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest truncate">{{ card.title }}</p>
              <h3 class="text-xl font-black tracking-tight text-gray-900 dark:text-white">{{ card.value }}</h3>
              <p v-if="card.subtitle" class="text-[9px] text-gray-400 font-medium truncate">{{ card.subtitle }}</p>
              <div v-if="card.trend" class="flex items-center gap-1 mt-1">
                <div :class="['flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold', card.trend > 0 ? 'bg-green-50 text-green-600 dark:bg-green-950/20' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20']">
                  <TrendingUpIcon v-if="card.trend > 0" class="w-2.5 h-2.5" />
                  <TrendingDownIcon v-else class="w-2.5 h-2.5" />
                  {{ Math.abs(card.trend) }}%
                </div>
              </div>
            </div>
            <div :class="['p-2 rounded-xl shrink-0 transition-transform group-hover:rotate-6', card.colorClass || 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400']">
              <component :is="card.icon" class="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      <!-- Main Charts Grid: 12-column Balance -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        
        <!-- Account Presence Breakdown (4 columns) -->
        <div class="lg:col-span-4 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col">
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <ActivityIcon class="w-4 h-4" />
              </div>
              <h2 class="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Account Presence</h2>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span class="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Live</span>
            </div>
          </div>
          <div class="flex-1 flex flex-col justify-center">
            <div class="h-48 relative mb-8">
              <canvas ref="presenceChartRef" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="p-3 bg-gray-50/50 dark:bg-[#252525]/50 rounded-xl border border-gray-100 dark:border-gray-800">
                <p class="text-[9px] font-bold text-gray-400 uppercase mb-1">Online</p>
                <p class="text-lg font-black text-emerald-600">{{ onlineUsersCount }}</p>
              </div>
              <div class="p-3 bg-gray-50/50 dark:bg-[#252525]/50 rounded-xl border border-gray-100 dark:border-gray-800">
                <p class="text-[9px] font-bold text-gray-400 uppercase mb-1">Offline</p>
                <p class="text-lg font-black text-gray-400">{{ offlineUsersCount }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Revenue Trend (8 columns) -->
        <div class="lg:col-span-8 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                <TrendingUpIcon class="w-4 h-4" />
              </div>
              <h2 class="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Revenue Trend</h2>
            </div>
            <div class="flex items-center gap-2">
              <button
                v-for="period in timePeriods"
                :key="period"
                @click="selectedTimePeriod = period"
                :class="[
                  'px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all',
                  selectedTimePeriod === period
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                ]"
              >
                {{ period }}
              </button>
            </div>
          </div>
          <div class="h-80">
            <canvas ref="revenueChartRef" />
          </div>
        </div>

      </div>

      <!-- Secondary Charts Grid: 50/50 Split -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        <!-- Appointment Distribution -->
        <div class="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg">
                <CalendarIcon class="w-4 h-4" />
              </div>
              <h2 class="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Appointment Status</h2>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div class="h-52 relative">
              <canvas ref="appointmentChartRef" />
            </div>
            <div class="space-y-4">
               <div v-for="(val, key) in appointmentStats" :key="key" class="space-y-1.5">
                  <div class="flex justify-between text-[10px] font-black uppercase tracking-wider">
                    <span class="text-gray-400">{{ key }}</span>
                    <span class="text-gray-700 dark:text-gray-200">{{ val }}</span>
                  </div>
                  <div class="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      class="h-full rounded-full transition-all duration-1000"
                      :class="key === 'Approved' ? 'bg-emerald-500' : key === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'"
                      :style="{ width: `${(val / (Object.values(appointmentStats).reduce((a,b)=>a+b,0) || 1) * 100)}%` }"
                    ></div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <!-- User Growth -->
        <div class="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div class="flex items-center gap-3 mb-8">
            <div class="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
              <UsersIcon class="w-4 h-4" />
            </div>
            <h2 class="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">User Growth Analysis</h2>
          </div>
          <div class="h-60">
            <canvas ref="userGrowthChartRef" />
          </div>
        </div>

      </div>

      <!-- Service Volume Section -->
      <div class="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm mb-8">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg">
              <BarChart3Icon class="w-4 h-4" />
            </div>
            <div>
              <h2 class="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Service Volume Analysis</h2>
              <p class="text-[11px] text-gray-400 mt-0.5">Analyze the total transactions and popularity of each service based on paid invoices.</p>
            </div>
          </div>
          <button @click="showServiceModal = true" class="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shrink-0">Detailed Analytics</button>
        </div>

        <!-- KPI Metrics Summary for Services -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 mb-6">
          <div class="p-4 bg-gray-50/30 dark:bg-[#252525]/20 border border-gray-100 dark:border-gray-800/60 rounded-2xl flex items-center gap-3">
            <div class="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
              <ActivityIcon class="w-4 h-4" />
            </div>
            <div class="min-w-0">
              <p class="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Total Rendered</p>
              <h3 class="text-base font-black text-gray-900 dark:text-white mt-0.5 truncate">{{ totalServicesRendered }} bookings</h3>
            </div>
          </div>
          <div class="p-4 bg-gray-50/30 dark:bg-[#252525]/20 border border-gray-100 dark:border-gray-800/60 rounded-2xl flex items-center gap-3">
            <div class="p-2.5 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-lg shrink-0">
              <TrendingUpIcon class="w-4 h-4" />
            </div>
            <div class="min-w-0">
              <p class="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Most Popular Service</p>
              <h3 class="text-xs font-black text-gray-900 dark:text-white mt-0.5 truncate" :title="topService.name">
                {{ topService.name }} <span class="text-[10px] font-bold text-purple-600 dark:text-purple-400">({{ topService.count }}x)</span>
              </h3>
            </div>
          </div>
          <div class="p-4 bg-gray-50/30 dark:bg-[#252525]/20 border border-gray-100 dark:border-gray-800/60 rounded-2xl flex items-center gap-3">
            <div class="p-2.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
              <BarChart3Icon class="w-4 h-4" />
            </div>
            <div class="min-w-0">
              <p class="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Active Services</p>
              <h3 class="text-base font-black text-gray-900 dark:text-white mt-0.5 truncate">{{ uniqueServicesCount }} types</h3>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
          <div v-for="(chunk, index) in serviceChunks" :key="index" class="p-4 bg-gray-50/30 dark:bg-[#252525]/30 rounded-2xl border border-gray-100 dark:border-gray-800/60 flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-center mb-4">
                <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Service Group 0{{ index + 1 }}</p>
                <span class="text-[9px] font-bold text-gray-500 dark:text-gray-400">{{ Object.keys(chunk).length }} Services</span>
              </div>
              <div class="h-28">
                <canvas :ref="(el) => (serviceChartRefs[index] = el)" />
              </div>
            </div>
            <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80 space-y-1.5">
              <div v-for="(val, key) in chunk" :key="key" class="flex justify-between items-center text-[10px]">
                <span class="text-gray-500 dark:text-gray-400 truncate max-w-37.5 font-medium" :title="key">{{ key }}</span>
                <span class="font-bold text-gray-800 dark:text-gray-200 shrink-0">{{ val }} {{ val === 1 ? 'txn' : 'txns' }}</span>
              </div>
            </div>
          </div>
          <div v-if="!serviceChunks.length" class="col-span-full text-center py-8 text-gray-400 italic">
            No service data found.
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
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="text-gray-400 dark:text-gray-500 border-b border-gray-50 dark:border-gray-800 uppercase tracking-tighter">
                  <th class="px-5 py-3 font-semibold">User</th>
                  <th class="px-5 py-3 font-semibold">Service</th>
                  <th class="px-5 py-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
                <tr v-for="appt in recentAppointments" :key="appt.id" class="hover:bg-gray-50/50 dark:hover:bg-[#252525]/30 transition-colors">
                  <td class="px-5 py-3">
                    <p class="font-bold text-gray-800 dark:text-gray-200 truncate max-w-30">{{ appt.email.split('@')[0] }}</p>
                    <p class="text-[10px] text-gray-400 truncate max-w-30">{{ appt.email }}</p>
                  </td>
                  <td class="px-5 py-3 text-gray-600 dark:text-gray-400">
                    <div class="flex items-center gap-1.5 truncate max-w-37.5">
                       <span class="truncate">{{ appt.services?.[0]?.serviceName || 'N/A' }}</span>
                       <span v-if="appt.services?.length > 1" class="shrink-0 text-[8px] bg-gray-100 dark:bg-gray-800 px-1 rounded font-black">+{{ appt.services.length - 1 }}</span>
                    </div>
                  </td>
                  <td class="px-5 py-3 text-right">
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase border" :class="getStatusClass(appt.status)">
                      {{ appt.status }}
                    </span>
                  </td>
                </tr>
                <tr v-if="!recentAppointments.length">
                  <td colspan="3" class="px-5 py-8 text-center text-gray-400 italic">No recent appointments found.</td>
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
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="text-gray-400 dark:text-gray-500 border-b border-gray-50 dark:border-gray-800 uppercase tracking-tighter">
                  <th class="px-5 py-3 font-semibold">User Info</th>
                  <th class="px-5 py-3 font-semibold">Role</th>
                  <th class="px-5 py-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
                <tr v-for="u in recentUsers" :key="u.id" class="hover:bg-gray-50/50 dark:hover:bg-[#252525]/30 transition-colors">
                  <td class="px-5 py-3 flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                      {{ u.username?.[0]?.toUpperCase() || 'U' }}
                    </div>
                    <div class="min-w-0">
                      <p class="font-bold text-gray-800 dark:text-gray-200 truncate max-w-30">{{ u.username || 'Anonymous' }}</p>
                      <p class="text-[10px] text-gray-400 truncate max-w-30">{{ u.email }}</p>
                    </div>
                  </td>
                  <td class="px-5 py-3 capitalize font-bold text-gray-500">{{ u.role }}</td>
                  <td class="px-5 py-3 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <div class="w-1.5 h-1.5 rounded-full" :class="u.status === 'deactivated' ? 'bg-rose-500' : 'bg-green-500'"></div>
                      <span class="text-[9px] font-black uppercase tracking-widest text-gray-400">{{ u.status || 'Active' }}</span>
                    </div>
                  </td>
                </tr>
                <tr v-if="!recentUsers.length">
                  <td colspan="3" class="px-5 py-8 text-center text-gray-400 italic">No new members recently.</td>
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
                  <div class="h-full bg-green-500 rounded-full" :style="{ width: `${(count / maxServiceCount * 100)}%` }"></div>
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
const presenceChartRef = ref(null)

const dashboardCards = ref([])
const serviceCounts = ref({})
const revenueTrend = ref({})
const appointmentStats = ref({ Pending: 0, Approved: 0, Declined: 0 })
const userRegistrations = ref({})
const onlineUsersCount = ref(0)
const offlineUsersCount = ref(0)

const recentAppointments = ref([])
const recentUsers = ref([])

const selectedWeek = ref('')
const availableWeeks = ref([])
const showServiceModal = ref(false)
const selectedTimePeriod = ref('Daily')
const timePeriods = ['Daily', 'Weekly', 'Monthly', 'Yearly']

let serviceChartInstances = []
let revenueChartInstance = null
let appointmentChartInstance = null
let userGrowthChartInstance = null
let presenceChartInstance = null

const sortedServiceTotals = computed(() =>
  Object.fromEntries(Object.entries(serviceCounts.value).sort((a, b) => b[1] - a[1]))
)

const serviceChunks = computed(() => {
  return chunkServiceCounts(serviceCounts.value, 6)
})

const totalServicesRendered = computed(() => {
  return Object.values(serviceCounts.value).reduce((a, b) => a + b, 0)
})

const topService = computed(() => {
  const entries = Object.entries(serviceCounts.value)
  if (entries.length === 0) return { name: 'N/A', count: 0 }
  const sorted = entries.sort((a, b) => b[1] - a[1])
  return { name: sorted[0][0], count: sorted[0][1] }
})

const uniqueServicesCount = computed(() => {
  return Object.keys(serviceCounts.value).length
})

const maxServiceCount = computed(() => {
  const values = Object.values(serviceCounts.value)
  return values.length > 0 ? Math.max(...values) : 1
})

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

function aggregateRevenueByPeriod(dataMap, period) {
  const aggregated = {}
  
  Object.entries(dataMap).forEach(([dateStr, amount]) => {
    const date = new Date(dateStr)
    let key
    
    switch (period) {
      case 'Weekly': {
        const weekStart = new Date(date)
        const day = weekStart.getDay() || 7
        weekStart.setDate(weekStart.getDate() - day + 1)
        key = weekStart.toISOString().split('T')[0]
        break
      }
      case 'Monthly': {
        key = dateStr.substring(0, 7) // YYYY-MM
        break
      }
      case 'Yearly': {
        key = dateStr.substring(0, 4) // YYYY
        break
      }
      case 'Daily':
      default:
        key = dateStr
    }
    
    aggregated[key] = (aggregated[key] || 0) + amount
  })
  
  return aggregated
}

function getRevenueChartData() {
  const aggregated = aggregateRevenueByPeriod(revenueTrend.value, selectedTimePeriod.value)
  const labels = Object.keys(aggregated).sort()
  const values = labels.map(d => aggregated[d])
  return { labels, values }
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
  onlineUsersCount.value = 0
  offlineUsersCount.value = 0

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
      
      // Track Presence
      if (u.onlineStatus === 'online') {
        onlineUsersCount.value++
      } else {
        offlineUsersCount.value++
      }

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
      { title: 'Live Online', value: onlineUsersCount.value, subtitle: 'Users active now', icon: ActivityIcon, colorClass: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' },
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
  [...serviceChartInstances, revenueChartInstance, appointmentChartInstance, userGrowthChartInstance, presenceChartInstance].forEach(c => c?.destroy())
  serviceChartInstances = []

  // Presence Chart (Doughnut)
  if (presenceChartRef.value) {
    presenceChartInstance = new Chart(presenceChartRef.value.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Online', 'Offline'],
        datasets: [{
          data: [onlineUsersCount.value, offlineUsersCount.value],
          backgroundColor: ['#10b981', '#e2e8f0'],
          hoverBackgroundColor: ['#059669', '#cbd5e1'],
          borderWidth: 0,
          cutout: '80%'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) => `${item.label}: ${item.raw} users`
            }
          }
        }
      }
    })
  }

  // Revenue Chart
  if (revenueChartRef.value) {
    const filtered = getFilteredData(revenueTrend.value)
    const { labels, values } = getRevenueChartData()
    const periodLabel = selectedTimePeriod.value
    revenueChartInstance = new Chart(revenueChartRef.value.getContext('2d'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: `Revenue (${periodLabel})`,
          data: values,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          fill: true,
          tension: 0.4,
          pointRadius: selectedTimePeriod.value === 'Yearly' ? 4 : 3,
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
          legend: { display: false }
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
  const chunks = serviceChunks.value
  serviceChartRefs.value = new Array(chunks.length)
  chunks.forEach((chunk, index) => {
    nextTick(() => {
      const ref = serviceChartRefs.value[index]
      if (!ref) return
      const chart = new Chart(ref.getContext('2d'), {
        type: 'bar',
        data: {
          labels: Object.keys(chunk),
          datasets: [{
            data: Object.values(chunk),
            backgroundColor: 'rgba(16, 185, 129, 0.85)',
            hoverBackgroundColor: '#10b981',
            borderRadius: 6,
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => ` Bookings: ${context.raw}`
              }
            }
          },
          scales: {
            x: { display: false },
            y: { beginAtZero: true, display: false }
          }
        }
      })
      serviceChartInstances.push(chart)
    })
  })
}

const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30'
    case 'approved': return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
    case 'declined': return 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30'
    default: return 'bg-gray-50 dark:bg-gray-800 text-gray-500 border-gray-100'
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
watch(selectedTimePeriod, drawCharts)
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
