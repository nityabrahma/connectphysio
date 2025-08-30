// src/lib/firebase.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyA90IEvWNZETbLD247OkFKVZy_eXsmg0dY",
  authDomain: "connectphysio-2511.firebaseapp.com",
  databaseURL: "https://connectphysio-2511-default-rtdb.firebaseio.com",
  projectId: "connectphysio-2511",
  storageBucket: "connectphysio-2511.firebasestorage.app",
  messagingSenderId: "1090667651344",
  appId: "1:1090667651344:web:e38e4793cf62246a1ec595"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

export { app, db };
