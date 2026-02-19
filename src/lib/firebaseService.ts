import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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
