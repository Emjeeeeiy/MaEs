<template>
    <div class="flex min-h-screen bg-gray-50">
      <!-- Sidebar -->
      <AdminSidebar />
  
      <!-- Main Content -->
      <div class="flex-1 p-6">
        <h1 class="text-2xl font-bold mb-6 text-gray-800">Manage Services</h1>
  
        <!-- Form -->
        <div class="bg-white shadow p-4 rounded-lg mb-6 max-w-2xl">
          <h2 class="text-lg font-semibold mb-4">
            {{ isEditing ? 'Edit Service' : 'Add New Service' }}
          </h2>
  
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              v-model="form.serviceName"
              type="text"
              placeholder="Service Name"
              class="border p-2 rounded w-full text-gray-800 bg-white"
            />
            <input
              v-model="form.category"
              type="text"
              placeholder="Category"
              class="border p-2 rounded w-full text-gray-800 bg-white"
            />
            <input
              v-model="form.cost"
              type="number"
              placeholder="Cost"
              class="border p-2 rounded w-full text-gray-800 bg-white"
            />
            <input
              v-model="form.description"
              type="text"
              placeholder="Description"
              class="border p-2 rounded w-full text-gray-800 bg-white"
            />
          </div>
  
          <div class="mt-4">
            <button
              @click="isEditing ? updateService() : addService()"
              class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {{ isEditing ? 'Update' : 'Add' }} Service
            </button>
            <button
              v-if="isEditing"
              @click="cancelEdit"
              class="ml-2 text-gray-600 hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
  
        <!-- Search Input -->
        <div class="mb-4 max-w-md">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Search services..."
            class="w-full border rounded px-3 py-2 text-gray-800 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
  
        <!-- Service List -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="service in filteredServices"
            :key="service.id"
            class="bg-gray-100 hover:bg-gray-200 transition p-4 shadow rounded flex flex-col justify-between"
          >
            <div>
              <h3 class="font-semibold text-lg text-gray-900">{{ service.serviceName }}</h3>
              <p class="text-gray-700 text-sm mt-1">{{ service.description }}</p>
              <p class="text-gray-600 text-sm mt-1">Category: {{ service.category }}</p>
              <p class="text-gray-800 font-medium mt-1">₱{{ service.cost }}</p>
            </div>
            <div class="mt-4 space-x-2">
              <button @click="editService(service)" class="text-blue-600 hover:underline">
                Edit
              </button>
              <button @click="deleteService(service.id)" class="text-red-600 hover:underline">
                Delete
              </button>
            </div>
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
  
  // Reactive state
  const services = ref([]);
  const searchTerm = ref('');
  const form = ref({
    serviceName: '',
    description: '',
    category: '',
    cost: null,
  });
  const isEditing = ref(false);
  const editId = ref(null);
  
  // Fetch services from Firestore
  const fetchServices = async () => {
    const snapshot = await getDocs(collection(db, 'services'));
    services.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  };
  
  // Computed: filtered list based on search
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
  
  // Add a new service
  const addService = async () => {
    if (!form.value.serviceName || !form.value.category || !form.value.cost) {
      alert('Please fill out all required fields.');
      return;
    }
  
    await addDoc(collection(db, 'services'), form.value);
    resetForm();
    fetchServices();
  };
  
  // Edit service
  const editService = (service) => {
    form.value = {
      serviceName: service.serviceName,
      description: service.description,
      category: service.category,
      cost: service.cost,
    };
    isEditing.value = true;
    editId.value = service.id;
  };
  
  // Update service
  const updateService = async () => {
    if (!editId.value) return;
    const serviceRef = doc(db, 'services', editId.value);
    await updateDoc(serviceRef, form.value);
    cancelEdit();
    fetchServices();
  };
  
  // Delete service
  const deleteService = async (id) => {
    if (confirm('Are you sure you want to delete this service?')) {
      await deleteDoc(doc(db, 'services', id));
      fetchServices();
    }
  };
  
  // Cancel edit and reset form
  const cancelEdit = () => {
    isEditing.value = false;
    editId.value = null;
    resetForm();
  };
  
  // Reset form fields
  const resetForm = () => {
    form.value = {
      serviceName: '',
      description: '',
      category: '',
      cost: null,
    };
  };
  
  // Lifecycle
  onMounted(fetchServices);
  </script>
  