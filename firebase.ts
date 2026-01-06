
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Production configuration for AuditPro SEO
const firebaseConfig = {
  apiKey: "AIzaSyBzyCTV9IO2SiaqwB1fA4EhxvGsqg8l1bI",
  authDomain: "auditpro-seo.firebaseapp.com",
  projectId: "auditpro-seo",
  storageBucket: "auditpro-seo.firebasestorage.app",
  messagingSenderId: "1036590134654",
  appId: "1:1036590134654:web:efcb18f5d09ccaec282f2f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut 
};
