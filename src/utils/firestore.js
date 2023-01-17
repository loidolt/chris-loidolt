import { addDoc, collection, getFirestore } from 'firebase/firestore';
import { toast } from 'react-toastify';

import app from './firebase-config';

const db = () => {
  const firebaseApp = app();
  if (!firebaseApp) return null;
  return getFirestore(firebaseApp);
};

export async function saveDocumentGenerateID(col, data) {
  if (!db()) return null;
  try {
    const docRef = await addDoc(collection(db(), col), data);
    toast.success('Saved Successfully');
    return docRef.id;
  } catch (e) {
    toast.error(e.message);
    return null;
  }
}
