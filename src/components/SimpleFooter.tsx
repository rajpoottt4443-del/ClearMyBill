import React from 'react';
import { HeartHandshake, ShieldCheck } from 'lucide-react';

export const SimpleFooter: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-emerald-100 bg-white/70 backdrop-blur-md py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-5">
        <div className="flex items-center justify-center gap-2">
          <div className="clay-mint-icon w-8 h-8 rounded-xl flex items-center justify-center">
            <HeartHandshake size={18} />
          </div>
          <span className="font-black text-2xl tracking-tight text-black">
            ClearMyBill
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          A super simple, clutter-free bilingual platform connecting needy individuals with direct donors worldwide to clear critical utility and essential bills directly.
        </p>
        <p className="text-xs sm:text-sm text-emerald-950 font-urdu font-bold max-w-md mx-auto">
          یہ ایک خالص فلاحی پلیٹ فارم ہے جہاں مستحق افراد اپنے بل اپلوڈ کر سکتے ہیں اور مخیر حضرات براہِ راست ادائیگی کر کے رسید اپلوڈ کر سکتے ہیں۔
        </p>

        <div className="pt-4 border-t border-emerald-100/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} ClearMyBill · Direct Peer Relief Platform
          </div>
          <div className="flex items-center gap-4 text-[11px] font-semibold text-emerald-800">
            <span>Direct Utility Payments</span>
            <span>·</span>
            <span>JazzCash / Easypaisa</span>
            <span>·</span>
            <span>Saved Paid Records / محفوظ ریکارڈ</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
