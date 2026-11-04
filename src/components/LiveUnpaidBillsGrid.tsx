import React, { useState } from 'react';
import { Copy, Check, Search, CheckCircle2, RotateCw, Loader2 } from 'lucide-react';
import { BillItem } from '../types/bill';
import { CountdownTimer } from './CountdownTimer';
import { BillPhotoPreview } from './BillPhotoPreview';

interface LiveUnpaidBillsGridProps {
  bills: BillItem[];
  clearedBills: BillItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onOpenZoom: (bill: BillItem) => void;
  onOpenReceiptUpload: (bill: BillItem) => void;
}

export const LiveUnpaidBillsGrid: React.FC<LiveUnpaidBillsGridProps> = ({
  bills,
  clearedBills,
  isLoading = false,
  onRefresh,
  onOpenZoom,
  onOpenReceiptUpload,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'unpaid' | 'cleared'>('unpaid');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((curr) => (curr === id ? null : curr));
    }, 2000);
  };

  const filteredUnpaid = bills.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (b.bill_type && b.bill_type.toLowerCase().includes(q)) ||
      (b.reference_no && b.reference_no.toLowerCase().includes(q)) ||
      (b.amount && b.amount.toString().includes(q))
    );
  });

  return (
    <section id="unpaid-bills" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 clay-timer-badge text-xs font-bold px-3 py-1 rounded-full mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Supabase Cloud Feed</span>
            <span>·</span>
            <span className="font-urdu">مدد کے منتظر بل (کلاؤڈ لائیو)</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
            Live Unpaid Bills / <span className="font-urdu font-black text-emerald-950">مدد کے منتظر بل</span>
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            All bills saved in Supabase database. Copy the Reference Number to pay directly, then upload receipt to auto-clear the bill.
          </p>
        </div>

        {/* Tab Switch & Refresh Button */}
        <div className="flex flex-wrap items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh from Supabase / کلاؤڈ ڈیٹا ریفریش کریں"
              className="p-2.5 rounded-xl bg-white/80 hover:bg-white border border-emerald-200 text-emerald-800 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <RotateCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
          )}

          <div className="flex items-center gap-1.5 bg-emerald-100/50 p-1.5 rounded-2xl border border-emerald-200/60">
            <button
              onClick={() => setActiveTab('unpaid')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'unpaid'
                  ? 'clay-mint-btn font-black shadow-xs'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              <span>Unpaid Bills ({bills.length})</span>
              <span className="ml-1 font-urdu">منتظر بل</span>
            </button>
            <button
              onClick={() => setActiveTab('cleared')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'cleared'
                  ? 'clay-mint-btn font-black shadow-xs'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              <span>Cleared Archive ({clearedBills.length})</span>
              <span className="ml-1 font-urdu">ادا شدہ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar for Unpaid Bills */}
      {activeTab === 'unpaid' && bills.length > 0 && (
        <div className="mb-7 max-w-md">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Reference ID or Category / ریفرنس یا بل کی قسم تلاش کریں..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/90 rounded-2xl text-xs sm:text-sm border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-[#34D399]"
            />
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && bills.length === 0 && (
        <div className="glass-green-card rounded-3xl p-12 text-center max-w-md mx-auto">
          <Loader2 size={36} className="animate-spin text-emerald-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">
            Connecting to Supabase...
          </h3>
          <p className="text-xs text-slate-600 mt-1 font-urdu">
            کلاؤڈ ڈیٹا بیس سے بلز لوڈ کیے جا رہے ہیں...
          </p>
        </div>
      )}

      {/* TAB 1: UNPAID BILLS GRID */}
      {activeTab === 'unpaid' && !isLoading && (
        <>
          {filteredUnpaid.length === 0 ? (
            <div className="glass-green-card rounded-3xl p-12 text-center max-w-lg mx-auto">
              <div className="clay-mint-icon w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-black text-black">
                {bills.length === 0 ? 'No Active Bills / کوئی بل زیر التواء نہیں' : 'No Bills Found / کوئی بل نہیں ملا'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 font-urdu leading-relaxed">
                {bills.length === 0
                  ? 'سپابیس ڈیٹا بیس فعال ہے! اگر آپ کو یا کسی ضرورت مند کو بل ادا کرنے کے لیے مدد چاہیے تو اوپر دیے گئے فارم سے بل اپلوڈ کریں۔'
                  : 'تلاش کے لیے دوسرا لفظ لکھیں یا فلٹر صاف کریں۔'}
              </p>
              {bills.length === 0 && (
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('upload-box')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="clay-mint-btn inline-flex items-center gap-2 mt-5 px-7 py-3 rounded-full text-xs sm:text-sm font-black text-[#064E3B] cursor-pointer shadow-md"
                >
                  <span>Upload a Bill / بل اپلوڈ کریں</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {filteredUnpaid.map((bill) => (
                <div
                  key={bill.id}
                  className="glass-green-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden group"
                >
                  {/* Card Top: 48-Hour Countdown Badge */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <CountdownTimer createdAt={bill.created_at} />
                      <span className="text-xs font-black text-emerald-900 bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-300/80">
                        Rs. {bill.amount ? Number(bill.amount).toLocaleString() : '0'}
                      </span>
                    </div>

                    {/* Bill Photo Preview (Click to Zoom) */}
                    <div className="mb-4">
                      <BillPhotoPreview
                        photoKey={bill.image_url}
                        referenceId={bill.reference_no}
                        amount={bill.amount}
                        billType={bill.bill_type}
                        onZoom={() => onOpenZoom(bill)}
                      />
                    </div>

                    {/* Bill Category Title */}
                    <div className="mb-3.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Category / بل کی نوعیت
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-black leading-snug">
                        {bill.bill_type}
                      </h3>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Uploaded: {new Date(bill.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {/* Reference ID with 1-click Copy */}
                    <div className="bg-white/95 p-3 rounded-2xl border border-emerald-200/90 mb-4 flex items-center justify-between">
                      <div className="truncate mr-2">
                        <span className="text-[10px] font-black text-slate-500 block">
                          Reference ID / ریفرنس نمبر:
                        </span>
                        <span className="font-mono font-bold text-xs sm:text-sm text-emerald-950 truncate block">
                          {bill.reference_no}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(bill.reference_no, `ref-${bill.id}`)}
                        className="clay-mint-btn px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                        title="Copy Reference ID / ریفرنس نمبر کاپی کریں"
                      >
                        {copiedId === `ref-${bill.id}` ? (
                          <>
                            <Check size={12} />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Action Button: I Paid This - Upload Receipt */}
                  <div className="pt-2 border-t border-emerald-100">
                    <button
                      onClick={() => onOpenReceiptUpload(bill)}
                      className="clay-mint-btn w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black text-[#064E3B] flex items-center justify-center gap-2 cursor-pointer shadow-md group"
                    >
                      <CheckCircle2 size={16} className="stroke-[2.5]" />
                      <span>I Paid This - Upload Receipt</span>
                    </button>
                    <div className="text-center text-[10px] text-emerald-900 font-urdu font-bold mt-1.5">
                      بل ادا کر دیا (رسید اپلوڈ کریں)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 2: CLEARED BILLS ARCHIVE */}
      {activeTab === 'cleared' && (
        <div>
          {clearedBills.length === 0 ? (
            <div className="glass-green-card rounded-3xl p-10 text-center max-w-md mx-auto">
              <CheckCircle2 size={36} className="mx-auto text-emerald-600 mb-3" />
              <h3 className="font-bold text-base text-slate-900">
                No Cleared Bills Yet / ابھی کوئی ادا شدہ بل آرکائیو نہیں ہے
              </h3>
              <p className="text-xs text-slate-600 mt-1 font-urdu">
                جیسے ہی کوئی مخیر بھائی بل ادا کر کے رسید اپلوڈ کرے گا، بل سپابیس کلاؤڈ لسٹ میں ادا شدہ مارک ہو جائے گا۔
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {clearedBills.map((bill) => (
                <div
                  key={bill.id}
                  className="bg-white/90 rounded-2xl p-5 border border-emerald-200 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      <span>Settled & Cleared / ادا شدہ</span>
                    </span>
                    <span className="font-black text-sm text-emerald-900">
                      Rs. {bill.amount ? Number(bill.amount).toLocaleString() : '0'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-base text-slate-900">{bill.bill_type}</h4>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      Ref: {bill.reference_no}
                    </div>
                  </div>

                  <div className="p-2.5 bg-emerald-50 rounded-xl text-[11px] text-emerald-900 font-urdu leading-relaxed">
                    الحمدللہ! ادائیگی مکمل ہونے پر یہ بل کامیابی سے لائیو لسٹ سے ہٹا دیا گیا ہے۔
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
