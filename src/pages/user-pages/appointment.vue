<template>
  <div class="flex min-h-screen bg-gray-100 text-gray-800 overflow-hidden">
    <!-- Sidebar -->
    <div class="w-64 h-screen sticky top-0 border-r border-gray-300 z-20">
      <Sidebar />
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col max-h-screen overflow-hidden">
      <!-- Topbar -->
      <div class="sticky top-0 z-10 bg-white border-b border-gray-300 shadow-sm">
        <Topbar />
      </div>

      <!-- Page Body -->
      <main class="flex-1 overflow-y-auto p-6 space-y-6">
        <h1 class="text-xl font-bold text-green-700">Book an Appointment</h1>

        <form @submit.prevent="submitAppointment" class="bg-white p-6 rounded-lg shadow space-y-4">
          <!-- Selected Services -->
          <div>
            <label class="block mb-1 font-semibold text-gray-700">Selected Services</label>
            <div class="text-sm text-gray-700 italic">
              {{ selectedServices.length ? selectedServices.map(s => s.serviceName).join(', ') : 'None selected' }}
            </div>
            <button type="button" class="mt-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700" @click="openServiceModal">
              Choose Services
            </button>
          </div>

          <!-- Preferred Date -->
          <div>
            <label class="block mb-1 font-semibold text-gray-700">Preferred Date</label>
            <div class="relative">
              <input
                type="date"
                v-model="form.date"
                class="w-full p-2 border rounded text-gray-800 bg-white focus:ring-2 focus:ring-green-500"
                :min="today"
                required
              />
              <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 7V3m8 4V3m-9 4h10M5 11h14M5 15h14M5 19h14" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Additional Notes -->
          <div>
            <label class="block mb-1 font-semibold text-gray-700">Additional Notes</label>
            <textarea v-model="form.notes" rows="3"
              class="w-full p-2 border rounded text-gray-800 bg-white"
            ></textarea>
          </div>

          <!-- Submit -->
          <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Submit Appointment
          </button>
        </form>

        <!-- Appointment List -->
        <div v-if="appointments.length" class="mt-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-2">Your Appointments</h2>
          <ul class="space-y-2">
            <li v-for="appt in appointments" :key="appt.id"
              class="bg-white p-4 rounded shadow border border-gray-200 text-gray-700"
            >
              <p><strong>Services:</strong> {{ appt.services.map(s => s.serviceName).join(', ') }}</p>
              <p><strong>Date:</strong> {{ appt.date }}</p>
              <p>
                <strong>Status:</strong>
                <span :class="[
                  'font-semibold',
                  appt.status === 'Pending' ? 'text-yellow-600' :
                  appt.status === 'Approved' ? 'text-green-600' :
                  'text-red-600',
                ]">
                  {{ appt.status }}
                </span>
              </p>
              <p v-if="appt.approvedAt" class="text-sm text-gray-600 mt-1">
                <strong>Approved At:</strong> {{ formatTimestamp(appt.approvedAt) }}
              </p>
              <p v-if="appt.declinedAt" class="text-sm text-gray-600 mt-1">
                <strong>Declined At:</strong> {{ formatTimestamp(appt.declinedAt) }}
              </p>
            </li>
          </ul>
        </div>
        <div v-else class="text-gray-500 text-sm text-center">No appointments yet.</div>
      </main>
    </div>

    <!-- Choose Services Modal -->
    <div v-if="showServiceModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- blur backdrop -->
      <div class="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

      <div class="relative bg-white max-w-2xl w-full rounded-xl shadow p-6 z-10">
        <h3 class="text-lg font-bold mb-4 text-gray-800">Select Services</h3>

        <input v-model="serviceSearch" type="text" placeholder="Search service..."
          class="w-full px-3 py-2 mb-4 border border-gray-300 rounded text-sm"
        />

        <div class="max-h-[320px] overflow-y-auto space-y-4 pr-1">
          <div v-for="(group, category) in filteredServiceGroups" :key="category" class="space-y-1">
            <h4 class="text-sm font-semibold text-gray-600">{{ category }}</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label v-for="svc in group" :key="svc.id" class="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" :value="svc" v-model="selectedServices" />
                {{ svc.serviceName }}
              </label>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <button @click="closeServiceModal" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">Cancel</button>
          <button @click="closeServiceModal" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Done</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/firebase';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import Sidebar from '@/components/Sidebar.vue';
import Topbar from '@/components/Topbar.vue';

const form = ref({ date: '', notes: '' });
const appointments = ref([]);
const userEmail = ref('');
const selectedServices = ref([]);
const showServiceModal = ref(false);
const serviceSearch = ref('');
const allServices = ref([]);

// Today's date for min attr
const today = new Date().toISOString().split('T')[0];

// Fetch user appointments
const fetchAppointments = async () => {
  if (!userEmail.value) return;
  const q = query(collection(db, 'appointments'), where('email', '==', userEmail.value));
  const snap = await getDocs(q);
  appointments.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// Fetch all services
const fetchServices = async () => {
  const snap = await getDocs(collection(db, 'services'));
  allServices.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

const openServiceModal = () => showServiceModal.value = true;
const closeServiceModal = () => showServiceModal.value = false;

const filteredServiceGroups = computed(() => {
  const term = serviceSearch.value.toLowerCase();
  return allServices.value
    .filter(s => s.serviceName.toLowerCase().includes(term))
    .reduce((acc, svc) => {
      const cat = svc.category || 'Others';
      (acc[cat] ||= []).push(svc);
      return acc;
    }, {});
});

const submitAppointment = async () => {
  if (!form.value.date || selectedServices.value.length === 0) {
    return alert('Please select services and a date.');
  }
  try {
    await addDoc(collection(db, 'appointments'), {
      services: selectedServices.value,
      date: form.value.date,
      notes: form.value.notes,
      email: userEmail.value,
      status: 'Pending',
      createdAt: Timestamp.now(),
    });
    alert('Appointment submitted!');
    form.value = { date: '', notes: '' };
    selectedServices.value = [];
    fetchAppointments();
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

const formatTimestamp = (ts) => {
  if (!ts?.toDate) return '';
  const d = ts.toDate();
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  onAuthStateChanged(getAuth(), (user) => {
    if (user) {
      userEmail.value = user.email;
      fetchAppointments();
      fetchServices();
    }
  });
});
</script>
