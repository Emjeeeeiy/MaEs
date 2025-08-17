<template>
  <div class="min-h-screen bg-white text-gray-800">
    <header class="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-md transition-all duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <img src="/MaEs_logo2.png" alt="MAES Logo" class="h-10 w-10 rounded-full shadow-sm" />
          <span class="text-lg sm:text-xl font-bold text-green-700 tracking-tight">Maria Estrella General Hospital, Inc.</span>
        </div>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex gap-8 text-sm font-medium text-gray-700">
          <button @click="scrollTo('home')" class="hover:text-green-700 transition-colors duration-200">Home</button>
          <button @click="scrollTo('how')" class="hover:text-green-700 transition-colors duration-200">How it Works</button>
          <button @click="scrollTo('features')" class="hover:text-green-700 transition-colors duration-200">Features</button>
          <button @click="scrollTo('benefits')" class="hover:text-green-700 transition-colors duration-200">Benefits</button>
          <button @click="scrollTo('contact')" class="hover:text-green-700 transition-colors duration-200">Contact</button>
        </nav>

        <!-- Desktop Action Buttons -->
        <div class="hidden md:flex gap-3">
          <button @click="goToLogin" class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition duration-200 text-sm font-medium">
            Login
          </button>
          <button @click="goToRegister" class="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition duration-200 text-sm font-medium">
            Register
          </button>
        </div>

        <!-- Mobile Menu Button -->
        <button class="md:hidden p-2 rounded-md hover:bg-gray-100 transition duration-200" @click="mobileMenu = !mobileMenu">
          <svg class="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <transition name="slide-fade">
        <div v-if="mobileMenu" class="md:hidden bg-white shadow-lg rounded-b-xl px-4 py-5 space-y-3">
          <button @click="scrollTo('home'); mobileMenu=false" class="block w-full text-left py-2 text-gray-700 hover:text-green-700 transition duration-200 text-sm font-medium">Home</button>
          <button @click="scrollTo('how'); mobileMenu=false" class="block w-full text-left py-2 text-gray-700 hover:text-green-700 transition duration-200 text-sm font-medium">How it Works</button>
          <button @click="scrollTo('features'); mobileMenu=false" class="block w-full text-left py-2 text-gray-700 hover:text-green-700 transition duration-200 text-sm font-medium">Features</button>
          <button @click="scrollTo('benefits'); mobileMenu=false" class="block w-full text-left py-2 text-gray-700 hover:text-green-700 transition duration-200 text-sm font-medium">Benefits</button>
          <button @click="scrollTo('contact'); mobileMenu=false" class="block w-full text-left py-2 text-gray-700 hover:text-green-700 transition duration-200 text-sm font-medium">Contact</button>

          <div class="flex flex-col gap-2 mt-4">
            <button @click="goToLogin" class="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition duration-200 text-sm font-medium">Login</button>
            <button @click="goToRegister" class="w-full px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition duration-200 text-sm font-medium">Register</button>
          </div>
        </div>
      </transition>
    </header>

    <!-- Hero -->
    <section ref="home" class="py-20 bg-gradient-to-br from-green-300 to-green-700 text-center text-white">
      <div class="max-w-4xl mx-auto px-4">
        <h1 class="text-4xl font-bold mb-4">Modern Automated E-Hospital System</h1>
        <p class="text-lg text-white/90 mb-6">A fully digital hospital billing and management platform built for efficiency, transparency, and ease of use.</p>
        <div class="flex justify-center gap-4">
          <button @click="goToRegister" class="bg-white text-green-700 px-6 py-3 rounded-lg hover:bg-gray-100 transition font-medium">Get Started</button>
          <button @click="goToLogin" class="border border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-green-700 transition font-medium">Login</button>
        </div>
      </div>
    </section>

    <!-- How it Works -->
    <section ref="how" class="py-20 bg-gray-50">
      <div class="max-w-6xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-16 text-green-700">
          How It Works
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <!-- Step 1 -->
          <div
            class="p-6 bg-white rounded-2xl border border-transparent hover:border-green-400 hover:shadow-lg transition-all duration-300 group"
          >
            <div
              class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 4v16m8-8H4"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-green-700">1. Register</h3>
            <p class="text-sm text-gray-600 mt-2">
              Patients or admins create accounts to access the system.
            </p>
          </div>

          <!-- Step 2 -->
          <div
            class="p-6 bg-white rounded-2xl border border-transparent hover:border-green-400 hover:shadow-lg transition-all duration-300 group"
          >
            <div
              class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-green-700">2. Add Patient Info</h3>
            <p class="text-sm text-gray-600 mt-2">
              Admins enter patient data and service details.
            </p>
          </div>

          <!-- Step 3 -->
          <div
            class="p-6 bg-white rounded-2xl border border-transparent hover:border-green-400 hover:shadow-lg transition-all duration-300 group"
          >
            <div
              class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 17v-6h13V7H9V1L1 9l8 8z"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-green-700">3. Generate Invoice</h3>
            <p class="text-sm text-gray-600 mt-2">
              System generates invoice for approval and review.
            </p>
          </div>

          <!-- Step 4 -->
          <div
            class="p-6 bg-white rounded-2xl border border-transparent hover:border-green-400 hover:shadow-lg transition-all duration-300 group"
          >
            <div
              class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8c-1.657 0-3 1.343-3 3v7h6v-7c0-1.657-1.343-3-3-3z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M5 21h14"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-green-700">4. Pay & Track</h3>
            <p class="text-sm text-gray-600 mt-2">
              Patients pay via GCash or cash, and admins validate payments.
            </p>
          </div>
        </div>
      </div>
    </section>


    <!-- Features -->
