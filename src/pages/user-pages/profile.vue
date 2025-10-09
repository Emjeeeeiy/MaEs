<template>
  <div class="h-screen w-full bg-gray-50 overflow-hidden">
    <!-- Fixed Topbar -->
    <div
      class="fixed top-0 left-0 right-0 z-30 transition-all duration-300"
      :class="{
        'backdrop-blur-sm bg-white/70': isMobileSidebarOpen,
        'bg-white border-b border-gray-200': !isMobileSidebarOpen
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
        class="flex-1 overflow-y-auto p-4 sm:p-6 transition-all duration-300"
        :class="{ 'blur-sm': isMobileSidebarOpen }"
      >
        <div class="bg-white rounded-lg shadow p-4 sm:p-6 border border-black max-w-4xl mx-auto">
          <!-- Loading -->
          <div v-if="loading" class="flex justify-center py-16">
            <LoadingAnimation />
          </div>

          <!-- Profile Content -->
          <template v-else>
            <!-- Profile Header -->
            <div class="flex flex-col items-center mb-6 text-center">
              <div class="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border border-gray-300">
                <img
                  v-if="profileImageUrl"
                  :src="profileImageUrl"
                  alt="Profile Picture"
                  class="w-full h-full object-cover"
                />
                <div class="text-3xl font-semibold text-gray-500" v-else>
                  {{ username.charAt(0).toUpperCase() }}
                </div>
              </div>
              <h2 class="text-2xl font-bold text-gray-800 mt-3">My Profile</h2>
              <p class="text-sm text-gray-500">Manage your account information</p>
            </div>

            <!-- Profile Details -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-gray-700 text-sm">
              <div><span class="font-semibold">Username:</span> {{ username || "Not provided" }}</div>
              <div><span class="font-semibold">Email:</span> {{ email || "Not provided" }}</div>
              <div><span class="font-semibold">Full Name:</span> {{ completeName || "Not provided" }}</div>
              <div><span class="font-semibold">Age:</span> {{ age || "Not provided" }}</div>
              <div><span class="font-semibold">Birthday:</span> {{ birthday || "Not provided" }}</div>
              <div><span class="font-semibold">Phone:</span> {{ cellphone || "Not provided" }}</div>
              <div><span class="font-semibold">Gender:</span> {{ gender || "Not provided" }}</div>
              <div><span class="font-semibold">Address:</span> {{ address || "Not provided" }}</div>
              <div class="sm:col-span-2">
                <span class="font-semibold">Status:</span>
                <span
                  :class="status === 'active' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'"
                >
                  {{ status }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-6 flex flex-col sm:flex-row justify-center items-center gap-3">
              <router-link
                to="/edit_profile"
                class="w-full sm:w-auto text-center px-5 py-2.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
              >
                Edit Profile
              </router-link>
            </div>

            <!-- Error Message -->
            <p v-if="errorMessage" class="text-red-600 mt-4 text-center text-sm font-medium">
              {{ errorMessage }}
            </p>
          </template>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { auth, db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Sidebar from "@/components/Sidebar.vue";
import Topbar from "@/components/topbar.vue";
import LoadingAnimation from "@/components/loading_animation.vue";

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

const isMobileSidebarOpen = ref(false);
let unsubscribeAuth = null;

const updateStatusInDB = async (userId, newStatus) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { status: newStatus });
  } catch (error) {
    console.error(`Failed to update status to ${newStatus}:`, error);
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

<style>
/* optional fade-in animation for main content */
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
