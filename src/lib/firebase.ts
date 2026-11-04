import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  increment,
  limit,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';

// Configuration loaded from firebase-applet-config.json
const firebaseConfig = {
  projectId: "gen-lang-client-0140617547",
  appId: "1:694884829631:web:0a27707c51827c8372f90a",
  apiKey: "AIzaSyCnVx34hQQVy6Gh4CvCHnbdAKS6vVd3qg8",
  authDomain: "gen-lang-client-0140617547.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-nexoraredesocial-35ec0479-3841-4c54-824c-565b6eef5c81",
  storageBucket: "gen-lang-client-0140617547.firebasestorage.app",
  messagingSenderId: "694884829631",
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// ============================================
// SECURITY & CRYPTOGRAPHIC HELPERS
// ============================================

/**
 * Generate permanent NEXORA ID: e.g. NX-849271
 */
export function generateNexoraId(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `NX-${randomNum}`;
}

/**
 * Generate a secure 16-character recovery code
 * Formatted as: NXREC-XXXX-XXXX-XXXX
 */
export function generateRecoveryCode(): string {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const pick = (len: number) => {
    let res = '';
    const array = new Uint8Array(len);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < len; i++) {
      res += charset[array[i] % charset.length];
    }
    return res;
  };
  return `NXREC-${pick(4)}-${pick(4)}-${pick(4)}`;
}

/**
 * Hash recovery code securely with SHA-256 (Never stored in plain text!)
 */
export async function hashRecoveryCode(code: string): Promise<string> {
  const clean = code.trim().toUpperCase();
  const encoder = new TextEncoder();
  const data = encoder.encode(clean);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Convert username to secure internal Firebase Auth email identifier
 * Ensures user does NOT need to provide an email or phone number.
 */
export function usernameToAuthEmail(username: string): string {
  const sanitized = username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');
  return `${sanitized}@auth.nexora.app`;
}

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  GoogleAuthProvider,
  signInWithPopup,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  increment,
  limit,
  serverTimestamp,
};
export type { FirebaseUser, Firestore };
