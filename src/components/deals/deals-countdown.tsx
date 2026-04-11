'use client';

import { useState, useEffect } from 'react';

export function DealsCountdown() {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!timeLeft) return null;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-[#565959]">Ends in</span>
      <div className="flex items-center gap-1 font-mono">
        {timeLeft.split(':').map((segment, i) => (
          <span key={i} className="flex items-center">
            <span className="bg-[#0F1111] text-white px-1.5 py-0.5 rounded text-sm font-bold min-w-[28px] text-center">
              {segment}
            </span>
            {i < 2 && <span className="text-[#0F1111] font-bold mx-0.5">:</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
