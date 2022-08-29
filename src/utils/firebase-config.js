import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/storage';
import 'firebase/compat/firestore';
import "firebase/compat/performance";
import "firebase/compat/analytics";

const firebaseConfig = {
    apiKey: process.env.GATSBY_FIREBASE_API_KEY,
    authDomain: process.env.GATSBY_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.GATSBY_FIREBASE_PROJECT_ID,
    storageBucket: process.env.GATSBY_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.GATSBY_FIREBASE_MESSAGING_SENDERID,
    appId: process.env.GATSBY_FIREBASE_APP_ID,
    measurementId: process.env.GATSBY_FIREBASE_MEASUREMENT_ID
};

let firebaseApp;

// Gatsby specific version for SSR
export default function getFirebase() {
    if (typeof window == 'undefined') return null;

    if (firebaseApp) return firebaseApp;
    // Use this to initialize the firebase App
    firebaseApp = firebase.initializeApp(firebaseConfig);
    return firebaseApp;
}

export function db() {
    if (!firebaseApp) return null;
    return firebase.firestore();
}

export function firebaseAuth() {
    if (!firebaseApp) return null;
    return firebase.auth();
}

export function storage() {
    if (!firebaseApp) return null;
    return firebase.storage();
}

export function analytics() {
    if (!firebaseApp) return null;
    return firebase.analytics();
}

export function perf() {
    if (!firebaseApp) return null;
    return firebase.performance();
}