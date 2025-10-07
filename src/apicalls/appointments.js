import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import firestoreDatabase from "../FirebaseConfig";

export const BookBarberAppointment = async (payload) => {
  try {
    console.log(payload);
    await addDoc(collection(firestoreDatabase, "appointments"), payload);
    return { success: true, message: "Appointment booked successfully" };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const GetBarberAppointmentsOnDate = async (barberId, date) => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(firestoreDatabase, "appointments"),
        where("barberId", "==", barberId),
        where("date", "==", date)
      )
    );
    const data = [];
    querySnapshot.forEach((doc) => {
      data.push(doc.data());
    });
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const GetBarberAppointments = async (barberId) => {
  try {
    console.log(barberId);
    const querySnapshot = await getDocs(
      query(
        collection(firestoreDatabase, "appointments"),
        where("barberId", "==", barberId)
      )
    );
    const data = [];
    querySnapshot.forEach((doc) => {
      data.push({
        ...doc.data(),
        id: doc.id,
      });
    });
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const GetUserAppointments = async (userId) => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(firestoreDatabase, "appointments"),
        where("userId", "==", userId) // userId je string
      )
    );
    const data = [];
    querySnapshot.forEach((doc) => {
      data.push({
        ...doc.data(),
        id: doc.id,
      });
    });
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const UpdateAppointmentStatus = async (id, status) => {
  try {
    console.log(status);
    await updateDoc(doc(firestoreDatabase, "appointments", id), {
      status,
    });
    return {
      success: true,
      message: "Appointment status updated",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};
