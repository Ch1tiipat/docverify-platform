// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ดึงข้อมูล Config จากไฟล์ .env.local (ซ่อนความลับ)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// ป้องกันปัญหา Firebase Initialize ซ้ำซ้อนเวลา Next.js ทำ Hot-reload
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// ส่งออก (Export) ฐานข้อมูลและระบบเก็บไฟล์ เพื่อให้หน้าอื่นๆ เรียกใช้ได้ทันที
export const db = getFirestore(app);
export const storage = getStorage(app);