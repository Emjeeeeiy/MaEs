<template>
  <div class="min-h-screen bg-white text-gray-800">

    <!-- HEADER -->
    <header
      :class="[
        'sticky top-0 z-50 bg-white/95 backdrop-blur-sm transition-all duration-300',
        isScrolled ? 'shadow-lg rounded-b-2xl py-1' : 'shadow-md py-2'
      ]"
    >
      <div
        :class="[
          'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center transition-all duration-300',
          isScrolled ? 'py-1' : 'py-2'
        ]"
      >
        <!-- Logo -->
        <div class="flex items-center gap-2 sm:gap-3">
          <img
            src="/MaEs_logo2.png"
            alt="MAES Logo"
            class="rounded-full shadow-sm transition-all duration-300"
            :class="isScrolled ? 'h-7 w-7 sm:h-8 sm:w-8' : 'h-8 w-8 sm:h-10 sm:w-10'"
          />
          <span
            class="font-bold text-green-700 tracking-tight transition-all duration-300 text-sm sm:text-base"
          >
            Maria Estrella
          </span>
        </div>

        <!-- Navigation (always visible, responsive fonts) -->
        <nav class="flex gap-3 sm:gap-6 text-xs sm:text-sm font-medium text-gray-700">
          <button @click="scrollTo('home')" class="hover:text-green-700 transition">Home</button>
          <button @click="scrollTo('how')" class="hover:text-green-700 transition">How it Works</button>
          <button @click="scrollTo('features')" class="hover:text-green-700 transition">Features</button>
          <button @click="scrollTo('features')" class="hover:text-green-700 transition">Benefits</button>
          <button @click="scrollTo('contact')" class="hover:text-green-700 transition">Contact</button>
        </nav>
      </div>
    </header>

    <!-- HERO -->
    <section
      ref="home"
      class="relative flex items-center justify-center text-center py-24 sm:py-32 bg-cover bg-center bg-no-repeat"
      :style="{ backgroundImage: 'url(/hospital_bg.jpeg)' }"
    >
      <!-- Overlay -->
      <div class="absolute inset-0 bg-black/40"></div>
      
      <!-- Subtle Green Fog Overlay -->
      <div class="absolute inset-0 bg-green-500/10 mix-blend-overlay pointer-events-none"></div>

      <!-- Content -->
      <div class="relative max-w-4xl mx-auto px-4 text-white space-y-6">
        <h1 class="text-3xl sm:text-5xl font-bold drop-shadow-lg text-green-200">MaEs - Paytrack</h1>
        <p class="text-sm sm:text-lg drop-shadow-md text-green-100">
          A fully digital hospital billing and management platform built for efficiency, transparency, and ease of use.
        </p>

        <div class="flex justify-center gap-3 sm:gap-6">
          <button
            @click="goToRegister"
            class="bg-green-600 text-white px-5 sm:px-7 py-2 sm:py-3 rounded-lg hover:bg-green-700 transition font-medium text-sm sm:text-base shadow-lg"
          >
            Get Started
          </button>
          <button
            @click="goToLogin"
            class="bg-white text-green-800 px-5 sm:px-7 py-2 sm:py-3 rounded-lg hover:bg-green-50 transition font-medium text-sm sm:text-base shadow-lg"
          >
            Login
          </button>
        </div>

        <!-- Heartbeat Animation -->
        <div class="mt-10 flex justify-center">
          <HeartbeatLine />
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section ref="how" class="py-16 sm:py-20 bg-green-900">
      <div class="max-w-6xl mx-auto px-4">
        <h2 class="text-2xl sm:text-3xl font-bold text-center mb-10 sm:mb-16 text-green-300">
          How It Works
        </h2>

        <!-- Timeline -->
        <div class="relative flex flex-col md:flex-row md:justify-between md:items-start gap-4 sm:gap-6">

          <!-- Line -->
          <div class="absolute top-0 md:top-1/2 left-5 md:left-0 md:right-0 h-full md:h-0.5 w-0.5 md:w-full bg-green-700/50 z-0"></div>

          <!-- Step 1 -->
          <div class="flex items-start md:flex-col md:items-center gap-3 relative z-10">
            <div class="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-green-700 text-white rounded-full">
              <User class="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
            <div class="text-left md:text-center">
              <h3 class="font-semibold text-green-200 text-sm sm:text-base">1. Register</h3>
              <p class="text-xs sm:text-sm text-green-100">Create an account to access the system.</p>
            </div>
          </div>

          <!-- Step 2 -->
          <div class="flex items-start md:flex-col md:items-center gap-3 relative z-10 mt-6 md:mt-0">
            <div class="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-green-700 text-white rounded-full">
              <UserPlus class="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
            <div class="text-left md:text-center">
              <h3 class="font-semibold text-green-200 text-sm sm:text-base">2. Add Patient Info</h3>
              <p class="text-xs sm:text-sm text-green-100">Admins input patient and service details.</p>
            </div>
          </div>

          <!-- Step 3 -->
          <div class="flex items-start md:flex-col md:items-center gap-3 relative z-10 mt-6 md:mt-0">
            <div class="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-green-700 text-white rounded-full">
              <FileText class="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
            <div class="text-left md:text-center">
              <h3 class="font-semibold text-green-200 text-sm sm:text-base">3. Generate Invoice</h3>
              <p class="text-xs sm:text-sm text-green-100">System creates billing invoices automatically.</p>
            </div>
          </div>

          <!-- Step 4 -->
          <div class="flex items-start md:flex-col md:items-center gap-3 relative z-10 mt-6 md:mt-0">
            <div class="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-green-700 text-white rounded-full">
              <CreditCard class="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
            <div class="text-left md:text-center">
              <h3 class="font-semibold text-green-200 text-sm sm:text-base">4. Pay & Track</h3>
              <p class="text-xs sm:text-sm text-green-100">Patients can pay and track payment status.</p>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- FEATURES/BENEFITS ACCORDION -->
    <section ref="features" class="py-16 sm:py-20 bg-green-900">
      <h2 class="text-2xl sm:text-3xl font-bold text-center mb-10 sm:mb-16 text-green-300">
          Features & Benefits
        </h2>
      <div class="max-w-4xl mx-auto px-4 space-y-6 sm:space-y-8">

        <!-- Accordion Item: Core Features -->
        <div class="border-b border-green-700 pb-3 sm:pb-4">
          <button
            @click="toggle('features')"
            class="flex items-center w-full text-left focus:outline-none gap-2 sm:gap-3 text-green-200"
          >
            <span
              class="transition-transform duration-300"
              :class="open === 'features' ? 'rotate-45' : 'rotate-0'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 sm:h-6 w-5 sm:w-6" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </span>
            <span class="font-bold text-base sm:text-xl">Core Features</span>
          </button>

          <transition name="slide-fade">
            <div v-if="open === 'features'" class="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
              <div class="p-3 sm:p-4 bg-green-800 rounded-xl shadow hover:shadow-lg transition flex items-center gap-2 text-green-100 text-sm sm:text-base">
                <FileText class="w-5 h-5" /> Digital Patient Invoicing
              </div>
              <div class="p-3 sm:p-4 bg-green-800 rounded-xl shadow hover:shadow-lg transition flex items-center gap-2 text-green-100 text-sm sm:text-base">
                <CreditCard class="w-5 h-5" /> GCash & Cash Integration
              </div>
              <div class="p-3 sm:p-4 bg-green-800 rounded-xl shadow hover:shadow-lg transition flex items-center gap-2 text-green-100 text-sm sm:text-base">
                <BarChart2 class="w-5 h-5" /> Admin Dashboard
              </div>
            </div>
          </transition>
        </div>

        <!-- Accordion Item: Why Choose MAES -->
        <div class="border-b border-green-700 pb-3 sm:pb-4">
          <button
            @click="toggle('benefits')"
            class="flex items-center w-full text-left focus:outline-none gap-2 sm:gap-3 text-green-200"
          >
            <span
              class="transition-transform duration-300"
              :class="open === 'benefits' ? 'rotate-45' : 'rotate-0'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 sm:h-6 w-5 sm:w-6" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </span>
            <span class="font-bold text-base sm:text-xl">Why Choose MAES?</span>
          </button>

          <transition name="slide-fade">
            <div v-if="open === 'benefits'" class="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
              <div class="p-3 sm:p-4 bg-green-800 rounded-xl shadow hover:shadow-lg transition flex items-center gap-2 text-green-100 text-sm sm:text-base">
                <TrendingUp class="w-5 h-5" /> Less Manual Work
              </div>
              <div class="p-3 sm:p-4 bg-green-800 rounded-xl shadow hover:shadow-lg transition flex items-center gap-2 text-green-100 text-sm sm:text-base">
                <CheckCircle class="w-5 h-5" /> Improved Accuracy
              </div>
              <div class="p-3 sm:p-4 bg-green-800 rounded-xl shadow hover:shadow-lg transition flex items-center gap-2 text-green-100 text-sm sm:text-base">
                <Eye class="w-5 h-5" /> Better Transparency
              </div>
            </div>
          </transition>
        </div>

      </div>
    </section>

    <!-- CONTACT -->
    <section ref="contact" class="py-16 sm:py-20 text-center bg-green-900">
      <<h2 class="text-2xl sm:text-3xl font-bold text-center mb-10 sm:mb-16 text-green-300">
        Get in Touch
      </h2>
      <p class="mb-4 sm:mb-8 text-green-100 text-sm sm:text-base">Join hospitals and clinics using MAES.</p>

      <button @click="goToRegister" class="bg-green-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:bg-green-800 transition font-medium text-sm sm:text-base">
        Create Account
      </button>

      <div class="mt-6 sm:mt-10 text-xs sm:text-sm text-green-200">
        <p>📞 <strong>+639-310-783-528</strong></p>
        <p>📧 meghlabibis@gmail.com</p>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="text-center py-4 sm:py-6 text-xs sm:text-sm text-gray-100 bg-gray-800">
      &copy; 2025 MAES Hospital System. All rights reserved.
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import HeartbeatLine from '@/components/heartbeat_line.vue'

const router = useRouter()
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

onMounted(() => window.addEventListener('scroll', handleScroll))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))

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
