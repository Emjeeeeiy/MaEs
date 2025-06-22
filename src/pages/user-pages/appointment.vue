<template>
  <div class="flex min-h-screen bg-gray-100 text-gray-800">
    <Sidebar />
    <div class="flex-1 flex flex-col">
      <Topbar />
      <main class="p-4 space-y-6 max-w-4xl mx-auto w-full">
        <h1 class="text-xl font-bold text-gray-800">Book an Appointment</h1>

        <!-- Appointment Form -->
        <form @submit.prevent="submitAppointment" class="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <label class="block mb-1 font-semibold text-gray-700">Department</label>
            <select v-model="form.department" required class="w-full p-2 border rounded text-gray-800 bg-white">
              <option disabled value="">Select department</option>
              <option>General Consultation</option>
              <option>Radiology</option>
              <option>Laboratory</option>
              <option>Cardiology</option>
            </select>
          </div>

          <div>
            <label class="block mb-1 font-semibold text-gray-700">Preferred Date</label>
            <input
              type="date"
              v-model="form.date"
              required
              class="w-full p-2 border rounded text-gray-800 bg-white"
            />
          </div>

          <div>
            <label class="block mb-1 font-semibold text-gray-700">Additional Notes</label>
            <textarea
              v-model="form.notes"
              class="w-full p-2 border rounded text-gray-800 bg-white"
              rows="3"
            ></textarea>
          </div>

          <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Submit
          </button>
        </form>

        <!-- Appointment List -->
        <div v-if="appointments.length" class="mt-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-2">Your Appointments</h2>
          <ul class="space-y-2">
            <li
              v-for="appt in appointments"
              :key="appt.id"
              class="bg-white p-4 rounded shadow border border-gray-200 text-gray-700"
            >
              <p><strong>Department:</strong> {{ appt.department }}</p>
              <p><strong>Date:</strong> {{ appt.date }}</p>
              <p>
                <strong>Status:</strong>
                <span
                  :class="[
                    'font-semibold',
                    appt.status === 'Pending' ? 'text-yellow-600' :
                    appt.status === 'Approved' ? 'text-green-600' :
                    'text-red-600'
                  ]"
                >
                  {{ appt.status }}
                </span>
              </p>
            </li>
          </ul>
        </div>

        <div v-else class="text-gray-500 text-sm text-center">No appointments yet.</div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/firebase';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import Sidebar from '@/components/Sidebar.vue';
import Topbar from '@/components/Topbar.vue';

const form = ref({ department: '', date: '', notes: '' });
const appointments = ref([]);
const userEmail = ref('');

const submitAppointment = async () => {
  try {
    await addDoc(collection(db, 'appointments'), {
      ...form.value,
      email: userEmail.value,
      status: 'Pending',
      createdAt: Timestamp.now(),
    });
    alert('Appointment submitted');
    form.value = { department: '', date: '', notes: '' };
    fetchAppointments();
  } catch (err) {
    alert('Error booking appointment: ' + err.message);
  }
};

const fetchAppointments = async () => {
  const q = query(collection(db, 'appointments'), where('email', '==', userEmail.value));
  const snap = await getDocs(q);
  appointments.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

onMounted(() => {
  onAuthStateChanged(getAuth(), (user) => {
    if (user) {
      userEmail.value = user.email;
      fetchAppointments();
    }
  });
});
</script>
