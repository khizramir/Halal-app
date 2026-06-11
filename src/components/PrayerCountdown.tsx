import React, { useState, useEffect } from 'react';

const PrayerCountdown: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<string>('--:--:--');
  const [nextPrayer, setNextPrayer] = useState<string>('...');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      let prayer = 'Isha';
      if (hours < 5) prayer = 'Fajr';
      else if (hours < 12) prayer = 'Dhuhr';
      else if (hours < 15) prayer = 'Asr';
      else if (hours < 18) prayer = 'Maghrib';
      setNextPrayer(prayer);
      const seconds = (3600 - (now.getMinutes() * 60 + now.getSeconds())) % 3600;
      const m = Math.floor(seconds / 60).toString().padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');
      setTimeLeft(`00:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-green-600 text-white rounded-xl p-4 flex flex-col items-center">
      <p className="text-sm opacity-80">Next Prayer</p>
      <p className="text-xl font-bold">{nextPrayer}</p>
      <p className="text-3xl font-mono font-semibold mt-1">{timeLeft}</p>
    </div>
  );
};

export default PrayerCountdown;
