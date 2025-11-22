<template>
  <div class="min-h-screen bg-white text-gray-800">

    <!-- HEADER -->
    <header class="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-md transition-all duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center">

        <!-- Logo -->
        <div class="flex items-center gap-2 sm:gap-3">
          <img src="/MaEs_logo2.png" alt="MAES Logo" class="h-8 w-8 sm:h-10 sm:w-10 rounded-full shadow-sm" />
          <span class="text-sm sm:text-lg font-bold text-green-700 tracking-tight">
            Maria Estrella General Hospital, Inc.
          </span>
        </div>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-gray-700">
          <button @click="scrollTo('home')" class="hover:text-green-700 transition-colors duration-200">Home</button>
          <button @click="scrollTo('how')" class="hover:text-green-700 transition-colors duration-200">How it Works</button>
          <button @click="scrollTo('features')" class="hover:text-green-700 transition-colors duration-200">Features</button>
          <button @click="scrollTo('features')" class="hover:text-green-700 transition-colors duration-200">Benefits</button>
          <button @click="scrollTo('contact')" class="hover:text-green-700 transition-colors duration-200">Contact</button>
        </nav>

        <!-- Desktop Buttons -->
        <div class="hidden md:flex gap-2 sm:gap-3">
          <button @click="goToLogin" class="px-3 py-1 sm:px-4 sm:py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition duration-200 text-xs sm:text-sm font-medium">
            Login
          </button>
          <button @click="goToRegister" class="px-3 py-1 sm:px-4 sm:py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition duration-200 text-xs sm:text-sm font-medium">
            Register
          </button>
        </div>

        <!-- Mobile Menu Button -->
        <button class="md:hidden p-2 rounded-md hover:bg-gray-100 transition duration-200" @click="mobileMenu = !mobileMenu">
          <svg class="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <transition name="slide-fade">
        <div v-if="mobileMenu" class="md:hidden bg-white shadow-lg rounded-b-xl px-4 py-3 space-y-2">
          <button @click="scrollTo('home'); mobileMenu=false" class="block w-full text-left py-1 text-sm">Home</button>
          <button @click="scrollTo('how'); mobileMenu=false" class="block w-full text-left py-1 text-sm">How it Works</button>
          <button @click="scrollTo('features'); mobileMenu=false" class="block w-full text-left py-1 text-sm">Features</button>
          <button @click="scrollTo('features'); mobileMenu=false" class="block w-full text-left py-1 text-sm">Benefits</button>
          <button @click="scrollTo('contact'); mobileMenu=false" class="block w-full text-left py-1 text-sm">Contact</button>

          <div class="flex flex-col gap-1 mt-3">
            <button @click="goToLogin" class="w-full px-3 py-1 border border-gray-300 rounded-lg text-sm">Login</button>
            <button @click="goToRegister" class="w-full px-3 py-1 bg-green-600 text-white rounded-lg text-sm">Register</button>
          </div>
        </div>
      </transition>
    </header>

    <!-- HERO -->
    <section
      ref="home"
      class="py-16 sm:py-20 text-center text-green-700 bg-cover bg-center bg-no-repeat relative"
      :style="{ backgroundImage: 'url(/hospital_bg.jpeg)' }"
    >
      <div class="absolute inset-0 bg-white/70 md:bg-white/50"></div>
      <div class="relative max-w-4xl mx-auto px-4">
        <h1 class="text-3xl sm:text-4xl font-bold mb-2 sm:mb-4">MaEs - Paytrack</h1>
        <p class="text-sm sm:text-lg text-gray-600 mb-4 sm:mb-6">
          A fully digital hospital billing and management platform built for efficiency, transparency, and ease of use.
        </p>

        <div class="flex justify-center gap-2 sm:gap-4">
          <button
            @click="goToRegister"
            class="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-700 transition font-medium text-sm sm:text-base"
          >
            Get Started
          </button>
          <button
            @click="goToLogin"
            class="border border-green-600 text-green-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-50 transition font-medium text-sm sm:text-base"
          >
            Login
          </button>
        </div>
      </div>
    </section>

    <section class="bg-green-900 text-white">
      <!-- HOW IT WORKS -->
      <section ref="how" class="py-16 sm:py-20">
        <div class="max-w-6xl mx-auto px-4">
          <h2 class="text-2xl sm:text-3xl font-bold text-center mb-10 sm:mb-16 text-green-200">
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
                <p class="text-xs sm:text-sm text-gray-100">Create an account to access the system.</p>
              </div>
            </div>

            <!-- Step 2 -->
            <div class="flex items-start md:flex-col md:items-center gap-3 relative z-10 mt-6 md:mt-0">
              <div class="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-green-700 text-white rounded-full">
                <UserPlus class="w-4 sm:w-5 h-4 sm:h-5" />
              </div>
              <div class="text-left md:text-center">
                <h3 class="font-semibold text-green-200 text-sm sm:text-base">2. Add Patient Info</h3>
                <p class="text-xs sm:text-sm text-gray-100">Admins input patient and service details.</p>
              </div>
            </div>

            <!-- Step 3 -->
            <div class="flex items-start md:flex-col md:items-center gap-3 relative z-10 mt-6 md:mt-0">
              <div class="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-green-700 text-white rounded-full">
                <FileText class="w-4 sm:w-5 h-4 sm:h-5" />
              </div>
              <div class="text-left md:text-center">
                <h3 class="font-semibold text-green-200 text-sm sm:text-base">3. Generate Invoice</h3>
                <p class="text-xs sm:text-sm text-gray-100">System creates billing invoices automatically.</p>
              </div>
            </div>

            <!-- Step 4 -->
            <div class="flex items-start md:flex-col md:items-center gap-3 relative z-10 mt-6 md:mt-0">
              <div class="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-green-700 text-white rounded-full">
                <CreditCard class="w-4 sm:w-5 h-4 sm:h-5" />
              </div>
              <div class="text-left md:text-center">
                <h3 class="font-semibold text-green-200 text-sm sm:text-base">4. Pay & Track</h3>
                <p class="text-xs sm:text-sm text-gray-100">Patients can pay and track payment status.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- FEATURES/BENEFITS ACCORDION -->
      <section ref="features" class="py-16 sm:py-20">
        <div class="max-w-4xl mx-auto px-4 space-y-6 sm:space-y-8">

          <!-- Accordion Item: Core Features -->
          <div class="border-b border-green-700 pb-3 sm:pb-4">
            <button
              @click="toggle('features')"
              class="flex items-center w-full text-left focus:outline-none gap-2 sm:gap-3"
            >
              <!-- Plus Icon -->
              <span
                class="transition-transform duration-300 text-green-200"
                :class="open === 'features' ? 'rotate-45' : 'rotate-0'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 sm:h-6 w-5 sm:w-6" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </span>
              <span class="text-green-200 font-bold text-base sm:text-xl">Core Features</span>
            </button>

            <transition name="slide-fade">
              <div v-if="open === 'features'" class="mt-3 sm:mt-4 space-y-3 sm:space-y-4 text-gray-100">
                <div class="p-3 sm:p-4 bg-green-800 rounded-xl shadow hover:shadow-lg transition text-sm sm:text-base">Digital Patient Invoicing</div>
                <div class="p-3 sm:p-4 bg-green-800 rounded-xl shadow hover:shadow-lg transition text-sm sm:text-base">GCash & Cash Integration</div>
                <div class="p-3 sm:p-4 bg-green-800 rounded-xl shadow hover:shadow-lg transition text-sm sm:text-base">Admin Dashboard</div>
              </div>
            </transition>
          </div>

          <!-- Accordion Item: Why Choose MAES -->
          <div class="border-b border-green-700 pb-3 sm:pb-4">
            <button
              @click="toggle('benefits')"
              class="flex items-center w-full text-left focus:outline-none gap-2 sm:gap-3"
            >
              <!-- Plus Icon -->
              <span
                class="transition-transform duration-300 text-green-200"
                :class="open === 'benefits' ? 'rotate-45' : 'rotate-0'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 sm:h-6 w-5 sm:w-6" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </span>
              <span class="text-green-200 font-bold text-base sm:text-xl">Why Choose MAES?</span>
            </button>

            <transition name="slide-fade">
              <div v-if="open === 'benefits'" class="mt-3 sm:mt-4 space-y-3 sm:space-y-4 text-gray-100">
                <div class="p-3 sm:p-4 bg-green-800 rounded-xl shadow hover:shadow-lg transition text-sm sm:text-base">Less Manual Work</div>
                <div class="p-3 sm:p-4 bg-green-800 rounded-xl shadow hover:shadow-lg transition text-sm sm:text-base">Improved Accuracy</div>
                <div class="p-3 sm:p-4 bg-green-800 rounded-xl shadow hover:shadow-lg transition text-sm sm:text-base">Better Transparency</div>
              </div>
            </transition>
          </div>

        </div>
      </section>

      <!-- CONTACT -->
      <section ref="contact" class="py-16 sm:py-20 text-center">
        <h2 class="text-2xl sm:text-3xl font-extrabold mb-3 sm:mb-4 text-green-200">Digitize Your Hospital Billing Today</h2>
        <p class="mb-4 sm:mb-8 text-gray-100 text-sm sm:text-base">Join hospitals and clinics using MAES.</p>

        <button @click="goToRegister" class="bg-green-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:bg-green-800 transition font-medium text-sm sm:text-base">
          Create Account
        </button>

        <div class="mt-6 sm:mt-10 text-xs sm:text-sm text-gray-200">
          <p>📞 <strong>+639-310-783-528</strong></p>
          <p>📧 meghlabibis@gmail.com</p>
        </div>
      </section>

    </section>

    <!-- Footer -->
    <footer class="text-center py-4 sm:py-6 text-xs sm:text-sm text-gray-100 bg-gray-800">
      &copy; 2025 MAES Hospital System. All rights reserved.
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { User, UserPlus, FileText, CreditCard } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()
const goToLogin = () => router.push('/login')
const goToRegister = () => router.push('/register')

// Accordion toggle
const open = ref(null)
function toggle(section) {
  open.value = open.value === section ? null : section
}

// Mobile menu
const mobileMenu = ref(false)

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

<style>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}
.slide-fade-enter-to,
.slide-fade-leave-from {
  max-height: 1000px;
  opacity: 1;
  overflow: hidden;
}
</style>
