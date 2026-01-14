
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBrNruLhq-5FLNkEUd58w0BAhnqYJJ2meo",
  authDomain: "daily-tracker-b3792.firebaseapp.com",
  projectId: "daily-tracker-b3792",
  storageBucket: "daily-tracker-b3792.firebasestorage.app",
  messagingSenderId: "325259909054",
  appId: "1:325259909054:web:12f7cf522f11c9be318bef"
};

// Initialize Firebase for Next.js SSR/Client
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
