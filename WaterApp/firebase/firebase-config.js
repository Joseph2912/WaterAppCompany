import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import {
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const app = initializeApp({
  apiKey: "AIzaSyDd7B1b7wRtqAl9NqyS3S7z26IPgfv-23g",
  authDomain: "aut-cabc5.firebaseapp.com",
  databaseURL: "https://aut-cabc5-default-rtdb.firebaseio.com",
  projectId: "aut-cabc5",
  storageBucket: "aut-cabc5.appspot.com",
  messagingSenderId: "684288096454",
  appId: "1:684288096454:web:700cf574e7d0cd540cffc7"
});

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

export {db };