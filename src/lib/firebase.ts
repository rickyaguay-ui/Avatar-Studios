import { initializeApp, getApps, getApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, onAuthStateChanged, User } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, collection, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

// Firebase is OPTIONAL. It only powers Google sign-in and cloud backup of projects.
// The config file is gitignored, so it may not exist. Load it only if present.
const configFiles = (import.meta as any).glob('../../firebase-applet-config.json', { eager: true, import: 'default' }) as Record<
  string,
  Record<string, string> | undefined
>;
const firebaseConfigData: Record<string, string> = Object.values(configFiles)[0] || {};

/** True only when a real config (non-empty apiKey) was provided. */
export const firebaseEnabled = Boolean(firebaseConfigData.apiKey);

let appInstance: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let dbInstance: Firestore | undefined;

if (firebaseEnabled) {
  const firebaseConfig = {
    apiKey: firebaseConfigData.apiKey,
    authDomain: firebaseConfigData.authDomain,
    projectId: firebaseConfigData.projectId,
    storageBucket: firebaseConfigData.storageBucket,
    messagingSenderId: firebaseConfigData.messagingSenderId,
    appId: firebaseConfigData.appId,
  };
  appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  authInstance = getAuth(appInstance);
  dbInstance = firebaseConfigData.firestoreDatabaseId
    ? getFirestore(appInstance, firebaseConfigData.firestoreDatabaseId)
    : getFirestore(appInstance);

  // Test connection on boot
  (async () => {
    try {
      await getDocFromServer(doc(dbInstance!, 'test', 'connection'));
    } catch (error: any) {
      if (error?.message && error.message.includes('the client is offline')) {
        console.warn('Firebase client is offline or network error.');
      }
    }
  })();
}

// When Firebase is off these are never used (callers check `firebaseEnabled` first).
export const app = appInstance as FirebaseApp;
export const auth = authInstance as Auth;
export const db = dbInstance as Firestore;
export const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<User> {
  if (!firebaseEnabled) throw new Error('Firebase is not configured.');
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  if (!firebaseEnabled) return;
  await fbSignOut(auth);
}

export type { User };
export { onAuthStateChanged, collection, doc, setDoc, getDocs, deleteDoc };
