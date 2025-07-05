<template>
  <div class="flex min-h-screen bg-[#1a1a1a] text-white overflow-hidden">
    <!-- Sidebar -->
    <AdminSidebar class="w-64 border-r border-gray-800 bg-[#1a1a1a]" />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col h-screen">
      <AdminTopbar />

      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- Header Controls -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-3 animate-fade-in">
          <input v-model="searchTerm" type="text" placeholder="Search services..."
            class="w-full sm:w-1/2 px-3 py-2 rounded-md bg-[#222] border border-gray-700 placeholder-gray-400 text-sm focus:ring-green-500 focus:outline-none transition shadow-sm" />

          <select v-model="selectedCategory"
            class="w-full sm:w-64 px-3 py-2 rounded-md bg-[#222] border border-gray-700 text-sm text-white focus:ring-green-500 focus:outline-none transition shadow-sm">
            <option value="">All Categories</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>

          <div class="flex flex-wrap gap-2">
            <button @click="showModal = true"
              class="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 text-sm shadow-md transition">
              <PlusIcon class="w-4 h-4" /> Add Service
            </button>
            <button @click="confirmDeleteAll"
              class="inline-flex items-center gap-1 bg-red-700/20 text-red-400 px-3 py-2 rounded-md hover:bg-red-700/40 border border-red-600 text-sm shadow-md transition">
              <TrashIcon class="w-4 h-4" /> Delete All
            </button>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto border border-gray-800 rounded-xl shadow-xl bg-[#222] animate-fade-in">
          <table class="min-w-full text-sm text-left text-gray-200">
            <thead class="bg-gray-700 text-xs uppercase text-green-300 border-b border-gray-600">
              <tr>
                <th class="px-3 py-2 w-12 text-center">No.</th>
                <th class="px-4 py-2">Service Name</th>
                <th class="px-4 py-2">Category</th>
                <th class="px-4 py-2">Amount</th>
                <th class="px-4 py-2">Special Instructions</th>
                <th class="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(service, idx) in filteredServices" :key="service.id"
                class="border-t border-gray-700 hover:bg-gray-700/40 transition duration-200">
                <td class="px-3 py-2 text-center">{{ idx + 1 }}</td>
                <td class="px-4 py-2 font-medium">{{ service.serviceName }}</td>
                <td class="px-4 py-2">{{ service.category }}</td>
                <td class="px-4 py-2">₱{{ service.amount || 0 }}</td>
                <td class="px-4 py-2 italic text-gray-400">{{ service.specialInstructions || '—' }}</td>
                <td class="px-4 py-2 space-x-2">
                  <button @click="openEditModal(service)" class="text-green-400 hover:underline text-sm">Edit</button>
                  <button @click="confirmDelete(service)" class="text-red-400 hover:underline text-sm">Delete</button>
                </td>
              </tr>
              <tr v-if="filteredServices.length === 0">
                <td colspan="6" class="px-4 py-3 text-center text-gray-400 italic">No services found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 animate-fade-in">
      <div class="bg-[#222] border border-gray-700 rounded-lg p-6 w-full max-w-lg shadow-2xl">
        <h2 class="text-lg font-bold text-white mb-4">
          {{ isEditing ? 'Edit Service' : 'Add New Service' }}
        </h2>
        <div class="space-y-4">
          <input v-model="form.serviceName" placeholder="Service Name"
            class="w-full px-3 py-2 rounded bg-[#111] border border-gray-600 text-white focus:ring-green-500 focus:outline-none shadow-sm transition" />

          <select v-model="form.category"
            class="w-full px-3 py-2 rounded bg-[#111] border border-gray-600 text-white focus:ring-green-500 focus:outline-none shadow-sm transition">
            <option value="" disabled>Select Category</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>

          <input v-model.number="form.amount" type="number" placeholder="Amount"
            class="w-full px-3 py-2 rounded bg-[#111] border border-gray-600 text-white focus:ring-green-500 focus:outline-none shadow-sm transition" />

          <textarea v-model="form.specialInstructions" placeholder="Special Instructions (optional)" rows="2"
            class="w-full px-3 py-2 rounded bg-[#111] border border-gray-600 text-white focus:ring-green-500 focus:outline-none shadow-sm transition" />

          <div class="flex justify-end gap-3 pt-2">
            <button @click="closeModal" class="text-gray-400 hover:underline">Cancel</button>
            <button @click="isEditing ? updateService() : addService()"
              class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 shadow transition">
              {{ isEditing ? 'Update' : 'Add' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '@/firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore'
import AdminSidebar from '@/components/admin_sidebar.vue'
import AdminTopbar from '@/components/AdminTopbar.vue'
import { PlusIcon, TrashIcon } from '@heroicons/vue/24/solid'

const services = ref([])
const searchTerm = ref('')
const selectedCategory = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const editId = ref(null)
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
  services.value = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

const filteredServices = computed(() => {
  const term = searchTerm.value.toLowerCase()
  const cat = selectedCategory.value
  return services.value.filter(
    (s) => s.serviceName?.toLowerCase().includes(term) && (!cat || s.category === cat)
  )
})

const addService = async () => {
  if (!form.value.serviceName || !form.value.category || form.value.amount == null) return
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
  if (!form.value.serviceName || !form.value.category || form.value.amount == null) return
  await updateDoc(doc(db, 'services', editId.value), form.value)
  closeModal()
  fetchServices()
}

const confirmDelete = (svc) => {
  if (confirm(`Delete service "${svc.serviceName}"?`)) {
    deleteDoc(doc(db, 'services', svc.id)).then(fetchServices)
  }
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
