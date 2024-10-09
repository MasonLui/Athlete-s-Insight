// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAUAj3kJICofYNBplxbh_Umt6RS2rY_6PQ",
  authDomain: "athletes-insight.firebaseapp.com",
  projectId: "athletes-insight",
  storageBucket: "athletes-insight.appspot.com",
  messagingSenderId: "421166724984",
  appId: "1:421166724984:web:e45871f4efb9a555427a8d",
  measurementId: "G-6PE2MMTJL6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
