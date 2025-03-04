// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBGux1bZhFmmuNQDvGr2CDsUxIrHF1pFhU",
  authDomain: "ai-traveller-67214.firebaseapp.com",
  projectId: "ai-traveller-67214",
  storageBucket: "ai-traveller-67214.firebasestorage.app",
  messagingSenderId: "151291844199",
  appId: "1:151291844199:web:45fcc2574f5c1d3453a6c2",
  measurementId: "G-W93HDHGMR1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
