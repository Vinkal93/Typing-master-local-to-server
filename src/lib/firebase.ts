import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB8pPAokyXrNhNs6p26z3FfAMd9xHsLe44",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "typing-master-e5b37.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "typing-master-e5b37",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "typing-master-e5b37.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "249138400809",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:249138400809:web:9f5b4127025d71c09e5638",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-3JM1F2NQLW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize analytics only in browser
export const initAnalytics = async () => {
  const supported = await isSupported();
  if (supported) {
    return getAnalytics(app);
  }
  return null;
};

export default app;
