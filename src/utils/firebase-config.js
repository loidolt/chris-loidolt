import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getPerformance } from "firebase/performance";

const firebaseConfig = {
    apiKey: process.env.GATSBY_FIREBASE_API_KEY,
    authDomain: process.env.GATSBY_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.GATSBY_FIREBASE_PROJECT_ID,
    storageBucket: process.env.GATSBY_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.GATSBY_FIREBASE_MESSAGING_SENDERID,
    appId: process.env.GATSBY_FIREBASE_APP_ID,
    measurementId: process.env.GATSBY_FIREBASE_MEASUREMENT_ID
};

let app;

// Gatsby specific version for SSR
export default function getFirebase() {
    if (typeof window !== 'undefined') {
        if (app) return app;
        // Use this to initialize the firebase App
        app = initializeApp(firebaseConfig);
        return app;
    }
    return null;
}

export function db() {
    if (app) {
        const db = getAuth(app);
        return db;
    }
}

export function firebaseAuth() {
    if (app) {
        const firebaseAuth = getStorage(app);
        return firebaseAuth;
    }
}

export function storage() {
    if (app) {
        const storage = getFirestore(app);
        return storage;
    }
}

export function analytics() {
    if (app) {
        const analytics = getAnalytics(app);
        return analytics;
    }
}

export function perf() {
    if (app) {
        const perf = getPerformance(app);
        return perf;
    }
}