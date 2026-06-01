<template>
  <div class="min-h-screen bg-white text-slate-800 antialiased font-sans">

    <header
      :class="[
        'sticky top-0 z-50 bg-white/80 backdrop-blur-md transition-all duration-300 border-b',
        isScrolled ? 'shadow-sm border-slate-100 py-2' : 'border-transparent py-4'
      ]"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div class="flex items-center gap-3 cursor-pointer" @click="scrollTo('home')">
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
          <button @click="scrollTo('home')" class="hover:text-emerald-700 transition-colors">Home</button>
          <button @click="scrollTo('how')" class="hover:text-emerald-700 transition-colors">Process</button>
          <button @click="scrollTo('features')" class="hover:text-emerald-700 transition-colors">Features</button>
          <button @click="scrollTo('contact')" class="hover:text-emerald-700 transition-colors">Contact</button>
        </nav>
      </div>
    </header>

    <section
      ref="home"
      class="relative flex items-center justify-center text-center py-24 sm:py-36 bg-cover bg-center bg-no-repeat overflow-hidden"
      :style="{ backgroundImage: 'url(/hospital_bg.jpeg)' }"
    >
      <div class="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"></div>
      
      <div class="absolute inset-0 bg-linear-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none"></div>

      <div class="relative max-w-3xl mx-auto px-4 text-white space-y-8">
        <div class="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase border border-emerald-500/30">
           Healthcare Billing
        </div>
        
        <h1 class="text-4xl sm:text-6xl font-black tracking-tight drop-shadow-sm text-white">
          MaEs <span class="text-emerald-400">Paytrack</span>
        </h1>
        
        <p class="text-base sm:text-xl text-slate-200 max-w-2xl mx-auto font-light leading-relaxed">
          A beautifully minimal, fully digital hospital billing platform engineered for absolute efficiency, transparency, and administrative ease.
        </p>

        <div class="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
          <button
            @click="goToRegister"
            class="w-full sm:w-auto bg-emerald-600 text-white px-8 py-3.5 rounded-xl hover:bg-emerald-500 transition-all font-semibold text-sm shadow-md shadow-emerald-900/20 hover:-translate-y-px"
          >
            Get Started Free
          </button>
          <button
            @click="goToLogin"
            class="w-full sm:w-auto bg-white/10 text-white backdrop-blur-md px-8 py-3.5 rounded-xl hover:bg-white/20 transition-all font-semibold text-sm border border-white/20"
          >
            Sign In to Dashboard
          </button>
        </div>

        <div class="pt-8 flex justify-center opacity-85">
          <HeartbeatLine />
        </div>
      </div>
    </section>

    <section ref="how" class="py-20 sm:py-28 bg-slate-50">
      <div class="max-w-6xl mx-auto px-4">
        <div class="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
          <h2 class="text-xs uppercase tracking-widest text-emerald-600 font-bold mb-3">Workflow Workflow</h2>
          <p class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Optimized billing in 4 simple steps
          </p>
          <p class="mt-4 text-slate-500 text-sm sm:text-base">
            Our frictionless automation blueprint reduces overhead layout timelines and keeps hospital desk administrative tasks moving smoothly.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          
          <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group hover:shadow-md transition">
            <div class="w-12 h-12 flex items-center justify-center bg-emerald-50 text-emerald-700 rounded-xl mb-5 font-bold group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <User class="w-5 h-5" />
            </div>
            <span class="absolute top-6 right-6 text-slate-200 font-bold text-lg">01</span>
            <h3 class="font-bold text-slate-900 text-base mb-2">Secure Registration</h3>
            <p class="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Create an administrative or staff hub account linked directly to your secure hospital node.
            </p>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group hover:shadow-md transition">
            <div class="w-12 h-12 flex items-center justify-center bg-emerald-50 text-emerald-700 rounded-xl mb-5 font-bold group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <UserPlus class="w-5 h-5" />
            </div>
            <span class="absolute top-6 right-6 text-slate-200 font-bold text-lg">02</span>
            <h3 class="font-bold text-slate-900 text-base mb-2">Log Admissions</h3>
            <p class="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Input patient vitals, personal data, and treatments received into our clean digital records ledger.
            </p>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group hover:shadow-md transition">
            <div class="w-12 h-12 flex items-center justify-center bg-emerald-50 text-emerald-700 rounded-xl mb-5 font-bold group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <FileText class="w-5 h-5" />
            </div>
            <span class="absolute top-6 right-6 text-slate-200 font-bold text-lg">03</span>
            <h3 class="font-bold text-slate-900 text-base mb-2">Auto-Generate</h3>
            <p class="text-xs sm:text-sm text-slate-500 leading-relaxed">
              The engine compiles active items instantly, generating clean itemized invoices without manual math.
            </p>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group hover:shadow-md transition">
            <div class="w-12 h-12 flex items-center justify-center bg-emerald-50 text-emerald-700 rounded-xl mb-5 font-bold group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <CreditCard class="w-5 h-5" />
            </div>
            <span class="absolute top-6 right-6 text-slate-200 font-bold text-lg">04</span>
            <h3 class="font-bold text-slate-900 text-base mb-2">Track Settlements</h3>
            <p class="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Process secure digital mobile payments while monitoring real-time balance sheets seamlessly.
            </p>
          </div>

        </div>
      </div>
    </section>

    <section ref="features" class="py-20 sm:py-28 bg-white border-t border-slate-100">
      <div class="max-w-6xl mx-auto px-4">
        
        <div class="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
          <h2 class="text-xs uppercase tracking-widest text-emerald-600 font-bold mb-3">System Capabilities</h2>
          <p class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Engineered for high-reliability medical operations
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16">
          
          <div class="space-y-6">
            <div class="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div class="p-2 bg-emerald-50 rounded-lg text-emerald-700">
                <LayoutDashboard class="w-5 h-5" />
              </div>
              <h3 class="text-xl font-bold text-slate-900">Core Features</h3>
            </div>
            
            <div class="space-y-4">
              <div class="p-5 bg-slate-50 rounded-xl border border-slate-100 transition hover:bg-slate-50/50">
                <h4 class="font-semibold text-slate-900 text-sm sm:text-base flex items-center gap-2 mb-1">
                  <FileSpreadsheet class="w-4 h-4 text-emerald-600" /> Digital Patient Invoicing
                </h4>
                <p class="text-xs sm:text-sm text-slate-500 leading-relaxed pl-6">
                  Instantly break down complex stays into easily understandable itemized invoices for rooms, medications, and dynamic physician fees.
                </p>
              </div>

              <div class="p-5 bg-slate-50 rounded-xl border border-slate-100 transition hover:bg-slate-50/50">
                <h4 class="font-semibold text-slate-900 text-sm sm:text-base flex items-center gap-2 mb-1">
                  <Wallet class="w-4 h-4 text-emerald-600" /> GCash & Cash Reconciliation
                </h4>
                <p class="text-xs sm:text-sm text-slate-500 leading-relaxed pl-6">
                  Supports modern e-wallets alongside standard over-the-counter payments to keep collections simple for patient relatives.
                </p>
              </div>

              <div class="p-5 bg-slate-50 rounded-xl border border-slate-100 transition hover:bg-slate-50/50">
                <h4 class="font-semibold text-slate-900 text-sm sm:text-base flex items-center gap-2 mb-1">
                  <BarChart3 class="w-4 h-4 text-emerald-600" /> Real-time Analytics Dashboard
                </h4>
                <p class="text-xs sm:text-sm text-slate-500 leading-relaxed pl-6">
                  Gain an instant birds-eye insight on total collections, outstanding receivables, and peak admissions volume on a single clean interface.
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div class="p-2 bg-emerald-50 rounded-lg text-emerald-700">
                <CheckCircle2 class="w-5 h-5" />
              </div>
              <h3 class="text-xl font-bold text-slate-900">Why Choose MAES?</h3>
            </div>

            <div class="space-y-4">
              <div class="p-5 bg-slate-50 rounded-xl border border-slate-100 transition hover:bg-slate-50/50">
                <h4 class="font-semibold text-slate-900 text-sm sm:text-base flex items-center gap-2 mb-1">
                  <Zap class="w-4 h-4 text-emerald-600" /> Eradicate Manual Labor
                </h4>
                <p class="text-xs sm:text-sm text-slate-500 leading-relaxed pl-6">
                  Transition your frontline medical secretaries away from confusing paper logs or messy spreadsheets into structured cloud automation.
                </p>
              </div>

              <div class="p-5 bg-slate-50 rounded-xl border border-slate-100 transition hover:bg-slate-50/50">
                <h4 class="font-semibold text-slate-900 text-sm sm:text-base flex items-center gap-2 mb-1">
                  <ShieldAlert class="w-4 h-4 text-emerald-600" /> Precision Accounting
                </h4>
                <p class="text-xs sm:text-sm text-slate-500 leading-relaxed pl-6">
                  Protect against clerical human computation error patterns and minimize discrepancy issues between admissions desks and internal cashiers.
                </p>
              </div>

              <div class="p-5 bg-slate-50 rounded-xl border border-slate-100 transition hover:bg-slate-50/50">
                <h4 class="font-semibold text-slate-900 text-sm sm:text-base flex items-center gap-2 mb-1">
                  <Eye class="w-4 h-4 text-emerald-600" /> Transparent Operations
                </h4>
                <p class="text-xs sm:text-sm text-slate-500 leading-relaxed pl-6">
                  Deliver absolute financial clarity to patients and regulatory auditors alike with transparent data storage structures.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <section ref="contact" class="py-20 sm:py-28 text-center bg-slate-950 text-white relative overflow-hidden">
      <div class="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>

      <div class="relative max-w-4xl mx-auto px-4 space-y-6">
        <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight">
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
            <span>📞</span> <strong class="text-slate-200">+639-310-783-528</strong>
          </div>
          <div class="flex items-center justify-center gap-2 bg-slate-900/50 py-3 rounded-xl border border-slate-800/40">
            <span>📧</span> <span class="text-slate-200 font-medium">meghlabibis@gmail.com</span>
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

const goToLogin = () => router.push('/login')
const goToRegister = () => router.push('/register')

// Accordion
const open = ref(null)
function toggle(section) {
  open.value = open.value === section ? null : section
}

// Mobile menu
const mobileMenu = ref(false)

// Scroll behavior for header
const isScrolled = ref(false)
const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  loadTawk();
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
