<template>
  <UserLayout>
    <div class="max-w-4xl mx-auto px-6 py-6 md:px-10 md:py-10 space-y-8 animate-fade-in">
      
      <div v-if="loading" class="animate-pulse space-y-8">
        <div class="bg-slate-900 rounded-[40px] p-8 md:p-12 h-64 border border-slate-800"></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="i in 2" :key="i" class="bg-slate-50 border border-slate-100 rounded-[40px] h-64"></div>
        </div>
      </div>

      <template v-else>
        <div class="relative bg-slate-950 rounded-[40px] p-8 md:p-12 text-white overflow-hidden shadow-2xl">
          <div class="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl"></div>
          
          <div class="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div class="relative group">
              <div class="w-32 h-32 md:w-40 md:h-40 rounded-[40px] overflow-hidden bg-slate-800 border-4 border-teal-500/30 p-1">
                <img
                  v-if="profileImageUrl"
                  :src="profileImageUrl"
                  alt="Profile"
                  class="w-full h-full object-cover rounded-4xl"
                />
                <div class="w-full h-full flex items-center justify-center text-4xl font-black text-teal-500 bg-slate-900 rounded-4xl" v-else>
                  {{ username.charAt(0).toUpperCase() }}
                </div>
              </div>
              <div class="absolute -bottom-2 -right-2 bg-teal-500 p-3 rounded-2xl shadow-lg border-4 border-slate-950">
                <UserCheck class="w-5 h-5 text-slate-950" />
              </div>
            </div>

            <div class="text-center md:text-left space-y-2">
              <div class="flex items-center justify-center md:justify-start gap-3">
                <h1 class="text-3xl md:text-4xl font-black tracking-tight">{{ completeName || username }}</h1>
                <span class="hidden md:inline-block px-3 py-1 bg-teal-500/20 text-teal-400 text-[10px] font-black uppercase rounded-full border border-teal-500/30">
                  {{ status }}
                </span>
              </div>
              <p class="text-slate-400 font-bold flex items-center justify-center md:justify-start gap-2">
                <Mail class="w-4 h-4" />
                {{ email }}
              </p>
              <div class="pt-4 flex flex-wrap justify-center md:justify-start gap-3">
                 <router-link
                    to="/edit_profile"
                    class="px-6 py-3 bg-white text-slate-950 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-teal-500 hover:text-slate-950 transition-all active:scale-95 shadow-xl shadow-black/20 flex items-center gap-2"
                  >
                    <Edit3 class="w-4 h-4" /> Edit Account
                  </router-link>
                  <button
                    @click="logout"
                    class="px-6 py-3 bg-slate-800 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-rose-600 transition-all flex items-center gap-2"
                  >
                    <LogOut class="w-4 h-4" /> Sign Out
                  </button>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-slate-50/50 rounded-[40px] p-8 border border-slate-100 space-y-6">
            <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <User class="w-4 h-4" /> Personal Details
            </h3>
            
            <div class="space-y-4">
              <div class="flex justify-between items-center py-3 border-b border-slate-200/50">
                <span class="text-sm font-bold text-slate-500">Username</span>
                <span class="text-sm font-black text-slate-900">@{{ username }}</span>
              </div>
              <div class="flex justify-between items-center py-3 border-b border-slate-200/50">
                <span class="text-sm font-bold text-slate-500">Gender</span>
                <span class="text-sm font-black text-slate-900">{{ gender || '—' }}</span>
              </div>
              <div class="flex justify-between items-center py-3 border-b border-slate-200/50">
                <span class="text-sm font-bold text-slate-500">Birthday</span>
                <span class="text-sm font-black text-slate-900">{{ birthday || '—' }}</span>
              </div>
              <div class="flex justify-between items-center py-3">
                <span class="text-sm font-bold text-slate-500">Age</span>
                <span class="text-sm font-black text-slate-900">{{ age || '—' }} years old</span>
              </div>
            </div>
          </div>

          <div class="bg-slate-50/50 rounded-[40px] p-8 border border-slate-100 space-y-6">
            <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Smartphone class="w-4 h-4" /> Connectivity
            </h3>
            
            <div class="space-y-4">
              <div class="flex flex-col py-3 border-b border-slate-200/50">
                <span class="text-[10px] font-black text-teal-600 uppercase mb-1">Mobile Number</span>
                <span class="text-base font-black text-slate-900">{{ cellphone || 'No phone linked' }}</span>
              </div>
              <div class="flex flex-col py-3">
                <span class="text-[10px] font-black text-teal-600 uppercase mb-1">Residential Address</span>
                <span class="text-sm font-black text-slate-900 leading-relaxed">{{ address || 'No address provided' }}</span>
              </div>
            </div>

            <div class="pt-4">
              <div class="bg-white p-4 rounded-3xl border border-slate-200 flex items-center gap-4">
                <div :class="['w-3 h-3 rounded-full animate-pulse', status === 'active' ? 'bg-teal-500' : 'bg-rose-500']"></div>
                <div>
                  <p class="text-[10px] font-black text-slate-400 uppercase">System Status</p>
                  <p class="text-xs font-black text-slate-900 uppercase tracking-tighter">{{ status }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <transition name="toast">
          <div v-if="errorMessage" class="bg-rose-600 text-white p-4 rounded-2xl text-center text-xs font-black uppercase tracking-widest">
            {{ errorMessage }}
          </div>
        </transition>

      </template>
    </div>
  </UserLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { auth, db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import UserLayout from "@/components/UserLayout.vue";
import { useRouter } from "vue-router";
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
const loading = ref(true);

let unsubscribeAuth = null;

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
    const user = auth.currentUser;
    if (user) {
      await updateStatusInDB(user.uid, "inactive");
    }
    await signOut(auth);
    router.push("/login");
  } catch (error) {
    console.error("Logout failed:", error);
    errorMessage.value = "Failed to logout. Please try again.";
  }
};

onMounted(() => {
  unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      status.value = "inactive";
      loading.value = false;
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
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

        await updateStatusInDB(user.uid, "active");
      } else {
        errorMessage.value = "User profile not found.";
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      errorMessage.value = "Error fetching profile data.";
    } finally {
      loading.value = false;
    }
  });
});

onUnmounted(() => {
  if (unsubscribeAuth) unsubscribeAuth();
});
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