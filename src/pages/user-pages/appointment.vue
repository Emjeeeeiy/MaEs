<template>
  <div class="flex flex-col h-screen overflow-hidden bg-gray-50 text-gray-800">

    <!-- Topbar -->
    <div
      class="flex-shrink-0 z-20 transition-all duration-300"
      :class="{
        'backdrop-blur-sm bg-white/60': isMobileSidebarOpen,
        'bg-white shadow': !isMobileSidebarOpen
      }"
    >
      <Topbar @toggle-sidebar="isMobileSidebarOpen = !isMobileSidebarOpen" />
    </div>

    <div class="flex flex-1 min-h-0">

      <!-- Sidebar -->
      <Sidebar
        :isMobileSidebarOpen="isMobileSidebarOpen"
        @close-sidebar="isMobileSidebarOpen = false"
      />

      <!-- Overlay -->
      <div
        v-if="isMobileSidebarOpen"
        class="fixed inset-0 bg-black/30 z-10 sm:hidden"
        @click="isMobileSidebarOpen = false"
      ></div>

      <!-- MAIN CONTENT -->
      <main class="flex-1 overflow-y-auto px-3 py-3 pb-24 space-y-4 transition-all duration-300"
            :class="{ 'blur-sm': isMobileSidebarOpen }">

        <!-- LOADING -->
        <div v-if="loading" class="flex items-center justify-center h-[60vh]">
          <loading_animation />
        </div>

        <template v-else>

          <!-- APPOINTMENT FORM (Compact Card) -->
          <form
            @submit.prevent="submitAppointment"
            class="bg-white p-3 rounded-lg shadow-sm border border-gray-200 space-y-3 animate-fade-in"
          >
            <h2 class="text-sm font-semibold text-gray-800 flex items-center gap-1">
              <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM2 9v7a2 2 0 002 2h12a2 2 0 002-2V9H2z" />
              </svg>
              Book Appointment
            </h2>

            <!-- Services -->
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-0.5">Services</label>
              <p class="text-[10px] text-gray-500 truncate">
                {{ selectedServices.length ? selectedServices.map(s=>s.serviceName).join(', ') : 'None selected' }}
              </p>
              <button
                type="button"
                @click="openServiceModal"
                class="mt-1 px-2 py-1 bg-blue-600 text-white rounded-full text-xs font-medium"
              >
                Choose Services
              </button>
            </div>

            <!-- Date -->
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-0.5">Preferred Date</label>
              <input
                type="date"
                v-model="form.date"
                :min="today"
                required
                class="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-0.5">Notes</label>
              <textarea
                v-model="form.notes"
                rows="2"
                class="w-full px-2 py-1 border border-gray-300 rounded text-xs resize-none"
              ></textarea>
            </div>

            <!-- Submit -->
            <div class="text-right">
              <button
                type="submit"
                :disabled="submitLoading"
                class="bg-blue-600 text-white px-4 py-1.5 rounded text-xs font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ml-auto"
              >
                <span v-if="!submitLoading">Submit</span>
                <span v-else class="flex items-center gap-1">
                  <svg class="animate-spin h-3 w-3" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="white" stroke-width="3"></circle>
                    <path class="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  Processing...
                </span>
              </button>
            </div>
          </form>

          <!-- TODAY'S APPOINTMENT (Compact Card) -->
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <h2 class="text-sm font-semibold text-gray-800">Today's Appointment</h2>
              <button
                v-if="appointments.length"
                @click="openAllModal"
                class="text-[10px] text-blue-600 underline font-medium"
              >
                View All
              </button>
            </div>

            <template v-if="todayAppointment">
              <div class="bg-white p-3 rounded-lg border border-gray-200 shadow-sm animate-fade-in">
                <p class="text-xs font-medium mb-0.5">
                  <strong>Services:</strong> {{ todayAppointment.services.map(s=>s.serviceName).join(', ') }}
                </p>
                <p class="text-xs font-medium">
                  <strong>Date:</strong> {{ todayAppointment.date }}
                </p>
                <p class="text-xs mt-0.5">
                  <strong>Status:</strong>
                  <span
                    :class="statusColor(todayAppointment.status)"
                    class="font-semibold px-1 py-0.5 rounded text-[10px]"
                  >
                    {{ todayAppointment.status }}
                  </span>
                </p>
                <p v-if="todayAppointment.approvedAt" class="text-[9px] text-gray-400 mt-0.5">
                  Approved: {{ formatTimestamp(todayAppointment.approvedAt) }}
                </p>
                <p v-if="todayAppointment.declinedAt" class="text-[9px] text-gray-400 mt-0.5">
                  Declined: {{ formatTimestamp(todayAppointment.declinedAt) }}
                </p>
              </div>
            </template>

            <div v-else class="text-center text-gray-500 text-xs py-3">
              No appointments for today.
            </div>
          </div>

        </template>
      </main>
    </div>

    <!-- SERVICE MODAL -->
    <div v-if="showServiceModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      <div class="relative bg-white max-w-md w-full mx-4 rounded-lg shadow border border-gray-200 p-4 space-y-3 animate-fade-in">
        <h3 class="text-sm font-bold text-gray-800">Select Services</h3>
        <input
          v-model="serviceSearch"
          type="text"
          placeholder="Search service..."
          class="w-full px-2 py-1 border border-gray-300 rounded text-xs"
        />
        <div class="max-h-60 overflow-y-auto space-y-2 pr-1">
          <div v-for="(group, category) in filteredServiceGroups" :key="category">
            <h4 class="text-[10px] font-semibold text-gray-600 mb-1">{{ category }}</h4>
            <div class="grid grid-cols-1 gap-1">
              <label v-for="svc in group" :key="svc.id" class="flex items-center gap-1 text-xs">
                <input type="checkbox" :value="svc" v-model="selectedServices" />
                {{ svc.serviceName }}
              </label>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-1">
          <button @click="closeServiceModal" class="px-3 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300">Cancel</button>
          <button @click="closeServiceModal" class="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">Done</button>
        </div>
      </div>
    </div>

    <!-- VIEW ALL APPOINTMENTS MODAL -->
    <div v-if="showAllModal" class="fixed inset-0 z-[9999] flex items-center justify-center">
      <div class="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      <div class="relative bg-white max-w-lg w-full mx-4 p-4 rounded-lg shadow border border-gray-200 space-y-3 animate-fade-in">
        <div class="flex justify-between items-center">
          <h3 class="text-sm font-bold text-gray-800">All Appointments</h3>
          <button @click="closeAllModal" class="text-gray-600 text-xs underline">Close</button>
        </div>
        <div class="max-h-80 overflow-y-auto space-y-2">
          <div v-for="appt in appointments" :key="appt.id" class="bg-gray-50 p-2 rounded border text-xs">
            <p><strong>Services:</strong> {{ appt.services.map(s=>s.serviceName).join(', ') }}</p>
            <p><strong>Date:</strong> {{ appt.date }}</p>
            <p>
              <strong>Status:</strong>
              <span :class="statusColor(appt.status)" class="font-semibold px-1 py-0.5 rounded text-[10px]">
                {{ appt.status }}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- GLOBAL TOAST -->
    <transition name="toast">
      <div
        v-if="toast.show"
        class="fixed top-4 right-4 z-[9999] px-3 py-2 rounded-lg shadow text-xs font-medium"
        :class="toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'"
      >
        {{ toast.message }}
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase'

