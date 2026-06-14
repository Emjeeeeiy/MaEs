<template>
  <UserLayout>
    <div class="max-w-5xl mx-auto px-6 py-8 md:px-10 space-y-10">
      
      <div v-if="loading" class="animate-pulse space-y-8">
        <div class="bg-slate-100 rounded-3xl h-72"></div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div v-for="i in 3" :key="i" class="bg-slate-50 rounded-3xl h-64 border border-slate-100"></div>
        </div>
      </div>

      <template v-else>
        <!-- Simple Profile Header -->
        <div class="relative bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-sm">
          <div class="flex flex-col lg:flex-row items-center lg:items-center gap-8">
            <div class="relative">
              <div class="w-32 h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 p-1">
                <img
                  v-if="profileImageUrl"
                  :src="profileImageUrl"
                  alt="Profile"
                  class="w-full h-full object-cover rounded-xl"
                />
                <div class="w-full h-full flex items-center justify-center text-4xl font-black text-slate-300 bg-slate-100 rounded-xl" v-else>
                  {{ username.charAt(0).toUpperCase() }}
                </div>
              </div>
              <div class="absolute -bottom-2 -right-2 bg-teal-600 text-white p-2 rounded-xl shadow-lg border-2 border-white">
                <ShieldCheck class="w-5 h-5" />
              </div>
            </div>

            <div class="flex-1 text-center lg:text-left">
              <div class="flex flex-col lg:flex-row lg:items-center gap-3 mb-2">
                <h1 class="text-2xl md:text-3xl font-bold text-slate-900 leading-none">{{ completeName || username }}</h1>
                <span class="inline-block w-fit mx-auto lg:mx-0 px-2 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-teal-100">
                  {{ status }}
                </span>
              </div>
              <p class="text-slate-500 text-sm font-medium flex items-center justify-center lg:justify-start gap-2">
                <Mail class="w-4 h-4 text-slate-400" />
                {{ email }}
              </p>

              <div class="flex flex-wrap justify-center lg:justify-start gap-3 pt-6">
                <router-link
                  to="/edit_profile"
                  class="px-6 py-3 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-teal-600 transition-colors flex items-center gap-2"
                >
                  <Edit3 class="w-3.5 h-3.5" /> Edit Profile
                </router-link>
                <div class="px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2.5">
                  <Clock class="w-3.5 h-3.5 text-slate-400" />
                  <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active Member</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Identity Card -->
          <div class="bg-white rounded-4xl p-8 border border-slate-100 shadow-sm space-y-8 hover:border-teal-100 transition-colors">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                <Fingerprint class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest leading-tight">Public</h3>
                <p class="text-base font-bold text-slate-900">Identity</p>
              </div>
            </div>
            
            <div class="space-y-6">
              <div class="group">
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 group-hover:text-teal-500 transition-colors">Handle</span>
                <p class="text-sm font-black text-slate-800 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">@{{ username }}</p>
              </div>
              <div class="group">
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 group-hover:text-teal-500 transition-colors">Gender Identification</span>
                <div class="flex items-center gap-3">
                   <div :class="['w-2 h-2 rounded-full', gender === 'Male' ? 'bg-indigo-500' : gender === 'Female' ? 'bg-pink-500' : 'bg-slate-300']"></div>
                   <p class="text-sm font-bold text-slate-800">{{ gender || 'Not specified' }}</p>
                </div>
              </div>
              <div class="group">
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 group-hover:text-teal-500 transition-colors">Full Name</span>
                <p class="text-sm font-bold text-slate-800">{{ completeName || '—' }}</p>
              </div>
            </div>
          </div>

          <!-- Vital Info Card -->
          <div class="bg-white rounded-4xl p-8 border border-slate-100 shadow-sm space-y-8 hover:border-teal-100 transition-colors lg:mt-6">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-teal-500 text-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Activity class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest leading-tight">Personal</h3>
                <p class="text-base font-bold text-slate-900">Vital Records</p>
              </div>
            </div>
            
            <div class="space-y-6">
              <div class="flex justify-between items-end">
                <div>
                  <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Birthday</span>
                  <p class="text-sm font-bold text-slate-800">{{ birthday || '—' }}</p>
                </div>
                <Calendar class="w-5 h-5 text-slate-200" />
              </div>
              <div class="flex justify-between items-end border-t border-slate-50 pt-6">
                <div>
                  <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Current Age</span>
                  <p class="text-sm font-black text-teal-600">{{ age || '—' }} Years Old</p>
                </div>
                <Hash class="w-5 h-5 text-slate-200" />
              </div>
            </div>
          </div>

          <!-- Contact Matrix Card -->
          <div class="bg-white rounded-4xl p-8 border border-slate-100 shadow-sm space-y-8 hover:border-teal-100 transition-colors">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <MapPin class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest leading-tight">Connect</h3>
                <p class="text-base font-bold text-slate-900">Reach Matrix</p>
              </div>
            </div>
            
            <div class="space-y-6">
              <div>
                <span class="text-[9px] font-black text-indigo-500 uppercase tracking-widest block mb-2">Mobile Terminal</span>
                <div class="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Smartphone class="w-5 h-5 text-slate-400" />
                  <span class="text-sm font-black text-slate-800 tracking-wider">{{ cellphone || '+63 — — —' }}</span>
                </div>
              </div>
              <div>
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Geo Location</span>
                <p class="text-sm font-bold text-slate-600 leading-relaxed">{{ address || 'No geographic data linked to account.' }}</p>
              </div>
            </div>
          </div>

        </div>

        <!-- Account Security Section -->
        <div class="bg-slate-50 rounded-4xl p-6 border border-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <ShieldCheck class="w-5 h-5" />
            </div>
            <div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Security Status</p>
              <p class="text-sm font-bold text-slate-700">Account is protected and currently {{ status }}</p>
            </div>
          </div>
          <button @click="router.push('/edit_profile')" class="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-teal-600 transition-colors flex items-center gap-2">
            Change Security Settings <ArrowRight class="w-3 h-3" />
          </button>
        </div>

        <transition name="toast">
          <div v-if="errorMessage" class="bg-rose-600 text-white p-5 rounded-2xl text-center text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-rose-600/20">
            {{ errorMessage }}
          </div>
        </transition>

      </template>
    </div>
  </UserLayout>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { auth, db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import UserLayout from "@/components/UserLayout.vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import {
  User,
  Mail,
  UserCheck,
  Calendar,
  Smartphone,
  MapPin,
  Edit3,
  LogOut,
  Activity,
  Fingerprint,
  ShieldCheck,
  Hash,
  Clock,
  ArrowRight
} from "lucide-vue-next";

