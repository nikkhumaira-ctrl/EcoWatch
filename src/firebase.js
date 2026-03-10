import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD2-9zyehTfw9Gu4c_Lb2D8cF50MwicMz8",
  authDomain: "ecowatch-6cbee.firebaseapp.com",
  projectId: "ecowatch-6cbee",
  storageBucket: "ecowatch-6cbee.firebasestorage.app",
  messagingSenderId: "493833914777",
  appId: "1:493833914777:web:cb775a3d2061c33059ab08"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore database
const db = getFirestore(app);

// Authentication
const auth = getAuth(app);

export { db, auth };