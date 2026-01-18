<template>
  <div class="min-h-screen bg-white text-gray-800 flex flex-col">

    <!-- MAIN CONTENT -->
    <main class="flex-grow flex items-center justify-center px-4">
      <form
        @submit.prevent="registerUser"
        class="w-full max-w-md rounded-lg p-6 space-y-4 bg-white shadow-sm border border-gray-200"
      >
        <!-- Title -->
        <h2 class="text-2xl font-bold text-green-700 text-center">
          Create Account
        </h2>
        <p class="text-sm text-gray-600 text-center">
          Join us and manage your hospital billing seamlessly.
        </p>

        <!-- Error -->
        <p v-if="errorMessage" class="text-red-600 text-sm text-center">
          {{ errorMessage }}
        </p>

        <!-- Username -->
        <div>
          <label class="block text-sm font-medium mb-1">Username</label>
          <input
            v-model="username"
            type="text"
            required
            class="w-full px-4 py-2 border rounded-md text-sm focus:ring-1 focus:ring-green-500 focus:outline-none"
          />
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-2 border rounded-md text-sm focus:ring-1 focus:ring-green-500 focus:outline-none"
          />
        </div>

        <!-- Password -->
        <div class="relative">
          <label class="block text-sm font-medium mb-1">Password</label>
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            required
            class="w-full px-4 py-2 border rounded-md pr-10 text-sm focus:ring-1 focus:ring-green-500 focus:outline-none"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-3 top-9 text-gray-500"
          >
            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
          </button>
        </div>

        <!-- Confirm Password -->
        <div class="relative">
          <label class="block text-sm font-medium mb-1">
            Confirm Password
          </label>
          <input
            :type="showConfirmPassword ? 'text' : 'password'"
            v-model="confirmPassword"
            required
            class="w-full px-4 py-2 border rounded-md pr-10 text-sm focus:ring-1 focus:ring-green-500 focus:outline-none"
          />
          <button
            type="button"
            @click="showConfirmPassword = !showConfirmPassword"
            class="absolute right-3 top-9 text-gray-500"
          >
            <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
          </button>
        </div>

        <!-- Password Rules -->
        <ul v-if="password.length" class="text-sm space-y-1">
          <li :class="passwordValidation.hasUppercase ? 'text-green-600' : 'text-red-500'">
            • Uppercase & lowercase
          </li>
          <li :class="passwordValidation.hasNumber ? 'text-green-600' : 'text-red-500'">
            • Number
          </li>
          <li :class="passwordValidation.hasSpecial ? 'text-green-600' : 'text-red-500'">
            • Special character
          </li>
          <li :class="passwordValidation.minLength ? 'text-green-600' : 'text-red-500'">
            • At least 8 characters
          </li>
          <li :class="passwordsMatch ? 'text-green-600' : 'text-red-500'">
            • Passwords match
          </li>
        </ul>

        <!-- Terms -->
        <div class="text-sm space-y-2">
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="acceptedTerms" />
            <span>I agree to the Terms</span>
          </label>
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="acceptedPrivacy" />
            <span>I accept the Privacy Policy</span>
          </label>
        </div>

        <!-- Register Button -->
        <button
          type="submit"
          :disabled="!isPasswordValid || !acceptedTerms || !acceptedPrivacy"
          :class="[ 
            'w-full py-2 rounded-md text-white text-sm font-semibold transition',
            isPasswordValid && acceptedTerms && acceptedPrivacy
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-gray-400 cursor-not-allowed'
          ]"
        >
          Register
        </button>

        <!-- Login -->
        <p class="text-sm text-center">
          Already have an account?
          <router-link to="/login" class="text-green-700 font-semibold">
            Login
          </router-link>
        </p>
      </form>
    </main>

    <!-- FOOTER COMPONENT -->
    <FooterOutside />

  </div>
</template>

<script>
import FooterOutside from "@/components/FooterOutside.vue"; // <-- Import footer component

export default {
  components: {
    FooterOutside
  },
  data() {
    return {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      showPassword: false,
      showConfirmPassword: false,
      acceptedTerms: false,
      acceptedPrivacy: false,
      errorMessage: '',
      dropdowns: {
        features: false,
        help: false
      }
    }
  },
  computed: {
    passwordValidation() {
      return {
        hasUppercase: /[A-Z]/.test(this.password) && /[a-z]/.test(this.password),
        hasNumber: /\d/.test(this.password),
        hasSpecial: /[^A-Za-z0-9]/.test(this.password),
        minLength: this.password.length >= 8
      }
    },
    passwordsMatch() {
      return this.password === this.confirmPassword && this.password.length
    },
    isPasswordValid() {
      const v = this.passwordValidation
      return v.hasUppercase && v.hasNumber && v.hasSpecial && v.minLength && this.passwordsMatch
    }
  },
  methods: {
    toggleDropdown(name) {
      this.dropdowns[name] = !this.dropdowns[name]
    },
    registerUser() {
      // registration logic here
    }
  }
}
</script>
