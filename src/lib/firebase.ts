import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCg41nrI9GosXvb_5vuOixSDpbzeYuct20",
  authDomain: "zeoxxyz.firebaseapp.com",
  databaseURL: "https://zeoxxyz-default-rtdb.firebaseio.com",
  projectId: "zeoxxyz",
  storageBucket: "zeoxxyz.firebasestorage.app",
  messagingSenderId: "896346061745",
  appId: "1:896346061745:web:d1fde2af1ee3eef26ddb90",
  measurementId: "G-4TB1S0J03W",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics only in browser
if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) getAnalytics(app);
  });
}

export default app;
