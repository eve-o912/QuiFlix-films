import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "quiflix-web3boxoffice.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase (prevent multiple initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Analytics only on client-side and with consent
let analytics: Analytics | undefined;
if (typeof window !== 'undefined') {
  try {
    const consent = localStorage.getItem('analytics_consent');
    if (consent === 'granted') {
      analytics = getAnalytics(app);
    }
  } catch {}
}

// Initialize Auth & Firestore
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { app, analytics, auth, db }