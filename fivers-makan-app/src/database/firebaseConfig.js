import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC63MK5LBwhRh_thgCtbduKDpscuBbSITo",
  authDomain: "fivers-14d26.firebaseapp.com",
  projectId: "fivers-14d26",
  storageBucket: "fivers-14d26.appspot.com",
  messagingSenderId: "604487933420",
  appId: "1:604487933420:web:63972e797c7ce06302b4c9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };