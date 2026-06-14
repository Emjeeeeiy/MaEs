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
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">Schedule Visit</h1>
          <p class="text-sm text-slate-500 mt-1">Book your laboratory appointments with ease.</p>
        </div>
        <div v-if="appointments.length" class="flex items-center gap-2 bg-teal-50 px-4 py-2 rounded-2xl border border-teal-100">
          <div class="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
          <span class="text-[11px] font-bold text-teal-700 uppercase tracking-wider">{{ appointments.length }} Total Bookings</span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        <div class="lg:col-span-7 space-y-6">
          <form @submit.prevent="submitAppointment" class="space-y-6">
            
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
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

            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
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
                  class="text-[10px] font-bold text-teal-600 uppercase tracking-widest hover:text-teal-700 flex items-center gap-1"
                >
                  <Plus class="w-3 h-3" />
                  Browse All
                </button>
              </div>

              <div v-if="selectedServices.length" class="space-y-3">
                <div 
                  v-for="s in selectedServices" 
                  :key="s.id"
                  class="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between group hover:border-teal-200 transition-all"
                >
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-slate-900">{{ s.serviceName }}</span>
                    <span class="text-[10px] text-slate-500 uppercase font-medium tracking-wide">{{ s.category }}</span>
                    <div v-if="s.specialInstructions" class="mt-1 flex items-center gap-1.5 text-amber-600 bg-amber-50 w-fit px-2 py-0.5 rounded-md border border-amber-100">
                      <AlertCircle class="w-3 h-3" />
                      <span class="text-[9px] font-bold">{{ s.specialInstructions }}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-4">
                    <span class="text-sm font-bold text-teal-600">₱{{ s.amount || 0 }}</span>
                    <button @click.stop="removeService(s.id)" class="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition">
                      <X class="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div class="pt-4 border-t border-dashed border-slate-200 flex justify-between items-center">
                  <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">Estimated Total</span>
                  <span class="text-xl font-black text-slate-900">₱{{ totalAmount }}</span>
                </div>
              </div>
              <div v-else @click="openServiceModal" class="py-12 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-teal-300 transition-all group">
                <div class="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-teal-50 transition-colors">
                  <Plus class="w-6 h-6 text-slate-300 group-hover:text-teal-500" />
                </div>
                <span class="text-xs font-bold text-slate-400 group-hover:text-teal-600">Click to add services</span>
              </div>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-amber-500 text-white rounded-lg shadow-sm">
                  <MessageSquare class="w-4 h-4" />
                </div>
                <h3 class="text-sm font-bold text-slate-900">Additional Notes</h3>
              </div>
              <textarea
                v-model="form.notes"
                rows="3"
                placeholder="Any specific requests or medical concerns we should know about?"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              :disabled="submitLoading || !selectedServices.length || !form.date"
              class="w-full py-5 bg-slate-900 hover:bg-teal-600 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold rounded-2xl transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 text-base group"
            >
              <RefreshCw v-if="submitLoading" class="w-5 h-5 animate-spin" />
              <template v-else>
                <span>Book Appointment</span>
                <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </template>
            </button>
          </form>
        </div>

        <div class="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
          <div class="bg-slate-900 rounded-4xl p-8 text-white shadow-2xl relative overflow-hidden">
            <div class="absolute -top-10 -right-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl"></div>
            <div class="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl"></div>
            
            <div class="relative z-10">
              <div class="flex justify-between items-center mb-10">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center border border-teal-500/20">
                    <Clock class="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <h2 class="text-lg font-bold">Today's Visit</h2>
                    <p class="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{{ today }}</p>
                  </div>
                </div>
                <button @click="openAllModal" class="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold uppercase tracking-widest text-slate-300 hover:bg-white/10 hover:text-white transition">History</button>
              </div>

              <div v-if="todayAppointment" class="space-y-6">
                <div class="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
                  <div class="flex justify-between items-start mb-6">
                    <span :class="['px-3 py-1 rounded-full text-[9px] font-bold uppercase border', 
                      todayAppointment.status === 'Approved' ? 'bg-teal-500/20 text-teal-400 border-teal-500/20' : 
                      todayAppointment.status === 'Pending' ? 'bg-amber-500/20 text-amber-400 border-amber-500/20' : 
                      'bg-rose-500/20 text-rose-400 border-rose-500/20']">
                      {{ todayAppointment.status }}
                    </span>
                    <span class="text-lg font-black text-white">₱{{ todayAppointmentTotal }}</span>
                  </div>
                  
                  <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Booked Services</h4>
                  <ul class="space-y-3 mb-6">
                    <li v-for="s in todayAppointment.services" :key="s.id" class="flex flex-col">
                      <div class="text-sm font-bold flex items-center gap-2">
                        <div class="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                        {{ s.serviceName }}
                      </div>
                      <span v-if="s.specialInstructions" class="text-[9px] text-amber-400 font-bold ml-3.5 mt-0.5">Note: {{ s.specialInstructions }}</span>
                    </li>
                  </ul>

                  <div v-if="todayAppointment.approvedAt" class="flex items-center gap-3 text-[11px] text-teal-400 font-bold bg-teal-500/10 p-4 rounded-2xl border border-teal-500/10">
                    <CheckCircle class="w-4 h-4" />
                    Confirmed at {{ formatTimestamp(todayAppointment.approvedAt) }}
                  </div>

                  <div v-if="todayAppointment.notes" class="mt-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Your Note</span>
                    <p class="text-xs text-slate-300 leading-relaxed italic">"{{ todayAppointment.notes }}"</p>
                  </div>
                </div>

                <div class="text-center p-4 bg-teal-500/5 rounded-2xl border border-teal-500/10">
                  <p class="text-[10px] font-bold text-teal-500/80 uppercase tracking-widest">Important Reminder</p>
                  <p class="text-[11px] text-slate-400 mt-1">Please arrive at least 15 minutes before your preferred time.</p>
                </div>
              </div>

              <div v-else class="py-20 text-center space-y-4">
                <div class="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto border border-white/5">
                  <CalendarX class="w-8 h-8 text-slate-700" />
                </div>
                <div>
                  <p class="text-sm font-bold text-slate-400">No appointments for today.</p>
                  <p class="text-[10px] text-slate-600 mt-1 uppercase font-bold tracking-tighter">Choose a date to get started</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>


    <Transition name="fade">
      <div v-if="showServiceModal" class="fixed inset-0 z-100 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="closeServiceModal"></div>
        <div class="relative bg-white max-w-3xl w-full rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-fade-in">
          <div class="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 class="text-2xl font-black text-slate-900">Select Services</h3>
              <p class="text-xs text-slate-500 mt-1">Choose the laboratory tests you need.</p>
            </div>
            <button @click="closeServiceModal" class="p-3 hover:bg-white text-slate-400 hover:text-slate-900 rounded-2xl transition shadow-sm border border-transparent hover:border-slate-100">
              <X class="w-6 h-6" />
            </button>
          </div>

          <div class="p-8">
            <div class="relative mb-8">
              <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                v-model="serviceSearch"
                type="text"
                placeholder="Search tests (e.g. Blood, Urine, etc.)..."
                class="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 outline-none transition-all shadow-sm"
              />
            </div>

            <div class="max-h-112 overflow-y-auto pr-4 space-y-8 custom-scroll">
              <div v-for="(group, category) in filteredServiceGroups" :key="category">
                <div class="flex items-center gap-4 mb-4 ml-1">
                  <h4 class="text-xs font-black text-slate-900 uppercase tracking-[0.2em] whitespace-nowrap">{{ category }}</h4>
                  <div class="h-px bg-slate-100 w-full"></div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label 
                    v-for="svc in group" 
                    :key="svc.id" 
                    class="group relative flex flex-col p-4 rounded-2xl border transition-all cursor-pointer"
                    :class="selectedServices.some(s => s.id === svc.id) ? 'bg-teal-50 border-teal-200 ring-2 ring-teal-500/10' : 'bg-white border-slate-100 hover:border-teal-100 hover:bg-slate-50/50'"
                  >
                    <input type="checkbox" :value="svc" v-model="selectedServices" class="hidden" />
                    <div class="flex justify-between items-start mb-2">
                      <div :class="['w-5 h-5 rounded-lg border flex items-center justify-center transition-all', selectedServices.some(s => s.id === svc.id) ? 'bg-teal-600 border-teal-600 shadow-lg shadow-teal-500/20' : 'border-slate-200 bg-white group-hover:border-teal-300']">
                        <Check class="w-3.5 h-3.5 text-white" v-if="selectedServices.some(s => s.id === svc.id)" />
                      </div>
                      <span class="text-sm font-black text-slate-900">₱{{ svc.amount || 0 }}</span>
                    </div>
                    <span class="text-xs font-bold text-slate-700 leading-tight pr-4">{{ svc.serviceName }}</span>
                    <div v-if="svc.specialInstructions" class="mt-2 flex items-center gap-1.5 text-amber-600">
                      <AlertCircle class="w-3 h-3" />
                      <span class="text-[9px] font-bold uppercase tracking-tighter">{{ svc.specialInstructions }}</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected Items</span>
              <span class="text-lg font-black text-slate-900">{{ selectedServices.length }} Services</span>
            </div>
            <div class="flex gap-4">
              <button @click="closeServiceModal" class="px-8 py-4 text-sm font-bold text-slate-500 hover:text-slate-900 transition">Cancel</button>
              <button @click="closeServiceModal" class="px-10 py-4 bg-slate-900 text-white text-sm font-bold rounded-2xl hover:bg-teal-600 transition shadow-lg shadow-slate-900/10">
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="showAllModal" class="fixed inset-0 z-100 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="closeAllModal"></div>
        <div class="relative bg-white max-w-2xl w-full rounded-[2.5rem] shadow-2xl border border-slate-100 animate-fade-in overflow-hidden">
          <div class="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 class="text-2xl font-black text-slate-900">Appointment History</h3>
              <p class="text-xs text-slate-500 mt-1">Overview of your laboratory visits.</p>
            </div>
            <button @click="closeAllModal" class="text-slate-400 hover:text-red-500 transition-colors">
              <X class="w-6 h-6" />
            </button>
          </div>
          <div class="p-8 max-h-128 overflow-y-auto space-y-4 custom-scroll">
            <div v-if="!appointments.length" class="text-center py-20">
              <div class="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Inbox class="w-8 h-8 text-slate-200" />
              </div>
              <p class="text-sm font-bold text-slate-400">No booking history found.</p>
            </div>
            <div v-for="appt in appointments" :key="appt.id" class="group bg-white p-6 rounded-3xl border border-slate-100 hover:border-teal-100 transition-all hover:shadow-xl hover:shadow-slate-200/50">
              <div class="flex justify-between items-start mb-6">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-teal-50 group-hover:border-teal-100 transition-colors">
                    <Calendar class="w-5 h-5 text-slate-400 group-hover:text-teal-500" />
                  </div>
                  <div>
                    <span class="text-xs font-black text-slate-900 block">{{ appt.date }}</span>
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Booked on {{ formatFullDate(appt.createdAt) }}</span>
                  </div>
                </div>
                <span :class="['px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border', statusColor(appt.status)]">
                  {{ appt.status }}
                </span>
              </div>
              
              <div class="space-y-4">
                <div class="flex flex-wrap gap-2">
                  <span v-for="s in appt.services" :key="s.id" class="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-600 rounded-lg border border-slate-100">
                    {{ s.serviceName }}
                  </span>
                </div>
                
                <div class="flex justify-between items-center pt-4 border-t border-slate-50">
                  <div class="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                    <span class="flex items-center gap-1.5"><Tag class="w-3 h-3" /> {{ appt.services.length }} Items</span>
                    <span v-if="appt.approvedAt" class="flex items-center gap-1.5 text-teal-600"><CheckCircle class="w-3 h-3" /> Approved</span>
                  </div>
                  <span class="text-base font-black text-slate-900">₱{{ calculateTotal(appt.services) }}</span>
                </div>

                <div v-if="appt.notes" class="p-3 bg-slate-50/50 rounded-xl border border-slate-50">
                  <p class="text-[10px] text-slate-500 italic leading-relaxed">"{{ appt.notes }}"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </UserLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { collection, addDoc, query, where, onSnapshot, getDocs, Timestamp, writeBatch, doc } from 'firebase/firestore'
