<template>
  <div class="min-h-screen bg-white text-slate-800 antialiased font-sans">

    <header
      :class="[
        'sticky top-0 z-50 bg-white/80 backdrop-blur-md transition-all duration-300 border-b',
        isScrolled ? 'shadow-sm border-slate-100 py-2' : 'border-transparent py-4'
      ]"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div class="flex items-center gap-3 cursor-pointer" @click="scrollTo('home')" aria-label="Go to Home" role="button" tabindex="0">
          <img
            src="/MaEs_logo2.png"
            alt="MAES Logo"
            class="rounded-full object-cover transition-all duration-300"
            :class="isScrolled ? 'h-8 w-8' : 'h-10 w-10'"
          />
          <div class="flex flex-col">
            <span class="font-bold text-emerald-800 tracking-tight text-sm sm:text-base leading-none">
              Maria Estrella
            </span>
            <span class="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-0.5">
              Paytrack
            </span>
          </div>
        </div>

        <nav class="flex gap-4 sm:gap-8 text-xs sm:text-sm font-medium text-slate-600">
          <button @click="scrollTo('home')" class="hover:text-emerald-700 transition-colors" aria-label="Home Section">Home</button>
          <button @click="scrollTo('how')" class="hover:text-emerald-700 transition-colors" aria-label="Process Section">Process</button>
          <button @click="scrollTo('features')" class="hover:text-emerald-700 transition-colors" aria-label="Features Section">Features</button>
          <button @click="scrollTo('contact')" class="hover:text-emerald-700 transition-colors" aria-label="Contact Section">Contact</button>
        </nav>
      </div>
    </header>

    <section
      ref="home"
      class="relative flex items-center justify-center text-center py-24 sm:py-36 bg-cover bg-center bg-no-repeat overflow-hidden"
      :style="{ backgroundImage: 'url(/hospital_bg.jpeg)' }"
      aria-labelledby="hero-title"
    >
      <div class="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]" aria-hidden="true"></div>
      
      <div class="absolute inset-0 bg-linear-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" aria-hidden="true"></div>

      <div class="relative max-w-3xl mx-auto px-4 text-white space-y-8">
        <div class="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase border border-emerald-500/30">
           Healthcare Billing
        </div>
        
        <h1 id="hero-title" class="text-4xl sm:text-6xl font-black tracking-tight drop-shadow-sm text-white">
          {{ landingData.hero.title.split(' ')[0] }} <span class="text-emerald-400">{{ landingData.hero.title.split(' ').slice(1).join(' ') }}</span>
        </h1>
        
        <p class="text-base sm:text-xl text-slate-200 max-w-2xl mx-auto font-light leading-relaxed">
          {{ landingData.hero.subtitle }}
        </p>

        <div class="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
          <button
            @click="goToRegister"
            class="w-full sm:w-auto bg-emerald-600 text-white px-8 py-3.5 rounded-xl hover:bg-emerald-500 transition-all font-semibold text-sm shadow-md shadow-emerald-900/20 hover:-translate-y-px"
          >
            {{ landingData.hero.cta1 }}
          </button>
          <button
            @click="goToLogin"
            class="w-full sm:w-auto bg-white/10 text-white backdrop-blur-md px-8 py-3.5 rounded-xl hover:bg-white/20 transition-all font-semibold text-sm border border-white/20"
          >
            {{ landingData.hero.cta2 }}
          </button>
        </div>

        <div class="pt-8 flex justify-center opacity-85" aria-hidden="true">
          <HeartbeatLine />
        </div>
      </div>
    </section>

    <section ref="how" class="py-20 sm:py-28 bg-slate-50" aria-labelledby="process-title">
      <div class="max-w-6xl mx-auto px-4">
        <div class="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
          <h2 id="process-title" class="text-xs uppercase tracking-widest text-emerald-600 font-bold mb-3">Workflow</h2>
          <p class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Optimized billing in 4 simple steps
          </p>
          <p class="mt-4 text-slate-500 text-sm sm:text-base">
            Our frictionless automation blueprint reduces overhead layout timelines and keeps hospital desk administrative tasks moving smoothly.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          
          <div v-for="(step, index) in landingData.workflow" :key="index" class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group hover:shadow-md transition">
            <div class="w-12 h-12 flex items-center justify-center bg-emerald-50 text-emerald-700 rounded-xl mb-5 font-bold group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300" aria-hidden="true">
              <component :is="workflowIcons[index]" class="w-5 h-5" />
            </div>
            <span class="absolute top-6 right-6 text-slate-200 font-bold text-lg" aria-hidden="true">0{{ index + 1 }}</span>
            <h3 class="font-bold text-slate-900 text-base mb-2">{{ step.title }}</h3>
            <p class="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {{ step.description }}
            </p>
          </div>

        </div>
      </div>
    </section>

    <section ref="features" class="py-20 sm:py-28 bg-white border-t border-slate-100" aria-labelledby="features-title">
      <div class="max-w-6xl mx-auto px-4">
        
        <div class="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
          <h2 id="features-title" class="text-xs uppercase tracking-widest text-emerald-600 font-bold mb-3">System Capabilities</h2>
          <p class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Engineered for high-reliability medical operations
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16">
          
          <div class="space-y-6">
            <div class="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div class="p-2 bg-emerald-50 rounded-lg text-emerald-700" aria-hidden="true">
                <LayoutDashboard class="w-5 h-5" />
              </div>
              <h3 class="text-xl font-bold text-slate-900">Core Features</h3>
            </div>
            
            <div class="space-y-4">
              <div v-for="(feature, index) in landingData.features" :key="index" class="p-5 bg-slate-50 rounded-xl border border-slate-100 transition hover:bg-slate-50/50">
                <h4 class="font-semibold text-slate-900 text-sm sm:text-base flex items-center gap-2 mb-1">
                  <component :is="featureIcons[index]" class="w-4 h-4 text-emerald-600" aria-hidden="true" /> {{ feature.title }}
                </h4>
                <p class="text-xs sm:text-sm text-slate-500 leading-relaxed pl-6">
                  {{ feature.description }}
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div class="p-2 bg-emerald-50 rounded-lg text-emerald-700" aria-hidden="true">
                <CheckCircle2 class="w-5 h-5" />
              </div>
              <h3 class="text-xl font-bold text-slate-900">Why Choose MAES?</h3>
            </div>

            <div class="space-y-4">
              <div v-for="(benefit, index) in landingData.benefits" :key="index" class="p-5 bg-slate-50 rounded-xl border border-slate-100 transition hover:bg-slate-50/50">
                <h4 class="font-semibold text-slate-900 text-sm sm:text-base flex items-center gap-2 mb-1">
                  <component :is="benefitIcons[index]" class="w-4 h-4 text-emerald-600" aria-hidden="true" /> {{ benefit.title }}
                </h4>
                <p class="text-xs sm:text-sm text-slate-500 leading-relaxed pl-6">
                  {{ benefit.description }}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <section ref="contact" class="py-20 sm:py-28 text-center bg-slate-950 text-white relative overflow-hidden" aria-labelledby="contact-title">
      <div class="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" aria-hidden="true"></div>

      <div class="relative max-w-4xl mx-auto px-4 space-y-6">
        <h2 id="contact-title" class="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Ready to transform your healthcare administrative flow?
        </h2>
        <p class="max-w-xl mx-auto text-slate-400 text-sm sm:text-base font-light">
          Deploy MaEs Paytrack to your medical facility today and experience error-free financial processing operations instantly.
        </p>

        <div class="pt-4">
          <button @click="goToRegister" class="bg-emerald-600 text-white px-8 py-3.5 rounded-xl hover:bg-emerald-500 transition-all font-semibold text-sm shadow-lg shadow-emerald-950/50 hover:-translate-y-px">
            Create Medical Unit Account
          </button>
        </div>

        <div class="pt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto text-xs sm:text-sm border-t border-slate-800/60 text-slate-400">
          <div class="flex items-center justify-center gap-2 bg-slate-900/50 py-3 rounded-xl border border-slate-800/40">
            <span aria-hidden="true">📞</span> <strong class="text-slate-200">{{ landingData.contact.phone }}</strong>
          </div>
          <div class="flex items-center justify-center gap-2 bg-slate-900/50 py-3 rounded-xl border border-slate-800/40">
            <span aria-hidden="true">📧</span> <span class="text-slate-200 font-medium">{{ landingData.contact.email }}</span>
          </div>
        </div>
      </div>
    </section>

    <footer class="text-center py-6 border-t border-slate-900 text-xs text-slate-500 bg-slate-950">
      &copy; 2026 MAES Hospital System. Built for next-gen medical resource management.
    </footer>
  </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import HeartbeatLine from '@/components/HeartbeatLine.vue'
