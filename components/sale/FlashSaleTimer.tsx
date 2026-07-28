"use client";

import { useEffect, useState } from "react";

export default function FlashSaleTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: "00",
    minutes: "00",
    seconds: "00"
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      // Target is midnight of today (end of day)
      const target = new Date();
      target.setHours(24, 0, 0, 0);

      const difference = target.getTime() - now.getTime();
      if (difference <= 0) {
        return { hours: "00", minutes: "00", seconds: "00" };
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      return {
        hours: hours.toString().padStart(2, "0"),
        minutes: minutes.toString().padStart(2, "0"),
        seconds: seconds.toString().padStart(2, "0")
      };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 mt-4 sm:mt-0">
      <span className="text-xs uppercase font-bold tracking-wider text-rose-100">
        Kết thúc sau:
      </span>
      <div className="flex items-center gap-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/30 font-mono text-base font-bold text-white backdrop-blur-sm border border-white/10 shadow-inner">
          {timeLeft.hours}
        </div>
        <span className="font-bold text-white">:</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/30 font-mono text-base font-bold text-white backdrop-blur-sm border border-white/10 shadow-inner">
          {timeLeft.minutes}
        </div>
        <span className="font-bold text-white">:</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/30 font-mono text-base font-bold text-white backdrop-blur-sm border border-white/10 shadow-inner">
          {timeLeft.seconds}
        </div>
      </div>
    </div>
  );
}
