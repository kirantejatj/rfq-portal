import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

export default function CountdownTimer({ toDate, fromDate }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [notStarted, setNotStarted] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const start = new Date(fromDate).getTime();
      const end = new Date(toDate).getTime();

      if (now < start) {
        setNotStarted(true);
        setIsExpired(false);
        const diff = start - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setTimeLeft(`Opens in ${days}d ${hours}h`);
        return;
      }

      setNotStarted(false);
      const diff = end - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft('Quotation Window Closed');
      } else {
        setIsExpired(false);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [toDate, fromDate]);

  if (isExpired) {
    return (
      <div className="inline-flex items-center px-2.5 py-1 rounded bg-red-50 text-red-700 text-xs font-medium border border-red-200">
        <AlertCircle className="w-3.5 h-3.5 mr-1" />
        <span>Window Closed</span>
      </div>
    );
  }

  if (notStarted) {
    return (
      <div className="inline-flex items-center px-2.5 py-1 rounded bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
        <Clock className="w-3.5 h-3.5 mr-1" />
        <span>{timeLeft}</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200 animate-pulse">
      <Clock className="w-3.5 h-3.5 mr-1 text-emerald-600" />
      <span>Closes in: <strong>{timeLeft}</strong></span>
    </div>
  );
}
