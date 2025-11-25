
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyChmlNP_IiUfgpGt9QEWfQUO7ATvdWEtwM",
  authDomain: "million-store.firebaseapp.com",
  projectId: "million-store",
  storageBucket: "million-store.firebasestorage.app",
  messagingSenderId: "1078801330776",
  appId: "1:1078801330776:web:6c3f696b4d0874e93f502d",
  measurementId: "G-VLK6HQKMZ5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
