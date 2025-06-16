<template>
  <div class="flex h-screen overflow-hidden bg-gray-50">
    <!-- Sidebar -->
    <div class="w-64 border-r border-gray-200 bg-white flex-shrink-0">
      <AdminSidebar />
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header with Buttons -->
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-6 bg-white shadow z-10">
        <h1 class="text-2xl font-bold text-gray-800">Manage Services</h1>

        <div class="flex flex-wrap gap-2">
          <button
            @click="showModal = true"
            class="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 4v16m8-8H4" />
            </svg>
            Add Service
          </button>

          <button
            @click="confirmDeleteAll"
            class="inline-flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 border border-red-300 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 6h18M9 6v12m6-12v12M4 6l1 14a2 2 0 002 2h10a2 2 0 002-2l1-14" />
            </svg>
            Delete All
          </button>
        </div>
      </div>

      <!-- Scrollable Content -->
      <div class="overflow-y-auto p-6 flex-1">
        <!-- Search Input -->
        <div class="max-w-md mb-4">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Search services..."
            class="w-full border rounded px-3 py-2 text-gray-800 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm text-left text-gray-700 bg-white border border-gray-200 shadow rounded">
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
                  <button @click="openEditModal(service)" class="text-blue-600 hover:underline">
                    Edit
                  </button>
                  <button @click="confirmDelete(service)" class="text-red-600 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl relative">
        <h2 class="text-xl font-bold mb-4">
          {{ isEditing ? 'Edit Service' : 'Add New Service' }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input v-model="form.serviceName" type="text" placeholder="Service Name"
            class="border p-2 rounded w-full text-gray-800" />
          <input v-model="form.category" type="text" placeholder="Category"
            class="border p-2 rounded w-full text-gray-800" />
          <input v-model="form.cost" type="number" placeholder="Cost"
            class="border p-2 rounded w-full text-gray-800" />
          <input v-model="form.description" type="text" placeholder="Description"
            class="border p-2 rounded w-full text-gray-800" />
        </div>
        <div class="mt-6 flex justify-end space-x-2">
          <button @click="isEditing ? updateService() : addService()"
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            {{ isEditing ? 'Update' : 'Add' }} Service
          </button>
          <button @click="closeModal"
            class="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4 text-red-600">Confirm Delete</h3>
        <p class="text-gray-700 mb-6">
          Are you sure you want to delete <strong>{{ serviceToDelete?.serviceName }}</strong>?
        </p>
        <div class="flex justify-end space-x-2">
          <button @click="performDelete" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Yes, Delete
          </button>
          <button @click="cancelDelete"
            class="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100">
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
  writeBatch
} from 'firebase/firestore';
import { db } from '@/firebase';

const services = ref([]);
const searchTerm = ref('');
const showModal = ref(false);
const isEditing = ref(false);
const editId = ref(null);
const showDeleteModal = ref(false);
const serviceToDelete = ref(null);

const form = ref({
  serviceName: '',
  description: '',
  category: '',
  cost: null,
});

const fetchServices = async () => {
  const snapshot = await getDocs(collection(db, 'services'));
  services.value = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

const filteredServices = computed(() => {
  const term = searchTerm.value.trim().toLowerCase();
  if (!term) return services.value;
  return services.value.filter((s) => {
    return (
      s.serviceName?.toLowerCase().includes(term) ||
      s.category?.toLowerCase().includes(term) ||
      s.description?.toLowerCase().includes(term)
    );
  });
});

const addService = async () => {
  if (!form.value.serviceName || !form.value.category || !form.value.cost) {
    alert('Please fill out all required fields.');
    return;
  }
  await addDoc(collection(db, 'services'), form.value);
  closeModal();
  fetchServices();
};

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

const updateService = async () => {
  if (!editId.value) return;
  const serviceRef = doc(db, 'services', editId.value);
  await updateDoc(serviceRef, form.value);
  closeModal();
  fetchServices();
};

const confirmDelete = (service) => {
  serviceToDelete.value = service;
  showDeleteModal.value = true;
};

const performDelete = async () => {
  if (!serviceToDelete.value?.id) return;
  await deleteDoc(doc(db, 'services', serviceToDelete.value.id));
  cancelDelete();
  fetchServices();
};

const cancelDelete = () => {
  showDeleteModal.value = false;
  serviceToDelete.value = null;
};

const confirmDeleteAll = async () => {
  if (confirm('Are you sure you want to delete ALL services?')) {
    const batch = writeBatch(db);
    services.value.forEach((service) => {
      const docRef = doc(db, 'services', service.id);
      batch.delete(docRef);
    });
    await batch.commit();
    fetchServices();
  }
};

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
