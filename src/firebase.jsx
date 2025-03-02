// src/firebase.jsx
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBDDYVmapcZDQYkrYgc90N4gMI__-OEFNE",
    authDomain: "hikayara-financial-tracker.firebaseapp.com",
    projectId: "hikayara-financial-tracker",
    storageBucket: "hikayara-financial-tracker.firebasestorage.app",
    messagingSenderId: "533699931145",
    appId: "1:533699931145:web:3738a3166855e592755cd8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default { auth, db };