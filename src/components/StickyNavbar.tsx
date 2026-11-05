import React from 'react';
import { User, LogOut, FileText, PlusCircle, ShieldCheck } from 'lucide-react';
import { AppUser } from '../types/user';

interface StickyNavbarProps {
  user: AppUser | null;
  myBillsCount: number;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onLogout: () => void;
  onScrollToUpload: () => void;
  onScrollToBills: () => void;
  onViewMyBills: () => void;
}

export const StickyNavbar: React.FC<StickyNavbarProps> = ({
  user,
  myBillsCount,
  onOpenAuth,
  onLogout,
  onScrollToUpload,
  onScrollToBills,
  onViewMyBills,
}) => {
  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#F8FAF9]/85 border-b border-emerald-200/50 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 group cursor-pointer text-left"
          >
            <div className="w-9 h-9 rounded-xl clay-mint-icon flex items-center justify-center font-black text-emerald-950 text-base shadow-xs">
              ⚡
            </div>
            <div>
              <span className="font-black text-xl sm:text-2xl text-black tracking-tight leading-none block">
                ClearMyBill
              </span>
              <span className="text-[10px] text-emerald-900 font-urdu font-bold leading-none block mt-0.5">
                بل ریلیف پلیٹ فارم
              </span>
            </div>
          </button>
        </div>

        {/* Center / Navigation Links */}
        <div className="hidden md:flex items-center gap-2 text-xs font-bold">
          <button
            onClick={onScrollToBills}
            className="px-3 py-1.5 rounded-xl text-slate-700 hover:text-black hover:bg-emerald-100/50 transition cursor-pointer"
          >
            Browse Bills / بلز دیکھیں
          </button>
          <button
            onClick={onScrollToUpload}
            className="px-3 py-1.5 rounded-xl text-slate-700 hover:text-black hover:bg-emerald-100/50 transition cursor-pointer"
          >
            Upload Bill / بل اپلوڈ کریں
          </button>
        </div>

        {/* Right Side: User Account Controls */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onViewMyBills}
                className="clay-timer-badge px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-950 flex items-center gap-1.5 cursor-pointer shadow-xs border border-emerald-300/70"
                title="View your uploaded bills / اپنے اپلوڈ کردہ بل دیکھیں"
              >
                <FileText size={13} className="text-emerald-700" />
                <span className="hidden sm:inline">My Bills</span>
                <span className="font-urdu sm:hidden">میرے بل</span>
                <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {myBillsCount}
                </span>
              </button>

              <div className="flex items-center gap-1.5 bg-white/90 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-bold">
                <User size={13} className="text-emerald-700 shrink-0" />
                <span className="max-w-[100px] truncate text-slate-800 font-bold" title={user.email}>
                  {user.fullName || user.email.split('@')[0]}
                </span>
                <button
                  onClick={onLogout}
                  title="Logout / لاگ آؤٹ کریں"
                  className="ml-1 text-slate-400 hover:text-rose-600 transition-colors p-1 rounded-lg hover:bg-rose-50 cursor-pointer"
                >
                  <LogOut size={13} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenAuth('signup')}
                className="clay-mint-btn px-3.5 sm:px-4 py-2 rounded-xl text-xs font-black text-[#064E3B] flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ShieldCheck size={14} className="stroke-[2.5]" />
                <span>Create Account / اکاؤنٹ بنائیں</span>
              </button>
              <button
                onClick={() => onOpenAuth('login')}
                className="hidden sm:flex px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-black hover:bg-white border border-emerald-200/70 transition cursor-pointer"
              >
                <span>Sign In / لاگ ان</span>
              </button>
            </div>
          )}

          <button
            onClick={onScrollToUpload}
            className="clay-mint-btn hidden lg:flex p-2 rounded-xl text-emerald-950 shadow-xs cursor-pointer"
            title="Upload Bill"
          >
            <PlusCircle size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
};
