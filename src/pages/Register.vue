<template>
  <div class="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased font-sans">

    <!-- MAIN CONTENT -->
    <main class="grow flex items-center justify-center px-4 py-12 sm:py-20">
      <form
        @submit.prevent="registerUser"
        class="w-full max-w-md rounded-2xl p-6 sm:p-8 space-y-5 bg-white shadow-sm border border-slate-200/60"
      >
        <!-- Header Text -->
        <div>
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Create Account
          </h2>
          <p class="text-xs text-slate-400 mt-1">
            Join Maria Estrella Paytrack to streamline your clinical unit's billing.
          </p>
        </div>

        <!-- Error Alert Banner -->
        <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-700 text-xs font-medium">
          <span>⚠️</span> <span>{{ errorMessage }}</span>
        </div>

        <!-- Username -->
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Username</label>
          <div class="relative">
            <User class="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              v-model="username"
              type="text"
              required
              placeholder="e.g., admin_desk"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none"
            />
          </div>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Email Address</label>
          <div class="relative">
            <Mail class="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              v-model="email"
              type="email"
              required
              placeholder="name@hospital.com"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none"
            />
          </div>
        </div>

        <!-- Password -->
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Password</label>
          <div class="relative">
            <Lock class="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="••••••••"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm transition-all focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
            >
              <Eye v-if="!showPassword" class="h-4 w-4" />
              <EyeOff v-else class="h-4 w-4" />
            </button>
          </div>
        </div>

        <!-- Confirm Password -->
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Confirm Password</label>
          <div class="relative">
            <Lock class="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              placeholder="••••••••"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm transition-all focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none"
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
            >
              <Eye v-if="!showConfirmPassword" class="h-4 w-4" />
              <EyeOff v-else class="h-4 w-4" />
            </button>
          </div>
        </div>

        <!-- Password Rules Validation Dashboard Layout -->
        <div v-if="password.length" class="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
          <p class="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1">Security Criteria</p>
          <ul class="text-xs space-y-1 font-medium">
            <li :class="passwordValidation.hasUppercase ? 'text-emerald-700 flex items-center gap-1.5' : 'text-slate-400 flex items-center gap-1.5'">
              <CheckCircle2 class="h-3.5 w-3.5 shrink-0" :class="passwordValidation.hasUppercase ? 'text-emerald-500' : 'text-slate-200'" />
              Uppercase & lowercase characters
            </li>
            <li :class="passwordValidation.hasNumber ? 'text-emerald-700 flex items-center gap-1.5' : 'text-slate-400 flex items-center gap-1.5'">
              <CheckCircle2 class="h-3.5 w-3.5 shrink-0" :class="passwordValidation.hasNumber ? 'text-emerald-500' : 'text-slate-200'" />
              Contains numerical sequences
            </li>
            <li :class="passwordValidation.hasSpecial ? 'text-emerald-700 flex items-center gap-1.5' : 'text-slate-400 flex items-center gap-1.5'">
              <CheckCircle2 class="h-3.5 w-3.5 shrink-0" :class="passwordValidation.hasSpecial ? 'text-emerald-500' : 'text-slate-200'" />
              Includes special symbol characters
            </li>
            <li :class="passwordValidation.minLength ? 'text-emerald-700 flex items-center gap-1.5' : 'text-slate-400 flex items-center gap-1.5'">
              <CheckCircle2 class="h-3.5 w-3.5 shrink-0" :class="passwordValidation.minLength ? 'text-emerald-500' : 'text-slate-200'" />
              Minimum standard structural count (8+ chars)
            </li>
            <li :class="passwordsMatch ? 'text-emerald-700 flex items-center gap-1.5' : 'text-slate-400 flex items-center gap-1.5'">
              <CheckCircle2 class="h-3.5 w-3.5 shrink-0" :class="passwordsMatch ? 'text-emerald-500' : 'text-slate-200'" />
              Both passwords align and match perfectly
            </li>
          </ul>
        </div>

        <!-- Compliance Checkboxes -->
        <div class="text-xs space-y-2.5 pt-1 text-slate-600 font-medium">
          <label class="flex items-start gap-2.5 cursor-pointer group">
            <input 
              type="checkbox" 
              v-model="acceptedTerms" 
              class="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20 h-4 w-4" 
            />
            <span class="group-hover:text-slate-900 transition">I agree to the operational <a href="#" class="text-emerald-700 font-bold hover:underline">Terms of Service</a></span>
          </label>
          <label class="flex items-start gap-2.5 cursor-pointer group">
            <input 
              type="checkbox" 
              v-model="acceptedPrivacy" 
              class="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20 h-4 w-4" 
            />
            <span class="group-hover:text-slate-900 transition">I accept the secure cloud platform <a href="#" class="text-emerald-700 font-bold hover:underline">Privacy Policy</a></span>
          </label>
        </div>

        <!-- Register Button -->
        <button
          type="submit"
          :disabled="!isPasswordValid || !acceptedTerms || !acceptedPrivacy"
          :class="[ 
            'w-full py-3 rounded-xl text-sm font-semibold transition-all shadow-sm mt-2',
            isPasswordValid && acceptedTerms && acceptedPrivacy
              ? 'bg-emerald-600 text-white hover:bg-emerald-500 hover:-translate-y-px'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          ]"
        >
          Complete Registration
        </button>

        <!-- Redirect Route Hook -->
        <p class="text-xs text-center text-slate-500 pt-1">
          Already have an account?
          <router-link to="/login" class="text-emerald-700 font-bold hover:underline ml-0.5">
            Sign In
          </router-link>
        </p>
      </form>
    </main>

    <!-- FOOTER COMPONENT -->
    <AppFooter />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2 
} from 'lucide-vue-next'
import AppFooter from "@/components/AppFooter.vue"
import { useTawk } from "@/composables/useTawk";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  updateProfile,
  signOut
} from 'firebase/auth'
import { db } from '@/firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useNotifications } from '@/composables/useNotifications'

