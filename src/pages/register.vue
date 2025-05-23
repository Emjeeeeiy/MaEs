<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-300 to-green-700">
    <form @submit.prevent="registerUser" class="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
      <h2 class="text-2xl font-bold mb-2 text-center text-gray-800">Create Account</h2>
      <p class="text-sm text-gray-600 text-center mb-6">Join us and manage your hospital billing seamlessly</p>

      <!-- Error Message -->
      <p v-if="errorMessage" class="mb-4 text-sm text-red-600 text-center">{{ errorMessage }}</p>

      <!-- Username -->
      <div class="mb-4">
        <label class="block mb-1 text-gray-700">Username</label>
        <input
          type="text"
          v-model="username"
          required
          class="w-full px-3 py-2 border rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter your username"
        />
      </div>

      <!-- Email -->
      <div class="mb-4">
        <label class="block mb-1 text-gray-700">Email</label>
        <input
          type="email"
          v-model="email"
          required
          class="w-full px-3 py-2 border rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter your email"
        />
      </div>

      <!-- Password -->
      <div class="mb-4">
        <label class="block mb-1 text-gray-700">Password</label>
        <input
          type="password"
          v-model="password"
          required
          class="w-full px-3 py-2 border rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Create a password"
        />
      </div>

      <!-- Confirm Password -->
      <div class="mb-4">
        <label class="block mb-1 text-gray-700">Confirm Password</label>
        <input
          type="password"
          v-model="confirmPassword"
          required
          class="w-full px-3 py-2 border rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Confirm your password"
        />
      </div>

      <!-- Register Button -->
      <button
        type="submit"
        class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
      >
        Register
      </button>

      <!-- Google Registration -->
      <button
        @click="registerWithGoogle"
        type="button"
        class="w-full mt-4 bg-white border border-gray-300 py-2 flex items-center justify-center gap-2 rounded hover:bg-gray-100 transition"
      >
        <img src="@/assets/google-icon.png" alt="Google Logo" class="w-5 h-5" />
        <span class="text-gray-700">Continue with Google</span>
      </button>

      <!-- Login Link -->
      <p class="text-sm text-center text-gray-600 mt-4">
        Already have an account?
        <router-link to="/login" class="text-green-700 hover:underline">Login here</router-link>
      </p>
    </form>
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