import { useTawk } from "@/composables/useTawk";
import { db } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'
import {
  User,
  UserPlus,
  FileText,
  CreditCard,
  LayoutDashboard,
  FileSpreadsheet,
  Wallet,
  BarChart3,
  CheckCircle2,
  Zap,
  ShieldAlert,
  Eye
} from 'lucide-vue-next'

const router = useRouter()
const { loadTawk, unloadTawk } = useTawk();

const workflowIcons = [User, UserPlus, FileText, CreditCard]
const featureIcons = [FileSpreadsheet, Wallet, BarChart3]
const benefitIcons = [Zap, ShieldAlert, Eye]

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

const loadLandingData = async () => {
  try {
    const docRef = doc(db, 'site_settings', 'landing_page')
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      landingData.value = { ...landingData.value, ...docSnap.data() }
    }
  } catch (err) {
    console.error('Error loading landing page data:', err)
  }
}

const goToLogin = () => router.push('/login')
const goToRegister = () => router.push('/register')

// Scroll behavior for header
const isScrolled = ref(false)
const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  loadTawk();
  loadLandingData();
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  unloadTawk();
})

// Smooth scroll
const home = ref(null)
const how = ref(null)
const features = ref(null)
const benefits = ref(null)
const contact = ref(null)

const scrollTo = (section) => {
  const sections = { home, how, features, benefits, contact }
  sections[section]?.value?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
/* Fade + slide transition for accordion */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
