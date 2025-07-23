<template>
  <div class="h-screen w-screen overflow-hidden bg-gray-50 text-gray-800">
    <!-- Fixed Topbar -->
    <Topbar class="fixed top-0 left-0 right-0 h-16 z-30 bg-white shadow-sm" />

    <!-- Main Layout -->
    <div class="pt-16 flex h-[calc(100vh-4rem)]">
      <!-- Fixed Sidebar -->
      <Sidebar class="w-64 fixed top-16 bottom-0 left-0 border-r border-gray-200 bg-white z-20" />

      <!-- Scrollable Content Area -->
      <main class="ml-64 flex-1 overflow-y-auto p-6">
        <div class="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
          <h2 class="text-2xl font-bold mb-6">Hospital Billing Settings</h2>

          <form @submit.prevent="saveSettings" class="space-y-6">
            <div>
              <label class="block font-medium mb-1">Tax Rate (%)</label>
              <input
                v-model.number="settings.taxRate"
                type="number"
                min="0"
                class="w-full border rounded-md px-3 py-2 text-gray-800 bg-white focus:outline-none focus:ring focus:border-green-400"
                placeholder="e.g. 12"
              />
            </div>

            <div>
              <label class="block font-medium mb-1">Service Fee (₱)</label>
              <input
                v-model.number="settings.serviceFee"
                type="number"
                min="0"
                class="w-full border rounded-md px-3 py-2 text-gray-800 bg-white focus:outline-none focus:ring focus:border-green-400"
                placeholder="e.g. 500"
              />
            </div>

            <div>
              <label class="block font-medium mb-1">Invoice Note</label>
              <textarea
                v-model="settings.invoiceNote"
                rows="3"
                class="w-full border rounded-md px-3 py-2 text-gray-800 bg-white focus:outline-none focus:ring focus:border-green-400"
                placeholder="Thank you for choosing our hospital..."
              ></textarea>
            </div>

            <button
              type="submit"
              class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
              :disabled="loading"
            >
              {{ loading ? 'Saving...' : 'Save Settings' }}
            </button>

            <p v-if="successMessage" class="text-green-600 mt-2">{{ successMessage }}</p>
            <p v-if="errorMessage" class="text-red-600 mt-2">{{ errorMessage }}</p>
          </form>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import Topbar from '@/components/Topbar.vue'

const settings = ref({
  taxRate: 0,
  serviceFee: 0,
  invoiceNote: '',
})

const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const saveSettings = async () => {
  loading.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    successMessage.value = 'Billing settings updated successfully.'
  } catch (error) {
    errorMessage.value = 'Failed to save settings. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
