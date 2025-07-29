// lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA_VjQw7dikwDEGqRTtIVnUX_aNTemdlgM",
  authDomain: "theonealgo-debf3.firebaseapp.com",
  projectId: "theonealgo-debf3",
  storageBucket: "theonealgo-debf3.appspot.com",
  messagingSenderId: "745387946420",
  appId: "1:745387946420:web:ff6905011a58685bc2c2e1",
  measurementId: "G-TZSV684T5L",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
