// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDd7B1b7wRtqAl9NqyS3S7z26IPgfv-23g",
  authDomain: "aut-cabc5.firebaseapp.com",
  databaseURL: "https://aut-cabc5-default-rtdb.firebaseio.com",
  projectId: "aut-cabc5",
  storageBucket: "aut-cabc5.appspot.com",
  messagingSenderId: "684288096454",
  appId: "1:684288096454:web:700cf574e7d0cd540cffc7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth( app );
export { app, auth };