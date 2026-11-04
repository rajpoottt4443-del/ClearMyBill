import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  createdAt?: string;
  expiresAt?: number;
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ createdAt, expiresAt, className = '' }) => {
  const targetTime = expiresAt || (createdAt ? new Date(createdAt).getTime() + 48 * 60 * 60 * 1000 : Date.now() + 48 * 60 * 60 * 1000);

  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({
    hours: 48,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({ hours, minutes, seconds, isExpired: false });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div
      className={`clay-timer-badge px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 text-xs font-bold tracking-tight shadow-xs ${className}`}
      title="48-Hour Target for Direct Settlement / 48 گھنٹے میں ادائیگی کا ہدف"
    >
      <Clock size={13} className="text-[#059669] shrink-0 timer-indicator" />
      <span className="font-mono text-emerald-950 text-xs font-black tabular-nums">
        {timeLeft.isExpired ? (
          <span className="text-rose-600">Urgent Extended / وقت بڑھ گیا</span>
        ) : (
          `${pad(timeLeft.hours)}:${pad(timeLeft.minutes)}:${pad(timeLeft.seconds)}`
        )}
      </span>
      <span className="text-[10px] text-emerald-800 font-semibold font-urdu">
        باقی وقت
      </span>
    </div>
  );
};
