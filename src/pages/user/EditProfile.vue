<template>
  <UserLayout>
    <div class="max-w-3xl mx-auto px-6 py-6 md:px-10 md:py-10 space-y-8 animate-fade-in">
      
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <div class="w-2 h-8 bg-teal-500 rounded-full"></div>
            <h1 class="text-3xl font-bold tracking-tight text-slate-950">Account Settings</h1>
          </div>
          <p class="text-base text-slate-500 ml-4">Update your personal information and profile picture.</p>
        </div>
        <router-link to="/profile" class="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-all">
           <X class="w-5 h-5" />
        </router-link>
      </div>

      <form @submit.prevent="updateProfile" class="space-y-8">
        
        <div class="bg-slate-950 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl">
          <div class="absolute -top-12 -right-12 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl"></div>
          
          <div class="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div class="relative group cursor-pointer">
              <div class="w-28 h-28 md:w-32 md:h-32 rounded-[32px] overflow-hidden bg-slate-800 border-4 border-teal-500/30 p-1 transition-transform group-hover:scale-105">
                <img
                  v-if="previewImage"
                  :src="previewImage"
                  class="w-full h-full object-cover rounded-[24px]"
                />
                <div v-else class="w-full h-full flex items-center justify-center bg-slate-900 text-teal-500 text-3xl font-black rounded-[24px]">
                  {{ username.charAt(0).toUpperCase() }}
                </div>
              </div>
              <input type="file" @change="handleImageChange" class="absolute inset-0 opacity-0 cursor-pointer z-20" />
              <div class="absolute -bottom-2 -right-2 bg-teal-500 p-2 rounded-xl shadow-lg border-4 border-slate-950">
                <Camera class="w-4 h-4 text-slate-950" />
              </div>
            </div>

            <div class="text-center md:text-left">
              <h3 class="text-lg font-black tracking-tight">Profile Portrait</h3>
              <p class="text-slate-400 text-sm font-bold mt-1">Click the avatar to upload a new photo.<br>Supported: JPG, PNG.</p>
            </div>
          </div>
        </div>

        <div class="bg-slate-50/50 rounded-[40px] p-8 md:p-10 border border-slate-100">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Full Name</label>
              <div class="relative">
                <UserIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input v-model="completeName" type="text" class="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm font-bold text-slate-950 outline-none" placeholder="John Doe" />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
              <div class="relative">
                <CalendarIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input v-model="birthday" type="date" class="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm font-bold text-slate-950 outline-none" />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Age</label>
              <div class="relative">
                <Hash class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input v-model="age" type="number" class="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm font-bold text-slate-950 outline-none" />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Connection</label>
              <div class="relative">
                <Phone class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input v-model="cellphone" type="text" class="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm font-bold text-slate-950 outline-none" placeholder="+63" />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender Identity</label>
              <div class="relative">
                <UserCheck class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select v-model="gender" class="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm font-bold text-slate-950 outline-none appearance-none">
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
            </div>

            <div class="space-y-2 md:col-span-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Residential Address</label>
              <div class="relative">
                <MapPin class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input v-model="address" type="text" class="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm font-bold text-slate-950 outline-none" placeholder="Complete Street, City, Province" />
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 pt-4">
           <button
            type="submit"
            class="flex-1 bg-slate-950 text-white py-5 rounded-[24px] text-xs font-black uppercase tracking-[0.2em] hover:bg-teal-500 hover:text-slate-950 transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
          >
            Save Changes
          </button>
          <router-link
            to="/profile"
            class="px-10 py-5 bg-white border border-slate-200 text-slate-500 rounded-[24px] text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all text-center"
          >
            Cancel
          </router-link>
        </div>

      </form>
    </div>
  </UserLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { auth, db } from '@/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

import UserLayout from '@/components/UserLayout.vue'
import {
  User as UserIcon,
  Calendar as CalendarIcon,
  Hash,
  Phone,
  UserCheck,
  MapPin,
  Camera,
  X,
} from 'lucide-vue-next'
import { useNotifications } from '@/composables/useNotifications'

const username = ref('')
const email = ref('')
const completeName = ref('')
const age = ref('')
const birthday = ref('')
const cellphone = ref('')
const gender = ref('')
const address = ref('')
const profileImage = ref('') 
const previewImage = ref('')
const { success: notifySuccess, error: notifyError } = useNotifications()

onMounted(async () => {
  const user = auth.currentUser
  if (!user) {
    notifyError('User is not authenticated.')
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
      previewImage.value = data.profileImageBase64 || '' 
    } else {
      notifyError('User profile not found.')
    }
  } catch (err) {
    notifyError('Failed to load profile data.')
  }
})

const handleImageChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = () => {
      profileImage.value = reader.result 
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
    const updateData = {
      completeName: completeName.value,
      age: age.value,
      birthday: birthday.value,
      cellphone: cellphone.value,
      gender: gender.value,
      address: address.value,
    }

    if (profileImage.value) {
      updateData.profileImageBase64 = profileImage.value
    }

    await updateDoc(userRef, updateData)
    notifySuccess('Profile updated successfully!')
  } catch (err) {
    notifyError('Failed to update profile.')
  }
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Remove default date picker icon for cleaner look */
input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.5;
}

input:focus {
  transform: translateY(-1px);
}
</style>
