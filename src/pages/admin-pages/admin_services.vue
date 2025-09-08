<template>
  <div class="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800 overflow-x-hidden">
    <!-- ✅ Topbar -->
    <div class="fixed top-0 z-30 shadow bg-white/90 backdrop-blur-md border-b border-gray-200 md:left-64 md:right-0 w-full h-16 flex items-center px-6">
      <AdminTopbar />
    </div>

    <div class="flex pt-16">
      <!-- ✅ Sidebar -->
      <aside class="hidden md:block w-64 flex-shrink-0 border-r border-gray-200 bg-white/90 backdrop-blur-md h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar shadow-sm">
        <AdminSidebar />
      </aside>

      <!-- ✅ Main Content -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto h-[calc(100vh-4rem)] custom-scrollbar">
        <!-- Controls -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div class="flex gap-2 items-center flex-wrap">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Search services..."
              class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <select
              v-model="selectedCategory"
              class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Categories</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>

          <div class="flex gap-2 flex-wrap">
            <button
              @click="showModal = true"
              class="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 active:scale-95 transition"
            >
              Add Service
            </button>

            <button
              @click="toggleEditMode"
              class="px-4 py-2 border border-gray-400 rounded-lg hover:bg-gray-100 active:scale-95 transition"
            >
              {{ editMode ? 'Cancel Edit' : 'Edit' }}
            </button>

            <template v-if="editMode && selectedIds.length > 0">
              <button
                @click="showDeleteModal = true"
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 active:scale-95 transition"
              >
                Delete
              </button>
              <button
                @click="openBulkEdit"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition"
              >
                Edit
              </button>
            </template>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-200">
          <table class="w-full text-sm border-collapse">
            <thead class="bg-gray-100 text-gray-700 font-semibold uppercase text-xs">
              <tr>
                <th v-if="editMode" class="px-4 py-2 border-b border-gray-300">✔</th>
                <th class="px-4 py-2 border-b border-gray-300">No.</th>
                <th class="px-4 py-2 border-b border-gray-300">Service Name</th>
                <th class="px-4 py-2 border-b border-gray-300">Category</th>
                <th class="px-4 py-2 border-b border-gray-300">Amount</th>
                <th class="px-4 py-2 border-b border-gray-300">Special Instructions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(service, idx) in filteredServices"
                :key="service.id"
                @click="toggleRowSelection(service.id)"
                class="hover:bg-gray-50 cursor-pointer"
              >
                <td v-if="editMode" class="px-4 py-2 text-center">
                  <input type="checkbox" :value="service.id" v-model="selectedIds" @click.stop />
                </td>
                <td class="px-4 py-2">{{ idx + 1 }}</td>
                <td class="px-4 py-2">{{ service.serviceName }}</td>
                <td class="px-4 py-2">{{ service.category }}</td>
                <td class="px-4 py-2">₱{{ service.amount || 0 }}</td>
                <td class="px-4 py-2">{{ service.specialInstructions || '—' }}</td>
              </tr>
              <tr v-if="filteredServices.length === 0">
                <td :colspan="editMode ? 6 : 5" class="text-center px-4 py-4 text-gray-500">No services found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>

    <!-- ✅ Modal (Add / Edit / Bulk Edit) -->
    <transition name="fade">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div class="bg-white/95 w-full max-w-lg p-6 rounded-2xl border border-gray-200 shadow-xl relative animate-fadeIn">
          <h2 class="text-lg font-semibold mb-4 text-gray-800">
            {{ bulkStepMode
              ? `Editing Service ${currentBulkIndex + 1} of ${selectedIds.length}`
              : (isEditing ? 'Edit Service' : 'Add New Service') }}
          </h2>

          <button @click="closeModal" class="absolute top-3 right-3 text-gray-500 hover:text-gray-700">✕</button>

          <div class="space-y-3">
            <input v-model="form.serviceName" placeholder="Service Name" class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />

            <select v-model="form.category" class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="" disabled>Select Category</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>

            <input v-model.number="form.amount" type="number" placeholder="Amount" class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />

            <textarea v-model="form.specialInstructions" placeholder="Special Instructions (optional)" rows="2" class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />

            <div class="flex justify-end gap-3 mt-2">
              <button @click="closeModal" class="px-3 py-1 border border-gray-400 rounded hover:bg-gray-100">Cancel</button>
              <button @click="handleSubmit" class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 active:scale-95 transition">
                {{ bulkStepMode
                  ? (currentBulkIndex < selectedIds.length - 1 ? 'Save & Next' : 'Finish')
                  : (isEditing ? 'Update' : 'Add') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- ✅ Delete Confirmation Modal -->
    <transition name="fade">
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div class="bg-white/95 w-full max-w-md p-6 rounded-2xl border border-gray-200 shadow-xl relative animate-fadeIn">
          <h2 class="text-lg font-semibold mb-2 text-gray-800">Confirm Delete</h2>
          <p class="mb-4 text-gray-700">
            Are you sure you want to delete <span class="font-semibold">{{ selectedIds.length }}</span>
            selected service<span v-if="selectedIds.length > 1">s</span>?
          </p>
          <div class="flex justify-end gap-3">
            <button @click="showDeleteModal = false" class="px-3 py-1 border border-gray-400 rounded hover:bg-gray-100">Cancel</button>
            <button @click="bulkDelete" class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 active:scale-95 transition">Yes, Delete</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '@/firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import AdminSidebar from '@/components/admin_sidebar.vue'
import AdminTopbar from '@/components/AdminTopbar.vue'

const services = ref([])
const searchTerm = ref('')
const selectedCategory = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const editMode = ref(false)
const editId = ref(null)
const selectedIds = ref([])
const showDeleteModal = ref(false)
const bulkStepMode = ref(false)
const currentBulkIndex = ref(0)

const categories = [
  'CHEMISTRY', 'SPECIAL CHEMISTRY', 'ELECTROLYTES', 'CLINICAL MICROSCOPY',
  'SPECIAL MICROSCOPY', 'URINE CHEMISTRY', 'HEMATOLOGY', 'SEROLOGY', 'IMMUNOLOGY',
  'THYROID PROFILE', 'HORMONES', 'CARDIAC MARKER', 'TUMOR MARKER', 'DRUG TEST',
  'HISTOPATHOLOGY', 'BLOOD STATION', 'TB-DOTS', 'OTHERS', 'PACKAGES', 'SEND OUT', 'MICROBIOLOGY'
]

const form = ref({ serviceName: '', category: '', amount: null, specialInstructions: '' })

const fetchServices = async () => {
  const snapshot = await getDocs(collection(db, 'services'))
  services.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
}

const filteredServices = computed(() => {
  const term = searchTerm.value.toLowerCase()
  const cat = selectedCategory.value
  return services.value.filter(s => s.serviceName?.toLowerCase().includes(term) && (!cat || s.category === cat))
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

const toggleRowSelection = (id) => {
  if (!editMode.value) return
  if (selectedIds.value.includes(id)) selectedIds.value = selectedIds.value.filter(sid => sid !== id)
  else selectedIds.value.push(id)
}

onMounted(fetchServices)
</script>

<style>
/* Scrollbar */
div::-webkit-scrollbar {
  width: 6px;
}
div::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}
</style>
