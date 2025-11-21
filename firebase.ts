
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC9DMH6QYRERl5TUQbJ1xcv-1kALJB0_x4",
  authDomain: "milano-store-335c8.firebaseapp.com",
  projectId: "milano-store-335c8",
  storageBucket: "milano-store-335c8.firebasestorage.app",
  messagingSenderId: "16994956866",
  appId: "1:16994956866:web:fdff2a474b12f30d6adfdb",
  measurementId: "G-1PN72B1710"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
