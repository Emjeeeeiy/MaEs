<template>
  <UserLayout>
    <div class="max-w-5xl mx-auto px-6 py-8 md:px-10 space-y-10">
      
      <!-- Integrated Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-sm">
            <Settings2 class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-2xl font-black tracking-tight text-slate-900">Manage Account</h1>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Configure your personal digital identity.</p>
          </div>
        </div>
        <router-link to="/profile" class="flex items-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl transition-all border border-slate-200 text-[10px] font-black uppercase tracking-widest">
           <ArrowLeft class="w-3 h-3" /> Return to Profile
        </router-link>
      </div>

      <form @submit.prevent="updateProfile" class="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        <!-- Portrait Configuration Left -->
        <div class="lg:col-span-4 space-y-8">
          <div class="bg-white rounded-3xl p-10 text-slate-900 border border-slate-200 shadow-sm flex flex-col items-center">
            
            <div class="relative z-10 flex flex-col items-center">
              <div class="relative mb-8 group/avatar">
                <div class="w-40 h-40 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 p-1 transition-all duration-300 group-hover/avatar:border-teal-500/50">
                  <img
                    v-if="previewImage"
                    :src="previewImage"
                    class="w-full h-full object-cover rounded-xl"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center bg-slate-100 text-teal-500 text-4xl font-black rounded-xl">
                    {{ username.charAt(0).toUpperCase() }}
                  </div>
                </div>
                
                <!-- Overlay Trigger -->
                <label class="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover/avatar:opacity-100 rounded-2xl cursor-pointer transition-all duration-300">
                  <input type="file" @change="handleImageChange" class="hidden" />
                  <div class="flex flex-col items-center gap-2 text-white">
                    <Upload class="w-6 h-6" />
                    <span class="text-[9px] font-black uppercase tracking-widest">Update Photo</span>
                  </div>
                </label>

                <div class="absolute -bottom-2 -right-2 bg-teal-600 p-2.5 rounded-xl shadow-lg border-2 border-white text-white">
                  <Camera class="w-4 h-4" />
                </div>
              </div>

              <div class="text-center space-y-2 mb-8">
                <h3 class="text-lg font-bold text-slate-900 tracking-tight">Profile Portrait</h3>
                <p class="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-loose">Best with square images.<br>JPG or PNG, max 5MB.</p>
              </div>

              <button 
                v-if="previewImage"
                type="button"
                @click="removeProfileImage"
                class="w-full py-3.5 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2.5"
              >
                <Trash2 class="w-4 h-4" /> Remove Photo
              </button>
            </div>
          </div>

          <div class="bg-teal-50 rounded-4xl p-6 border border-teal-100 flex items-start gap-4">
            <div class="p-2.5 bg-teal-500 text-white rounded-xl shadow-lg shadow-teal-500/20">
              <ShieldCheck class="w-5 h-5" />
            </div>
            <div>
              <h4 class="text-xs font-black text-teal-700 uppercase tracking-widest mb-1">Data Sovereignty</h4>
              <p class="text-[11px] font-bold text-teal-600/70 leading-relaxed">Your personal data is encrypted and managed according to the latest laboratory standards.</p>
            </div>
          </div>
        </div>

        <!-- Field Configuration Right -->
        <div class="lg:col-span-8 space-y-8">
          
          <div class="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm space-y-12">
            
            <!-- Section: Core Data -->
            <div class="space-y-8">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-2 h-2 rounded-full bg-slate-900"></div>
                <h2 class="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Core Identification</h2>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-2 group">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-teal-600 transition-colors">Full Legal Name</label>
                  <div class="relative">
                    <UserIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-teal-500 transition-colors" />
                    <input v-model="completeName" type="text" class="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all text-sm font-bold text-slate-900 outline-none" placeholder="Required" />
                  </div>
                </div>

                <div class="space-y-2 group">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-teal-600 transition-colors">Sex / Gender</label>
                  <div class="relative">
                    <UserCheck class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-teal-500 transition-colors" />
                    <select v-model="gender" class="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer">
                      <option value="">Choose Gender</option>
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section: Temporal Data -->
            <div class="space-y-8">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-2 h-2 rounded-full bg-slate-900"></div>
                <h2 class="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Temporal Records</h2>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-2 group">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Birth Registry</label>
                  <div class="relative">
                    <CalendarIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-teal-500 transition-colors" />
                    <input v-model="birthday" type="date" class="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all text-sm font-bold text-slate-900 outline-none" />
                  </div>
                </div>

                <div class="space-y-2 group">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Age</label>
                  <div class="relative">
                    <Hash class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-teal-500 transition-colors" />
                    <input v-model="age" type="number" class="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all text-sm font-bold text-slate-900 outline-none" placeholder="Auto-calculated if possible" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Section: Terminal Connectivity -->
            <div class="space-y-8">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-2 h-2 rounded-full bg-slate-900"></div>
                <h2 class="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Reach Registry</h2>
              </div>

              <div class="space-y-8">
                <div class="space-y-2 group">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Interface</label>
                  <div class="relative">
                    <Phone class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-teal-500 transition-colors" />
                    <input v-model="cellphone" type="text" class="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all text-sm font-bold text-slate-900 outline-none tracking-widest" placeholder="+63 000 000 0000" />
                  </div>
                </div>

                <div class="space-y-2 group">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Geographic Coordinates</label>
                  <div class="relative">
                    <MapPin class="absolute left-4 top-4 w-4 h-4 text-slate-300 group-focus-within:text-teal-500 transition-colors" />
                    <textarea v-model="address" rows="3" class="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all text-sm font-bold text-slate-900 outline-none resize-none" placeholder="Enter complete residential address"></textarea>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div class="flex flex-col sm:flex-row gap-6">
             <button
              type="submit"
              class="flex-1 bg-slate-900 text-white py-6 rounded-3xl text-xs font-black uppercase tracking-[0.2em] hover:bg-teal-600 transition-all shadow-2xl shadow-slate-900/20 active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <Save class="w-4 h-4" /> Commit Changes
            </button>
            <router-link
              to="/profile"
              class="px-10 py-6 bg-white border border-slate-200 text-slate-400 rounded-3xl text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-50 hover:text-slate-600 transition-all text-center"
            >
              Abort
            </router-link>
          </div>

        </div>

      </form>
    </div>
  </UserLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
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
  Trash2,
  Settings2,
  ArrowLeft,
  Upload,
  ShieldCheck,
  Save
} from 'lucide-vue-next'
import { useNotifications } from '@/composables/useNotifications'
import { useAuth } from '@/composables/useAuth'

