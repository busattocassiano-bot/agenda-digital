import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyASpWqinYKKi9pDw6vm5Av3MNw0_FPVA5k",
  authDomain: "agenda-digital-clinica.firebaseapp.com",
  projectId: "agenda-digital-clinica",
  storageBucket: "agenda-digital-clinica.firebasestorage.app",
  messagingSenderId: "48969632155",
  appId: "1:48969632155:web:9f42840bff4ebbf6ee393e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
