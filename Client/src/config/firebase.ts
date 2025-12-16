import { initializeApp, type FirebaseApp } from "firebase/app";
import { getStorage, type FirebaseStorage } from "firebase/storage";

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

// Initialize Firebase
export const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Storage
export const storage: FirebaseStorage = getStorage(firebaseApp);
