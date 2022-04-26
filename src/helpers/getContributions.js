import axios from 'axios'

export default async function getContributions() {

    return new Promise((resolve, reject) => {
        axios({
            method: "GET",
            url: "/api/skyline-fetch",
            headers: { accept: "Accept: application/json" },
        })
            .then((r) => {
                /* console.log("HomeInfo: " + JSON.stringify(r.data)); */
                resolve(r.data.contributions);
            })
            .catch((r) => {
                console.log("getContributions: " + r);
                reject(null);
            });
    });
};