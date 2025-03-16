<template>
  <div class="register-wrapper">
    <div class="register-container">
      <h2>Create Account</h2>
      <p class="tagline">Join us and manage your hospital billing seamlessly</p>
      <form @submit.prevent="registerUser">
        <div class="input-group">
          <input type="text" v-model="username" placeholder="Username" required />
        </div>
        <div class="input-group">
          <input type="email" v-model="email" placeholder="Email" required />
        </div>
        <div class="input-group">
          <input type="password" v-model="password" placeholder="Password" required />
        </div>
        <div class="input-group">
          <input type="password" v-model="confirmPassword" placeholder="Confirm Password" required />
        </div>
        <button type="submit" class="btn primary-btn">Register</button>
        <button @click="registerWithGoogle" type="button" class="btn google-btn">
          <img src="@/assets/google-icon.png" alt="Google Logo" /> Continue with Google
        </button>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>
      <p class="login-msg">
        Already have an account?
        <router-link to="/login" class="link">Login here</router-link>
      </p>
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

<style scoped>
/* Background with a modern gradient */
.register-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #81c784, #388e3c);
}

/* Centered card container */
.register-container {
  background: rgba(255, 255, 255, 0.98);
  padding: 40px 30px;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  max-width: 420px;
  width: 100%;
  text-align: center;
  font-family: 'Poppins', sans-serif;
}

/* Headings & Tagline */
h2 {
  color: #2e7d32;
  font-size: 38px;
  margin-bottom: 10px;
}
.tagline {
  color: #555;
  font-size: 15px;
  margin-bottom: 25px;
}

/* Input Group Styling */
.input-group {
  margin-bottom: 15px;
}
input {
  width: 100%;
  padding: 12px;
  border: 1px solid #bdbdbd;
  border-radius: 6px;
  font-size: 15px;
  outline: none;
  transition: border 0.2s;
  background: #f9fbe7;
}
input:focus {
  border-color: #2e7d32;
}

/* Buttons */
.btn {
  width: 100%;
  padding: 12px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  margin-bottom: 15px;
  transition: background 0.3s, transform 0.2s;
}
.primary-btn {
  background-color: #388e3c;
  color: white;
}
.primary-btn:hover {
  background-color: #2e7d32;
  transform: scale(1.02);
}
.google-btn {
  background-color: #f1f1f1;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
}
.google-btn:hover {
  background-color: #e0e0e0;
  transform: scale(1.02);
}
.google-btn img {
  width: 22px;
  margin-right: 10px;
}

/* Error Message */
.error-message {
  color: #d32f2f;
  font-size: 14px;
  margin-top: 10px;
}

/* Login Link Message */
.login-msg {
  font-size: 14px;
  color: #555;
  margin-top: 10px;
}
.link {
  color: #2e7d32;
  text-decoration: none;
  font-weight: bold;
}
.link:hover {
  text-decoration: underline;
}
</style>
