<template>
  <div class="flex flex-col min-h-screen bg-[#1a1a1a] text-gray-200 overflow-x-hidden">
    <!-- Topbar -->
    <div class="fixed top-0 left-0 right-0 z-30">
      <AdminTopbar />
    </div>

    <div class="flex pt-14">
      <!-- Sidebar -->
      <aside>
        <AdminSidebar />
      </aside>

      <!-- Main Content -->
      <main class="flex-1 p-6 space-y-8 overflow-y-auto h-[calc(100vh-3.5rem)] custom-scrollbar">
        <div class="max-w-5xl mx-auto">
          <div class="flex items-center gap-3 mb-8">
            <SettingsIcon class="w-8 h-8 text-green-400" />
            <h1 class="text-3xl font-bold text-gray-100">Settings</h1>
          </div>

          <!-- Tabs Navigation -->
          <div class="flex border-b border-gray-700 mb-6">
            <button
              @click="activeTab = 'general'"
              :class="[
                'px-6 py-3 font-medium transition-all duration-200 border-b-2',
                activeTab === 'general'
                  ? 'border-green-500 text-green-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              ]"
            >
              General
            </button>
            <button
              @click="activeTab = 'landing'"
              :class="[
                'px-6 py-3 font-medium transition-all duration-200 border-b-2',
                activeTab === 'landing'
                  ? 'border-green-500 text-green-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              ]"
            >
              Landing Page Editor
            </button>
          </div>

          <!-- General Settings Tab -->
          <div v-if="activeTab === 'general'" class="space-y-6">
            <div class="bg-[#2a2a2a] p-6 rounded-xl border border-gray-700 shadow-sm">
              <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
                <Palette class="w-5 h-5 text-blue-400" /> Appearance
              </h2>
              <div class="flex items-center justify-between p-4 bg-[#1e1e1e] rounded-lg border border-gray-700">
                <div>
                  <p class="font-medium">Dark Mode</p>
                  <p class="text-sm text-gray-400">Toggle between light and dark theme for the entire application.</p>
                </div>
                <button 
                  @click="toggleDarkMode"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#1a1a1a]"
                  :class="isDarkMode ? 'bg-green-600' : 'bg-gray-600'"
                >
                  <span
                    class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    :class="isDarkMode ? 'translate-x-6' : 'translate-x-1'"
                  />
                </button>
              </div>
            </div>
          </div>

          <!-- Landing Page Editor Tab -->
          <div v-if="activeTab === 'landing'" class="space-y-8">
            <!-- Hero Section -->
            <div class="bg-[#2a2a2a] p-6 rounded-xl border border-gray-700 shadow-sm">
              <h2 class="text-xl font-semibold mb-6 flex items-center gap-2 border-b border-gray-700 pb-2">
                <Monitor class="w-5 h-5 text-purple-400" /> Hero Section
              </h2>
              <div class="grid grid-cols-1 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-400 mb-1">Hero Title</label>
                  <input 
                    v-model="landingData.hero.title"
                    type="text" 
                    class="w-full bg-[#1e1e1e] border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400 mb-1">Hero Subtitle</label>
                  <textarea 
                    v-model="landingData.hero.subtitle"
                    rows="3"
                    class="w-full bg-[#1e1e1e] border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  ></textarea>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1">CTA Button 1 (Primary)</label>
                    <input 
                      v-model="landingData.hero.cta1"
                      type="text" 
                      class="w-full bg-[#1e1e1e] border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-400 mb-1">CTA Button 2 (Secondary)</label>
                    <input 
                      v-model="landingData.hero.cta2"
                      type="text" 
                      class="w-full bg-[#1e1e1e] border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Workflow Section -->
            <div class="bg-[#2a2a2a] p-6 rounded-xl border border-gray-700 shadow-sm">
              <h2 class="text-xl font-semibold mb-6 flex items-center gap-2 border-b border-gray-700 pb-2">
                <Zap class="w-5 h-5 text-yellow-400" /> Workflow Section
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div v-for="(step, index) in landingData.workflow" :key="index" class="p-4 bg-[#1e1e1e] rounded-lg border border-gray-700">
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-xs font-bold text-green-500 uppercase tracking-widest">Step 0{{ index + 1 }}</span>
                  </div>
                  <div class="space-y-3">
                    <input 
                      v-model="step.title"
                      type="text" 
                      placeholder="Step Title"
                      class="w-full bg-[#2a2a2a] border border-gray-600 rounded px-3 py-1.5 text-sm"
                    />
                    <textarea 
                      v-model="step.description"
                      rows="2"
                      placeholder="Step Description"
                      class="w-full bg-[#2a2a2a] border border-gray-600 rounded px-3 py-1.5 text-sm"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- Features Section -->
            <div class="bg-[#2a2a2a] p-6 rounded-xl border border-gray-700 shadow-sm">
              <h2 class="text-xl font-semibold mb-6 flex items-center gap-2 border-b border-gray-700 pb-2">
                <LayoutDashboard class="w-5 h-5 text-emerald-400" /> Features Section
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div v-for="(feature, index) in landingData.features" :key="index" class="p-4 bg-[#1e1e1e] rounded-lg border border-gray-700">
                  <div class="space-y-3">
                    <input 
                      v-model="feature.title"
                      type="text" 
                      placeholder="Feature Title"
                      class="w-full bg-[#2a2a2a] border border-gray-600 rounded px-3 py-1.5 text-sm"
                    />
                    <textarea 
                      v-model="feature.description"
                      rows="3"
                      placeholder="Feature Description"
                      class="w-full bg-[#2a2a2a] border border-gray-600 rounded px-3 py-1.5 text-sm"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- Benefits Section (Why Choose) -->
            <div class="bg-[#2a2a2a] p-6 rounded-xl border border-gray-700 shadow-sm">
              <h2 class="text-xl font-semibold mb-6 flex items-center gap-2 border-b border-gray-700 pb-2">
                <CheckCircle2 class="w-5 h-5 text-blue-400" /> Why Choose Section
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div v-for="(benefit, index) in landingData.benefits" :key="index" class="p-4 bg-[#1e1e1e] rounded-lg border border-gray-700">
                  <div class="space-y-3">
                    <input 
                      v-model="benefit.title"
                      type="text" 
                      placeholder="Benefit Title"
                      class="w-full bg-[#2a2a2a] border border-gray-600 rounded px-3 py-1.5 text-sm"
                    />
                    <textarea 
                      v-model="benefit.description"
                      rows="3"
                      placeholder="Benefit Description"
                      class="w-full bg-[#2a2a2a] border border-gray-600 rounded px-3 py-1.5 text-sm"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- Contact Info -->
            <div class="bg-[#2a2a2a] p-6 rounded-xl border border-gray-700 shadow-sm">
              <h2 class="text-xl font-semibold mb-6 flex items-center gap-2 border-b border-gray-700 pb-2">
                <Phone class="w-5 h-5 text-emerald-400" /> Contact Information
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
                  <input 
                    v-model="landingData.contact.phone"
                    type="text" 
                    class="w-full bg-[#1e1e1e] border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                  <input 
                    v-model="landingData.contact.email"
                    type="email" 
                    class="w-full bg-[#1e1e1e] border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end gap-4 pb-12">
              <button 
                @click="resetToDefaults"
                class="px-6 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition"
              >
                Reset to Defaults
              </button>
              <button 
                @click="saveLandingSettings"
                :disabled="saving"
                class="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition disabled:opacity-50 flex items-center gap-2"
              >
                <Save v-if="!saving" class="w-4 h-4" />
                <span v-if="saving">Saving...</span>
                <span v-else>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '@/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { useNotifications } from '@/composables/useNotifications'
