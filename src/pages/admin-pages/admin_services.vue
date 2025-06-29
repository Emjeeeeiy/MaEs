<template>
  <div class="flex h-screen overflow-hidden bg-gray-50">
    <!-- Sidebar -->
    <AdminSidebar class="w-64 border-r bg-white flex-shrink-0" />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Admin Top-bar -->
      <AdminTopbar />

      <!-- Page Body -->
      <div class="flex-1 overflow-y-auto p-3 space-y-4">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 bg-white shadow px-3 py-3 rounded-md">
          <h1 class="text-xl font-semibold text-gray-800">Manage Services</h1>
          <div class="flex flex-wrap gap-2">
            <!-- Add Service -->
            <button
              @click="showModal = true"
              class="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Service
            </button>
            <!-- Delete All -->
            <button
              @click="confirmDeleteAll"
              class="inline-flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1.5 rounded-md hover:bg-red-200 border border-red-300 text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M9 6v12m6-12v12M4 6l1 14a2 2 0 002 2h10a2 2 0 002-2l1-14" />
              </svg>
              Delete All
            </button>
          </div>
        </div>

        <!-- Search / Filter -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Search services..."
            class="w-full sm:w-1/2 border rounded px-2 py-1.5 text-gray-800 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm"
          />
          <select
            v-model="selectedCategory"
            class="w-full sm:w-64 mt-1 sm:mt-0 border rounded px-2 py-1.5 text-gray-800 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm"
          >
            <option value="">All Categories</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>

        <!-- Services Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm text-left text-gray-700 bg-white border border-gray-200 shadow rounded">
            <thead class="bg-gray-100 text-xs uppercase text-gray-600">
              <tr>
                <th class="px-4 py-2">Service Name</th>
                <th class="px-4 py-2">Category</th>
                <th class="px-4 py-2">Amount</th> <!-- NEW -->
                <th class="px-4 py-2">Special Instructions</th>
                <th class="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="service in filteredServices"
                :key="service.id"
                class="border-t hover:bg-gray-50"
              >
                <td class="px-4 py-2 font-medium text-gray-900">{{ service.serviceName }}</td>
                <td class="px-4 py-2">{{ service.category }}</td>
                <td class="px-4 py-2">₱{{ service.amount || 0 }}</td> <!-- NEW -->
                <td class="px-4 py-2 text-gray-700 italic">{{ service.specialInstructions || '—' }}</td>
                <td class="px-4 py-2 space-x-2 whitespace-nowrap">
                  <button @click="openEditModal(service)" class="text-blue-600 hover:underline text-sm">Edit</button>
                  <button @click="confirmDelete(service)" class="text-red-600 hover:underline text-sm">Delete</button>
                </td>
              </tr>
              <tr v-if="filteredServices.length === 0">
                <td colspan="5" class="px-4 py-3 text-center text-gray-500 italic">No services found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add / Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm">
      <div class="bg-white rounded-md shadow-lg p-4 w-full max-w-xl relative">
        <h2 class="text-lg font-bold mb-3">{{ isEditing ? 'Edit Service' : 'Add New Service' }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input v-model="form.serviceName" type="text" placeholder="Service Name" class="border p-2 rounded w-full text-sm text-gray-800" />
          <select v-model="form.category" class="border p-2 rounded w-full text-sm text-gray-800">
            <option value="" disabled>Select Category</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
          <input v-model.number="form.amount" type="number" placeholder="Amount" class="border p-2 rounded w-full text-sm text-gray-800" /> <!-- NEW -->
          <textarea
            v-model="form.specialInstructions"
            placeholder="Special Instructions (optional)"
            class="md:col-span-2 border p-2 rounded w-full text-sm text-gray-800 resize-none"
            rows="2"
          ></textarea>
        </div>
        <div class="mt-4 flex justify-end space-x-2">
          <button
            @click="isEditing ? updateService() : addService()"
            class="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 text-sm"
          >
            {{ isEditing ? 'Update' : 'Add' }} Service
          </button>
          <button @click="closeModal" class="px-3 py-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm">
      <div class="bg-white p-4 rounded-md shadow-lg w-full max-w-md">
        <h3 class="text-base font-semibold mb-2 text-red-600">Confirm Delete</h3>
        <p class="text-sm text-gray-700 mb-4">
          Are you sure you want to delete <strong>{{ serviceToDelete?.serviceName }}</strong>?
        </p>
        <div class="flex justify-end space-x-2">
          <button @click="performDelete" class="bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 text-sm">
            Yes, Delete
          </button>
          <button @click="cancelDelete" class="px-3 py-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Warning Modal -->
    <div v-if="showWarningModal" class="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm">
      <div class="bg-white p-4 rounded-md shadow-lg w-full max-w-sm">
        <div class="flex items-center mb-3">
          <svg class="w-6 h-6 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 16h-1v-4h-1m0-4h.01M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z" />
          </svg>
          <h3 class="text-yellow-600 font-semibold text-base">Incomplete Form</h3>
        </div>
        <p class="text-sm text-gray-700">
          Please fill out the <strong>Service Name</strong>, <strong>Category</strong>, and <strong>Amount</strong>.
        </p>
        <div class="mt-4 flex justify-end">
          <button @click="showWarningModal = false" class="bg-yellow-500 text-white px-3 py-1.5 rounded hover:bg-yellow-600 text-sm">
            OK
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminSidebar from '@/components/admin_sidebar.vue'
import AdminTopbar from '@/components/AdminTopbar.vue'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/firebase'

const services = ref([])
const searchTerm = ref('')
const selectedCategory = ref('')
const showModal = ref(false)
const showWarningModal = ref(false)
const isEditing = ref(false)
const editId = ref(null)
const showDeleteModal = ref(false)
const serviceToDelete = ref(null)

const categories = [
  'CHEMISTRY', 'SPECIAL CHEMISTRY', 'ELECTROLYTES', 'CLINICAL MICROSCOPY',
  'SPECIAL MICROSCOPY', 'URINE CHEMISTRY', 'HEMATOLOGY', 'SEROLOGY', 'IMMUNOLOGY',
  'THYROID PROFILE', 'HORMONES', 'CARDIAC MARKER', 'TUMOR MARKER', 'DRUG TEST',
  'HISTOPATHOLOGY', 'BLOOD STATION', 'TB-DOTS', 'OTHERS', 'PACKAGES', 'SEND OUT', 'MICROBIOLOGY',
]

const form = ref({
  serviceName: '',
  category: '',
  amount: null, // NEW
  specialInstructions: '',
})

const fetchServices = async () => {
  const snapshot = await getDocs(collection(db, 'services'))
  services.value = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

const filteredServices = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  const cat = selectedCategory.value
  return services.value.filter((s) => {
    const matchText = s.serviceName?.toLowerCase().includes(term)
    const matchCat = cat ? s.category === cat : true
    return matchText && matchCat
  })
})

