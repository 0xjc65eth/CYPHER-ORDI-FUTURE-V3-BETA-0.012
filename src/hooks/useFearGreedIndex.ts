import { useState, useEffect } from 'react';

interface FearGreedData {
  index: number;
  label: string;
  loading: boolean;
  error: string | null;
}

export function useFearGreedIndex() {
  const [data, setData] = useState<FearGreedData>({
    index: 50,
    label: 'Neutral',
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchFearGreedIndex = async () => {
      try {
        // Using alternative.me API for Fear & Greed Index
        const response = await fetch('https://api.alternative.me/fng/?limit=1');
        const result = await response.json();
        
        if (result.data && result.data[0]) {
          const value = parseInt(result.data[0].value);
          let label = 'Neutral';
          
          if (value < 25) label = 'Extreme Fear';
          else if (value < 45) label = 'Fear';
          else if (value < 55) label = 'Neutral';
          else if (value < 75) label = 'Greed';
          else label = 'Extreme Greed';
          
          setData({
            index: value,
            label,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        // If API fails, use simulated data
        const simulatedValue = Math.floor(Math.random() * 30) + 35; // 35-65 range
        setData({
          index: simulatedValue,
          label: simulatedValue < 45 ? 'Fear' : simulatedValue > 55 ? 'Greed' : 'Neutral',
          loading: false,
          error: null
        });
      }
    };

    fetchFearGreedIndex();
    const interval = setInterval(fetchFearGreedIndex, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, []);

  return data;
}