<template>
  <UserLayout>
    <div v-if="loading" class="max-w-7xl mx-auto px-6 py-6 md:px-10 md:py-10 space-y-10 animate-pulse">
      <div class="h-10 bg-slate-100 rounded-xl w-1/4"></div>
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div class="lg:col-span-7 space-y-6">
          <div v-for="i in 3" :key="i" class="h-40 bg-slate-50 border border-slate-100 rounded-4xl"></div>
          <div class="h-16 bg-slate-200 rounded-3xl w-full"></div>
        </div>
        <div class="lg:col-span-5">
          <div class="h-80 bg-slate-900/5 rounded-[40px] border border-slate-100"></div>
        </div>
      </div>
    </div>

    <div v-else class="max-w-7xl mx-auto px-6 py-6 md:px-10 md:py-10 space-y-8 animate-fade-in">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-slate-950">Schedule Visit</h1>
        <p class="text-base text-slate-500 mt-1">Book your laboratory appointments with ease.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        <div class="lg:col-span-7 space-y-6">
          <form @submit.prevent="submitAppointment" class="space-y-8">
            
            <div class="bg-slate-50/50 p-6 rounded-4xl border border-slate-100 space-y-4">
              <div class="flex items-center gap-3 mb-2">
                <div class="p-2 bg-teal-500 text-white rounded-xl shadow-lg shadow-teal-500/20">
                  <Calendar class="w-5 h-5" />
                </div>
                <h3 class="font-bold text-slate-900">Select Date</h3>
              </div>
              <input
                type="date"
                v-model="form.date"
                :min="today"
                required
                class="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all"
              />
            </div>

            <div class="bg-slate-50/50 p-6 rounded-4xl border border-slate-100 space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-slate-950 text-white rounded-xl">
                    <List class="w-5 h-5" />
                  </div>
                  <h3 class="font-bold text-slate-900">Laboratory Services</h3>
                </div>
                <button
                  type="button"
                  @click="openServiceModal"
                  class="text-xs font-black text-teal-600 uppercase tracking-widest hover:text-teal-700"
                >
                  Browse All
                </button>
              </div>

              <div v-if="selectedServices.length" class="flex flex-wrap gap-2 pt-2">
                <div 
                  v-for="s in selectedServices" 
                  :key="s.id"
                  class="px-4 py-2 bg-white border border-teal-100 rounded-full text-xs font-bold text-teal-700 flex items-center gap-2 shadow-sm"
                >
                  {{ s.serviceName }}
                  <button @click.stop="removeService(s.id)" class="hover:text-red-500 transition">
                    <X class="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div v-else @click="openServiceModal" class="py-10 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-teal-300 transition-all group">
                <Plus class="w-6 h-6 text-slate-300 group-hover:text-teal-500 mb-2" />
                <span class="text-sm font-bold text-slate-400 group-hover:text-teal-600">Click to add services</span>
              </div>
            </div>

            <div class="bg-slate-50/50 p-6 rounded-4xl border border-slate-100 space-y-4">
              <h3 class="font-bold text-slate-900 ml-1">Additional Notes (Optional)</h3>
              <textarea
                v-model="form.notes"
                rows="3"
                placeholder="Provide any specific instructions or symptoms..."
                class="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              :disabled="submitLoading || !selectedServices.length || !form.date"
              class="w-full py-5 bg-teal-500 hover:bg-teal-400 disabled:bg-slate-100 disabled:text-slate-400 text-slate-950 font-black rounded-3xl transition-all shadow-xl shadow-teal-500/20 flex items-center justify-center gap-3 text-lg"
            >
              <RefreshCw v-if="submitLoading" class="w-6 h-6 animate-spin" />
              <span v-else>Confirm Appointment</span>
            </button>
          </form>
        </div>

        <div class="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
          <div class="bg-slate-950 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
            <div class="absolute -top-10 -right-10 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl"></div>
            
            <div class="flex justify-between items-center mb-8">
              <h2 class="text-xl font-bold flex items-center gap-2">
                <Clock class="w-5 h-5 text-teal-400" />
                Today's Visit
              </h2>
              <button @click="openAllModal" class="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition">History</button>
            </div>

            <div v-if="todayAppointment" class="space-y-6">
              <div class="p-5 bg-white/5 border border-white/10 rounded-3xl">
                <div class="flex justify-between items-start mb-4">
                  <span class="px-3 py-1 bg-teal-500/20 text-teal-400 text-[10px] font-black rounded-full uppercase tracking-tighter border border-teal-500/30">
                    {{ todayAppointment.status }}
                  </span>
                  <span class="text-xs font-mono text-slate-500">{{ todayAppointment.date }}</span>
                </div>
                
                <h4 class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Booked Services</h4>
                <ul class="space-y-2">
                  <li v-for="s in todayAppointment.services" :key="s.id" class="text-sm font-bold flex items-center gap-2">
                    <div class="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                    {{ s.serviceName }}
                  </li>
                </ul>
              </div>

              <div v-if="todayAppointment.approvedAt" class="flex items-center gap-3 text-xs text-teal-400 font-bold bg-teal-400/5 p-4 rounded-2xl border border-teal-400/20">
                <CheckCircle class="w-4 h-4" />
                Confirmed at {{ formatTimestamp(todayAppointment.approvedAt) }}
              </div>
            </div>

            <div v-else class="py-20 text-center space-y-4">
              <div class="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                <CalendarX class="w-8 h-8 text-slate-600" />
              </div>
              <p class="text-sm font-bold text-slate-400">No appointments scheduled for today.</p>
            </div>
          </div>
        </div>

      </div>
    </div>


    <Transition name="fade">
      <div v-if="showServiceModal" class="fixed inset-0 z-100 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="closeServiceModal"></div>
        <div class="relative bg-white max-w-2xl w-full rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden animate-fade-in">
          <div class="p-8 border-b border-slate-50 flex justify-between items-center">
            <div>
              <h3 class="text-2xl font-black text-slate-950">Select Services</h3>
              <p class="text-sm text-slate-500">Pick one or more lab tests to proceed.</p>
            </div>
            <button @click="closeServiceModal" class="p-2 hover:bg-slate-100 rounded-full transition">
              <X class="w-6 h-6 text-slate-400" />
            </button>
          </div>

          <div class="p-8">
            <div class="relative mb-6">
              <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                v-model="serviceSearch"
                type="text"
                placeholder="Search by test name (e.g. Blood Sugar)..."
                class="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all"
              />
            </div>

            <div class="max-h-100 overflow-y-auto pr-2 space-y-6 custom-scroll">
              <div v-for="(group, category) in filteredServiceGroups" :key="category">
                <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">{{ category }}</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label 
                    v-for="svc in group" 
                    :key="svc.id" 
                    class="flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer"
                    :class="selectedServices.some(s => s.id === svc.id) ? 'bg-teal-50 border-teal-200 ring-1 ring-teal-200' : 'bg-white border-slate-100 hover:border-teal-100'"
                  >
                    <input type="checkbox" :value="svc" v-model="selectedServices" class="hidden" />
                    <div :class="['w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all', selectedServices.some(s => s.id === svc.id) ? 'bg-teal-600 border-teal-600' : 'border-slate-200']">
                      <Check class="w-3 h-3 text-white" v-if="selectedServices.some(s => s.id === svc.id)" />
                    </div>
                    <span class="text-sm font-bold text-slate-900">{{ svc.serviceName }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button @click="closeServiceModal" class="px-8 py-4 text-sm font-black text-slate-500 hover:text-slate-950 transition">Cancel</button>
            <button @click="closeServiceModal" class="px-10 py-4 bg-slate-950 text-white text-sm font-black rounded-2xl hover:bg-slate-800 transition shadow-lg shadow-slate-900/20">
              Done ({{ selectedServices.length }})
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="showAllModal" class="fixed inset-0 z-100 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="closeAllModal"></div>
        <div class="relative bg-white max-w-lg w-full rounded-[40px] shadow-2xl border border-slate-100 animate-fade-in overflow-hidden">
          <div class="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 class="text-2xl font-black text-slate-950">Appointment History</h3>
            <button @click="closeAllModal" class="text-slate-400 hover:text-red-500 transition font-bold text-sm">Close</button>
          </div>
          <div class="p-8 max-h-125 overflow-y-auto space-y-3 custom-scroll">
            <div v-for="appt in appointments" :key="appt.id" class="bg-slate-50 p-5 rounded-3xl border border-slate-100">
              <div class="flex justify-between items-center mb-3">
                <span class="text-xs font-mono text-slate-500">{{ appt.date }}</span>
                <span :class="['px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter', statusColor(appt.status)]">
                  {{ appt.status }}
                </span>
              </div>
              <p class="text-sm font-bold text-slate-900 leading-snug">
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
import { ref, onMounted, computed } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase'

import UserLayout from '@/components/UserLayout.vue'
import { 
  Calendar, List, X, Plus, Clock, CheckCircle, 
  CalendarX, Search, Check, RefreshCw, AlertCircle 
} from 'lucide-vue-next'

import { useNotifications } from '@/composables/useNotifications'

const loading = ref(true)
const submitLoading = ref(false)
const form = ref({ date: '', notes: '' })
const appointments = ref([])
const userEmail = ref('')
const selectedServices = ref([])
const showServiceModal = ref(false)
const showAllModal = ref(false)
const serviceSearch = ref('')
const allServices = ref([])

const { success, error: notifyError } = useNotifications();
const today = new Date().toISOString().split('T')[0]

const fetchAppointments = async () => {
  if (!userEmail.value) return
  const q = query(collection(db, 'appointments'), where('email', '==', userEmail.value))
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
    await addDoc(collection(db, 'appointments'), {
      services: selectedServices.value,
      date: form.value.date,
      notes: form.value.notes,
      email: userEmail.value,
      status: 'Pending',
      createdAt: Timestamp.now(),
    })
    form.value = { date: '', notes: '' }
    selectedServices.value = []
    await fetchAppointments()
    success("Appointment successfully booked!")
  } catch (e) {
    notifyError("Server error. Please try again.")
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

onMounted(() => {
  onAuthStateChanged(getAuth(), async (user) => {
    if (user) {
      userEmail.value = user.email
      await Promise.all([fetchAppointments(), fetchServices()])
      loading.value = false
    }
  })
})
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