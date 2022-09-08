import { toast } from 'react-toastify';
import app from './firebase-config';
import { getFirestore, collection, addDoc } from "firebase/firestore";

const db = () => {
    const firebaseApp = app();
    if (!firebaseApp) return null;
    return getFirestore(firebaseApp);
}

export async function saveDocumentGenerateID(col, data) {
    if (!db()) return null;
    try {
        const docRef = await addDoc(collection(db(), col), data);
        toast.success("Saved Successfully")
        return docRef.id;
    } catch (e) {
        toast.error(e.message);
        return null;
    }
}