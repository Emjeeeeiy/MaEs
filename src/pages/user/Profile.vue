<template>
  <UserLayout>
    <div class="max-w-4xl mx-auto px-6 py-8 md:px-10 space-y-8 animate-fade-in">
      
      <div v-if="loading" class="animate-pulse space-y-8">
        <div class="bg-slate-100 rounded-3xl p-8 md:p-12 h-64"></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="i in 2" :key="i" class="bg-slate-50 border border-slate-100 rounded-3xl h-64"></div>
        </div>
      </div>

      <template v-else>
        <div class="relative bg-slate-900 rounded-3xl p-8 md:p-12 text-white overflow-hidden shadow-xl">
          <div class="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div class="relative">
              <div class="w-32 h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden bg-slate-800 border-2 border-teal-500/30 p-1">
                <img
                  v-if="profileImageUrl"
                  :src="profileImageUrl"
                  alt="Profile"
                  class="w-full h-full object-cover rounded-xl"
                />
                <div class="w-full h-full flex items-center justify-center text-3xl font-black text-teal-500 bg-slate-900 rounded-xl" v-else>
                  {{ username.charAt(0).toUpperCase() }}
                </div>
              </div>
              <div class="absolute -bottom-2 -right-2 bg-teal-500 p-2.5 rounded-xl shadow-lg border-2 border-slate-900">
                <UserCheck class="w-4 h-4 text-slate-900" />
              </div>
            </div>

            <div class="text-center md:text-left space-y-1.5">
              <div class="flex items-center justify-center md:justify-start gap-3">
                <h1 class="text-2xl md:text-3xl font-bold tracking-tight">{{ completeName || username }}</h1>
                <span class="hidden md:inline-block px-2.5 py-0.5 bg-teal-500/20 text-teal-400 text-[9px] font-bold uppercase rounded-full border border-teal-500/20">
                  {{ status }}
                </span>
              </div>
              <p class="text-slate-400 text-sm font-medium flex items-center justify-center md:justify-start gap-2">
                <Mail class="w-3.5 h-3.5" />
                {{ email }}
              </p>
              <div class="pt-4 flex flex-wrap justify-center md:justify-start gap-3">
                 <router-link
                    to="/edit_profile"
                    class="px-5 py-2.5 bg-white text-slate-900 text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-teal-500 transition-all flex items-center gap-2"
                  >
                    <Edit3 class="w-3.5 h-3.5" /> Edit Account
                  </router-link>
                  <button
                    @click="logout"
                    class="px-5 py-2.5 bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-rose-600 transition-all flex items-center gap-2"
                  >
                    <LogOut class="w-3.5 h-3.5" /> Sign Out
                  </button>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white rounded-3xl p-8 border border-slate-200 space-y-6">
            <h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <User class="w-4 h-4" /> Personal Details
            </h3>
            
            <div class="space-y-4">
              <div class="flex justify-between items-center py-3 border-b border-slate-100">
                <span class="text-sm font-medium text-slate-500">Username</span>
                <span class="text-sm font-bold text-slate-900">@{{ username }}</span>
              </div>
              <div class="flex justify-between items-center py-3 border-b border-slate-100">
                <span class="text-sm font-medium text-slate-500">Gender</span>
                <span class="text-sm font-bold text-slate-900">{{ gender || '—' }}</span>
              </div>
              <div class="flex justify-between items-center py-3 border-b border-slate-100">
                <span class="text-sm font-medium text-slate-500">Birthday</span>
                <span class="text-sm font-bold text-slate-900">{{ birthday || '—' }}</span>
              </div>
              <div class="flex justify-between items-center py-3">
                <span class="text-sm font-medium text-slate-500">Age</span>
                <span class="text-sm font-bold text-slate-900">{{ age || '—' }} years old</span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-3xl p-8 border border-slate-200 space-y-6">
            <h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Smartphone class="w-4 h-4" /> Connectivity
            </h3>
            
            <div class="space-y-5">
              <div>
                <span class="text-[9px] font-bold text-teal-600 uppercase tracking-wider mb-1 block">Mobile Number</span>
                <span class="text-sm font-bold text-slate-900">{{ cellphone || 'No phone linked' }}</span>
              </div>
              <div>
                <span class="text-[9px] font-bold text-teal-600 uppercase tracking-wider mb-1 block">Residential Address</span>
                <span class="text-sm font-bold text-slate-900 leading-relaxed">{{ address || 'No address provided' }}</span>
              </div>
            </div>

            <div class="pt-4">
              <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                <div :class="['w-2.5 h-2.5 rounded-full', status === 'active' ? 'bg-teal-500' : 'bg-rose-500']"></div>
                <div>
                  <p class="text-[9px] font-bold text-slate-400 uppercase tracking-tight">System Status</p>
                  <p class="text-[10px] font-bold text-slate-900 uppercase">{{ status }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <transition name="toast">
          <div v-if="errorMessage" class="bg-rose-600 text-white p-4 rounded-xl text-center text-xs font-bold uppercase tracking-widest">
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
  Users,
  MapPin,
  Circle,
  Edit3,
  LogOut,
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
      profileImageUrl.value = data.profileImageUrl || "";
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
  animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: scale(0.9); }
</style>
