import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/storage';
import 'firebase/compat/firestore';
import { getPerformance } from "firebase/performance";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
    apiKey: process.env.GATSBY_FIREBASE_API_KEY,
    authDomain: process.env.GATSBY_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.GATSBY_FIREBASE_PROJECT_ID,
    storageBucket: process.env.GATSBY_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.GATSBY_FIREBASE_MESSAGING_SENDERID,
    appId: process.env.GATSBY_FIREBASE_APP_ID,
    measurementId: process.env.GATSBY_FIREBASE_MEASUREMENT_ID
};

// Use this to initialize the firebase App
const firebaseApp = firebase.initializeApp(firebaseConfig);

// Pass your reCAPTCHA v3 site key (public key) to activate(). Make sure this
// key is the counterpart to the secret key you set in the Firebase console.
/* const appCheck = initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaV3Provider('6LdC3IEUAAAAAHS58e9WsbROAwOVC2MFHokPkMfX'),
    isTokenAutoRefreshEnabled: true
}); */

// Use these for db & auth
const db = firebaseApp.firestore();
const firebaseAuth = firebase.auth();
const storage = firebase.storage();
const perf = getPerformance(firebaseApp);

export { firebaseAuth, db, storage, perf/* , appCheck */ };