require('dotenv').config();
import fetch from "node-fetch"

export default async function handler(req, res) {
    const year = new Date().getFullYear()
    const url = 'https://skyline.github.com/' + process.env.GITHUB_USERNAME + '/' + year + '.json'
    const headers = {
        "Content-Type": "application/json",
    }
    try {
        const result = await fetch(url, {
            method: "GET",
            headers: headers,
        }).then(res => {
            return res.json()
        })
        res.json(result)
    } catch (error) {
        res.status(500).send(error)
    }
}