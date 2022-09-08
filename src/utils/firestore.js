import { toast } from 'react-toastify';
import { db } from './firebase-config';

export async function saveDocumentGenerateID(collection, data) {
    const docSnap = await db.collection(collection).add(data)
        .then(() => {
            toast.success("Saved Successfully")
            return true
        })
        .catch((error) => {
            toast.error('Error saving document: ', error);
            console.error('Error saving document: ', error);
            return false
        });
    return docSnap
}