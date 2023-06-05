import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

export default function useContributions() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchContributions = useCallback(async () => {
    setIsLoading(true);

    const sessionContributions = sessionStorage.getItem('contributions');
    if (sessionContributions) {
      setData(JSON.parse(sessionContributions));
      setIsLoading(false);
      return;
    }

    const year = new Date().getFullYear();

    try {
      const { data } = await axios.post(
        process.env.GATSBY_FIREBASE_FUNCTIONS_URL + '/userContributions',
        {
          username: process.env.GATSBY_GITHUB_USERNAME,
          year: year
        }
      );
      if (data.contributions) {
        const contributionData = [];
        data.contributions.forEach((wk) => {
          let count = 0;
          wk.days.forEach((day) => {
            count += day.count;
          });

          if (count > 0) {
            contributionData.push({
              week: wk.week,
              contributions: count
            });
          }
        });
        sessionStorage.setItem('contributions', JSON.stringify(contributionData));
        setData(contributionData);
        setIsLoading(false);
      }
    } catch (err) {
      sessionStorage.removeItem('contributions');
      setError(err);
    }

    setIsLoading(false);
  }, [setIsLoading, setData, setError]);

  useEffect(() => {
    fetchContributions();
  }, [fetchContributions]);

  return {
    data,
    isLoading,
    error
  };
}
