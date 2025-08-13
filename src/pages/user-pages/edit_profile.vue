<template>
  <div class="h-screen w-full bg-gray-50 overflow-hidden">
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

    <!-- Body -->
    <div class="flex pt-16 h-full relative">
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
        class="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full transition-all duration-300"
        :class="{ 'blur-sm': isMobileSidebarOpen }"
      >
        <div class="bg-white rounded-lg shadow p-6 animate-fade-in">
          <form @submit.prevent="updateProfile">
            <!-- Profile Picture -->
            <div class="flex items-center space-x-4 mb-6">
              <img
                v-if="previewImage"
                :src="previewImage"
                class="w-20 h-20 rounded-full object-cover border"
              />
              <div
                v-else
                class="w-20 h-20 flex items-center justify-center bg-green-600 text-white rounded-full text-3xl font-semibold"
              >
                {{ username.charAt(0).toUpperCase() }}
              </div>
              <input type="file" @change="handleImageChange" class="text-sm" />
            </div>

            <!-- Form Fields -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 mb-4">
              <div>
                <label class="block text-sm font-medium">Full Name</label>
                <input v-model="completeName" class="form-input mt-1 block w-full rounded border px-3 py-2 text-sm" />
              </div>
              <div>
                <label class="block text-sm font-medium">Age</label>
                <input v-model="age" type="number" class="form-input mt-1 block w-full rounded border px-3 py-2 text-sm" />
              </div>
              <div>
                <label class="block text-sm font-medium">Birthday</label>
                <input v-model="birthday" type="date" class="form-input mt-1 block w-full rounded border px-3 py-2 text-sm" />
              </div>
              <div>
                <label class="block text-sm font-medium">Phone</label>
                <input v-model="cellphone" class="form-input mt-1 block w-full rounded border px-3 py-2 text-sm" />
              </div>
              <div>
                <label class="block text-sm font-medium">Gender</label>
                <select v-model="gender" class="form-select mt-1 block w-full rounded border px-3 py-2 text-sm">
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium">Address</label>
                <input v-model="address" class="form-input mt-1 block w-full rounded border px-3 py-2 text-sm" />
              </div>
            </div>

            <!-- Action -->
            <div class="mt-4">
              <button
                type="submit"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Save Changes
              </button>
            </div>
          </form>

          <p v-if="errorMessage" class="mt-4 text-sm text-red-500">{{ errorMessage }}</p>
          <p v-if="successMessage" class="mt-4 text-sm text-green-600">{{ successMessage }}</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { auth, db, storage } from '@/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

import Sidebar from '@/components/Sidebar.vue'
import Topbar from '@/components/Topbar.vue'

const username = ref('')
const email = ref('')
const completeName = ref('')
const age = ref('')
const birthday = ref('')
const cellphone = ref('')
const gender = ref('')
const address = ref('')
const profileImage = ref(null)
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
      previewImage.value = data.profileImageUrl || ''
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
    profileImage.value = file
    previewImage.value = URL.createObjectURL(file)
  }
}

const updateProfile = async () => {
  const user = auth.currentUser
  if (!user) return

  try {
    const userRef = doc(db, 'users', user.uid)
    let profileImageUrl = previewImage.value

    if (profileImage.value) {
      const storageReference = storageRef(storage, `profile_pictures/${user.uid}`)
      await uploadBytes(storageReference, profileImage.value)
      profileImageUrl = await getDownloadURL(storageReference)
    }

    await updateDoc(userRef, {
      completeName: completeName.value,
      age: age.value,
      birthday: birthday.value,
      cellphone: cellphone.value,
      gender: gender.value,
      address: address.value,
      profileImageUrl
    })

    successMessage.value = 'Profile updated successfully!'
  } catch (err) {
    errorMessage.value = 'Failed to update profile.'
  }
}
</script>

<style>
/* optional fade-in animation for main content */
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
