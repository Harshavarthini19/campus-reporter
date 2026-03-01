import { db } from "./firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, doc, setDoc, getDoc } from "firebase/firestore";

/**
 * Saves a new report to Firestore
 * This mirrors the logic from your script: db.collection("reports").add({ ... })
 */
export const saveReportToFirestore = async (reportData: any) => {
    try {
        const docRef = await addDoc(collection(db, "reports"), {
            ...reportData,
            createdAt: serverTimestamp(), // Automatically add server-side timestamp
            status: "pending"            // Default status
        });
        console.log("Report saved with ID: ", docRef.id);
        return { success: true, id: docRef.id };
    } catch (error: any) {
        console.error("Error adding report: ", error);
        return { success: false, error: error.message };
    }
};

/**
 * Fetches all reports for a specific user from Firestore
 */
export const getReportsByUserId = async (userId: string) => {
    try {
        const q = query(
            collection(db, "reports"),
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Convert Firestore Timestamp to ISO string if it exists
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            };
        });
    } catch (error) {
        console.error("Error fetching user reports: ", error);
        return [];
    }
};

/**
 * Fetches all reports from Firestore (for Admin)
 */
export const getAllReports = async () => {
    try {
        const q = query(
            collection(db, "reports"),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Convert Firestore Timestamp to ISO string if it exists
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            };
        });
    } catch (error) {
        console.error("Error fetching all reports: ", error);
        return [];
    }
};

/**
 * Creates or updates a user profile in Firestore
 */
export const createUserProfile = async (uid: string, profileData: any) => {
    try {
        await setDoc(doc(db, "users", uid), {
            ...profileData,
            uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        }, { merge: true });
        return { success: true };
    } catch (error: any) {
        console.error("Error creating user profile: ", error);
        return { success: false, error: error.message };
    }
};

/**
 * Fetches a user profile from Firestore
 */
export const getUserProfile = async (uid: string) => {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            return { success: true, data: userDoc.data() };
        } else {
            return { success: false, error: "User profile not found" };
        }
    } catch (error: any) {
        console.error("Error fetching user profile: ", error);
        return { success: false, error: error.message };
    }
};
