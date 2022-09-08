import { toast } from 'react-toastify';
import { db } from './firebase-config';
import { collection, addDoc } from "firebase/firestore";

export async function saveDocumentGenerateID(col, data) {
    const docRef = await addDoc(collection(db, col), data);
    if (docRef) {
        console.log("Document written with ID: ", docRef.id);
        toast.success("Saved Successfully")
        return docRef
    } else {
        toast.success("Error Saving")
        return null
    }
}