import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import firestoreDatabase from "../FirebaseConfig";

// ✅ Doda novega barberja
export const AddBarber = async (payload) => {
  try {
    // ob dodajanju barberja nastavi začetni status na "pending"
    const updatedPayload = {
      ...payload,
      status: "pending",
    };

    await setDoc(
      doc(firestoreDatabase, "barbers", payload.userId),
      updatedPayload
    );

    await updateDoc(doc(firestoreDatabase, "users", payload.userId), {
      role: "barber",
    });

    return {
      success: true,
      message: "Barber added successfully. Please wait for admin approval.",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

// ✅ Preveri, ali je uporabnik že poslal prošnjo za barber račun
export const CheckIfBarberAccountIsApplied = async (id) => {
  try {
    const barbers = await getDocs(
      query(collection(firestoreDatabase, "barbers"), where("userId", "==", id))
    );
    if (barbers.size > 0) {
      return {
        success: true,
        message: "Barber account already applied",
        data: barbers.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }))[0],
      };
    }
    return {
      success: false,
      message: "Barber account not applied",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

// ✅ Pridobi SAMO approved barberje (za uporabnike)
export const GetAllApprovedBarbers = async () => {
  try {
    const approvedQuery = query(
      collection(firestoreDatabase, "barbers"),
      where("status", "==", "approved")
    );

    const barbers = await getDocs(approvedQuery);

    return {
      success: true,
      data: barbers.docs.map((barber) => ({
        ...barber.data(),
        id: barber.id,
      })),
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

// ✅ Pridobi VSE barberje (za admin ploščo)
export const GetAllBarbers = async () => {
  try {
    const barbers = await getDocs(collection(firestoreDatabase, "barbers"));
    return {
      success: true,
      data: barbers.docs.map((barber) => ({
        ...barber.data(),
        id: barber.id,
      })),
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

// ✅ Posodobi barberja (npr. admin approval/reject)
export const UpdateBarber = async (payload) => {
  try {
    await setDoc(doc(firestoreDatabase, "barbers", payload.id), payload);
    return {
      success: true,
      message: "Barber updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

// ✅ Pridobi barberja po ID-ju
export const GetBarberById = async (id) => {
  try {
    const barber = await getDoc(doc(firestoreDatabase, "barbers", id));
    return {
      success: true,
      data: barber.data(),
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};
