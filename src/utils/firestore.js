import { toast } from 'react-toastify';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from './firebase-config';

export function saveUser(user, firstName, lastName) {
    return db
        .collection(`users`)
        .add({
            email: user.email,
            displayName: `${firstName} ${lastName}`,
            uid: user.uid
        })
        .then(docRef => docRef)
        .catch((error) => {
            toast.error('Error saving user info: ', error);
            console.error('Error saving user info: ', error);
        });
}

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

export async function saveDocument(collection, id, data) {
    const existingDoc = await getDocument(collection, id)
    if (existingDoc) {
        toast.error("ID already exists. Please use a different ID")
        return false
    }
    const docSnap = await setDoc(doc(db, collection, id), data)
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

export async function getDocument(collection, id) {
    const docSnap = await getDoc(doc(db, collection, id));

    if (docSnap.exists()) {
        /* console.log("Document data:", docSnap.data()); */
        return docSnap.data()
    }
    return null
}

export async function findInCollection(collection, field, value) {
    const response = await db.collection(collection).where(field, "==", value)
        .get()
        .then((querySnapshot) => {
            let documents = []
            querySnapshot.forEach(function (doc) {
                // doc.data() is never undefined for query doc snapshots
                documents.push(doc.data());
            });
            return documents
        })
        .catch((error) => {
            toast.error('Error locating document: ', error);
            console.error('Error locating document: ', error);
            return false
        });
    return response
}

export async function updateDocument(collection, id, data) {
    const existingDoc = await getDocument(collection, id)
    if (!existingDoc) {
        toast.error("Document Not Found")
        return false
    }
    const docSnap = await updateDoc(doc(db, collection, id), data)
        .then(() => {
            toast.success("Saved Successfully")
            return true
        })
        .catch((error) => {
            toast.error('Error updating document: ', error);
            console.error('Error updating document: ', error);
            return false
        });
    return docSnap
}

export async function getReference(reference) {
    const files = await reference.get()
    if (files) {
        /* console.log("Reference data:", files.data()); */
        return files.data()
    }
    return null
}

export async function getCollection(collection) {
    const collectionRef = db.collection(collection);
    const snapshot = await collectionRef.get();
    return snapshot
}

export async function deleteDocument(collection, id) {
    await deleteDoc(doc(db, collection, id))
        .then((data) => {
            toast.success("Deleted Successfully")
            return data
        })
        .catch((error) => {
            toast.error('Error deleting document: ', error);
            console.error('Error deleting document: ', error);
            return false
        });
}