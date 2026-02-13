// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD_RY0gTNZAxh_n6qmzi4vfAj3UjKA9o40",
  authDomain: "sateri-medical.firebaseapp.com",
  projectId: "sateri-medical",
  storageBucket: "sateri-medical.firebasestorage.app",
  messagingSenderId: "914343330895",
  appId: "1:914343330895:web:34c3af35e2184b03cb563a",
  measurementId: "G-VFK2QGDX9T"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
