import axios from 'axios';
import { getToken } from './firebase'

export const firebaseAxios = axios.create({
    baseURL: process.env.REACT_APP_FIREBASE_FUNCTIONS_URL,
});

firebaseAxios.interceptors.request.use( async config => {
    const accessToken = await getToken();

    //checking if accessToken exists
    if (accessToken) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return config;
});