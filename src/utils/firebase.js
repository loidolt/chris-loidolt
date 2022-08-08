import { toast } from 'react-toastify';
import { firebaseAuth } from './firebase-config';
import { saveUser } from './firestore';
import { updatePassword } from "firebase/auth"

export function auth(email, password, firstName, lastName) {
    return firebaseAuth.createUserWithEmailAndPassword(email, password)
        .then((response) => {
            toast.success("Account Created")
            saveUser(response.user.auth.currentUser, firstName, lastName)
            return response
        })
        .catch((error) => {
            console.log(error)
            toast.error(error.message)
            return false
        });
}

export function logout() {
    return firebaseAuth.signOut();
}

export function login(email, pw) {
    return firebaseAuth.signInWithEmailAndPassword(email, pw)
        .then(async (response) => {
            toast.success("Login Success")
            return response
        })
        .catch((error) => {
            console.log(error)
            toast.error(error.message)
            return false
        });;
}

export function getToken() {
    return firebaseAuth.currentUser.getIdToken()
        .then(async (response) => response)
        .catch((error) => {
            console.log(error)
            toast.error(error.message)
            return false
        });;
}

export function resetPassword(email) {
    return firebaseAuth.sendPasswordResetEmail(email)
        .then((response) => {
            toast.success("Sent successfully, please check your email")
            return response
        })
        .catch((error) => {
            console.log(error)
            toast.error(error.message)
            return false
        });;
}

export function changePassword(newPassword) {

    const user = firebaseAuth.currentUser;

    return updatePassword(user, newPassword)
        .then(() => {
            toast.success("Password Changed Successfully")
            return true
        })
        .catch((error) => {
            console.log(error)
            toast.error(error.message)
            return false
        });;
}