const router = useRouter();
const { user, loading: authLoading } = useAuth();

const username = ref("");
const email = ref("");
const completeName = ref("");
const age = ref("");
const birthday = ref("");
const cellphone = ref("");
const gender = ref("");
const address = ref("");
const profileImageUrl = ref("");
const status = ref("inactive");
const errorMessage = ref("");
const dataLoading = ref(true);
const loading = computed(() => authLoading.value || dataLoading.value);

const updateStatusInDB = async (userId, newStatus) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { status: newStatus });
  } catch (error) {
    console.error(`Failed to update status to ${newStatus}:`, error);
  }
};

const logout = async () => {
  try {
    if (user.value) {
      await updateStatusInDB(user.value.uid, "inactive");
    }
    await signOut(auth);
    router.push("/login");
  } catch (error) {
    console.error("Logout failed:", error);
    errorMessage.value = "Failed to logout. Please try again.";
  }
};

const fetchProfileData = async () => {
  if (!user.value) {
    status.value = "inactive";
    dataLoading.value = false;
    return;
  }

  try {
    const userRef = doc(db, "users", user.value.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      username.value = data.username || "";
      email.value = data.email || "";
      completeName.value = data.completeName || "";
      age.value = data.age || "";
      birthday.value = data.birthday || "";
      cellphone.value = data.cellphone || "";
      gender.value = data.gender || "";
      address.value = data.address || "";
      profileImageUrl.value = data.profileImageBase64 || data.profileImageUrl || "";
      status.value = "active";

      await updateStatusInDB(user.value.uid, "active");
    } else {
      errorMessage.value = "User profile not found.";
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    errorMessage.value = "Error fetching profile data.";
  } finally {
    dataLoading.value = false;
  }
};

onMounted(fetchProfileData);
watch(user, fetchProfileData);
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.toast-enter-active, .toast-leave-active { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: scale(0.9); }
</style>
