<template>
  <div class="flex flex-col h-screen overflow-hidden bg-gray-100 text-gray-800">
    <!-- ░░ Topbar (fixed height) ░░ -->
    <div class="flex-shrink-0 bg-white shadow-md z-10">
      <Topbar />
    </div>

    <!-- ░░ Content: Sidebar + Main Scrollable Content ░░ -->
    <div class="flex flex-1 min-h-0">
      <!-- ░░ Sidebar (fixed width) ░░ -->
      <div class="w-64 hidden sm:block border-r border-gray-200 bg-white flex-shrink-0">
        <Sidebar />
      </div>

      <!-- ░░ Main Scrollable Content ░░ -->
      <div class="flex-1 overflow-y-auto px-4 py-4 sm:py-6 space-y-6 animate-fade-in text-sm">
        <!-- ───────── LOADING STATE ───────── -->
        <div v-if="loading" class="flex items-center justify-center h-[60vh]">
          <loading_animation />
        </div>

        <!-- ───────── PAGE CONTENT ───────── -->
        <template v-else>
          <!-- ░░ Appointment Form ░░ -->
          <form
            @submit.prevent="submitAppointment"
            class="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 space-y-4"
          >
            <!-- Selected Services -->
            <div>
              <label class="block mb-1 font-medium text-gray-700">Selected Services</label>
              <p class="text-xs text-gray-600 italic">
                {{
                  selectedServices.length
                    ? selectedServices.map((s) => s.serviceName).join(', ')
                    : 'None selected'
                }}
              </p>
              <button
                type="button"
                class="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs transition"
                @click="openServiceModal"
              >
                Choose Services
              </button>
            </div>

            <!-- Preferred Date -->
            <div>
              <label class="block mb-1 font-medium text-gray-700">Preferred Date</label>
              <div class="relative">
                <input
                  type="date"
                  v-model="form.date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-blue-500 text-sm"
                  :min="today"
                  required
                />
                <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 4h10M5 11h14M5 15h14M5 19h14"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div>
              <label class="block mb-1 font-medium text-gray-700">Additional Notes</label>
              <textarea
                v-model="form.notes"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
              ></textarea>
            </div>

            <!-- Submit -->
            <div class="text-right">
              <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                Submit Appointment
              </button>
            </div>
          </form>

          <!-- ░░ Appointment List ░░ -->
          <div v-if="appointments.length" class="space-y-3">
            <h2 class="text-base font-semibold text-gray-800">Your Appointments</h2>
            <ul class="space-y-3">
              <li
                v-for="appt in appointments"
                :key="appt.id"
                class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
              >
                <p><strong>Services:</strong> {{ appt.services.map((s) => s.serviceName).join(', ') }}</p>
                <p><strong>Date:</strong> {{ appt.date }}</p>
                <p>
                  <strong>Status:</strong>
                  <span
                    :class="[
                      'font-semibold text-xs',
                      appt.status === 'Pending'
                        ? 'text-yellow-600'
                        : appt.status === 'Approved'
                        ? 'text-green-600'
                        : 'text-red-600',
                    ]"
                  >
                    {{ appt.status }}
                  </span>
                </p>
                <p v-if="appt.approvedAt" class="text-xs text-gray-500 mt-1">
                  <strong>Approved At:</strong> {{ formatTimestamp(appt.approvedAt) }}
                </p>
                <p v-if="appt.declinedAt" class="text-xs text-gray-500 mt-1">
                  <strong>Declined At:</strong> {{ formatTimestamp(appt.declinedAt) }}
                </p>
              </li>
            </ul>
          </div>
          <div v-else class="text-center text-sm text-gray-500">No appointments yet.</div>
        </template>
      </div>
    </div>

    <!-- ░░ Service Modal ░░ -->
    <div v-if="showServiceModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      <div class="relative bg-white max-w-2xl w-full mx-4 rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 z-10 space-y-4">
        <h3 class="text-base font-bold text-gray-800">Select Services</h3>
        <input
          v-model="serviceSearch"
          type="text"
          placeholder="Search service..."
          class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
        />
        <div class="max-h-[300px] overflow-y-auto pr-1 space-y-4">
          <div v-for="(group, category) in filteredServiceGroups" :key="category" class="space-y-1">
            <h4 class="text-sm font-semibold text-gray-600">{{ category }}</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label
                v-for="svc in group"
                :key="svc.id"
                class="flex items-center gap-2 text-sm text-gray-700"
              >
                <input type="checkbox" :value="svc" v-model="selectedServices" />
                {{ svc.serviceName }}
              </label>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button @click="closeServiceModal" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">Cancel</button>
          <button @click="closeServiceModal" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">Done</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/firebase'

import Sidebar from '@/components/Sidebar.vue'
import Topbar from '@/components/Topbar.vue'
import loading_animation from '@/components/loading_animation.vue'

const loading = ref(true)

const form = ref({ date: '', notes: '' })
const appointments = ref([])
const userEmail = ref('')

const selectedServices = ref([])
const showServiceModal = ref(false)
const serviceSearch = ref('')
const allServices = ref([])

const showSuccessModal = ref(false)
const errorMessage = ref('')

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
      const cat = svc.category || 'Others'
      ;(acc[cat] ||= []).push(svc)
      return acc
    }, {})
})

const openServiceModal = () => (showServiceModal.value = true)
const closeServiceModal = () => (showServiceModal.value = false)

const submitAppointment = async () => {
  if (!form.value.date || selectedServices.value.length === 0) {
    errorMessage.value = 'Please select services and a preferred date.'
    return
  }
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
    showSuccessModal.value = true
  } catch (err) {
    errorMessage.value = 'Error submitting appointment: ' + err.message
  }
}

const formatTimestamp = (ts) => {
  if (!ts?.toDate) return ''
  const d = ts.toDate()
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
