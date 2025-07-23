// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCeUcOrJoIEVnxT6IY_2gaClvAolijGqKI",
  authDomain: "skillstage-1de3d.firebaseapp.com",
  projectId: "skillstage-1de3d",
  storageBucket: "skillstage-1de3d.firebasestorage.app",
  messagingSenderId: "704611063823",
  appId: "1:704611063823:web:f3429b0405d8ff1fb62b7a",
  measurementId: "G-NJ0T88PEY7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);