import { db } from '@/firebase'

import UserLayout from '@/components/UserLayout.vue'
import { 
  Calendar, List, X, Plus, Clock, CheckCircle, 
  CalendarX, Search, Check, RefreshCw, AlertCircle,
  MessageSquare, ArrowRight, Tag, Inbox
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
let unsubscribeAppointments = null

const { success, error: notifyError } = useNotifications();

const getLocalDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const today = ref(getLocalDate());

const fetchAppointments = () => {
  if (!user.value?.email) return
  
  if (unsubscribeAppointments) unsubscribeAppointments()

  // Support both original and lowercase email to handle historical data
  const email = user.value.email
  const emailLower = email.toLowerCase().trim()
  const emailVariants = [...new Set([email, emailLower])]
  
  const q = query(
    collection(db, 'appointments'), 
    where('email', 'in', emailVariants)
  )

  unsubscribeAppointments = onSnapshot(q, (snap) => {
    appointments.value = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
    dataLoading.value = false
  }, (err) => {
    console.error("Fetch error:", err)
    dataLoading.value = false
  })
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

const todayAppointment = computed(() => appointments.value.find(a => a.date === today.value))

const totalAmount = computed(() => {
  return selectedServices.value.reduce((acc, s) => acc + (s.amount || 0), 0)
})

const todayAppointmentTotal = computed(() => {
  if (!todayAppointment.value) return 0
  return todayAppointment.value.services.reduce((acc, s) => acc + (s.amount || 0), 0)
})

const calculateTotal = (services) => {
  return services.reduce((acc, s) => acc + (s.amount || 0), 0)
}

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
      email: user.value.email.toLowerCase().trim(),
      uid: user.value.uid,
      status: 'Pending',
      createdAt: now,
    })

    batch.update(userRef, {
      lastAppointmentAt: now
    })

    await batch.commit()

    form.value = { date: '', notes: '' }
    selectedServices.value = []
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

const formatFullDate = (ts) => {
  if (!ts?.toDate) return ''
  const d = ts.toDate()
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

const statusColor = (status) => {
  if (status === 'Pending') return 'bg-amber-100 text-amber-700 border-amber-200'
  if (status === 'Approved') return 'bg-teal-100 text-teal-700 border-teal-200'
  return 'bg-rose-100 text-rose-700 border-rose-200'
}

const initData = async () => {
  if (user.value) {
    fetchAppointments()
    await fetchServices()
  }
}

onMounted(() => {
  initData()
  const interval = setInterval(() => {
    today.value = getLocalDate()
  }, 60000)
  
  onUnmounted(() => {
    clearInterval(interval)
    if (unsubscribeAppointments) unsubscribeAppointments()
  })
})

watch(user, (newUser) => {
  if (newUser) initData()
})
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar { width: 6px; }
.custom-scroll::-webkit-scrollbar-track { background: transparent; }
.custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
.custom-scroll::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }

.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px) } to { opacity:1; transform: translateY(0) } }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
