
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import 'firebase/compat/functions';

const firebaseConfig = {
  apiKey: "AIzaSyAfAmediQHvqtb42H_wvqc2iFTVtJnlnR4",
  authDomain: "studio-7638670629-b2831.firebaseapp.com",
  databaseURL: "https://studio-7638670629-b2831-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "studio-7638670629-b2831",
  storageBucket: "studio-7638670629-b2831.firebasestorage.app",
  messagingSenderId: "846565674927",
  appId: "1:846565674927:web:3e5307bd919c5ade69295a",
  measurementId: "G-2P869HPRJZ"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();
export const functions = firebase.functions();
export const googleProvider = new firebase.auth.GoogleAuthProvider();

export default firebase;