import Sidebar from '@/components/Sidebar.vue'
import Topbar from '@/components/topbar.vue'
import loading_animation from '@/components/loading_animation.vue'

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
const isMobileSidebarOpen = ref(false)

const toast = ref({ show: false, message: "", type: "success" })
const today = new Date().toISOString().split('T')[0]

const showToast = (msg, type = "success") => {
  toast.value = { show: true, message: msg, type }
  setTimeout(() => (toast.value.show = false), 2500)
}

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
      const cat = svc.category || 'Others'
      ;(acc[cat] ||= []).push(svc)
      return acc
    }, {})
})

const todayAppointment = computed(() => appointments.value.find(a => a.date === today))

const openServiceModal = () => showServiceModal.value = true
const closeServiceModal = () => showServiceModal.value = false
const openAllModal = () => showAllModal.value = true
const closeAllModal = () => showAllModal.value = false

const submitAppointment = async () => {
  if (!form.value.date || selectedServices.value.length === 0) {
    showToast("Please complete the form", "error")
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
    showToast("Appointment submitted!", "success")
  } catch (e) {
    showToast("Something went wrong", "error")
  }
  submitLoading.value = false
}

const formatTimestamp = (ts) => {
  if (!ts?.toDate) return ''
  const d = ts.toDate()
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const statusColor = (status) => {
  if (status === 'Pending') return 'bg-yellow-100 text-yellow-700'
  if (status === 'Approved') return 'bg-green-100 text-green-700'
  return 'bg-red-100 text-red-700'
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
.animate-fade-in { animation: fadeIn 0.25s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px) } to { opacity:1; transform: translateY(0) } }

.toast-enter-active,
.toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from,
.toast-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
