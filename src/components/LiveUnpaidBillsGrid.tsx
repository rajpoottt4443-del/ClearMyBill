import React, { useState } from 'react';
import { Copy, Check, Search, CheckCircle2, RotateCw, Loader2, Trash2, UserCheck, ShieldCheck, LogIn, Lock } from 'lucide-react';
import { BillItem } from '../types/bill';
import { AppUser } from '../types/user';
import { CountdownTimer } from './CountdownTimer';
import { BillPhotoPreview } from './BillPhotoPreview';
import { isBillOwner, cleanDisplayReference } from '../services/billService';

interface LiveUnpaidBillsGridProps {
  bills: BillItem[];
  clearedBills: BillItem[];
  user: AppUser | null;
  activeTab?: 'unpaid' | 'my_bills' | 'cleared';
  onTabChange?: (tab: 'unpaid' | 'my_bills' | 'cleared') => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  onOpenZoom: (bill: BillItem) => void;
  onOpenReceiptUpload: (bill: BillItem) => void;
  onOpenDelete?: (bill: BillItem) => void;
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
}

export const LiveUnpaidBillsGrid: React.FC<LiveUnpaidBillsGridProps> = ({
  bills,
  clearedBills,
  user,
  activeTab: controlledTab,
  onTabChange,
  isLoading = false,
  onRefresh,
  onOpenZoom,
  onOpenReceiptUpload,
  onOpenDelete,
  onOpenAuth,
}) => {
  const [internalTab, setInternalTab] = useState<'unpaid' | 'my_bills' | 'cleared'>('unpaid');
  const activeTab = controlledTab || internalTab;
  const setActiveTab = (tab: 'unpaid' | 'my_bills' | 'cleared') => {
    setInternalTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleCopy = (text: string, id: string) => {
    // Copy clean reference number without internal brackets
    const clean = cleanDisplayReference(text);
    navigator.clipboard.writeText(clean);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((curr) => (curr === id ? null : curr));
    }, 2000);
  };

  // Filter bills belonging to current user / local uploader
  const myBills = bills.filter((b) => isBillOwner(b, user));
  const myClearedBills = clearedBills.filter((b) => isBillOwner(b, user));

  const filteredUnpaid = bills.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const cleanRef = cleanDisplayReference(b.reference_no).toLowerCase();
    return (
      (b.bill_type && b.bill_type.toLowerCase().includes(q)) ||
      cleanRef.includes(q) ||
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
            All bills saved in Supabase database. Only the bill creator can delete their bill to ensure complete protection.
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

          <div className="flex items-center gap-1.5 bg-emerald-100/50 p-1.5 rounded-2xl border border-emerald-200/60 overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('unpaid')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'unpaid'
                  ? 'clay-mint-btn font-black shadow-xs'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              <span>All Bills ({bills.length})</span>
              <span className="ml-1 font-urdu">تمام بل</span>
            </button>

            <button
              onClick={() => setActiveTab('my_bills')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'my_bills'
                  ? 'clay-mint-btn font-black shadow-xs'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              <UserCheck size={13} className="text-emerald-700" />
              <span>My Bills ({myBills.length})</span>
              <span className="font-urdu">میرے بل</span>
            </button>

            <button
              onClick={() => setActiveTab('cleared')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'cleared'
                  ? 'clay-mint-btn font-black shadow-xs'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              <span>Cleared ({clearedBills.length})</span>
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

      {/* TAB 1: ALL UNPAID BILLS GRID */}
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
                    if (!user && onOpenAuth) {
                      onOpenAuth('signup');
                    } else {
                      document.getElementById('upload-box')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="clay-mint-btn inline-flex items-center gap-2 mt-5 px-7 py-3 rounded-full text-xs sm:text-sm font-black text-[#064E3B] cursor-pointer shadow-md"
                >
                  <span>Upload a Bill / بل اپلوڈ کریں</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {filteredUnpaid.map((bill) => {
                const isOwner = isBillOwner(bill, user);
                const displayRef = cleanDisplayReference(bill.reference_no);

                return (
                  <div
                    key={bill.id}
                    className={`glass-green-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden group ${
                      isOwner ? 'ring-2 ring-emerald-400 bg-white/90' : ''
                    }`}
                  >
                    {/* Card Top: 48-Hour Countdown Badge + Amount + Owner Badge / Delete */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <CountdownTimer createdAt={bill.created_at} />
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-emerald-900 bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-300/80">
                            Rs. {bill.amount ? Number(bill.amount).toLocaleString() : '0'}
                          </span>
                          {/* Only show delete button to owner or authorized user */}
                          {isOwner && onOpenDelete && (
                            <button
                              type="button"
                              onClick={() => onOpenDelete(bill)}
                              title="Delete your bill / اپنا بل ڈیلیٹ کریں"
                              className="p-1.5 rounded-xl text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Owner Banner (if this is user's own bill) */}
                      {isOwner && (
                        <div className="mb-3 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-[11px] text-emerald-900 font-bold">
                          <span className="flex items-center gap-1">
                            <ShieldCheck size={13} className="text-emerald-600" />
                            <span>Your Bill / آپ کا بل</span>
                          </span>
                          <span className="text-[10px] text-emerald-700">Delete Control Active</span>
                        </div>
                      )}

                      {/* Bill Photo Preview (Click to Zoom) */}
                      <div className="mb-4">
                        <BillPhotoPreview
                          photoKey={bill.image_url}
                          referenceId={displayRef}
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
                            {displayRef}
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

                      {/* Delete Option for Owner */}
                      {isOwner && onOpenDelete && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100/90 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => onOpenDelete(bill)}
                            className="text-[11px] text-rose-600 hover:text-rose-800 inline-flex items-center gap-1.5 font-bold transition-colors cursor-pointer py-1 px-3 rounded-lg hover:bg-rose-50"
                          >
                            <Trash2 size={13} />
                            <span>Delete My Bill / اپنا بل ڈیلیٹ کریں</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* TAB 2: MY BILLS (USER'S PERSONAL BILLS WITH EXCLUSIVE DELETE ACCESS) */}
      {activeTab === 'my_bills' && (
        <div>
          {myBills.length === 0 ? (
            <div className="glass-green-card rounded-3xl p-10 text-center max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <UserCheck size={28} />
              </div>
              <h3 className="font-black text-lg text-slate-900">
                No Bills In Your Account / آپ کا کوئی بل موجود نہیں ہے
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 font-urdu leading-relaxed">
                جب آپ بل اپلوڈ کریں گے تو وہ یہاں آپ کے ذاتی اکاؤنٹ کے پینل میں ظاہر ہو گا اور آپ اسے جب چاہیں ڈیلیٹ کر سکیں گے۔
              </p>

              {!user && onOpenAuth && (
                <div className="mt-5 p-4 bg-white/90 rounded-2xl border border-emerald-200">
                  <p className="text-xs text-slate-700 mb-3">
                    Have you previously created an account? Sign in to view all your bills:
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenAuth('login')}
                    className="clay-mint-btn px-6 py-2.5 rounded-full text-xs font-black text-[#064E3B] inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <LogIn size={14} />
                    <span>Sign In to Your Account / اپنے اکاؤنٹ میں لاگ ان کریں</span>
                  </button>
                </div>
              )}

              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => {
                    if (!user && onOpenAuth) {
                      onOpenAuth('signup');
                    } else {
                      document.getElementById('upload-box')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="clay-mint-btn px-6 py-2.5 rounded-full text-xs font-black text-[#064E3B] shadow-sm cursor-pointer"
                >
                  <span>Upload a Bill Now / نیا بل اپلوڈ کریں</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* My Bills Notice Banner */}
              <div className="clay-timer-badge p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left border border-emerald-300">
                <div className="flex items-center gap-3">
                  <div className="clay-mint-icon w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                    <ShieldCheck size={22} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-black text-emerald-950">
                      Your Managed Bills Panel / آپ کا ذاتی بل کنٹرول پینل
                    </div>
                    <div className="text-xs text-emerald-800 font-urdu mt-0.5">
                      یہاں موجود تمام بلز پر مکمل کنٹرول صرف آپ کے پاس ہے، کوئی اجنبی انہیں ڈیلیٹ نہیں کر سکتا۔
                    </div>
                  </div>
                </div>
                <div className="bg-white/90 px-3.5 py-1.5 rounded-xl border border-emerald-200 text-xs font-black text-emerald-900 shrink-0">
                  Total: {myBills.length} Active Bills
                </div>
              </div>

              {/* Grid of My Bills */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myBills.map((bill) => {
                  const displayRef = cleanDisplayReference(bill.reference_no);
                  return (
                    <div
                      key={bill.id}
                      className="bg-white/95 rounded-3xl p-5 border-2 border-emerald-300 shadow-lg space-y-4 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[11px] font-black text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                            <ShieldCheck size={12} className="text-emerald-700" />
                            <span>Your Bill / آپ کا بل</span>
                          </span>
                          <span className="font-black text-base text-emerald-900">
                            Rs. {bill.amount ? Number(bill.amount).toLocaleString() : '0'}
                          </span>
                        </div>

                        {/* Photo Preview */}
                        <div className="my-3">
                          <BillPhotoPreview
                            photoKey={bill.image_url}
                            referenceId={displayRef}
                            amount={bill.amount}
                            billType={bill.bill_type}
                            onZoom={() => onOpenZoom(bill)}
                          />
                        </div>

                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Category / نوعیت
                          </div>
                          <h4 className="font-black text-base text-slate-900 leading-snug">
                            {bill.bill_type}
                          </h4>
                          <div className="text-xs text-slate-700 font-mono mt-1 break-all bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            <strong>Reference ID:</strong> {displayRef}
                          </div>
                        </div>
                      </div>

                      {/* Direct Delete Action */}
                      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                        {onOpenDelete && (
                          <button
                            type="button"
                            onClick={() => onOpenDelete(bill)}
                            className="flex-1 py-2.5 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-700 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <Trash2 size={14} />
                            <span>Delete This Bill / ڈیلیٹ کریں</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onOpenZoom(bill)}
                          className="px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-black bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                        >
                          View / دیکھیں
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CLEARED BILLS ARCHIVE */}
      {activeTab === 'cleared' && (
        <div>
          {clearedBills.length === 0 ? (
            <div className="glass-green-card rounded-3xl p-10 text-center max-w-md mx-auto">
              <CheckCircle2 size={36} className="mx-auto text-emerald-600 mb-3" />
              <h3 className="font-bold text-base text-slate-900">
                No Cleared Bills Yet / ابھی کوئی ادا شدہ بل آرکائیو نہیں ہے
              </h3>
              <p className="text-xs text-slate-600 mt-1 font-urdu">
                جیسے ہی کوئی مخیر بھائی بل ادا کر کے رسید اپلوڈ کرے گا، بل سپابیس کلاؤڈ ڈیٹا بیس میں ہمیشہ کے لیے ادا شدہ ریکارڈ کے طور پر محفوظ رہے گا۔
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Record Summary Banner */}
              <div className="clay-timer-badge p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex items-center gap-3">
                  <div className="clay-mint-icon w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle2 size={20} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-black text-emerald-950">
                      Permanent Cleared Bills Archive / ادا شدہ بلوں کا مستقل ریکارڈ
                    </div>
                    <div className="text-xs text-emerald-800 font-urdu mt-0.5">
                      یہ تمام بلز اور ادائیگی کی رسیدیں سپابیس کلاؤڈ میں ریکارڈ کے لیے محفوظ ہیں
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/80 px-4 py-2 rounded-xl border border-emerald-200">
                  <div className="text-center">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Total Cleared</div>
                    <div className="text-sm font-black text-emerald-900">{clearedBills.length} Bills</div>
                  </div>
                  <span className="text-emerald-300">|</span>
                  <div className="text-center">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Total Amount</div>
                    <div className="text-sm font-black text-emerald-700">
                      Rs. {clearedBills.reduce((acc, b) => acc + (Number(b.amount) || 0), 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clearedBills.map((bill) => {
                  const isOwner = isBillOwner(bill, user);
                  const displayRef = cleanDisplayReference(bill.reference_no);
                  return (
                    <div
                      key={bill.id}
                      className="bg-white/95 rounded-3xl p-5 border border-emerald-200/90 shadow-md space-y-3.5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-black text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1.5">
                            <CheckCircle2 size={13} className="text-emerald-700" />
                            <span>Paid & Saved / ادا شدہ</span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-sm text-emerald-900">
                              Rs. {bill.amount ? Number(bill.amount).toLocaleString() : '0'}
                            </span>
                            {/* Allow owner to delete their record if they wish */}
                            {isOwner && onOpenDelete && (
                              <button
                                type="button"
                                onClick={() => onOpenDelete(bill)}
                                title="Delete record / ریکارڈ ڈیلیٹ کریں"
                                className="p-1 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Photo / Receipt Preview with Zoom */}
                        <div className="my-3">
                          <BillPhotoPreview
                            photoKey={bill.image_url}
                            referenceId={displayRef}
                            amount={bill.amount}
                            billType={bill.bill_type}
                            onZoom={() => onOpenZoom(bill)}
                          />
                        </div>

                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Category / نوعیت
                          </div>
                          <h4 className="font-black text-base text-slate-900 leading-snug">
                            {bill.bill_type}
                          </h4>
                          <div className="text-xs text-slate-600 font-mono mt-1 break-all bg-slate-50 p-2 rounded-xl border border-slate-200">
                            <strong>Ref:</strong> {displayRef}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Date: {new Date(bill.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span className="font-urdu font-bold text-emerald-800">محفوظ شدہ ریکارڈ</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
