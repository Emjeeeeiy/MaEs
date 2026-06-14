<template>
  <AdminLayout>
    <div class="min-h-screen bg-gray-50/50 dark:bg-[#121212] p-6 text-gray-900 dark:text-gray-100 font-sans">
      <div class="max-w-4xl mx-auto">
        
        <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-5 border-b border-gray-200/60 dark:border-gray-800/60">
          <div>
            <div class="flex items-center gap-2.5">
              <div class="p-1 rounded-md bg-gray-50 dark:bg-[#222] border border-gray-100 dark:border-gray-800/60">
                <SettingsIcon class="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </div>
              <h1 class="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">System Configuration</h1>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">I-adjust ang pangkalahatang tema o baguhin ang mga dynamic copy at impormasyon ng iyong pampublikong landing page.</p>
          </div>
        </header>

        <div class="flex items-center gap-1 border-b border-gray-200/60 dark:border-gray-800/60 mb-8 text-xs font-medium">
          <button
            @click="activeTab = 'general'"
            :class="[
              'px-4 py-2.5 transition relative -mb-px border-b-2',
              activeTab === 'general'
                ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            ]"
          >
            General Parameters
          </button>
          <button
            @click="activeTab = 'landing'"
            :class="[
              'px-4 py-2.5 transition relative -mb-px border-b-2',
              activeTab === 'landing'
                ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            ]"
          >
            Landing Page Content Editor
          </button>
        </div>

        <div v-if="activeTab === 'general'" class="animate-fadeIn">
          <div class="bg-white dark:bg-[#1a1a1a] border border-gray-200/70 dark:border-gray-800/70 rounded-xl p-5 shadow-2xs">
            <h2 class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4 flex items-center gap-2">
              <Palette class="w-3.5 h-3.5" /> Appearance Settings
            </h2>
            
            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#222]/30 border border-gray-200/40 dark:border-gray-800/40 rounded-lg">
              <div class="space-y-0.5">
                <p class="text-xs font-semibold text-gray-900 dark:text-white">Dark Theme Override</p>
                <p class="text-[11px] text-gray-400 dark:text-gray-500">Mabilis na magpalit sa pagitan ng light at dark display parameters para sa buong dashboard application.</p>
              </div>
              
              <button 
                @click="toggleDarkMode"
                class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition focus:outline-none"
                :class="isDarkMode ? 'bg-gray-900 dark:bg-white' : 'bg-gray-200'"
              >
                <span
                  class="inline-block h-3.5 w-3.5 transform rounded-full transition"
                  :class="[
                    isDarkMode 
                      ? 'translate-x-5 bg-white dark:bg-gray-900' 
                      : 'translate-x-0.5 bg-white'
                  ]"
                />
              </button>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'landing'" class="space-y-6 animate-fadeIn">
          
          <div class="bg-white dark:bg-[#1a1a1a] border border-gray-200/70 dark:border-gray-800/70 rounded-xl p-5 shadow-2xs space-y-4">
            <h2 class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 pb-2 border-b border-gray-100 dark:border-gray-800/60 flex items-center gap-2">
              <Monitor class="w-3.5 h-3.5" /> Hero Billboard Section
            </h2>
            
            <div class="grid grid-cols-1 gap-4 text-xs">
              <div class="space-y-1">
                <label class="font-medium text-gray-500">Main Title Banner</label>
                <input 
                  v-model="landingData.hero.title"
                  type="text" 
                  class="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition"
                />
              </div>
              
              <div class="space-y-1">
                <label class="font-medium text-gray-500">Sub-narrative Subtitle</label>
                <textarea 
                  v-model="landingData.hero.subtitle"
                  rows="2"
                  class="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition resize-none leading-relaxed"
                />
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="font-medium text-gray-500">Primary action trigger (CTA 1)</label>
                  <input 
                    v-model="landingData.hero.cta1"
                    type="text" 
                    class="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition"
                  />
                </div>
                <div class="space-y-1">
                  <label class="font-medium text-gray-500">Secondary action trigger (CTA 2)</label>
                  <input 
                    v-model="landingData.hero.cta2"
                    type="text" 
                    class="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-[#1a1a1a] border border-gray-200/70 dark:border-gray-800/70 rounded-xl p-5 shadow-2xs space-y-4">
            <h2 class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 pb-2 border-b border-gray-100 dark:border-gray-800/60 flex items-center gap-2">
              <Zap class="w-3.5 h-3.5" /> Operations Workflow
            </h2>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div 
                v-for="(step, index) in landingData.workflow" 
                :key="index" 
                class="p-4 bg-gray-50/50 dark:bg-[#222]/20 border border-gray-100 dark:border-gray-800 rounded-xl space-y-2.5"
              >
                <span class="inline-block text-[10px] font-mono tracking-wider text-gray-400 uppercase font-semibold">Stage Sequence 0{{ index + 1 }}</span>
                <div class="space-y-2">
                  <input 
                    v-model="step.title"
                    type="text" 
                    placeholder="Workflow heading..."
                    class="w-full bg-white dark:bg-[#222] border border-gray-200/60 dark:border-gray-800/60 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition"
                  />
                  <textarea 
                    v-model="step.description"
                    rows="2"
                    placeholder="Short process instruction detail description..."
                    class="w-full bg-white dark:bg-[#222] border border-gray-200/60 dark:border-gray-800/60 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition resize-none layout-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-[#1a1a1a] border border-gray-200/70 dark:border-gray-800/70 rounded-xl p-5 shadow-2xs space-y-4">
            <h2 class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 pb-2 border-b border-gray-100 dark:border-gray-800/60 flex items-center gap-2">
              <LayoutDashboard class="w-3.5 h-3.5" /> Capabilities & Features
            </h2>
            
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div 
                v-for="(feature, index) in landingData.features" 
                :key="index" 
                class="p-3.5 bg-gray-50/50 dark:bg-[#222]/20 border border-gray-100 dark:border-gray-800 rounded-xl space-y-2"
              >
                <input 
                  v-model="feature.title"
                  type="text" 
                  placeholder="Feature label title..."
                  class="w-full bg-white dark:bg-[#222] border border-gray-200/60 dark:border-gray-800/60 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition"
                />
                <textarea 
                  v-model="feature.description"
                  rows="3"
                  placeholder="Elaborate value proposition parameters..."
                  class="w-full bg-white dark:bg-[#222] border border-gray-200/60 dark:border-gray-800/60 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition resize-none text-[11px]"
                />
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-[#1a1a1a] border border-gray-200/70 dark:border-gray-800/70 rounded-xl p-5 shadow-2xs space-y-4">
            <h2 class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 pb-2 border-b border-gray-100 dark:border-gray-800/60 flex items-center gap-2">
              <CheckCircle2 class="w-3.5 h-3.5" /> Value Propositions (Why Us)
            </h2>
            
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div 
                v-for="(benefit, index) in landingData.benefits" 
                :key="index" 
                class="p-3.5 bg-gray-50/50 dark:bg-[#222]/20 border border-gray-100 dark:border-gray-800 rounded-xl space-y-2"
              >
                <input 
                  v-model="benefit.title"
                  type="text" 
                  placeholder="Benefit label headline..."
                  class="w-full bg-white dark:bg-[#222] border border-gray-200/60 dark:border-gray-800/60 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition"
                />
                <textarea 
                  v-model="benefit.description"
                  rows="3"
                  placeholder="Provide supporting analytical matrix or proofs..."
                  class="w-full bg-white dark:bg-[#222] border border-gray-200/60 dark:border-gray-800/60 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition resize-none text-[11px]"
                />
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-[#1a1a1a] border border-gray-200/70 dark:border-gray-800/70 rounded-xl p-5 shadow-2xs space-y-4">
            <h2 class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 pb-2 border-b border-gray-100 dark:border-gray-800/60 flex items-center gap-2">
              <Phone class="w-3.5 h-3.5" /> Communications Nodes
            </h2>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div class="space-y-1">
                <label class="font-medium text-gray-500">Public Hotline Support</label>
                <input 
                  v-model="landingData.contact.phone"
                  type="text" 
                  class="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition"
                />
              </div>
              <div class="space-y-1">
                <label class="font-medium text-gray-500">Corporate Email Gateway</label>
                <input 
                  v-model="landingData.contact.email"
                  type="email" 
                  class="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition"
                />
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 pb-8">
            <button 
              @click="resetToDefaults"
              class="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-transparent dark:hover:bg-[#222] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 transition"
            >
              Reset Defaults
            </button>
            <button 
              @click="saveLandingSettings"
              :disabled="saving"
              class="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg text-xs font-medium transition shadow-sm active:scale-97 disabled:opacity-40"
            >
              <SaveIcon v-if="!saving" class="w-3.5 h-3.5" />
              <span>{{ saving ? 'Syncing Modules...' : 'Commit Changes' }}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  </AdminLayout>

  <!-- ================= GENERIC CONFIRMATION MODAL ================= -->
  <transition name="fade">
    <div
      v-if="confirmationModal.show"
      class="fixed inset-0 z-100 flex items-center justify-center bg-black/20 dark:bg-black/50 backdrop-blur-xs px-4"
      @click="confirmationModal.show = false"
    >
      <div 
        class="bg-white dark:bg-[#1a1a1a] w-full max-w-md p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl relative animate-fadeIn"
        @click.stop
      >
        <div :class="['flex items-center gap-3 mb-4', confirmationModal.isDestructive ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400']">
          <div :class="['p-3 rounded-2xl border', confirmationModal.isDestructive ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30' : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30']">
            <component :is="confirmationModal.icon || AlertTriangleIcon" class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-lg font-black tracking-tight">{{ confirmationModal.title }}</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">Please confirm your action.</p>
          </div>
        </div>
        
        <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
          {{ confirmationModal.message }}
        </p>
        
        <div class="flex justify-end gap-3">
          <button
            @click="confirmationModal.show = false"
            class="px-6 py-3 rounded-2xl text-xs font-bold bg-gray-50 dark:bg-transparent hover:bg-gray-100 dark:hover:bg-[#222] border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 transition"
          >
            Cancel
          </button>
          <button
            @click="handleConfirmedAction"
            :class="['px-6 py-3 rounded-2xl text-xs font-bold text-white transition shadow-lg', confirmationModal.isDestructive ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20']"
          >
            {{ confirmationModal.confirmText }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '@/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { useNotifications } from '@/composables/useNotifications'
import AdminLayout from '@/components/AdminLayout.vue'
import { 
  Settings as SettingsIcon, 
  Palette, 
  Monitor, 
  Zap, 
  Phone, 
  Save as SaveIcon,
  CheckCircle2,
  LayoutDashboard,
  AlertTriangle as AlertTriangleIcon
} from 'lucide-vue-next'

const { success: notifySuccess, error: notifyError } = useNotifications()

const activeTab = ref('general')
const saving = ref(false)
const isDarkMode = ref(localStorage.getItem('theme') === 'dark')

// Confirmation Modal State
const confirmationModal = ref({
  show: false,
  title: '',
  message: '',
  confirmText: '',
  isDestructive: false,
  icon: null,
  action: null
});

const handleConfirmedAction = () => {
  if (confirmationModal.value.action) {
    confirmationModal.value.action();
  }
  confirmationModal.value.show = false;
};

const openConfirm = (config) => {
  confirmationModal.value = {
    show: true,
    title: config.title || 'Are you sure?',
    message: config.message || 'This action cannot be undone.',
    confirmText: config.confirmText || 'Confirm',
    isDestructive: config.isDestructive || false,
    icon: config.icon || AlertTriangleIcon,
    action: config.action
  };
};

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
  openConfirm({
    title: 'Reset Landing Page?',
    message: 'Sigurado ka bang nais mong ibalik sa default ang lahat ng content ng landing page? Ang aksyong ito ay magpapalit sa iyong mga kasalukuyang customized labels at descriptions.',
    confirmText: 'Yes, Reset to Default',
    isDestructive: true,
    action: () => {
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
      notifySuccess('Reset successful. Click commit to save changes.');
    }
  });
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
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.animate-fadeIn { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
</style>