<section ref="features" class="py-20 bg-gray-100">
  <div class="max-w-6xl mx-auto px-4">
    <h2 class="text-3xl font-extrabold text-center mb-14 text-green-700 tracking-tight">
      Core Features
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
      
      <!-- Feature Card -->
      <div class="group p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
        <div class="flex justify-center mb-6">
          <div class="p-4 bg-green-100 text-green-700 rounded-full group-hover:scale-110 transition duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-6h6v6m-7 4h8a2 2 0 002-2v-8a2 2 0 00-2-2H9l-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <h3 class="text-xl font-semibold text-green-700 mb-3 text-center">
          Digital Patient Invoicing
        </h3>
        <p class="text-sm text-gray-600 text-center leading-relaxed">
          Automatically generate, track, and approve invoices with real-time visibility for both admins and patients.
        </p>
      </div>

      <!-- Feature Card -->
      <div class="group p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
        <div class="flex justify-center mb-6">
          <div class="p-4 bg-green-100 text-green-700 rounded-full group-hover:scale-110 transition duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.656 0-3 1.567-3 3.5S10.344 15 12 15s3-1.567 3-3.5S13.656 8 12 8z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364l-1.414-1.414M8.05 8.05L6.636 6.636m0 10.728l1.414-1.414M17.95 6.05l1.414 1.414" />
            </svg>
          </div>
        </div>
        <h3 class="text-xl font-semibold text-green-700 mb-3 text-center">
          GCash & Cash Integration
        </h3>
        <p class="text-sm text-gray-600 text-center leading-relaxed">
          Secure payment channels through cash and GCash uploads with reference number validation for fraud prevention.
        </p>
      </div>

      <!-- Feature Card -->
      <div class="group p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
        <div class="flex justify-center mb-6">
          <div class="p-4 bg-green-100 text-green-700 rounded-full group-hover:scale-110 transition duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17l-2.25 2.25m0-4.5L9.75 17m0 0h8.25a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0018 4.5H6a2.25 2.25 0 00-2.25 2.25v8.25" />
            </svg>
          </div>
        </div>
        <h3 class="text-xl font-semibold text-green-700 mb-3 text-center">
          Admin Dashboard
        </h3>
        <p class="text-sm text-gray-600 text-center leading-relaxed">
          Powerful tools to monitor payments, approve invoices, track analytics, and generate detailed reports.
        </p>
      </div>

    </div>
  </div>
