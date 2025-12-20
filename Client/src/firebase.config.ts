// Firebase configuration and initialization
// This file can be imported as: import { auth, db, storage } from '@/firebase.config'
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyBh0uaHuOShcdIuEIScVs96Xicq6pPiwnk",
  authDomain: "quiflix-web3boxoffice.firebaseapp.com",
  databaseURL: "https://quiflix-web3boxoffice-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "quiflix-web3boxoffice",
  storageBucket: "quiflix-web3boxoffice.firebasestorage.app",
  messagingSenderId: "722887250041",
  appId: "1:722887250041:web:9419d3e0fd7c7ebcb004a8",
  measurementId: "G-RFWHYYDCY0"
};

// Initialize Firebase only if it hasn't been initialized yet
// This prevents the "duplicate app" error
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Set authentication persistence to local storage
// This keeps users logged in across browser sessions
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Error setting auth persistence:', error);
});

// Export the app instance if needed elsewhere
export default app;
