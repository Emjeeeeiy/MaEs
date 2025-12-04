<template>
  <div class="h-screen w-full bg-gray-50 overflow-hidden flex flex-col">
    <!-- Fixed Topbar -->
    <div
      class="fixed top-0 left-0 right-0 z-30 transition-all duration-300"
      :class="{
        'backdrop-blur-sm bg-white/70': isMobileSidebarOpen,
        'bg-white border-b border-gray-200 shadow': !isMobileSidebarOpen
      }"
    >
      <Topbar @toggle-sidebar="isMobileSidebarOpen = !isMobileSidebarOpen" />
    </div>

    <div class="flex pt-16 flex-1 h-full relative">
      <!-- Sidebar -->
      <Sidebar
        :isMobileSidebarOpen="isMobileSidebarOpen"
        @close-sidebar="isMobileSidebarOpen = false"
      />

      <!-- Mobile Overlay -->
      <div
        v-if="isMobileSidebarOpen"
        class="fixed inset-0 bg-black/30 z-20 sm:hidden"
        @click="isMobileSidebarOpen = false"
      ></div>

      <!-- Main Content -->
      <main
        class="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-3xl mx-auto w-full transition-all duration-300"
        :class="{ 'blur-sm': isMobileSidebarOpen }"
      >
        <div class="bg-white rounded-xl shadow p-6 animate-fade-in space-y-4">
          <!-- Title -->
          <div class="flex items-center gap-2">
            <CheckCircle class="w-6 h-6 text-green-600" />
            <h2 class="text-lg font-semibold text-gray-800">Profile</h2>
          </div>

          <form @submit.prevent="updateProfile" class="space-y-4">
            <!-- Profile Picture -->
            <div class="flex items-center gap-4">
              <div class="relative">
                <img
                  v-if="previewImage"
                  :src="previewImage"
                  class="w-20 h-20 rounded-full object-cover border border-gray-300"
                />
                <div
                  v-else
                  class="w-20 h-20 flex items-center justify-center bg-green-600 text-white rounded-full text-3xl font-semibold"
                >
                  {{ username.charAt(0).toUpperCase() }}
                </div>
                <input type="file" @change="handleImageChange" class="absolute inset-0 opacity-0 cursor-pointer rounded-full" />
              </div>
              <div class="flex flex-col text-sm text-gray-600">
                <span>Click image to upload</span>
                <span class="text-xs text-gray-400">Supported: JPG, PNG</span>
              </div>
            </div>

            <!-- Form Fields -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex items-center gap-2">
                <User class="w-5 h-5 text-gray-500" />
                <div class="flex-1">
                  <label class="block text-xs font-medium text-gray-700">Full Name</label>
                  <input v-model="completeName" class="form-input mt-1 block w-full rounded border px-2 py-1 text-gray-800 text-sm bg-white" />
                </div>
              </div>

              <div class="flex items-center gap-2">
                <Calendar class="w-5 h-5 text-gray-500" />
                <div class="flex-1">
                  <label class="block text-xs font-medium text-gray-700">Birthday</label>
                  <input v-model="birthday" type="date" class="form-input mt-1 block w-full rounded border px-2 py-1 text-gray-800 text-sm bg-white" />
                </div>
              </div>

              <div class="flex items-center gap-2">
                <Hash class="w-5 h-5 text-gray-500" />
                <div class="flex-1">
                  <label class="block text-xs font-medium text-gray-700">Age</label>
                  <input v-model="age" type="number" class="form-input mt-1 block w-full rounded border px-2 py-1 text-gray-800 text-sm bg-white" />
                </div>
              </div>

              <div class="flex items-center gap-2">
                <Phone class="w-5 h-5 text-gray-500" />
                <div class="flex-1">
                  <label class="block text-xs font-medium text-gray-700">Phone</label>
                  <input v-model="cellphone" class="form-input mt-1 block w-full rounded border px-2 py-1 text-gray-800 text-sm bg-white" />
                </div>
              </div>

              <div class="flex items-center gap-2">
                <UserCheck class="w-5 h-5 text-gray-500" />
                <div class="flex-1">
                  <label class="block text-xs font-medium text-gray-700">Gender</label>
                  <select v-model="gender" class="form-select mt-1 block w-full rounded border px-2 py-1 text-gray-800 text-sm bg-white">
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <MapPin class="w-5 h-5 text-gray-500" />
                <div class="flex-1">
                  <label class="block text-xs font-medium text-gray-700">Address</label>
                  <input v-model="address" class="form-input mt-1 block w-full rounded border px-2 py-1 text-gray-800 text-sm bg-white" />
                </div>
              </div>
            </div>

            <!-- Action Button -->
            <button
              type="submit"
              class="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Save Changes
            </button>

            <!-- Messages -->
            <p v-if="errorMessage" class="text-xs text-red-500">{{ errorMessage }}</p>
            <p v-if="successMessage" class="text-xs text-green-600">{{ successMessage }}</p>
          </form>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { auth, db } from '@/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

import Sidebar from '@/components/Sidebar.vue'
import Topbar from '@/components/topbar.vue'
import {
  User,
  Calendar,
  Hash,
  Phone,
  UserCheck,
  MapPin,
  CheckCircle
} from 'lucide-vue-next'

const username = ref('')
const email = ref('')
const completeName = ref('')
const age = ref('')
const birthday = ref('')
const cellphone = ref('')
const gender = ref('')
const address = ref('')
const profileImage = ref('') // base64
const previewImage = ref('')
const errorMessage = ref('')
const successMessage = ref('')

const isMobileSidebarOpen = ref(false)

onMounted(async () => {
  const user = auth.currentUser
  if (!user) {
    errorMessage.value = 'User is not authenticated.'
    return
  }

  try {
    const userRef = doc(db, 'users', user.uid)
    const docSnap = await getDoc(userRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      username.value = data.username || ''
      email.value = data.email || ''
      completeName.value = data.completeName || ''
      age.value = data.age || ''
      birthday.value = data.birthday || ''
      cellphone.value = data.cellphone || ''
      gender.value = data.gender || ''
      address.value = data.address || ''
      previewImage.value = data.profileImageBase64 || '' // load base64
    } else {
      errorMessage.value = 'User profile not found.'
    }
  } catch (err) {
    errorMessage.value = 'Failed to load profile data.'
  }
})

const handleImageChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = () => {
      profileImage.value = reader.result // Base64 string
      previewImage.value = reader.result
    }
    reader.readAsDataURL(file)
  }
}

const updateProfile = async () => {
  const user = auth.currentUser
  if (!user) return

  try {
    const userRef = doc(db, 'users', user.uid)

    await updateDoc(userRef, {
      completeName: completeName.value,
      age: age.value,
      birthday: birthday.value,
      cellphone: cellphone.value,
      gender: gender.value,
      address: address.value,
      profileImageBase64: profileImage.value
    })

    successMessage.value = 'Profile updated successfully!'
    errorMessage.value = ''
  } catch (err) {
    errorMessage.value = 'Failed to update profile.'
    successMessage.value = ''
  }
}
</script>

<style scoped>
/* optional fade-in animation */
.animate-fade-in {
  animation: fadeIn 0.35s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