import AdminSidebar from '@/components/AdminSidebar.vue'
import AdminTopbar from '@/components/AdminTopbar.vue'
import { 
  Settings as SettingsIcon, 
  Palette, 
  Monitor, 
  Zap, 
  Phone, 
  Save,
  CheckCircle2,
  LayoutDashboard
} from 'lucide-vue-next'

const { success: notifySuccess, error: notifyError } = useNotifications()

const activeTab = ref('general')
const saving = ref(false)
const isDarkMode = ref(localStorage.getItem('theme') === 'dark')

const landingData = ref({
  hero: {
    title: 'MaEs Paytrack',
    subtitle: 'A beautifully minimal, fully digital hospital billing platform engineered for absolute efficiency, transparency, and administrative ease.',
    cta1: 'Get Started Free',
    cta2: 'Sign In to Dashboard'
  },
  workflow: [
    { title: 'Secure Registration', description: 'Create an administrative or staff hub account linked directly to your secure hospital node.' },
    { title: 'Log Admissions', description: 'Input patient vitals, personal data, and treatments received into our clean digital records ledger.' },
    { title: 'Auto-Generate', description: 'The engine compiles active items instantly, generating clean itemized invoices without manual math.' },
    { title: 'Track Settlements', description: 'Process secure digital mobile payments while monitoring real-time balance sheets seamlessly.' }
  ],
  features: [
    { title: 'Digital Patient Invoicing', description: 'Instantly break down complex stays into easily understandable itemized invoices for rooms, medications, and dynamic physician fees.' },
    { title: 'GCash & Cash Reconciliation', description: 'Supports modern e-wallets alongside standard over-the-counter payments to keep collections simple for patient relatives.' },
    { title: 'Real-time Analytics Dashboard', description: 'Gain an instant birds-eye insight on total collections, outstanding receivables, and peak admissions volume on a single clean interface.' }
  ],
  benefits: [
    { title: 'Eradicate Manual Labor', description: 'Transition your frontline medical secretaries away from confusing paper logs or messy spreadsheets into structured cloud automation.' },
    { title: 'Precision Accounting', description: 'Protect against clerical human computation error patterns and minimize discrepancy issues between admissions desks and internal cashiers.' },
    { title: 'Transparent Operations', description: 'Deliver absolute financial clarity to patients and regulatory auditors alike with transparent data storage structures.' }
  ],
  contact: {
    phone: '+639-310-783-528',
    email: 'meghlabibis@gmail.com'
  }
})