const addService = async () => {
  if (!form.value.serviceName || !form.value.category || form.value.amount == null) {
    showWarningModal.value = true
    return
  }
  await addDoc(collection(db, 'services'), form.value)
  closeModal()
  fetchServices()
}

const openEditModal = (svc) => {
  form.value = {
    serviceName: svc.serviceName,
    category: svc.category,
    amount: svc.amount || 0,
    specialInstructions: svc.specialInstructions || '',
  }
  editId.value = svc.id
  isEditing.value = true
  showModal.value = true
}

const updateService = async () => {
  if (!form.value.serviceName || !form.value.category || form.value.amount == null) {
    showWarningModal.value = true
    return
  }
  await updateDoc(doc(db, 'services', editId.value), form.value)
  closeModal()
  fetchServices()
}

const confirmDelete = (svc) => {
  serviceToDelete.value = svc
  showDeleteModal.value = true
}
const performDelete = async () => {
  await deleteDoc(doc(db, 'services', serviceToDelete.value.id))
  cancelDelete()
  fetchServices()
}
const cancelDelete = () => {
  showDeleteModal.value = false
  serviceToDelete.value = null
}

const confirmDeleteAll = async () => {
  if (confirm('Are you sure you want to delete ALL services?')) {
    const batch = writeBatch(db)
    services.value.forEach((s) => batch.delete(doc(db, 'services', s.id)))
    await batch.commit()
    fetchServices()
  }
}

const closeModal = () => {
  showModal.value = false
  isEditing.value = false
  editId.value = null
  form.value = { serviceName: '', category: '', amount: null, specialInstructions: '' }
}

onMounted(fetchServices)
</script>
