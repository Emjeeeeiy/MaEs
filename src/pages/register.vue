<template>
  <div class="min-h-screen bg-gradient-to-br from-green-300 to-green-700 flex flex-col">
    <!-- Topbar -->
    <login_topbar />

    <div class="flex-grow flex items-center justify-center px-4 py-8">
      <form
        @submit.prevent="registerUser"
        class="w-full max-w-sm bg-white p-6 rounded-lg shadow-md"
      >
        <h2 class="text-xl font-semibold mb-1 text-center text-gray-800">Create Account</h2>
        <p class="text-xs text-gray-600 text-center mb-5">
          Join us and manage your hospital billing seamlessly
        </p>

        <!-- Error Message -->
        <p v-if="errorMessage" class="mb-3 text-xs text-red-600 text-center">{{ errorMessage }}</p>

        <!-- Username -->
        <div class="mb-3">
          <label class="block mb-1 text-gray-700 text-xs">Username</label>
          <input
            type="text"
            v-model="username"
            required
            class="w-full px-2 py-1 border rounded text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter your username"
          />
        </div>

        <!-- Email -->
        <div class="mb-3">
          <label class="block mb-1 text-gray-700 text-xs">Email</label>
          <input
            type="email"
            v-model="email"
            required
            class="w-full px-2 py-1 border rounded text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter your email"
          />
        </div>

        <!-- Password -->
        <div class="mb-3">
          <label class="block mb-1 text-gray-700 text-xs">Password</label>
          <input
            type="password"
            v-model="password"
            required
            class="w-full px-2 py-1 border rounded text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Create a password"
          />
        </div>

        <!-- Confirm Password -->
        <div class="mb-4">
          <label class="block mb-1 text-gray-700 text-xs">Confirm Password</label>
          <input
            type="password"
            v-model="confirmPassword"
            required
            class="w-full px-2 py-1 border rounded text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Confirm your password"
          />
        </div>

        <!-- Register Button -->
        <button
          type="submit"
          class="w-full bg-green-600 text-white py-1.5 rounded hover:bg-green-700 transition text-sm font-semibold"
        >
          Register
        </button>

        <!-- Google Registration -->
        <button
          @click="registerWithGoogle"
          type="button"
          class="w-full mt-3 bg-white border border-gray-300 py-1.5 flex items-center justify-center gap-2 rounded hover:bg-gray-100 transition text-sm"
        >
          <img src="@/assets/google-icon.png" alt="Google Logo" class="w-4 h-4" />
          <span class="text-gray-700">Continue with Google</span>
        </button>
        <router-link to="/login" class="text-green-700 hover:underline">back</router-link>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "firebase/auth";
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "vue-router";
import login_topbar from "@/components/login_topbar.vue";

const username = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const errorMessage = ref("");
const router = useRouter();
const auth = getAuth();

const registerUser = async () => {
  if (password.value !== confirmPassword.value) {
    errorMessage.value = "Passwords do not match.";
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;

    await updateProfile(user, { displayName: username.value });
    await sendEmailVerification(user);

    await setDoc(doc(db, "users", user.uid), {
      username: username.value,
      email: email.value,
      role: "user",
      status: "active"
    });

    alert("Registration successful! Please check your email for verification.");
    await signOut(auth);
    router.push("/login");
  } catch (error) {
    errorMessage.value = `Registration failed: ${error.message}`;
  }
};

const registerWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      errorMessage.value = "User already registered. Please login.";
      await signOut(auth);
      router.push("/login");
      return;
    }

    await setDoc(userRef, {
      username: user.displayName,
      email: user.email,
      role: "user",
      status: "active"
    });

    alert("Registration successful!");
    router.push("/dashboard");
  } catch (error) {
    errorMessage.value = "Google Registration Failed: " + error.message;
  }
};
</script>
