<template>
    <div class="flex min-h-screen bg-gray-50 text-gray-800">
      <!-- Sidebar -->
      <Sidebar class="w-full lg:w-64 border-r border-gray-200" />
  
      <!-- Main Content -->
      <div class="flex-1 flex flex-col">
        <Topbar class="sticky top-0 z-10 bg-white shadow-sm" />
  
        <!-- Feedback Form -->
        <main class="flex-1 p-6">
          <div class="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md">
            <h2 class="text-2xl font-bold mb-4">Billing Feedback</h2>
  
            <form @submit.prevent="submitFeedback" class="space-y-4">
              <div>
                <label class="block font-medium mb-1">Your Name</label>
                <input
                  v-model="name"
                  type="text"
                  class="w-full border rounded-md px-3 py-2 text-gray-800 bg-white focus:outline-none focus:ring focus:border-green-400"
                  placeholder="Enter your name"
                />
              </div>
  
              <div>
                <label class="block font-medium mb-1">Email</label>
                <input
                  v-model="email"
                  type="email"
                  class="w-full border rounded-md px-3 py-2 text-gray-800 bg-white focus:outline-none focus:ring focus:border-green-400"
                  placeholder="Enter your email"
                />
              </div>
  
              <div>
                <label class="block font-medium mb-1">Feedback</label>
                <textarea
                  v-model="message"
                  rows="4"
                  class="w-full border rounded-md px-3 py-2 text-gray-800 bg-white focus:outline-none focus:ring focus:border-green-400"
                  placeholder="Describe your billing experience..."
                ></textarea>
              </div>
  
              <button
                type="submit"
                class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                :disabled="loading"
              >
                {{ loading ? 'Submitting...' : 'Submit Feedback' }}
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
  import { db } from '@/firebase'
  import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
  import Sidebar from '@/components/Sidebar.vue'
  import Topbar from '@/components/Topbar.vue'
  
  const name = ref('')
  const email = ref('')
  const message = ref('')
  const loading = ref(false)
  const successMessage = ref('')
  const errorMessage = ref('')
  
  const submitFeedback = async () => {
    if (!name.value || !email.value || !message.value) {
      errorMessage.value = 'Please fill in all fields.'
      return
    }
  
    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''
  
    try {
      await addDoc(collection(db, 'billingFeedback'), {
        name: name.value,
        email: email.value,
        message: message.value,
        createdAt: serverTimestamp(),
      })
  
      successMessage.value = 'Thank you! Your feedback has been submitted.'
      name.value = ''
      email.value = ''
      message.value = ''
    } catch (error) {
      errorMessage.value = 'An error occurred. Please try again.'
    } finally {
      loading.value = false
    }
  }
  </script>
  