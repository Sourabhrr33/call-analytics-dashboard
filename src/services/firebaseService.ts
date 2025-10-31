import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    onSnapshot, 
    getDoc 
} from 'firebase/firestore';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore, Unsubscribe, DocumentSnapshot } from 'firebase/firestore'; 

// Global Variables from the Canvas Environment
declare const __app_id: string;
declare const __firebase_config: string;
declare const __initial_auth_token: string | undefined;

// --- DUMMY CONFIG CONSTANTS ---
const DUMMY_API_KEY = "DUMMY_API_KEY";
const DUMMY_FIREBASE_CONFIG = {
    apiKey: DUMMY_API_KEY,
    authDomain: "dummy-domain.firebaseapp.com",
    projectId: "dummy-project-id",
    storageBucket: "dummy-bucket.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdefghij"
};

const appId: string = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Check if the global config is present and valid, otherwise use the dummy config
const isGlobalConfigValid = (typeof __firebase_config !== 'undefined' && __firebase_config.length > 20);
const firebaseConfig: any = isGlobalConfigValid ? JSON.parse(__firebase_config) : DUMMY_FIREBASE_CONFIG;
const isDummyMode = firebaseConfig.apiKey === DUMMY_API_KEY; 
const initialAuthToken: string | undefined = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : undefined;

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

export const CUSTOM_CHART_COLLECTION = 'custom_chart_data';

/**
 * Initializes Firebase, authenticates the user, and sets up Firestore.
 */
export const initializeFirebase = async (): Promise<{ db: Firestore, auth: Auth, userId: string }> => {
    if (isDummyMode) {
        console.warn("Running in DUMMY Firebase mode. Data persistence is disabled.");
        // Return a mocked object to satisfy the App component's expectations
        return { 
            db: {} as Firestore, 
            auth: {} as Auth, 
            userId: 'DUMMY_USER_ID_' + Math.random().toString(36).substring(2, 8) 
        };
    }


    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    try {
        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
        } else {
            await signInAnonymously(auth);
        }
    } catch (error) {
        console.error("Firebase sign-in failed during initialization:", error);
    }
    
    return new Promise((resolve) => {
        // Wait for the auth state to settle
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe(); // Stop listening once we have the user
            const userId = user?.uid ?? 'AUTH_FALLBACK_USER';
            resolve({ db, auth, userId });
        });
    });
};

/**
 * Saves or overwrites custom chart data for a user identified by email.
 * This function will now be protected by the isDummyMode check.
 */
export const saveCustomChartData = async (userId: string, email: string, chartData: any[]) => {
    if (isDummyMode) {
        console.warn("Attempted to save data in DUMMY mode. Operation ignored.");
        return;
    }
    if (!db) throw new Error("Firestore not initialized.");
    
    const dataRef = doc(db, 'artifacts', appId, 'users', userId, CUSTOM_CHART_COLLECTION, email);

    await setDoc(dataRef, {
        email: email,
        chart_name: 'Call Duration Analysis',
        chart_values: JSON.stringify(chartData), 
        updated_at: new Date().toISOString()
    });
};

/**
 * Synchronously fetches custom chart data for a one-time check.
 * This function will now be protected by the isDummyMode check.
 */
export const getCustomChartData = async (userId: string, email: string): Promise<any[] | null> => {
    if (isDummyMode) {
        console.warn("Attempted to fetch data in DUMMY mode. Returning null.");
        return null;
    }
    if (!db) throw new Error("Firestore not initialized.");
    
    const dataRef = doc(db, 'artifacts', appId, 'users', userId, CUSTOM_CHART_COLLECTION, email);
    
    try {
        const docSnapshot: DocumentSnapshot = await getDoc(dataRef);
        
        if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            return JSON.parse(data.chart_values);
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching document synchronously:", error);
        return null;
    }
};

/**
 * Sets up a real-time listener for custom chart data.
 */
export const listenForCustomChartData = (userId: string, email: string, callback: (data: any[] | null) => void): Unsubscribe => {
    if (isDummyMode) {
        console.warn("Attempted to set up listener in DUMMY mode. Operation ignored.");
        return () => {}; // Return a no-op unsubscribe function
    }
    if (!db) throw new Error("Firestore not initialized.");

    const dataRef = doc(db, 'artifacts', appId, 'users', userId, CUSTOM_CHART_COLLECTION, email);

    const unsubscribe = onSnapshot(dataRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            try {
                callback(JSON.parse(data.chart_values));
            } catch (e) {
                console.error("Error parsing stored JSON data:", e);
                callback(null);
            }
        } else {
            callback(null);
        }
    }, (error) => {
        console.error("Firestore onSnapshot error:", error);
        callback(null);
    });

    return unsubscribe;
};
