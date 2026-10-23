import { initializeApp, getApps, getApp, FirebaseApp, FirebaseOptions } from 'firebase/app';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { UserProfile } from '../types';

const STORAGE_KEY = 'medifinder_firebase_config';

export const DEFAULT_FIREBASE_CONFIG: FirebaseOptions = {
  apiKey: "AIzaSyBp7xkE6NhKH0cROJQPE2uDhVHJl8cUTa4",
  authDomain: "medifinder-9471f.firebaseapp.com",
  projectId: "medifinder-9471f",
  storageBucket: "medifinder-9471f.firebasestorage.app",
  messagingSenderId: "96224770523",
  appId: "1:96224770523:web:85ea155122e29e8ecd0ffe",
  measurementId: "G-Q5H5SMX1SG"
};

/**
 * Retrieves Firebase configuration from localStorage, Vite environment variables, or default project.
 */
export function getFirebaseConfig(): FirebaseOptions | null {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.apiKey && parsed.projectId) {
          return parsed;
        }
      } catch {
        // ignore JSON parse error
      }
    }
  }

  const env = (import.meta as any).env || {};
  const apiKey = env.VITE_FIREBASE_API_KEY;
  const projectId = env.VITE_FIREBASE_PROJECT_ID;

  if (apiKey && projectId) {
    return {
      apiKey,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
      projectId,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: env.VITE_FIREBASE_APP_ID || '',
      measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || ''
    };
  }

  return DEFAULT_FIREBASE_CONFIG;
}

/**
 * Checks if Firebase has valid credentials configured.
 */
export function isFirebaseConfigured(): boolean {
  const config = getFirebaseConfig();
  return Boolean(config?.apiKey && config?.projectId);
}

/**
 * Saves Firebase configuration into localStorage and triggers app refresh.
 */
export function saveFirebaseConfig(config: FirebaseOptions): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

/**
 * Clears custom Firebase configuration.
 */
export function clearFirebaseConfig(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// Initialize Firebase App, Auth & Firestore singletons
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

const config = getFirebaseConfig();
if (config) {
  try {
    app = getApps().length === 0 ? initializeApp(config) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.error('Failed to initialize Firebase App / Firestore:', err);
  }
}

export { auth, db };

export function getCurrentFirebaseUser(): FirebaseUser | null {
  return auth?.currentUser || null;
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Map Firebase User object to MediFinder UserProfile
 */
export function mapFirebaseUserToProfile(user: FirebaseUser): UserProfile {
  const isGoogle = user.providerData.some(p => p.providerId === 'google.com');
  return {
    uid: user.uid,
    name: user.displayName || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    phone: user.phoneNumber || '9876543210',
    avatar:
      user.photoURL ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user.displayName || user.email?.split('@')[0] || 'User'
      )}&background=0bbbb6&color=fff`,
    authProvider: isGoogle ? 'google' : 'guest'
  };
}

/**
 * Format Firebase Auth errors into friendly messages.
 */
export function formatFirebaseError(error: any): string {
  if (!error) return 'An unexpected error occurred.';
  const code = error.code || '';
  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completing.';
    case 'auth/cancelled-popup-request':
      return 'Only one popup request allowed at a time.';
    case 'auth/popup-blocked':
      return 'Google sign-in popup was blocked by your browser. Please allow popups for localhost.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/operation-not-allowed':
      return 'This sign-in provider is disabled in your Firebase Console. Please enable Google or Email/Password under Firebase Console > Authentication > Sign-in method.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in Firebase. Please add "localhost" under Firebase Console > Authentication > Settings > Authorized domains.';
    default:
      return error.message || 'Authentication failed. Please check your credentials.';
  }
}

/**
 * Real Firebase Google Sign-In with popup
 */
export async function loginWithGooglePopup(): Promise<UserProfile> {
  if (!auth) {
    throw new Error(
      'Firebase Authentication is not configured yet. Please configure your Firebase project credentials.'
    );
  }

  const result = await signInWithPopup(auth, googleProvider);
  return mapFirebaseUserToProfile(result.user);
}

/**
 * Real Firebase Email/Password Sign-In
 */
export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  if (!auth) {
    throw new Error(
      'Firebase Authentication is not configured yet. Please configure your Firebase project credentials.'
    );
  }

  const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return mapFirebaseUserToProfile(result.user);
}

/**
 * Real Firebase Email/Password Sign-Up
 */
export async function registerWithEmail(
  email: string,
  pass: string,
  name?: string
): Promise<UserProfile> {
  if (!auth) {
    throw new Error(
      'Firebase Authentication is not configured yet. Please configure your Firebase project credentials.'
    );
  }

  const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  if (name?.trim() && result.user) {
    try {
      await updateProfile(result.user, { displayName: name.trim() });
    } catch {
      // Non-critical profile name update error
    }
  }

  return mapFirebaseUserToProfile(result.user);
}

/**
 * Real Firebase Sign-Out
 */
export async function logoutUser(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}

/**
 * Real-time Firebase Auth State Listener
 */
export function onAuthChange(callback: (user: UserProfile | null) => void): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, (fbUser) => {
    if (fbUser) {
      callback(mapFirebaseUserToProfile(fbUser));
    } else {
      callback(null);
    }
  });
}