const { user } = useAuth()
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
const isImageRemoved = ref(false)
const { success: notifySuccess, error: notifyError } = useNotifications()

const initForm = async () => {
  if (!user.value) return

  try {
    const userRef = doc(db, 'users', user.value.uid)
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
      previewImage.value = data.profileImageBase64 || data.profileImageUrl || '' 
    } else {
      notifyError('User profile not found.')
    }
  } catch (err) {
    console.error('Init form error:', err)
    notifyError('Failed to load profile data.')
  }
}

onMounted(initForm)
watch(user, initForm)

const handleImageChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = () => {
      profileImage.value = reader.result 
      previewImage.value = reader.result
      isImageRemoved.value = false
    }
    reader.readAsDataURL(file)
  }
}

const removeProfileImage = () => {
  profileImage.value = ''
  previewImage.value = ''
  isImageRemoved.value = true
}

const updateProfile = async () => {
  if (!user.value) return

  try {
    const userRef = doc(db, 'users', user.value.uid)
    const updateData = {
      completeName: completeName.value,
      age: age.value,
      birthday: birthday.value,
      cellphone: cellphone.value,
      gender: gender.value,
      address: address.value,
    }

    if (isImageRemoved.value) {
      updateData.profileImageBase64 = ''
      updateData.profileImageUrl = ''
    } else if (profileImage.value) {
      updateData.profileImageBase64 = profileImage.value
    }

    await updateDoc(userRef, updateData)
    notifySuccess('Profile updated successfully!')
    isImageRemoved.value = false
  } catch (err) {
    console.error('Update profile error:', err)
    notifyError('Failed to update profile.')
  }
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Custom transitions for form inputs */
input:focus, select:focus, textarea:focus {
  transform: scale(1.005);
}

/* Hide scrollbar for Chrome, Safari and Opera */
textarea::-webkit-scrollbar {
  display: none;
}

/* Remove default date picker icon for cleaner look */
input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.5;
}
</style>
