import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCjOMtmfyqbLEt4lZoC_IxBXNHhGOzgpN8",
  authDomain: "campus-flow-app-60fa8.firebaseapp.com",
  projectId: "campus-flow-app-60fa8",
  storageBucket: "campus-flow-app-60fa8.firebasestorage.app",
  messagingSenderId: "990548010268",
  appId: "1:990548010268:web:da49d89ec21bac94fd86d9",
  measurementId: "G-8JNMDH21K9"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, analytics };
