// src/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth'; // Import initializeAuth from standard path
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // 画像アップロード用にStorageも追加
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

console.log('[firebase.ts] Starting script execution...');

// .env ファイルから環境変数を読み込む
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

console.log('[firebase.ts] Firebase Config Loaded:', {
  apiKey: firebaseConfig.apiKey ? '***' : 'MISSING',
  authDomain: firebaseConfig.authDomain || 'MISSING',
  projectId: firebaseConfig.projectId || 'MISSING',
  storageBucket: firebaseConfig.storageBucket || 'MISSING',
  messagingSenderId: firebaseConfig.messagingSenderId || 'MISSING',
  appId: firebaseConfig.appId || 'MISSING',
});

// Firebase Appの初期化
let app: any; // appをtryの外でも参照できるように宣言
let db: any, auth: any, storage: any; // 各サービスも同様に宣言

try {
  console.log('[firebase.ts] Checking existing apps...');
  if (!getApps().length) {
    console.log('[firebase.ts] No existing app found, initializing new app...');
    app = initializeApp(firebaseConfig);
    console.log('[firebase.ts] New app initialized successfully.');
  } else {
    console.log('[firebase.ts] Existing app found, getting app instance...');
    app = getApp();
    console.log('[firebase.ts] Got existing app instance successfully.');
  }

  console.log('[firebase.ts] Initializing Auth...');
  auth = initializeAuth(app); 
  console.log('[firebase.ts] Auth initialized successfully.');

  console.log('[firebase.ts] Initializing Firestore...');
  db = getFirestore(app);
  console.log('[firebase.ts] Firestore initialized successfully.');

  console.log('[firebase.ts] Initializing Storage...');
  storage = getStorage(app);
  console.log('[firebase.ts] Storage initialized successfully.');

  console.log('[firebase.ts] Exporting modules...');

} catch (error) {
  console.error('[firebase.ts] FATAL ERROR during Firebase initialization:', error);
  // エラー発生時のフォールバックが必要な場合はここに追加
}

console.log('[firebase.ts] Script execution finished, exporting...');
export { app, db, auth, storage }; // エクスポート
