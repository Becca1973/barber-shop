import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCJO29z_qepJ-PD3p9vkwXn7i0wWOFgET4",
  authDomain: "barbershop-663dc.firebaseapp.com",
  projectId: "barbershop-663dc",
  storageBucket: "barbershop-663dc.firebasestorage.app",
  messagingSenderId: "924900801379",
  appId: "1:924900801379:web:d6af8342da33979c513156",
  measurementId: "G-JPR1X7E01M",
};

const app = initializeApp(firebaseConfig);

const firestoreDatabase = getFirestore(app);

export default firestoreDatabase;
