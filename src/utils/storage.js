import { toast } from 'react-toastify';
import { storage } from './firebase-config';

export function uploadFile(path, file) {
    return storage
        .ref(`${path}${file.name}`)
        .put(file)
        .then((response) => {
            toast.success("File Uploaded")
            return response
        })
        .catch((error) => {
            toast.error('Error uploading file: ', error);
            console.error('Error uploading file: ', error);
            return false
        });

}

export function getPublicURL(fileRef) {
    return storage
        .ref(fileRef).getDownloadURL()
        .then((url) => url)
        .catch((error) => {
            toast.error('Error getting file URL: ', error);
            console.error('Error getting file URL: ', error);
            return false
        });

}