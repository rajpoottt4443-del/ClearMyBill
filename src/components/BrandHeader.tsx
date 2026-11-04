import React from 'react';
import { HeartHandshake, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

interface BrandHeaderProps {
  onScrollToUpload: () => void;
  onScrollToBills: () => void;
  unpaidCount: number;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({
  onScrollToUpload,
  onScrollToBills,
  unpaidCount,
}) => {
  return (
    <header className="relative pt-10 pb-8 sm:pt-14 sm:pb-10 overflow-hidden text-center">
      {/* Eye-soothing soft green ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full pointer-events-none -z-10">
        <div className="absolute top-2 left-1/3 w-80 h-80 rounded-full ambient-glow-sage blur-3xl opacity-75" />
        <div className="absolute top-10 right-1/4 w-72 h-72 rounded-full ambient-glow-mint blur-2xl opacity-60" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Bilingual Pill Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full clay-timer-badge text-xs font-black mb-5 shadow-xs">
          <HeartHandshake size={15} className="text-[#059669]" />
          <span>Global Peer-to-Peer Relief</span>
          <span className="text-emerald-400">·</span>
          <span className="font-urdu font-bold text-emerald-950">
            بلوں کی براہِ راست 48 گھنٹے میں ادائیگی
          </span>
        </div>

        {/* Brand Header Rule: Massive ultra-bold Pure Jet Black (#000000) typography (font-weight: 900, 4.5rem) */}
        <h1 className="font-black text-black tracking-[-0.04em] text-5xl sm:text-6xl md:text-7xl lg:text-[4.5rem] leading-[0.95] mb-4">
          ClearMyBill
        </h1>

        {/* Bilingual Subtitle */}
        <p className="text-base sm:text-lg lg:text-xl font-bold text-[#1E293B] max-w-2xl mx-auto leading-relaxed">
          The 48-Hour Peer-to-Peer Bill Relief Platform
        </p>
        <p className="text-sm sm:text-base text-emerald-900 font-urdu font-bold mt-1 max-w-xl mx-auto leading-relaxed">
          ضرورت مند لوگ اپنے بل اپلوڈ کریں اور دنیا بھر کے مخیر حضرات 48 گھنٹے کے اندر براہِ راست بل یا رقم ادا کریں۔
        </p>

        {/* Quick Dual Action Badges */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onScrollToUpload}
            className="clay-mint-btn px-6 py-3 rounded-full text-xs sm:text-sm font-black text-[#064E3B] flex items-center gap-2 cursor-pointer shadow-md"
          >
            <span>Upload a Bill / بل اپلوڈ کریں</span>
          </button>
          <button
            onClick={onScrollToBills}
            className="clay-white-btn px-6 py-3 rounded-full text-xs sm:text-sm font-black text-slate-800 flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <span>View Unpaid Bills ({unpaidCount}) / بل دیکھیں</span>
          </button>
        </div>

        {/* 3 Quick Guarantees */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
          <div className="bg-white/80 p-3 rounded-2xl border border-emerald-200/60 flex items-center gap-2.5">
            <div className="clay-mint-icon w-8 h-8 rounded-xl flex items-center justify-center shrink-0">
              <Clock size={16} />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900">48-Hour Goal</div>
              <div className="text-[10px] text-slate-500 font-urdu">48 گھنٹے کا ہدف</div>
            </div>
          </div>

          <div className="bg-white/80 p-3 rounded-2xl border border-emerald-200/60 flex items-center gap-2.5">
            <div className="clay-mint-icon w-8 h-8 rounded-xl flex items-center justify-center shrink-0">
              <ShieldCheck size={16} />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900">0% Deductions</div>
              <div className="text-[10px] text-slate-500 font-urdu">100% مکمل براہ راست ادائیگی</div>
            </div>
          </div>

          <div className="bg-white/80 p-3 rounded-2xl border border-emerald-200/60 flex items-center gap-2.5">
            <div className="clay-mint-icon w-8 h-8 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900">Auto-Removal</div>
              <div className="text-[10px] text-slate-500 font-urdu">رسید پر بل فوری ہٹایا جائے گا</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
