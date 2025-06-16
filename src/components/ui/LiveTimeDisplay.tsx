'use client';

import { useState, useEffect } from 'react';

export function LiveTimeDisplay() {
  const [time, setTime] = useState<string>('--:--:--');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString());
    };
    
    // Update immediately when mounted
    updateTime();
    
    // Update every second
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Always return the same value during SSR and initial render
  if (!mounted) {
    return <span className="text-xs text-gray-400 font-mono">--:--:--</span>;
  }

  return <span className="text-xs text-gray-400 font-mono">{time}</span>;
}