<template>
  <div class="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800 overflow-x-hidden">
    <!-- ✅ Topbar -->
    <div class="fixed top-0 left-0 right-0 z-30 shadow bg-white/90 backdrop-blur-md border-b border-gray-200">
      <AdminTopbar />
    </div>

    <div class="flex pt-16">
      <!-- ✅ Sidebar -->
      <aside
        class="hidden md:block w-64 flex-shrink-0 border-r border-gray-200 bg-white/90 backdrop-blur-md h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar shadow-sm"
      >
        <AdminSidebar />
      </aside>

      <!-- ✅ Main Content -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto h-[calc(100vh-4rem)] custom-scrollbar">
        <!-- Controls -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <!-- Search & Filter -->
          <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Search services..."
              class="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none w-full sm:w-64 text-left"
            />
            <select
              v-model="selectedCategory"
              class="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none w-full sm:w-52 text-left"
            >
              <option value="">All Categories</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-3">
            <button
              @click="showModal = true"
              class="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 active:scale-95 text-white text-sm font-medium shadow-md transition"
            >
              Add Service
            </button>
            <button
              @click="toggleEditMode"
              class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 active:scale-95 text-gray-700 text-sm font-medium shadow-md transition"
            >
              {{ editMode ? 'Cancel Edit' : 'Edit' }}
            </button>

            <template v-if="editMode && selectedIds.length > 0">
              <button
                @click="showDeleteModal = true"
                class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 active:scale-95 text-white text-sm font-medium shadow-md transition"
              >
                Delete
              </button>
              <button
                @click="openBulkEdit"
                class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-medium shadow-md transition"
              >
                Edit
              </button>
            </template>
          </div>
        </div>

        <!-- Services Table -->
        <div class="bg-white/80 backdrop-blur-md rounded-2xl shadow border border-gray-200 overflow-hidden">
          <table class="w-full text-sm text-left">
            <thead class="bg-gray-100 text-gray-700">
              <tr>
                <th v-if="editMode" class="px-4 py-2 text-left">✔</th>
                <th class="px-4 py-2 text-left">No.</th>
                <th class="px-4 py-2 text-left">Service Name</th>
                <th class="px-4 py-2 text-left">Category</th>
                <th class="px-4 py-2 text-left">Amount</th>
                <th class="px-4 py-2 text-left">Special Instructions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(service, idx) in filteredServices"
                :key="service.id"
                @click="toggleRowSelection(service.id)"
                class="hover:bg-gray-50 cursor-pointer transition text-left"
              >
                <td v-if="editMode" class="px-4 py-2 text-left">
                  <input
                    type="checkbox"
                    :value="service.id"
                    v-model="selectedIds"
                    @click.stop
                  />
                </td>
                <td class="px-4 py-2 text-left">{{ idx + 1 }}</td>
                <td class="px-4 py-2 font-medium text-gray-800 text-left">{{ service.serviceName }}</td>
                <td class="px-4 py-2 text-left">{{ service.category }}</td>
                <td class="px-4 py-2 text-green-600 font-semibold text-left">₱{{ service.amount || 0 }}</td>
                <td class="px-4 py-2 text-gray-500 text-left">{{ service.specialInstructions || '—' }}</td>
              </tr>
              <tr v-if="filteredServices.length === 0">
                <td :colspan="editMode ? 6 : 5" class="px-4 py-6 text-gray-500 text-left">
                  No services found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>

    <!-- ✅ Add/Edit Service Modal -->
    <transition name="fade">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      >
        <div class="bg-white/95 w-full max-w-lg p-6 rounded-2xl border border-gray-200 shadow-xl relative animate-fadeIn text-left">
          <h2 class="text-lg font-semibold mb-5 text-gray-800 text-left">
            {{ bulkStepMode
              ? `Editing Service ${currentBulkIndex + 1} of ${selectedIds.length}`
              : (isEditing ? 'Edit Service' : 'Add New Service') }}
          </h2>
          <button
            @click="closeModal"
            class="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>

          <div class="space-y-3">
            <input
              v-model="form.serviceName"
              placeholder="Service Name"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none text-left"
            />
            <select
              v-model="form.category"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none text-left"
            >
              <option value="" disabled>Select Category</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <input
              v-model.number="form.amount"
              type="number"
              placeholder="Amount"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none text-left"
            />
            <textarea
              v-model="form.specialInstructions"
              placeholder="Special Instructions (optional)"
              rows="2"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none text-left"
            />

            <div class="flex justify-end gap-3 pt-2">
              <button
                @click="closeModal"
                class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium shadow-sm transition"
              >
                Cancel
              </button>
              <button
                @click="handleSubmit"
                class="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium shadow-md transition"
              >
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
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      >
        <div class="bg-white/95 w-full max-w-md p-6 rounded-2xl border border-gray-200 shadow-xl animate-fadeIn text-left">
          <h2 class="text-lg font-semibold text-gray-800 mb-2 text-left">Confirm Delete</h2>
          <p class="text-gray-600 mb-6 text-left">
            Are you sure you want to delete
            <span class="font-semibold">{{ selectedIds.length }}</span>
            selected service<span v-if="selectedIds.length > 1">s</span>?
          </p>
          <div class="flex justify-end gap-3">
            <button
              @click="showDeleteModal = false"
              class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium shadow-sm transition"
            >
              Cancel
            </button>
            <button
              @click="bulkDelete"
              class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium shadow-md transition"
            >
              Yes, Delete
            </button>
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
import AdminTopbar from '@/components/admintopbar.vue'

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
