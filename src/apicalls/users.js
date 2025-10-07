import firestoreDatabase from "../FirebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import CryptoJS from "crypto-js";

// Ustvari novega uporabnika in dodaj id v dokument
export const CreateUser = async (payload) => {
  try {
    // Preveri, če uporabnik že obstaja
    const qry = query(
      collection(firestoreDatabase, "users"),
      where("email", "==", payload.email)
    );
    const querySnapshot = await getDocs(qry);
    if (querySnapshot.size > 0) {
      throw new Error("User already exists");
    }

    // Šifriraj geslo
    const hashedPassword = CryptoJS.AES.encrypt(
      payload.password,
      "barber-shop"
    ).toString();
    payload.password = hashedPassword;

    // Dodaj dokument
    const docRef = await addDoc(
      collection(firestoreDatabase, "users"),
      payload
    );

    // Posodobi dokument z id
    await updateDoc(doc(firestoreDatabase, "users", docRef.id), {
      id: docRef.id,
    });

    return {
      success: true,
      message: "User created successfully",
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Prijava uporabnika
export const LoginUser = async (payload) => {
  try {
    const qry = query(
      collection(firestoreDatabase, "users"),
      where("email", "==", payload.email)
    );
    const userSnapshots = await getDocs(qry);

    if (userSnapshots.size === 0) {
      throw new Error("User does not exist");
    }

    const userDoc = userSnapshots.docs[0];
    const user = userDoc.data();
    user.id = userDoc.id;

    const bytes = CryptoJS.AES.decrypt(user.password, "barber-shop");
    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

    if (originalPassword !== payload.password) {
      throw new Error("Incorrect password");
    }

    return {
      success: true,
      message: "User logged in successfully",
      data: user,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Pridobi vse uporabnike
export const GetAllUsers = async () => {
  try {
    const usersSnapshot = await getDocs(collection(firestoreDatabase, "users"));
    const users = usersSnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    return { success: true, data: users };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Pridobi uporabnika po id
export const GetUserById = async (id) => {
  try {
    const userDoc = await getDoc(doc(firestoreDatabase, "users", id));
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }
    return { success: true, data: { ...userDoc.data(), id: userDoc.id } };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
