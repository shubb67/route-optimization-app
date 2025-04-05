// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGc1wbY8Hqb5blcpyUyoh-6e9A25IB3ds",
  authDomain: "route-optimizer-app-3a667.firebaseapp.com",
  projectId: "route-optimizer-app-3a667",
  storageBucket: "route-optimizer-app-3a667.firebasestorage.app",
  messagingSenderId: "711332823819",
  appId: "1:711332823819:web:9882d1bd1dbd64ca90580e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

export { auth, db, storage };