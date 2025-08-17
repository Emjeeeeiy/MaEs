<template>
  <div class="flex h-screen overflow-hidden bg-[#1a1a1a] text-white">
    <!-- Sidebar -->
    <aside
      class="w-64 shrink-0 bg-[#1a1a1a] border-r border-gray-800 shadow fixed top-16 left-0 bottom-0 z-10 overflow-y-auto">
      <AdminSidebar />
    </aside>

    <!-- Main Content -->
    <div class="flex flex-col flex-1 pl-64 min-w-0">
      <!-- Topbar -->
      <div class="fixed top-0 left-0 right-0 z-20 h-16 shadow-md bg-[#1a1a1a] border-b border-gray-800">
        <AdminTopbar />
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6 mt-16 animate-fade-in">
        <!-- Controls -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
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

            <button @click="toggleEditMode"
              class="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm shadow-md transition">
              <PencilIcon class="w-4 h-4" /> {{ editMode ? 'Cancel Edit' : 'Edit' }}
            </button>

            <!-- Bulk Actions -->
            <template v-if="editMode && selectedIds.length > 0">
              <button @click="showDeleteModal = true"
                class="inline-flex items-center gap-1 bg-red-700/20 text-red-400 px-3 py-2 rounded-md hover:bg-red-700/40 border border-red-600 text-sm shadow-md transition">
                <TrashIcon class="w-4 h-4" /> Delete
              </button>
              <button @click="openBulkEdit"
                class="inline-flex items-center gap-1 bg-yellow-600 text-white px-3 py-2 rounded-md hover:bg-yellow-700 text-sm shadow-md transition">
                <PencilIcon class="w-4 h-4" /> Edit
              </button>
            </template>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto border border-gray-800 rounded-xl shadow-xl bg-[#222]">
          <table class="min-w-full text-sm text-left text-gray-200">
            <thead class="bg-gray-700 text-xs uppercase text-green-300 border-b border-gray-600">
              <tr>
                <th v-if="editMode" class="px-3 py-2 w-10 text-center">✔</th>
                <th class="px-3 py-2 w-12 text-center">No.</th>
                <th class="px-4 py-2">Service Name</th>
                <th class="px-4 py-2">Category</th>
                <th class="px-4 py-2">Amount</th>
                <th class="px-4 py-2">Special Instructions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(service, idx) in filteredServices" :key="service.id"
                :class="[
                  'border-t border-gray-700 hover:bg-gray-700/40 transition duration-200 cursor-pointer',
                  editMode && selectedIds.includes(service.id) ? 'bg-green-900/30' : ''
                ]"
                @click="toggleRowSelection(service.id)">
                <td v-if="editMode" class="px-3 py-2 text-center">
                  <!-- Stop propagation para di magdoble click -->
                  <input type="checkbox" :value="service.id" v-model="selectedIds"
                    @click.stop
                    class="w-4 h-4 text-green-600 border-gray-600 rounded focus:ring-green-500">
                </td>
                <td class="px-3 py-2 text-center">{{ idx + 1 }}</td>
                <td class="px-4 py-2 font-medium">{{ service.serviceName }}</td>
                <td class="px-4 py-2">{{ service.category }}</td>
                <td class="px-4 py-2">₱{{ service.amount || 0 }}</td>
                <td class="px-4 py-2 italic text-gray-400">{{ service.specialInstructions || '—' }}</td>
              </tr>
              <tr v-if="filteredServices.length === 0">
                <td :colspan="editMode ? 6 : 5" class="px-4 py-3 text-center text-gray-400 italic">
                  No services found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal (Add / Edit / Step-by-step bulk edit) -->
    <div v-if="showModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 animate-fade-in">
      <div class="bg-[#222] border border-gray-700 rounded-lg p-6 w-full max-w-lg shadow-2xl">
        <h2 class="text-lg font-bold text-white mb-4">
          {{ bulkStepMode ? `Editing Service ${currentBulkIndex + 1} of ${selectedIds.length}` : (isEditing ? 'Edit Service' : 'Add New Service') }}
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
            <button @click="handleSubmit"
              class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 shadow transition">
              {{ bulkStepMode ? (currentBulkIndex < selectedIds.length - 1 ? 'Save & Next' : 'Finish') : (isEditing ? 'Update' : 'Add') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
      <div class="bg-[#222] border border-red-600 rounded-lg p-6 w-full max-w-sm shadow-2xl text-center">
        <h2 class="text-lg font-bold text-red-400 mb-3">Confirm Delete</h2>
        <p class="text-gray-300 mb-5">
          Are you sure you want to delete <span class="font-semibold">{{ selectedIds.length }}</span> selected
          service<span v-if="selectedIds.length > 1">s</span>?
        </p>
        <div class="flex justify-center gap-3">
          <button @click="showDeleteModal = false"
            class="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-500 transition">
            Cancel
          </button>
          <button @click="bulkDelete"
            class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition">
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '@/firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import AdminSidebar from '@/components/admin_sidebar.vue'
import AdminTopbar from '@/components/AdminTopbar.vue'
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/vue/24/solid'

const services = ref([])
const searchTerm = ref('')
const selectedCategory = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const editMode = ref(false)
const editId = ref(null)
const selectedIds = ref([])
const showDeleteModal = ref(false)

// Bulk step-by-step editing
const bulkStepMode = ref(false)
const currentBulkIndex = ref(0)

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

const updateService = async () => {
  if (!form.value.serviceName || !form.value.category || form.value.amount == null) return
  await updateDoc(doc(db, 'services', editId.value), form.value)
  closeModal()
  fetchServices()
  exitEditMode()
}

// 🔹 Bulk step-by-step edit
const openBulkEdit = () => {
  if (selectedIds.value.length === 0) return
  bulkStepMode.value = true
  currentBulkIndex.value = 0
  loadBulkForm()
  showModal.value = true
}

const loadBulkForm = () => {
  const id = selectedIds.value[currentBulkIndex.value]
  const service = services.value.find(s => s.id === id)
  if (service) {
    form.value = { ...service }
    editId.value = id
  }
}

const saveBulkEdit = async () => {
  if (!form.value.serviceName || !form.value.category || form.value.amount == null) return
  await updateDoc(doc(db, 'services', editId.value), form.value)
  if (currentBulkIndex.value < selectedIds.value.length - 1) {
    currentBulkIndex.value++
    loadBulkForm()
  } else {
    closeModal()
    fetchServices()
    exitEditMode()
  }
}

const bulkDelete = async () => {
  for (const id of selectedIds.value) {
    await deleteDoc(doc(db, 'services', id))
  }
  selectedIds.value = []
  showDeleteModal.value = false
  fetchServices()
  exitEditMode()
}

const handleSubmit = () => {
  if (bulkStepMode.value) saveBulkEdit()
  else if (isEditing.value) updateService()
  else addService()
}

const toggleEditMode = () => {
  editMode.value = !editMode.value
  selectedIds.value = []
}

const closeModal = () => {
  showModal.value = false
  isEditing.value = false
  bulkStepMode.value = false
  currentBulkIndex.value = 0
  editId.value = null
  form.value = { serviceName: '', category: '', amount: null, specialInstructions: '' }
}

const exitEditMode = () => {
  editMode.value = false
  selectedIds.value = []
}

// 🔹 Toggle row selection
const toggleRowSelection = (id) => {
  if (!editMode.value) return
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter(sid => sid !== id)
  } else {
    selectedIds.value.push(id)
  }
}

onMounted(fetchServices)
</script>

<style scoped>
div::-webkit-scrollbar {
  width: 6px;
}
div::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}
</style>
