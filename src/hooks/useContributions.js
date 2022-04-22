import { useState, useEffect, useCallback } from 'react';
import axios from 'axios'

export function useContributions() {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchContributions = useCallback(async () => {
        setIsLoading(true);

        try {
            const { data } = await axios({
                method: "GET",
                url: "/api/skyline-fetch",
                headers: { accept: "Accept: application/json" },
            })
            setData(data.contributions)
        } catch (err) {
            console.log("useContributions: " + err);
            setIsLoading(false);
            setError(err)
        }

        setIsLoading(false)
    }, [setIsLoading, setData, setError])

    useEffect(() => {
        fetchContributions()
    }, [fetchContributions])

    return {
        data,
        isLoading,
        error,
    }
}