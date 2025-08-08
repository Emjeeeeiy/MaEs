<template>
  <div class="min-h-screen bg-white text-gray-800">
    <!-- Navbar -->
    <header class="bg-white shadow sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <img src="/MaEs_logo2.png" alt="MAES Logo" class="h-9 w-9" />
          <span class="text-xl font-bold text-green-700">Maria Estrella General Hospital, Inc.</span>
        </div>
        <nav class="hidden md:flex gap-6 text-sm font-medium">
          <button @click="scrollTo('home')" class="hover:text-green-700 transition">Home</button>
          <button @click="scrollTo('how')" class="hover:text-green-700 transition">How it Works</button>
          <button @click="scrollTo('features')" class="hover:text-green-700 transition">Features</button>
          <button @click="scrollTo('benefits')" class="hover:text-green-700 transition">Benefits</button>
          <button @click="scrollTo('contact')" class="hover:text-green-700 transition">Contact</button>
        </nav>
        <div class="hidden md:flex gap-2">
          <button @click="goToLogin" class="text-sm px-4 py-2 rounded-lg hover:bg-gray-100 transition">Login</button>
          <button @click="goToRegister" class="text-sm px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Register</button>
        </div>
        <button class="md:hidden" @click="mobileMenu = !mobileMenu">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      <div v-if="mobileMenu" class="md:hidden bg-white px-4 pb-4">
        <button @click="scrollTo('home'); mobileMenu = false" class="block py-2 text-sm font-medium hover:text-green-700 transition">Home</button>
        <button @click="scrollTo('how'); mobileMenu = false" class="block py-2 text-sm font-medium hover:text-green-700 transition">How it Works</button>
        <button @click="scrollTo('features'); mobileMenu = false" class="block py-2 text-sm font-medium hover:text-green-700 transition">Features</button>
        <button @click="scrollTo('benefits'); mobileMenu = false" class="block py-2 text-sm font-medium hover:text-green-700 transition">Benefits</button>
        <button @click="scrollTo('contact'); mobileMenu = false" class="block py-2 text-sm font-medium hover:text-green-700 transition">Contact</button>
        <div class="flex flex-col gap-2 mt-3">
          <button @click="goToLogin" class="w-full px-4 py-2 rounded-lg border hover:bg-gray-100 transition text-sm">Login</button>
          <button @click="goToRegister" class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm">Register</button>
        </div>
      </div>
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
    <section ref="how" class="py-16 bg-gray-50">
      <div class="max-w-6xl mx-auto px-4">
        <h2 class="text-2xl font-bold text-center mb-12 text-green-700">How It Works</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div class="p-6 bg-white rounded-2xl hover:shadow-xl transition">
            <h3 class="text-lg font-semibold text-green-700">1. Register</h3>
            <p class="text-sm text-gray-600 mt-2">Patients or admins create accounts to access the system.</p>
          </div>
          <div class="p-6 bg-white rounded-2xl hover:shadow-xl transition">
            <h3 class="text-lg font-semibold text-green-700">2. Add Patient Info</h3>
            <p class="text-sm text-gray-600 mt-2">Admins enter patient data and service details.</p>
          </div>
          <div class="p-6 bg-white rounded-2xl hover:shadow-xl transition">
            <h3 class="text-lg font-semibold text-green-700">3. Generate Invoice</h3>
            <p class="text-sm text-gray-600 mt-2">System generates invoice for approval and review.</p>
          </div>
          <div class="p-6 bg-white rounded-2xl hover:shadow-xl transition">
            <h3 class="text-lg font-semibold text-green-700">4. Pay & Track</h3>
            <p class="text-sm text-gray-600 mt-2">Patients pay via GCash or cash, and admins validate payments.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section ref="features" class="py-16 bg-white">
      <div class="max-w-6xl mx-auto px-4">
        <h2 class="text-2xl font-bold text-center mb-12 text-green-700">Core Features</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="p-6 border rounded-2xl hover:shadow-2xl transition bg-white">
            <h3 class="text-lg font-semibold text-green-700 mb-2">Digital Patient Invoicing</h3>
            <p class="text-sm text-gray-600">Automatically generate, track, and approve invoices with real-time visibility.</p>
          </div>
          <div class="p-6 border rounded-2xl hover:shadow-2xl transition bg-white">
            <h3 class="text-lg font-semibold text-green-700 mb-2">GCash & Cash Integration</h3>
            <p class="text-sm text-gray-600">Secure payment channels through cash and GCash uploads with reference validation.</p>
          </div>
          <div class="p-6 border rounded-2xl hover:shadow-2xl transition bg-white">
            <h3 class="text-lg font-semibold text-green-700 mb-2">Admin Dashboard</h3>
            <p class="text-sm text-gray-600">Powerful tools to monitor payments, approve invoices, and generate reports.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits -->
    <section ref="benefits" class="py-16 bg-gray-50">
      <div class="max-w-6xl mx-auto px-4">
        <h2 class="text-2xl font-bold text-center mb-12 text-green-700">Why Choose MAES?</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div class="p-6 rounded-2xl bg-white hover:shadow-2xl transition">
            <h3 class="text-lg font-semibold text-green-700">Less Manual Work</h3>
            <p class="text-sm text-gray-600 mt-2">Cut down admin processing time by 50% through automation.</p>
          </div>
          <div class="p-6 rounded-2xl bg-white hover:shadow-2xl transition">
            <h3 class="text-lg font-semibold text-green-700">Improved Accuracy</h3>
            <p class="text-sm text-gray-600 mt-2">Minimize billing errors and patient disputes.</p>
          </div>
          <div class="p-6 rounded-2xl bg-white hover:shadow-2xl transition">
            <h3 class="text-lg font-semibold text-green-700">Better Transparency</h3>
            <p class="text-sm text-gray-600 mt-2">Give both admins and patients full access to invoice status.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section ref="contact" class="py-20 bg-green-700 text-white text-center">
      <div class="max-w-xl mx-auto px-4">
        <h2 class="text-3xl font-bold mb-4">Digitize Your Hospital Billing Today</h2>
        <p class="mb-6 text-sm">Join hospitals and clinics using MAES to modernize their systems.</p>
        <button @click="goToRegister" class="bg-white text-green-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition">Create Account</button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="text-center py-6 text-sm text-gray-500 bg-white">
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