// Form references
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const { loadTawk, unloadTawk } = useTawk();
const { success, error: notifyError } = useNotifications();
const router = useRouter();
const auth = getAuth();
const isSubmitting = ref(false)

onMounted(() => {
  loadTawk();
})

onUnmounted(() => {
  unloadTawk();
})

// Interactive interface toggles
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const acceptedTerms = ref(false)
const acceptedPrivacy = ref(false)
const errorMessage = ref('')

// Password validation state calculations
const passwordValidation = computed(() => {
  return {
    hasUppercase: /[A-Z]/.test(password.value) && /[a-z]/.test(password.value),
    hasNumber: /\d/.test(password.value),
    hasSpecial: /[^A-Za-z0-9]/.test(password.value),
    minLength: password.value.length >= 8
  }
})

const passwordsMatch = computed(() => {
  return password.value === confirmPassword.value && password.value.length > 0
})

const isPasswordValid = computed(() => {
  const v = passwordValidation.value
  return v.hasUppercase && v.hasNumber && v.hasSpecial && v.minLength && passwordsMatch.value
})

const registerUser = async () => {
  if (!isPasswordValid.value || !acceptedTerms.value || !acceptedPrivacy.value) return
  
  isSubmitting.value = true
  errorMessage.value = ''
  
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email.value.trim(), password.value)
    
    // Update profile
    await updateProfile(user, { displayName: username.value })
    
    // Create Firestore record
    await setDoc(doc(db, 'users', user.uid), {
      username: username.value,
      email: email.value.toLowerCase().trim(),
      role: 'user',
      status: 'active',
      createdAt: serverTimestamp()
    })
    
    // Send verification email
    await sendEmailVerification(user)
    
    // Sign out to force login after verification
    await signOut(auth)
    
    success('Registration successful! Please verify your email before logging in.')
    router.push('/login')
  } catch (err) {
    console.error(err)
    if (err.code === 'auth/email-already-in-use') {
      errorMessage.value = 'This email is already registered.'
    } else {
      errorMessage.value = 'Failed to create account. Please try again.'
    }
    notifyError(errorMessage.value)
  } finally {
    isSubmitting.value = false
  }
}
</script>