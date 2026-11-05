import React from 'react';
import { CheckCircle2, ShieldCheck, ExternalLink, Sparkles, Receipt, ArrowRight } from 'lucide-react';
import { BillItem } from '../types/bill';
import { cleanDisplayReference } from '../services/billService';

interface VerifiedReliefShowcaseProps {
  clearedBills: BillItem[];
  onOpenZoom: (bill: BillItem) => void;
  onViewAllCleared: () => void;
}

export const VerifiedReliefShowcase: React.FC<VerifiedReliefShowcaseProps> = ({
  clearedBills,
  onOpenZoom,
  onViewAllCleared,
}) => {
  if (clearedBills.length === 0) return null;

  const totalAmount = clearedBills.reduce(
    (acc, b) => acc + (Number(b.amount) || 0),
    0
  );

  // Show top 4 most recent paid bills as social proof
  const showcaseBills = clearedBills.slice(0, 4);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="glass-green-card rounded-3xl p-6 sm:p-9 border-2 border-emerald-300 shadow-xl relative overflow-hidden">
        {/* Ambient glow in background */}
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full ambient-glow-mint pointer-events-none opacity-60" />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-black mb-2 shadow-xs">
              <Sparkles size={14} />
              <span>Real Relief Proof · زندہ ثبوت</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-black tracking-tight">
              Verified Paid Bills & Receipts / <span className="font-urdu font-black text-emerald-950">ادا شدہ بلوں کا ریکارڈ</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 mt-1 max-w-2xl font-medium">
              Every bill paid by worldwide donors is permanently archived on our database with the official transaction receipt. 100% transparent and verified.
            </p>
          </div>

          {/* Social Proof Stats Badge */}
          <div className="flex items-center gap-3 bg-white/90 p-3 rounded-2xl border border-emerald-300 shadow-xs shrink-0">
            <div className="text-center px-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Relief Given</div>
              <div className="text-base sm:text-lg font-black text-emerald-800">
                Rs. {totalAmount.toLocaleString()}
              </div>
            </div>
            <span className="text-emerald-200">|</span>
            <div className="text-center px-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Bills Cleared</div>
              <div className="text-base sm:text-lg font-black text-slate-900">
                {clearedBills.length} Families
              </div>
            </div>
          </div>
        </div>

        {/* 4 Paid Bills Showcase Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {showcaseBills.map((bill) => {
            const displayRef = cleanDisplayReference(bill.reference_no);
            return (
              <div
                key={bill.id}
                onClick={() => onOpenZoom(bill)}
                className="bg-white/95 rounded-2xl p-4 border border-emerald-200/90 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Paid Stamp & Amount */}
                  <div className="flex items-center justify-between gap-1.5 mb-2.5">
                    <span className="text-[11px] font-black text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-emerald-700" />
                      <span>PAID & CLEARED</span>
                    </span>
                    <span className="text-xs font-black text-emerald-900">
                      Rs. {bill.amount ? Number(bill.amount).toLocaleString() : '0'}
                    </span>
                  </div>

                  {/* Thumbnail of Paid Receipt */}
                  <div className="relative rounded-xl overflow-hidden mb-3 aspect-[4/3] bg-emerald-50 border border-emerald-100 flex items-center justify-center group-hover:border-emerald-300 transition">
                    <img
                      src={bill.image_url}
                      alt="Paid Bill Receipt"
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-emerald-900/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white/90 text-slate-900 font-black text-xs px-3 py-1.5 rounded-xl shadow-md inline-flex items-center gap-1">
                        <ExternalLink size={13} />
                        <span>Inspect Receipt</span>
                      </span>
                    </div>
                  </div>

                  {/* Title & Ref */}
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug line-clamp-1">
                      {bill.bill_type}
                    </h4>
                    <p className="text-[11px] font-mono text-slate-600 truncate mt-0.5">
                      Ref: {displayRef}
                    </p>
                  </div>
                </div>

                {/* Footer Stamp */}
                <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1 text-emerald-800 font-bold">
                    <Receipt size={12} />
                    <span>Receipt Verified</span>
                  </span>
                  <span className="font-urdu font-bold text-emerald-900">
                    ادا شدہ
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA to view all cleared bills in archive */}
        <div className="mt-7 pt-4 border-t border-emerald-200/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-950 font-bold">
            <ShieldCheck size={18} className="text-emerald-700 shrink-0" />
            <span>
              All transactions are recorded with genuine donor receipts in our Supabase Cloud Database.
            </span>
          </div>

          <button
            type="button"
            onClick={onViewAllCleared}
            className="clay-mint-btn px-5 py-2.5 rounded-full text-xs font-black text-white inline-flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
          >
            <span>View All {clearedBills.length} Paid Bills / تمام ادا شدہ بل دیکھیں</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
};
