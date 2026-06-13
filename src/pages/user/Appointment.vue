<template>
  <UserLayout>
    <div v-if="loading" class="max-w-7xl mx-auto px-6 py-8 md:px-10 space-y-10 animate-pulse">
      <div class="h-8 bg-slate-100 rounded-xl w-1/4"></div>
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div class="lg:col-span-7 space-y-6">
          <div v-for="i in 3" :key="i" class="h-32 bg-slate-50 border border-slate-100 rounded-2xl"></div>
          <div class="h-14 bg-slate-200 rounded-2xl w-full"></div>
        </div>
        <div class="lg:col-span-5">
          <div class="h-64 bg-slate-100 rounded-3xl border border-slate-100"></div>
        </div>
      </div>
    </div>

    <div v-else class="max-w-7xl mx-auto px-6 py-8 md:px-10 space-y-8 animate-fade-in">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">Schedule Visit</h1>
        <p class="text-sm text-slate-500 mt-1">Book your laboratory appointments with ease.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        <div class="lg:col-span-7 space-y-6">
          <form @submit.prevent="submitAppointment" class="space-y-6">
            
            <div class="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-teal-600 text-white rounded-lg">
                  <Calendar class="w-4 h-4" />
                </div>
                <h3 class="text-sm font-bold text-slate-900">Select Date</h3>
              </div>
              <input
                type="date"
                v-model="form.date"
                :min="today"
                required
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all"
              />
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-slate-900 text-white rounded-lg">
                    <List class="w-4 h-4" />
                  </div>
                  <h3 class="text-sm font-bold text-slate-900">Laboratory Services</h3>
                </div>
                <button
                  type="button"
                  @click="openServiceModal"
                  class="text-[10px] font-bold text-teal-600 uppercase tracking-widest hover:text-teal-700"
                >
                  Browse All
                </button>
              </div>

              <div v-if="selectedServices.length" class="flex flex-wrap gap-2 pt-1">
                <div 
                  v-for="s in selectedServices" 
                  :key="s.id"
                  class="px-3 py-1.5 bg-teal-50 border border-teal-100 rounded-full text-[11px] font-bold text-teal-700 flex items-center gap-2 shadow-sm"
                >
                  {{ s.serviceName }}
                  <button @click.stop="removeService(s.id)" class="hover:text-red-500 transition">
                    <X class="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div v-else @click="openServiceModal" class="py-10 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-teal-300 transition-all group">
                <Plus class="w-5 h-5 text-slate-300 group-hover:text-teal-500 mb-2" />
                <span class="text-xs font-bold text-slate-400 group-hover:text-teal-600">Click to add services</span>
              </div>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
              <h3 class="text-sm font-bold text-slate-900">Additional Notes</h3>
              <textarea
                v-model="form.notes"
                rows="3"
                placeholder="Optional instructions..."
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              :disabled="submitLoading || !selectedServices.length || !form.date"
              class="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold rounded-2xl transition-all shadow-lg shadow-teal-500/10 flex items-center justify-center gap-2 text-base"
            >
              <RefreshCw v-if="submitLoading" class="w-5 h-5 animate-spin" />
              <span v-else>Confirm Appointment</span>
            </button>
          </form>
        </div>

        <div class="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
          <div class="bg-slate-900 rounded-3xl p-8 text-white shadow-xl">
            <div class="flex justify-between items-center mb-8">
              <h2 class="text-lg font-bold flex items-center gap-2">
                <Clock class="w-4 h-4 text-teal-400" />
                Today's Visit
              </h2>
              <button @click="openAllModal" class="text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition">History</button>
            </div>

            <div v-if="todayAppointment" class="space-y-6">
              <div class="p-5 bg-white/5 border border-white/10 rounded-2xl">
                <div class="flex justify-between items-start mb-4">
                  <span class="px-2 py-0.5 bg-teal-500/20 text-teal-400 text-[9px] font-bold rounded-full uppercase border border-teal-500/20">
                    {{ todayAppointment.status }}
                  </span>
                  <span class="text-[10px] font-mono text-slate-500">{{ todayAppointment.date }}</span>
                </div>
                
                <h4 class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Booked Services</h4>
                <ul class="space-y-2">
                  <li v-for="s in todayAppointment.services" :key="s.id" class="text-sm font-medium flex items-center gap-2">
                    <div class="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                    {{ s.serviceName }}
                  </li>
                </ul>
              </div>

              <div v-if="todayAppointment.approvedAt" class="flex items-center gap-3 text-xs text-teal-400 font-bold bg-teal-500/5 p-4 rounded-xl border border-teal-500/10">
                <CheckCircle class="w-4 h-4" />
                Confirmed at {{ formatTimestamp(todayAppointment.approvedAt) }}
              </div>
            </div>

            <div v-else class="py-16 text-center space-y-4">
              <div class="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                <CalendarX class="w-6 h-6 text-slate-600" />
              </div>
              <p class="text-xs font-bold text-slate-400">No appointments for today.</p>
            </div>
          </div>
        </div>

      </div>
    </div>


    <Transition name="fade">
      <div v-if="showServiceModal" class="fixed inset-0 z-100 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="closeServiceModal"></div>
        <div class="relative bg-white max-w-2xl w-full rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-fade-in">
          <div class="p-6 border-b border-slate-50 flex justify-between items-center">
            <div>
              <h3 class="text-xl font-bold text-slate-900">Select Services</h3>
              <p class="text-xs text-slate-500">Pick one or more lab tests to proceed.</p>
            </div>
            <button @click="closeServiceModal" class="p-2 hover:bg-slate-100 rounded-full transition">
              <X class="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div class="p-6">
            <div class="relative mb-6">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                v-model="serviceSearch"
                type="text"
                placeholder="Search tests..."
                class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all"
              />
            </div>

            <div class="max-h-96 overflow-y-auto pr-2 space-y-6 custom-scroll">
              <div v-for="(group, category) in filteredServiceGroups" :key="category">
                <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">{{ category }}</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label 
                    v-for="svc in group" 
                    :key="svc.id" 
                    class="flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer"
                    :class="selectedServices.some(s => s.id === svc.id) ? 'bg-teal-50 border-teal-200' : 'bg-white border-slate-100 hover:border-teal-100'"
                  >
                    <input type="checkbox" :value="svc" v-model="selectedServices" class="hidden" />
                    <div :class="['w-4 h-4 rounded border flex items-center justify-center transition-all', selectedServices.some(s => s.id === svc.id) ? 'bg-teal-600 border-teal-600' : 'border-slate-300']">
                      <Check class="w-3 h-3 text-white" v-if="selectedServices.some(s => s.id === svc.id)" />
                    </div>
                    <span class="text-xs font-bold text-slate-900">{{ svc.serviceName }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button @click="closeServiceModal" class="px-6 py-3 text-xs font-bold text-slate-500 hover:text-slate-900 transition">Cancel</button>
            <button @click="closeServiceModal" class="px-8 py-3 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition">
              Done ({{ selectedServices.length }})
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="showAllModal" class="fixed inset-0 z-100 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="closeAllModal"></div>
        <div class="relative bg-white max-w-lg w-full rounded-3xl shadow-2xl border border-slate-100 animate-fade-in overflow-hidden">
          <div class="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 class="text-xl font-bold text-slate-900">Appointment History</h3>
            <button @click="closeAllModal" class="text-slate-400 hover:text-red-500 transition font-bold text-xs">Close</button>
          </div>
          <div class="p-6 max-h-96 overflow-y-auto space-y-3 custom-scroll">
            <div v-for="appt in appointments" :key="appt.id" class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div class="flex justify-between items-center mb-3">
                <span class="text-[10px] font-mono text-slate-500">{{ appt.date }}</span>
                <span :class="['px-2 py-0.5 rounded-full text-[8px] font-bold uppercase', statusColor(appt.status)]">
                  {{ appt.status }}
                </span>
              </div>
              <p class="text-xs font-bold text-slate-900 leading-snug">
                {{ appt.services.map(s=>s.serviceName).join(', ') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </UserLayout>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { collection, addDoc, query, where, getDocs, Timestamp, writeBatch, doc } from 'firebase/firestore'
import { db } from '@/firebase'

import UserLayout from '@/components/UserLayout.vue'
import { 
  Calendar, List, X, Plus, Clock, CheckCircle, 
  CalendarX, Search, Check, RefreshCw, AlertCircle 
} from 'lucide-vue-next'

import { useNotifications } from '@/composables/useNotifications'
import { useAuth } from '@/composables/useAuth'

const { user, loading: authLoading } = useAuth()
const dataLoading = ref(true)
const loading = computed(() => authLoading.value || dataLoading.value)
const submitLoading = ref(false)
const form = ref({ date: '', notes: '' })
const appointments = ref([])
const selectedServices = ref([])
const showServiceModal = ref(false)
const showAllModal = ref(false)
const serviceSearch = ref('')
const allServices = ref([])

const { success, error: notifyError } = useNotifications();
const today = new Date().toISOString().split('T')[0]

const fetchAppointments = async () => {
  if (!user.value?.email) return
  const q = query(collection(db, 'appointments'), where('email', '==', user.value.email))
  const snap = await getDocs(q)
  appointments.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

const fetchServices = async () => {
  const snap = await getDocs(collection(db, 'services'))
  allServices.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

const filteredServiceGroups = computed(() => {
  const term = serviceSearch.value.toLowerCase()
  return allServices.value
    .filter((s) => s.serviceName.toLowerCase().includes(term))
    .reduce((acc, svc) => {
      const cat = svc.category || 'Laboratory Tests'
      ;(acc[cat] ||= []).push(svc)
      return acc
    }, {})
})

const todayAppointment = computed(() => appointments.value.find(a => a.date === today))

const openServiceModal = () => showServiceModal.value = true
const closeServiceModal = () => showServiceModal.value = false
const openAllModal = () => showAllModal.value = true
const closeAllModal = () => showAllModal.value = false

const removeService = (id) => {
  selectedServices.value = selectedServices.value.filter(s => s.id !== id)
}

const submitAppointment = async () => {
  if (!form.value.date || selectedServices.value.length === 0) {
    notifyError("Please select at least one service and a date.")
    return
  }

  submitLoading.value = true
  try {
    const batch = writeBatch(db)
    const appRef = doc(collection(db, 'appointments'))
    const userRef = doc(db, 'users', user.value.uid)
    const now = Timestamp.now()

    batch.set(appRef, {
      services: selectedServices.value,
      date: form.value.date,
      notes: form.value.notes,
      email: user.value.email,
      status: 'Pending',
      createdAt: now,
    })

    batch.update(userRef, {
      lastAppointmentAt: now
    })

    await batch.commit()

    form.value = { date: '', notes: '' }
    selectedServices.value = []
    await fetchAppointments()
    success("Appointment successfully booked!")
  } catch (e) {
    console.error("Booking error:", e)
    notifyError("Failed to book appointment. Please try again (there is a 1-minute cooldown).")
  }
  submitLoading.value = false
}

const formatTimestamp = (ts) => {
  if (!ts?.toDate) return ''
  const d = ts.toDate()
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const statusColor = (status) => {
  if (status === 'Pending') return 'bg-amber-100 text-amber-700'
  if (status === 'Approved') return 'bg-teal-100 text-teal-700'
  return 'bg-rose-100 text-rose-700'
}

const initData = async () => {
  if (user.value) {
    await Promise.all([fetchAppointments(), fetchServices()])
    dataLoading.value = false
  }
}

onMounted(initData)
watch(user, initData)
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar { width: 5px; }
.custom-scroll::-webkit-scrollbar-track { background: transparent; }
.custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px) } to { opacity:1; transform: translateY(0) } }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.toast-enter-active, .toast-leave-active { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.toast-enter-from { opacity: 0; transform: translate(-50%, 20px); }
.toast-leave-to { opacity: 0; transform: translate(-50%, -20px); }
</style>
