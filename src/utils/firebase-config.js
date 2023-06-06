import { getAnalytics, logEvent } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { getPerformance } from 'firebase/performance';

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
  if (typeof window == 'undefined') return null;

  if (app) return app;
  // Use this to initialize the firebase App
  app = initializeApp(firebaseConfig);
  //console.log(app);
  return app;
}

export function analytics() {
  if (!app) return null;
  return getAnalytics(app);
}

export function logAnalyticsEvent(name, event) {
  if (!app) return null;
  return logEvent(analytics(), name, event);
}

export function perf() {
  if (!app) return null;
  return getPerformance(app);
}
