import { useState, useEffect } from 'react';

interface VolumeData {
  date: string;
  volume: number;
  trades: number;
}

export function useOrdinalsVolumeChart() {
  const [data, setData] = useState<{ data: VolumeData[]; loading: boolean }>({
    data: [],
    loading: true
  });

  useEffect(() => {
    const generateData = () => {
      const volumeData: VolumeData[] = [];
      const today = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        volumeData.push({
          date: date.toISOString().split('T')[0],
          volume: 10 + Math.random() * 40,
          trades: Math.floor(100 + Math.random() * 400)
        });
      }

      setData({ data: volumeData, loading: false });
    };

    generateData();
  }, []);

  return data;
}