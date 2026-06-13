<template>
  <AdminLayout>
    <div class="min-h-screen bg-gray-50/50 dark:bg-[#121212] p-6 text-gray-900 dark:text-gray-100 font-sans">
      
      <!-- Workspace Navigation Header -->
      <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-5 border-b border-gray-200/60 dark:border-gray-800/60">
        <div>
          <h1 class="text-xl font-semibold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <LayersIcon class="w-5 h-5 text-gray-400" /> 
            <span>Services Directory</span>
          </h1>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Pamahalaan, i-edit, o magdagdag ng mga serbisyo at kaukulang presyo para sa system.</p>
        </div>
      </header>

      <!-- Unified Control and Action Toolbar -->
      <div class="space-y-4 mb-6">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white dark:bg-[#1a1a1a] border border-gray-200/70 dark:border-gray-800/70 rounded-xl p-4 shadow-xs">
          
          <!-- Left: Filter Inputs Grid -->
          <div class="flex flex-col sm:flex-row gap-3 flex-1 w-full">
            <div class="relative flex-1">
              <input
                v-model="searchTerm"
                type="text"
                placeholder="Search services by identifier..."
                class="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 dark:bg-[#222] border border-gray-200/60 dark:border-gray-800/60 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition"
              />
              <SearchIcon class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <div class="relative w-full sm:w-56">
              <select
                v-model="selectedCategory"
                class="w-full appearance-none pl-3 pr-8 py-2 text-xs bg-gray-50 dark:bg-[#222] border border-gray-200/60 dark:border-gray-800/60 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition"
              >
                <option value="">All Categories</option>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
              <ChevronDownIcon class="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <!-- Right: Control Button Groups -->
          <div class="flex items-center flex-wrap gap-2 shrink-0">
            <button
              @click="toggleEditMode"
              :class="editMode ? 'bg-gray-900 border-transparent text-white dark:bg-white dark:text-gray-900' : 'bg-white border-gray-200 dark:bg-transparent dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#222]'"
              class="inline-flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-medium transition"
            >
              <SlidersHorizontalIcon class="w-3.5 h-3.5" /> 
              <span>{{ editMode ? 'Exit Selection' : 'Select Multiple' }}</span>
            </button>

            <button
              @click="showModal = true"
              class="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-[#222] text-gray-700 dark:text-gray-300 font-medium text-xs transition shadow-2xs"
            >
              <PlusIcon class="w-3.5 h-3.5 text-gray-400" /> 
              <span>Add New Service</span>
            </button>
          </div>
        </div>

        <!-- Floating Bulk Action Bar (Revealed on Edit Mode selection) -->
        <transition name="fade">
          <div 
            v-if="editMode" 
            class="flex items-center justify-between p-3 px-4 bg-gray-50 dark:bg-[#1a1a1a]/60 border border-gray-200/60 dark:border-gray-800/60 rounded-xl"
          >
            <div class="flex items-center gap-2">
              <span class="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {{ selectedIds.length }} item<span v-if="selectedIds.length !== 1">s</span> selected for modifications
              </p>
            </div>
            
            <div class="flex items-center gap-2" v-if="selectedIds.length > 0">
              <button
                @click="openBulkEdit"
                class="inline-flex items-center gap-1 px-2.5 py-1.5 border border-blue-100 dark:border-blue-900/30 rounded-lg bg-blue-50/50 dark:bg-blue-950/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100/50 transition text-xs font-medium"
              >
                <Edit3Icon class="w-3 h-3" /> 
                <span>Bulk Edit</span>
              </button>
              <button
                @click="showDeleteModal = true"
                class="inline-flex items-center gap-1 px-2.5 py-1.5 border border-transparent text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition text-xs font-medium"
              >
                <Trash2Icon class="w-3 h-3" /> 
                <span>Delete</span>
              </button>
            </div>
          </div>
        </transition>
      </div>

      <!-- Services Master Ledger Table -->
      <div class="bg-white dark:bg-[#1a1a1a] border border-gray-200/70 dark:border-gray-800/70 rounded-xl shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-xs border-collapse text-left">
            <thead>
              <tr class="border-b border-gray-100 dark:border-gray-800/50 text-gray-400 dark:text-gray-500 font-medium">
                <th v-if="editMode" class="px-4 py-3 w-10 text-center">
                  <div class="flex items-center justify-center"><CheckIcon class="w-3.5 h-3.5" /></div>
                </th>
                <th class="px-4 py-3 w-12 text-center">Idx</th>
                <th class="px-4 py-3 font-medium">Service Name</th>
                <th class="px-4 py-3 font-medium">Category Group</th>
                <th class="px-4 py-3 font-medium">Amount Due</th>
                <th class="px-4 py-3 font-medium">Special Instructions / Memo</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800/40 text-gray-700 dark:text-gray-300">
              <tr
                v-for="(service, idx) in filteredServices"
                :key="service.id"
                @click="toggleRowSelection(service.id)"
                :class="selectedIds.includes(service.id) && editMode ? 'bg-gray-50/70 dark:bg-[#222]/30' : 'hover:bg-gray-50/40 dark:hover:bg-[#222]/10'"
                class="cursor-pointer transition"
              >
                <!-- Multi Selection Checkbox Box -->
                <td v-if="editMode" class="px-4 py-3.5 text-center" @click.stop>
                  <div class="flex items-center justify-center">
                    <input
                      type="checkbox"
                      :value="service.id"
                      v-model="selectedIds"
                      class="w-3.5 h-3.5 accent-gray-900 dark:accent-white rounded border-gray-300 text-gray-900 focus:ring-0"
                    />
                  </div>
                </td>
                
                <td class="px-4 py-3.5 text-center text-gray-400 dark:text-gray-500 font-mono">{{ idx + 1 }}</td>
                <td class="px-4 py-3.5 font-medium text-gray-900 dark:text-white">{{ service.serviceName }}</td>
                <td class="px-4 py-3.5 whitespace-nowrap">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-50 dark:bg-[#222] border border-gray-100 dark:border-gray-800 text-[11px] text-gray-500 dark:text-gray-400">
                    {{ service.category }}
                  </span>
                </td>
                <td class="px-4 py-3.5 font-semibold text-gray-900 dark:text-white whitespace-nowrap">₱{{ service.amount || 0 }}</td>
                <td class="px-4 py-3.5 text-gray-400 dark:text-gray-500 max-w-sm truncate" :title="service.specialInstructions">
                  {{ service.specialInstructions || '—' }}
                </td>
              </tr>

              <!-- Nested Table Empty Placeholder -->
              <tr v-if="filteredServices.length === 0">
                <td :colspan="editMode ? 6 : 5" class="text-center py-12 text-gray-400 bg-gray-50/20 dark:bg-transparent">
                  <div class="flex flex-col items-center justify-center gap-2">
                    <InboxIcon class="w-5 h-5 text-gray-300" />
                    <span>No structural services recorded under this filter criteria.</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ================= STRUCTURAL MODAL COMPONENT (ADD / EDIT FORM) ================= -->
      <transition name="fade">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-xs" @click="closeModal"></div>
          
          <div class="bg-white dark:bg-[#1a1a1a] w-full max-w-md p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl relative z-10 space-y-4 animate-fadeIn">
            <div class="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <div class="flex items-center gap-2">
                <Edit3Icon v-if="bulkStepMode || isEditing" class="w-4 h-4 text-gray-400" />
                <PlusIcon v-else class="w-4 h-4 text-gray-400" />
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
                  <span v-if="bulkStepMode">Edit Service ({{ currentBulkIndex + 1 }} of {{ selectedIds.length }})</span>
                  <span v-else-if="isEditing">Modify Existing Service</span>
                  <span v-else>Create New System Service</span>
                </h3>
              </div>
              <button @click="closeModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition text-sm">✕</button>
            </div>

            <!-- Main Input Payload Workspace -->
            <div class="space-y-3.5">
              <div>
                <label class="text-[11px] font-medium text-gray-400 uppercase tracking-wide block mb-1">Service Title</label>
                <input
                  v-model="form.serviceName"
                  type="text"
                  placeholder="e.g., General Consultation"
                  class="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition"
                />
              </div>

              <div>
                <label class="text-[11px] font-medium text-gray-400 uppercase tracking-wide block mb-1">Classification Category</label>
                <div class="relative">
                  <select
                    v-model="form.category"
                    class="w-full appearance-none px-3 py-2 text-xs bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition"
                  >
                    <option value="" disabled>Choose classification group...</option>
                    <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                  </select>
                  <ChevronDownIcon class="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label class="text-[11px] font-medium text-gray-400 uppercase tracking-wide block mb-1">Standard Base Amount (PHP)</label>
                <input
                  v-model.number="form.amount"
                  type="number"
                  placeholder="0.00"
                  class="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition"
                />
              </div>

              <div>
                <label class="text-[11px] font-medium text-gray-400 uppercase tracking-wide block mb-1">Special Instructions & Guidelines</label>
                <textarea
                  v-model="form.specialInstructions"
                  placeholder="Provide explicit directions or prerequisites (optional)..."
                  rows="3"
                  class="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition resize-none"
                />
              </div>
            </div>

            <!-- Form Control Footer Buttons -->
            <div class="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button 
                @click="closeModal" 
                class="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-transparent dark:hover:bg-[#222] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 transition"
              >
                Cancel
              </button>
              <button
                @click="handleSubmit"
                class="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg text-xs font-medium transition"
              >
                {{ bulkStepMode
                  ? (currentBulkIndex < selectedIds.length - 1 ? 'Save & Proceed' : 'Finalize Ledger')
                  : (isEditing ? 'Update Changes' : 'Append Service') }}
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- ================= CONFIRM BULK DELETE MODAL ================= -->
      <transition name="fade">
        <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-xs" @click="showDeleteModal = false"></div>
          
          <div class="bg-white dark:bg-[#1a1a1a] w-full max-w-sm p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl relative z-10 space-y-4">
            <div class="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangleIcon class="w-4 h-4" />
              <h3 class="text-sm font-semibold">Confirm Bulk Elimination</h3>
            </div>
            
            <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Sigurado ka bang nais mong burahin ang napiling <span class="font-bold text-gray-900 dark:text-white">{{ selectedIds.length }}</span> serbisyo? Ang aksyong ito ay permanenteng aalisin ang mga tala sa database at hindi na maaaring ibalik.
            </p>

            <div class="flex justify-end gap-2 pt-2">
              <button
                @click="showDeleteModal = false"
                class="px-3 py-1.5 bg-gray-50 dark:bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 transition hover:bg-gray-100 dark:hover:bg-[#222]"
              >
                Abort
              </button>
              <button
                @click="bulkDelete"
                class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition shadow-xs"
              >
                Yes, Purge Selected
              </button>
            </div>
          </div>
        </div>
      </transition>

    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '@/firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import AdminLayout from '@/components/AdminLayout.vue'
import { 
  Plus as PlusIcon, 
  Edit2 as Edit2Icon, 
  Edit3 as Edit3Icon, 
  Trash2 as Trash2Icon,
  Layers as LayersIcon,
  Search as SearchIcon,
  ChevronDown as ChevronDownIcon,
  SlidersHorizontal as SlidersHorizontalIcon,
  Check as CheckIcon,
  Inbox as InboxIcon,
  AlertTriangle as AlertTriangleIcon
} from 'lucide-vue-next'
import { useNotifications } from '@/composables/useNotifications'

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
const { success: notifySuccess, error: notifyError } = useNotifications()

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
  try {
    await addDoc(collection(db, 'services'), form.value)
    notifySuccess('Service added successfully!')
    closeModal()
    fetchServices()
  } catch (error) {
    notifyError('Error adding service: ' + error.message)
  }
}

const updateService = async () => {
  if (!form.value.serviceName || !form.value.category || form.value.amount == null) return
  try {
    await updateDoc(doc(db, 'services', editId.value), form.value)
    notifySuccess('Service updated successfully!')
    closeModal()
    fetchServices()
    exitEditMode()
  } catch (error) {
    notifyError('Error updating service: ' + error.message)
  }
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
  try {
    await updateDoc(doc(db, 'services', editId.value), form.value)
    if (currentBulkIndex.value < selectedIds.value.length - 1) {
      currentBulkIndex.value++
      loadBulkForm()
    } else {
      notifySuccess('All services updated successfully!')
      closeModal()
      fetchServices()
      exitEditMode()
    }
  } catch (error) {
    notifyError('Error updating service: ' + error.message)
  }
}

const bulkDelete = async () => {
  try {
    for (const id of selectedIds.value) {
      await deleteDoc(doc(db, 'services', id))
    }
    notifySuccess(`${selectedIds.value.length} service(s) deleted successfully!`)
    selectedIds.value = []
    showDeleteModal.value = false
    fetchServices()
    exitEditMode()
  } catch (error) {
    notifyError('Error deleting services: ' + error.message)
  }
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

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
.animate-fadeIn { animation: fadeIn 0.3s ease-out; }
</style>
