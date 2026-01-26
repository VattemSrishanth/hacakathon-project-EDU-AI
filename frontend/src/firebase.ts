import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB0TOlcBCHqLew5EFgPxE2LjUM5TLgVclw",
  authDomain: "learnbridge-ai-15fc7.firebaseapp.com",
  projectId: "learnbridge-ai-15fc7",
  storageBucket: "learnbridge-ai-15fc7.firebasestorage.app",
  messagingSenderId: "175617620564",
  appId: "1:175617620564:web:66f794cc040c0601464bc1",
  measurementId: "G-76BRRHERSH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();