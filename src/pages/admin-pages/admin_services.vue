<template>
  <div class="flex min-h-screen bg-[#1a1a1a] text-white overflow-hidden">
    <!-- Sidebar -->
    <AdminSidebar class="w-64 border-r border-gray-800 bg-[#1a1a1a]" />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col h-screen">
      <!-- Topbar -->
      <AdminTopbar />

      <!-- Page Body -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- Header Actions -->
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-[#222] border border-gray-700 px-4 py-3 rounded-xl shadow">
          <h1 class="text-xl font-semibold text-green-400">Manage Services</h1>
          <div class="flex flex-wrap gap-2">
            <button @click="showModal = true" class="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Service
            </button>
            <button @click="confirmDeleteAll" class="inline-flex items-center gap-1 bg-red-700/20 text-red-400 px-3 py-1.5 rounded-md hover:bg-red-700/30 border border-red-600 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M9 6v12m6-12v12M4 6l1 14a2 2 0 002 2h10a2 2 0 002-2l1-14" />
              </svg>
              Delete All
            </button>
          </div>
        </div>

        <!-- Search & Filter -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
          <input v-model="searchTerm" type="text" placeholder="Search services..." class="w-full sm:w-1/2 px-3 py-1.5 rounded-md bg-[#222] border border-gray-700 placeholder-gray-400 text-sm focus:ring-green-400 focus:outline-none" />
          <select v-model="selectedCategory" class="w-full sm:w-64 px-3 py-1.5 rounded-md bg-[#222] border border-gray-700 text-sm text-white focus:ring-green-400 focus:outline-none">
            <option value="">All Categories</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>

        <!-- Services Table -->
        <div class="overflow-x-auto border border-gray-800 rounded-xl shadow bg-[#222]">
          <table class="min-w-full text-sm text-left text-gray-200">
            <thead class="bg-gray-700 text-xs uppercase text-green-300 border-b border-gray-600">
              <tr>
                <th class="px-4 py-2">Service Name</th>
                <th class="px-4 py-2">Category</th>
                <th class="px-4 py-2">Amount</th>
                <th class="px-4 py-2">Special Instructions</th>
                <th class="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="service in filteredServices" :key="service.id" class="border-t border-gray-700 hover:bg-gray-700/50">
                <td class="px-4 py-2 font-medium">{{ service.serviceName }}</td>
                <td class="px-4 py-2">{{ service.category }}</td>
                <td class="px-4 py-2">₱{{ service.amount || 0 }}</td>
                <td class="px-4 py-2 italic text-gray-300">{{ service.specialInstructions || '—' }}</td>
                <td class="px-4 py-2 space-x-2 whitespace-nowrap">
                  <button @click="openEditModal(service)" class="text-green-400 hover:underline text-sm">Edit</button>
                  <button @click="confirmDelete(service)" class="text-red-400 hover:underline text-sm">Delete</button>
                </td>
              </tr>
              <tr v-if="filteredServices.length === 0">
                <td colspan="5" class="px-4 py-3 text-center text-gray-400 italic">No services found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminSidebar from '@/components/admin_sidebar.vue'
import AdminTopbar from '@/components/AdminTopbar.vue'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore'
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
  'HISTOPATHOLOGY', 'BLOOD STATION', 'TB-DOTS', 'OTHERS', 'PACKAGES', 'SEND OUT', 'MICROBIOLOGY'
]

const form = ref({
  serviceName: '',
  category: '',
  amount: null,
  specialInstructions: ''
})

const fetchServices = async () => {
  const snapshot = await getDocs(collection(db, 'services'))
  services.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

const filteredServices = computed(() => {
  const term = searchTerm.value.toLowerCase()
  const cat = selectedCategory.value
  return services.value.filter((s) =>
    s.serviceName?.toLowerCase().includes(term) && (cat ? s.category === cat : true)
  )
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
  form.value = { ...svc }
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
