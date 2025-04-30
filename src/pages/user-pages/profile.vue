<template>
    <div class="flex min-h-screen bg-gray-50">
      <!-- Sidebar -->
      <Sidebar class="w-full lg:w-64 border-r border-gray-200" />
  
      <!-- Main content area -->
      <div class="flex-1 flex flex-col">
        <!-- Topbar -->
        <Topbar class="sticky top-0 z-10 bg-white shadow-sm" />
  
        <!-- Page content -->
         <!-- Profile Content -->
      <main class="flex-1 p-6 max-w-4xl mx-auto w-full">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">My Profile</h2>

          <!-- Profile Picture -->
          <div class="flex items-center space-x-4 mb-6">
            <div>
              <img
                v-if="profileImageUrl"
                :src="profileImageUrl"
                alt="Profile Picture"
                class="w-20 h-20 rounded-full object-cover border"
              />
              <div
                v-else
                class="w-20 h-20 flex items-center justify-center bg-green-600 text-white rounded-full text-3xl font-semibold"
              >
                {{ username.charAt(0).toUpperCase() }}
              </div>
            </div>
            <div>
              <h3 class="text-xl font-semibold text-gray-700">{{ username }}</h3>
              <p class="text-sm text-gray-500">{{ email }}</p>
              <p
                class="text-xs inline-block mt-1 px-2 py-1 rounded-full"
                :class="status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
              >
                {{ status }}
              </p>
            </div>
          </div>

          <!-- Profile Details -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-gray-700">
            <p><strong>Full Name:</strong> {{ completeName || 'Not provided' }}</p>
            <p><strong>Age:</strong> {{ age || 'Not provided' }}</p>
            <p><strong>Birthday:</strong> {{ birthday || 'Not provided' }}</p>
            <p><strong>Phone:</strong> {{ cellphone || 'Not provided' }}</p>
            <p><strong>Gender:</strong> {{ gender || 'Not provided' }}</p>
            <p><strong>Address:</strong> {{ address || 'Not provided' }}</p>
          </div>

          <!-- Actions -->
          <div class="flex items-center space-x-4">
            <router-link
              to="/edit-profile"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Edit Profile
            </router-link>
          </div>

          <!-- Error -->
          <p v-if="errorMessage" class="mt-4 text-sm text-red-500">
            {{ errorMessage }}
          </p>
        </div>
      </main>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { auth, db } from '@/firebase'
  import { doc, getDoc } from 'firebase/firestore'
  import Sidebar from '@/components/Sidebar.vue'
  import Topbar from '@/components/Topbar.vue'
  
  // Refs
  const username = ref('')
  const email = ref('')
  const completeName = ref('')
  const age = ref('')
  const birthday = ref('')
  const cellphone = ref('')
  const gender = ref('')
  const address = ref('')
  const profileImageUrl = ref('')
  const status = ref('')
  const errorMessage = ref('')
  
  // Fetch user data
  onMounted(async () => {
    const user = auth.currentUser
    if (!user) {
      errorMessage.value = 'User is not authenticated.'
      return
    }
  
    try {
      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)
  
      if (userSnap.exists()) {
        const data = userSnap.data()
        username.value = data.username || ''
        email.value = data.email || ''
        completeName.value = data.completeName || ''
        age.value = data.age || ''
        birthday.value = data.birthday || ''
        cellphone.value = data.cellphone || ''
        gender.value = data.gender || ''
        address.value = data.address || ''
        profileImageUrl.value = data.profileImageUrl || ''
        status.value = data.status || 'active'
      } else {
        errorMessage.value = 'User profile not found.'
      }
    } catch (error) {
      errorMessage.value = 'Error fetching profile data.'
    }
  })
  </script>