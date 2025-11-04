// src/services/firebaseService.ts
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  type Auth
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  type Firestore,
  type Unsubscribe,
  type DocumentSnapshot
} from 'firebase/firestore';
import type { FirebaseApp } from 'firebase/app';

declare const __firebase_config: string | undefined; // canvas
declare const __initial_auth_token: string | undefined;

const VITE_USE_DUMMY = (import.meta.env.VITE_USE_DUMMY as string | undefined) === 'true';

// try parse canvas-provided config first
let parsedGlobalConfig: any | null = null;
if (typeof __firebase_config !== 'undefined' && __firebase_config) {
  try {
    parsedGlobalConfig = JSON.parse(__firebase_config);
  } catch (e) {
    console.warn('Could not parse __firebase_config from canvas:', e);
  }
}

// Build firebaseConfig from multiple fallbacks
const firebaseConfigFromEnv = ((): any | null => {
  // Option 1: a single JSON env var (Vite)
  const cfg = import.meta.env.VITE_FIREBASE_CONFIG as string | undefined;
  if (cfg) {
    try {
      return JSON.parse(cfg);
    } catch (e) {
      console.warn('VITE_FIREBASE_CONFIG is present but not valid JSON.');
    }
  }

  // Option 2: individual VITE_FIREBASE_* vars
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined;
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined;
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID as string | undefined;

  if (apiKey && projectId) {
    return {
      apiKey,
      projectId,
      authDomain,
      storageBucket,
      messagingSenderId,
      appId
    };
  }

  return null;
})();

const firebaseConfig = parsedGlobalConfig ?? firebaseConfigFromEnv ?? null;
const isDummyMode = VITE_USE_DUMMY || firebaseConfig === null;

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

export const USER_CHARTS_COLLECTION = 'user_charts';

/**
 * Initialize Firebase (idempotent).
 * Returns: { db, auth, userId, isDummyMode }
 */
export const initializeFirebase = async (): Promise<{ db: Firestore | null, auth: Auth | null, userId: string, isDummyMode: boolean }> => {
  if (isDummyMode) {
    console.warn('Firebase running in DUMMY mode. Persistence disabled. Provide VITE_FIREBASE_CONFIG or set VITE_USE_DUMMY=false in .env to enable.');
    return {
      db: null,
      auth: null,
      userId: 'DUMMY_USER_' + Math.random().toString(36).slice(2, 9),
      isDummyMode: true
    };
  }

  if (!app) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  }

  // sign in (custom token preferred, fallback to anonymous)
  try {
    const initialToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : (import.meta.env.VITE_INITIAL_AUTH_TOKEN as string | undefined);
    if (initialToken) {
      await signInWithCustomToken(auth!, initialToken);
    } else {
      await signInAnonymously(auth!);
    }
  } catch (err) {
    console.error('Firebase auth failed:', err);
  }

  // wait for onAuthStateChanged to resolve and give uid
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth!, (user) => {
      unsubscribe();
      const uid = user?.uid ?? ('UID_FALLBACK_' + Math.random().toString(36).slice(2, 8));
      resolve({ db, auth, userId: uid, isDummyMode: false });
    });
  });
};

/**
 * Save/overwrite chart data for an email.
 * Stores JSON directly in doc field 'data' (not stringified).
 * Returns true on success, false on failure or dummy mode.
 */
export const saveCustomChartData = async (email: string, chartData: any): Promise<boolean> => {
  if (isDummyMode) {
    console.warn('Attempt to save in dummy mode — ignored.');
    return false;
  }
  if (!db) {
    console.error('Firestore not initialized (db null).');
    return false;
  }

  try {
    // use collection user_charts, doc id = email (safe if you URL encode; here we use base64 to be safe)
    const docId = encodeURIComponent(email);
    const ref = doc(db, USER_CHARTS_COLLECTION, docId);
    await setDoc(ref, {
      email,
      data: chartData,
      updated_at: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('saveCustomChartData failed:', err);
    return false;
  }
};

/**
 * Fetch saved chart data by email (returns data or null)
 */
export const getCustomChartData = async (email: string): Promise<any | null> => {
  if (isDummyMode) {
    console.warn('Attempt to fetch in dummy mode — returning null.');
    return null;
  }
  if (!db) {
    console.error('Firestore not initialized (db null).');
    return null;
  }

  try {
    const docId = encodeURIComponent(email);
    const ref = doc(db, USER_CHARTS_COLLECTION, docId);
    const snap: DocumentSnapshot = await getDoc(ref);
    if (!snap.exists()) return null;
    const payload = snap.data();
    return payload?.data ?? null;
  } catch (err) {
    console.error('getCustomChartData failed:', err);
    return null;
  }
};

/**
 * Real-time listener (optional)
 */
export const listenForCustomChartData = (email: string, callback: (data: any | null) => void): Unsubscribe => {
  if (isDummyMode) {
    console.warn('listenForCustomChartData in dummy mode — no-op unsubscribe returned.');
    return () => {};
  }
  if (!db) {
    console.error('Firestore not initialized (db null).');
    return () => {};
  }

  const docId = encodeURIComponent(email);
  const ref = doc(db, USER_CHARTS_COLLECTION, docId);
  const unsubscribe = onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    const payload = snap.data();
    callback(payload?.data ?? null);
  }, (err) => {
    console.error('listenForCustomChartData snapshot error:', err);
    callback(null);
  });

  return unsubscribe;
};
