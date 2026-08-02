import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCTVtJ2Wuaj85zWEAsu-YeZ6Nx0HIGI-u4",
  authDomain: "project-1-b280e.firebaseapp.com",
  projectId: "project-1-b280e",
  storageBucket: "project-1-b280e.firebasestorage.app",
  messagingSenderId: "746835104857",
  appId: "1:746835104857:web:bf2b77939d979a95db4d48"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);