</section>



    <!-- Benefits -->
    <section ref="benefits" class="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div class="max-w-6xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-14 text-green-700 relative inline-block">
          Why Choose MAES?
          <span class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-green-500 rounded-full"></span>
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          
          <!-- Card 1 -->
          <div class="group p-8 rounded-2xl bg-white border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-green-200">
            <div class="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-4H5l7-8 7 8h-4v4H9z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-green-700">Less Manual Work</h3>
            <p class="text-sm text-gray-600 mt-3 leading-relaxed">
              Cut down admin processing time by <span class="font-semibold text-green-600">50%</span> through automation.
            </p>
          </div>

          <!-- Card 2 -->
          <div class="group p-8 rounded-2xl bg-white border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-green-200">
            <div class="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-green-700">Improved Accuracy</h3>
            <p class="text-sm text-gray-600 mt-3 leading-relaxed">
              Minimize billing errors and avoid patient disputes with reliable automation.
            </p>
          </div>

          <!-- Card 3 -->
          <div class="group p-8 rounded-2xl bg-white border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-green-200">
            <div class="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12h3m0 0h3m-3 0v3m0-3V9m-9 3h.01M4 6h16M4 12h4m-4 6h16" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-green-700">Better Transparency</h3>
            <p class="text-sm text-gray-600 mt-3 leading-relaxed">
              Give both admins and patients full access to invoice and payment status.
            </p>
          </div>

        </div>
      </div>
    </section>


    <!-- CTA / Contact -->
    <section
      ref="contact"
      class="py-20 bg-gradient-to-br from-green-700 via-green-600 to-green-800 text-white text-center relative overflow-hidden"
    >
      <!-- Decorative Background Circles -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute -top-10 -left-10 w-40 h-40 bg-green-500 opacity-20 rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 right-0 w-60 h-60 bg-green-400 opacity-10 rounded-full blur-3xl"></div>
      </div>

      <div class="relative max-w-xl mx-auto px-4">
        <h2 class="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">
          Digitize Your Hospital Billing Today
        </h2>
        <p class="mb-8 text-base sm:text-lg text-green-100">
          Join hospitals and clinics using MAES to modernize their systems.
        </p>

        <!-- Call to Action Button -->
        <button
          @click="goToRegister"
          class="bg-white text-green-700 px-8 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:bg-green-50 hover:scale-105 hover:ring-2 hover:ring-white hover:ring-offset-2 hover:ring-offset-green-700"
        >
          Create Account
        </button>

        <!-- Contact Info -->
        <div class="mt-10 text-sm space-y-2 text-green-100">
          <p>📞 <span class="font-medium text-white">+63 912 345 6789</span></p>
          <p>
            📧
            <a
              href="mailto:maes.hospital@gmail.com"
              class="underline hover:text-green-200 transition-colors"
            >
              maes.hospital@gmail.com
            </a>
          </p>

          <!-- Social Media Icons -->
          <nav class="flex justify-center gap-6 items-center mt-6">
            <a
              href="https://www.facebook.com"
              target="_blank"
              class="hover:text-green-200 transform transition-transform duration-300 hover:scale-125"
              aria-label="Facebook"
            >
              <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path
                  d="M22 12.07C22 6.477 17.523 2 12 2S2 6.477 2 12.07c0 5.012 3.657 9.163 8.438 9.877v-6.995H7.898v-2.882h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.464h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.882h-2.33v6.995C18.343 21.233 22 17.082 22 12.07z"
                />
              </svg>
            </a>

            <a
              href="https://www.instagram.com"
              target="_blank"
              class="hover:text-green-200 transform transition-transform duration-300 hover:scale-125"
              aria-label="Instagram"
            >
              <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path
                  d="M7.75 2h8.5A5.76 5.76 0 0 1 22 7.75v8.5A5.76 5.76 0 0 1 16.25 22h-8.5A5.76 5.76 0 0 1 2 16.25v-8.5A5.76 5.76 0 0 1 7.75 2Zm0 1.5A4.26 4.26 0 0 0 3.5 7.75v8.5A4.26 4.26 0 0 0 7.75 20.5h8.5A4.26 4.26 0 0 0 20.5 16.25v-8.5A4.26 4.26 0 0 0 16.25 3.5h-8.5Zm8 2.25a.75.75 0 1 1 1.5 0v1.5a.75.75 0 1 1-1.5 0Zm-4.25 1a4.75 4.75 0 1 1 0 9.5a4.75 4.75 0 0 1 0-9.5Zm0 1.5a3.25 3.25 0 1 0 0 6.5a3.25 3.25 0 0 0 0-6.5Z"
                />
              </svg>
            </a>

            <a
              href="https://twitter.com"
              target="_blank"
              class="hover:text-green-200 transform transition-transform duration-300 hover:scale-125"
              aria-label="Twitter"
            >
              <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path
                  d="M22 4.26c-.77.35-1.6.58-2.47.69a4.3 4.3 0 0 0 1.88-2.37a8.59 8.59 0 0 1-2.73 1.04a4.28 4.28 0 0 0-7.29 3.9A12.15 12.15 0 0 1 3 3.16a4.28 4.28 0 0 0 1.33 5.72A4.25 4.25 0 0 1 2.8 8.3v.05a4.28 4.28 0 0 0 3.44 4.19a4.28 4.28 0 0 1-1.92.07a4.28 4.28 0 0 0 4 2.97a8.58 8.58 0 0 1-5.32 1.84A8.72 8.72 0 0 1 2 17.7a12.1 12.1 0 0 0 6.56 1.92c7.87 0 12.18-6.52 12.18-12.18l-.01-.55A8.67 8.67 0 0 0 22 4.26Z"
                />
              </svg>
            </a>
          </nav>
        </div>
      </div>
    </section>


    <!-- Footer -->
    <footer class="text-center py-6 text-sm text-gray-100 bg-gray-800">
    &copy; 2025 MAES Hospital System. All rights reserved.
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const mobileMenu = ref(false)

const goToLogin = () => router.push('/login')
const goToRegister = () => router.push('/register')

// Section refs for smooth scrolling
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
button,
a {
  transition: transform 0.15s ease, opacity 0.15s ease;
}
button:hover,
a:hover {
  transform: translateY(-2px) scale(1.01);
  opacity: 0.95;
}
</style>
