import React from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  createdAt?: string;
  expiresAt?: number;
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ createdAt, className = '' }) => {
  // Format relative time since upload (e.g. "Today", "Yesterday", or "Active")
  const getRelativeText = () => {
    if (!createdAt) return 'Active Appeal / امداد کا منتظر';
    try {
      const created = new Date(createdAt).getTime();
      const diffMs = Date.now() - created;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffHours < 1) return 'Just Uploaded / ابھی اپلوڈ ہوا';
      if (diffHours < 24) return `${diffHours}h ago / فعال بل`;
      if (diffDays === 1) return 'Yesterday / کل کا بل';
      return `${diffDays} days ago / زیر التواء`;
    } catch {
      return 'Active / فعال';
    }
  };

  return (
    <div
      className={`clay-timer-badge px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 text-xs font-bold tracking-tight shadow-xs ${className}`}
      title="Awaiting Settlement / ادائیگی کا منتظر"
    >
      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
      <Clock size={12} className="text-[#059669] shrink-0" />
      <span className="text-emerald-950 text-xs font-bold">
        {getRelativeText()}
      </span>
      <span className="text-[10px] text-emerald-800 font-semibold font-urdu">
        مدد کا منتظر
      </span>
    </div>
  );
};
