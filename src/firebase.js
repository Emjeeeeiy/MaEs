import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 
import { addDoc, serverTimestamp } from "firebase/firestore";



// Your Firebase configuration (Replace with actual values if necessary)
const firebaseConfig = {
  apiKey: "AIzaSyB932LihfaOUYVCksqn9iVTglDq6QQrkhA",
  authDomain: "hospital-billing-a5bef.firebaseapp.com",
  projectId: "hospital-billing-a5bef",
  storageBucket: "hospital-billing-a5bef.firebasestorage.app",
  messagingSenderId: "298673867675",
  appId: "1:298673867675:web:ceedde4d4ff09eecdb2f3e",
  measurementId: "G-FKFY1TM68W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
const storage = getStorage(app); 

// Function for Google Sign-In
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("User Info:", result.user);
  } catch (error) {
    console.error("Google Sign-In Error:", error.message);
  }
};

// Function to Logoutc
const logout = async () => {
  try {
    await signOut(auth);
    console.log("User logged out.");
  } catch (error) {
    console.error("Logout Error:", error.message);
  }
};

export { auth, db, storage, collection, getDocs, addDoc, serverTimestamp, signInWithGoogle, logout };