// Theme Logic
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  const theme = isDarkMode.value ? 'dark' : 'light'
  localStorage.setItem('theme', theme)
  
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  
  notifySuccess(`Theme switched to ${theme} mode`)
}

// Load Settings from Firestore
const loadSettings = async () => {
  try {
    const docRef = doc(db, 'site_settings', 'landing_page')
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      landingData.value = { ...landingData.value, ...docSnap.data() }
    }
  } catch (err) {
    console.error('Error loading settings:', err)
  }
}

// Save Settings to Firestore
const saveLandingSettings = async () => {
  saving.value = true
  try {
    await setDoc(doc(db, 'site_settings', 'landing_page'), landingData.value)
    notifySuccess('Landing page settings updated successfully!')
  } catch (err) {
    console.error('Error saving settings:', err)
    notifyError('Failed to save settings.')
  } finally {
    saving.value = false
  }
}

const resetToDefaults = () => {
  if (confirm('Are you sure you want to reset all landing page content to defaults?')) {
    landingData.value = {
      hero: {
        title: 'MaEs Paytrack',
        subtitle: 'A beautifully minimal, fully digital hospital billing platform engineered for absolute efficiency, transparency, and administrative ease.',
        cta1: 'Get Started Free',
        cta2: 'Sign In to Dashboard'
      },
      workflow: [
        { title: 'Secure Registration', description: 'Create an administrative or staff hub account linked directly to your secure hospital node.' },
        { title: 'Log Admissions', description: 'Input patient vitals, personal data, and treatments received into our clean digital records ledger.' },
        { title: 'Auto-Generate', description: 'The engine compiles active items instantly, generating clean itemized invoices without manual math.' },
        { title: 'Track Settlements', description: 'Process secure digital mobile payments while monitoring real-time balance sheets seamlessly.' }
      ],
      features: [
        { title: 'Digital Patient Invoicing', description: 'Instantly break down complex stays into easily understandable itemized invoices for rooms, medications, and dynamic physician fees.' },
        { title: 'GCash & Cash Reconciliation', description: 'Supports modern e-wallets alongside standard over-the-counter payments to keep collections simple for patient relatives.' },
        { title: 'Real-time Analytics Dashboard', description: 'Gain an instant birds-eye insight on total collections, outstanding receivables, and peak admissions volume on a single clean interface.' }
      ],
      benefits: [
        { title: 'Eradicate Manual Labor', description: 'Transition your frontline medical secretaries away from confusing paper logs or messy spreadsheets into structured cloud automation.' },
        { title: 'Precision Accounting', description: 'Protect against clerical human computation error patterns and minimize discrepancy issues between admissions desks and internal cashiers.' },
        { title: 'Transparent Operations', description: 'Deliver absolute financial clarity to patients and regulatory auditors alike with transparent data storage structures.' }
      ],
      contact: {
        phone: '+639-310-783-528',
        email: 'meghlabibis@gmail.com'
      }
    }
  }
}

onMounted(() => {
  loadSettings()
  // Ensure theme class is applied on mount
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #374151;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #4b5563;
}
</style>
