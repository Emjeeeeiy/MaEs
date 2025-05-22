<template>
  <div class="flex min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main Content -->
    <div class="flex-1 p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Manage Services</h1>
        <button
          @click="showModal = true"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Service
        </button>
      </div>

      <!-- Search -->
      <div class="mb-4 max-w-md">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search services..."
          class="w-full border rounded px-3 py-2 text-gray-800 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <!-- Service Table -->
      <div class="overflow-auto shadow rounded border border-gray-200 bg-white">
        <table class="min-w-full text-sm text-left text-gray-700">
          <thead class="bg-gray-100 text-xs uppercase text-gray-600">
            <tr>
              <th class="px-6 py-3">Service Name</th>
              <th class="px-6 py-3">Category</th>
              <th class="px-6 py-3">Description</th>
              <th class="px-6 py-3">Cost (₱)</th>
              <th class="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="service in filteredServices"
              :key="service.id"
              class="border-t hover:bg-gray-50"
            >
              <td class="px-6 py-4 font-medium text-gray-900">{{ service.serviceName }}</td>
              <td class="px-6 py-4">{{ service.category }}</td>
              <td class="px-6 py-4">{{ service.description }}</td>
              <td class="px-6 py-4">₱{{ service.cost }}</td>
              <td class="px-6 py-4 space-x-2">
                <button
                  @click="openEditModal(service)"
                  class="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  @click="deleteService(service.id)"
                  class="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm"
    >
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl relative">
        <h2 class="text-xl font-bold mb-4">
          {{ isEditing ? 'Edit Service' : 'Add New Service' }}
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            v-model="form.serviceName"
            type="text"
            placeholder="Service Name"
            class="border p-2 rounded w-full text-gray-800"
          />
          <input
            v-model="form.category"
            type="text"
            placeholder="Category"
            class="border p-2 rounded w-full text-gray-800"
          />
          <input
            v-model="form.cost"
            type="number"
            placeholder="Cost"
            class="border p-2 rounded w-full text-gray-800"
          />
          <input
            v-model="form.description"
            type="text"
            placeholder="Description"
            class="border p-2 rounded w-full text-gray-800"
          />
        </div>

        <div class="mt-6 flex justify-end space-x-2">
          <button
            @click="isEditing ? updateService() : addService()"
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {{ isEditing ? 'Update' : 'Add' }} Service
          </button>
          <button
            @click="closeModal"
            class="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import AdminSidebar from '@/components/admin_sidebar.vue';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '@/firebase';

// State
const services = ref([]);
const searchTerm = ref('');
const showModal = ref(false);
const isEditing = ref(false);
const editId = ref(null);

const form = ref({
  serviceName: '',
  description: '',
  category: '',
  cost: null,
});

// Fetch services
const fetchServices = async () => {
  const snapshot = await getDocs(collection(db, 'services'));
  services.value = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Filtered services
const filteredServices = computed(() => {
  const term = searchTerm.value.trim().toLowerCase();
  if (!term) return services.value;

  return services.value.filter((s) => {
    const name = s.serviceName?.toLowerCase() || '';
    const category = s.category?.toLowerCase() || '';
    const description = s.description?.toLowerCase() || '';
    return (
      name.includes(term) ||
      category.includes(term) ||
      description.includes(term)
    );
  });
});

// Add new service
const addService = async () => {
  if (!form.value.serviceName || !form.value.category || !form.value.cost) {
    alert('Please fill out all required fields.');
    return;
  }
  await addDoc(collection(db, 'services'), form.value);
  closeModal();
  fetchServices();
};

// Edit
const openEditModal = (service) => {
  form.value = {
    serviceName: service.serviceName,
    description: service.description,
    category: service.category,
    cost: service.cost,
  };
  editId.value = service.id;
  isEditing.value = true;
  showModal.value = true;
};

// Update
const updateService = async () => {
  if (!editId.value) return;
  const serviceRef = doc(db, 'services', editId.value);
  await updateDoc(serviceRef, form.value);
  closeModal();
  fetchServices();
};

// Delete
const deleteService = async (id) => {
  if (confirm('Are you sure you want to delete this service?')) {
    await deleteDoc(doc(db, 'services', id));
    fetchServices();
  }
};

// Close and reset modal
const closeModal = () => {
  showModal.value = false;
  isEditing.value = false;
  editId.value = null;
  form.value = {
    serviceName: '',
    description: '',
    category: '',
    cost: null,
  };
};

onMounted(fetchServices);
</script>
