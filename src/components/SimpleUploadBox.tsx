import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Loader2,
  ShieldCheck,
  UserCheck,
  LogIn,
  UserPlus,
  Lock,
  Building2,
  Plus,
  Smartphone,
  Tag,
} from 'lucide-react';
import { NewBillPayload } from '../types/bill';
import { AppUser } from '../types/user';
import { PakistaniBankAccount } from '../types/bankAccount';
import { compressImage } from '../lib/imageUtils';
import {
  getUserBankAccounts,
  encodeBankAccountInReference,
} from '../services/bankAccountService';

interface SimpleUploadBoxProps {
  onBillSubmitted: (payload: NewBillPayload) => Promise<void>;
  user?: AppUser | null;
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
  onOpenBankAccounts?: () => void;
  userBankAccounts?: PakistaniBankAccount[];
}

const BILL_CATEGORIES = [
  { id: 'elec', en: 'Electricity Bill', ur: 'بجلی کا بل' },
  { id: 'gas', en: 'Sui Gas Bill', ur: 'سوئی گیس کا بل' },
  { id: 'water', en: 'Water Bill', ur: 'پانی کا بل' },
  { id: 'med', en: 'Medicine / Hospital', ur: 'ادویات و علاج' },
  { id: 'other', en: 'Other Bills', ur: 'دیگر بلز' },
];

const OTHER_SUGGESTIONS = [
  { en: 'School / College Fee', ur: 'تعلیمی فیس' },
  { en: 'House / Room Rent', ur: 'مکان کا کرایہ' },
  { en: 'Internet / Wi-Fi', ur: 'انٹرنیٹ بل' },
  { en: 'Grocery / Ration', ur: 'راشن و گروسری' },
  { en: 'Traffic Challan', ur: 'ٹریفک چالان' },
  { en: 'Commercial Shop Bill', ur: 'دکان کا بل' },
];

export const SimpleUploadBox: React.FC<SimpleUploadBoxProps> = ({
  onBillSubmitted,
  user,
  onOpenAuth,
  onOpenBankAccounts,
  userBankAccounts: externalBankAccounts,
}) => {
  const [billType, setBillType] = useState<string>('Electricity Bill / بجلی کا بل');
  const [isOtherSelected, setIsOtherSelected] = useState<boolean>(false);
  const [customOtherType, setCustomOtherType] = useState<string>('');

  const [referenceNo, setReferenceNo] = useState<string>('');
  const [personName, setPersonName] = useState<string>('');
  const [accountNo, setAccountNo] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [billPhotoData, setBillPhotoData] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Pakistani Bank Accounts Integration
  const [savedBankAccounts, setSavedBankAccounts] = useState<PakistaniBankAccount[]>([]);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>('');

  useEffect(() => {
    if (externalBankAccounts) {
      setSavedBankAccounts(externalBankAccounts);
      if (externalBankAccounts.length > 0 && !selectedBankAccountId) {
        const def = externalBankAccounts.find((b) => b.isDefault) || externalBankAccounts[0];
        setSelectedBankAccountId(def.id);
        if (!personName) setPersonName(def.accountTitle);
        if (!accountNo) setAccountNo(`${def.bankName}: ${def.accountNumber}`);
      }
    } else if (user?.id) {
      const loaded = getUserBankAccounts(user.id);
      setSavedBankAccounts(loaded);
      if (loaded.length > 0 && !selectedBankAccountId) {
        const def = loaded.find((b) => b.isDefault) || loaded[0];
        setSelectedBankAccountId(def.id);
        if (!personName) setPersonName(def.accountTitle);
        if (!accountNo) setAccountNo(`${def.bankName}: ${def.accountNumber}`);
      }
    }
  }, [user, externalBankAccounts]);

  const handleSelectBankAccount = (acc: PakistaniBankAccount) => {
    if (selectedBankAccountId === acc.id) {
      // Toggle deselect
      setSelectedBankAccountId('');
    } else {
      setSelectedBankAccountId(acc.id);
      setPersonName(acc.accountTitle);
      setAccountNo(`${acc.bankName}: ${acc.accountNumber}`);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strict Gate: Nobody can upload without account
    if (!user) {
      if (onOpenAuth) onOpenAuth('signup');
      return;
    }

    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setIsCompressing(true);
      setErrorMsg('');
      try {
        const compressed = await compressImage(file, 1200, 1200, 0.72);
        setBillPhotoData(compressed);
      } catch (err) {
        console.error('Image compression failed:', err);
        setErrorMsg('Failed to process image. Please try another photo.');
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleRemovePhoto = () => {
    setBillPhotoData('');
    setUploadedFileName('');
  };

  const handleCategoryClick = (category: typeof BILL_CATEGORIES[0]) => {
    if (category.id === 'other') {
      setIsOtherSelected(true);
      setBillType('Other Bill / دیگر بل');
    } else {
      setIsOtherSelected(false);
      setBillType(`${category.en} / ${category.ur}`);
    }
  };

  const handleQuickOtherSuggestion = (sug: typeof OTHER_SUGGESTIONS[0]) => {
    const formatted = `${sug.en} / ${sug.ur}`;
    setCustomOtherType(formatted);
    setBillType(`Other: ${formatted}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Strict Gate: Nobody can submit without account
    if (!user) {
      if (onOpenAuth) onOpenAuth('signup');
      return;
    }

    if (!billPhotoData) {
      setErrorMsg('Please upload a photo of your bill / براہ کرم بل کی تصویر لگائیں');
      return;
    }
    if (!referenceNo.trim()) {
      setErrorMsg('Please enter the Bill Reference ID / براہ کرم بل کا ریفرنس نمبر درج کریں');
      return;
    }
    const cleanAmount = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (!cleanAmount || isNaN(cleanAmount) || cleanAmount <= 0) {
      setErrorMsg('Please enter a valid bill amount / براہ کرم بل کی درست رقم درج کریں');
      return;
    }

    // Determine finalized bill category type
    let finalBillType = billType;
    if (isOtherSelected) {
      if (customOtherType.trim()) {
        finalBillType = `Other: ${customOtherType.trim()}`;
      } else {
        finalBillType = 'Other Bill / دیگر بل';
      }
    }

    // Combine reference_no with optional account or person info
    let combinedReference = referenceNo.trim();
    const extraDetails: string[] = [];
    if (personName.trim()) extraDetails.push(`Name: ${personName.trim()}`);
    if (accountNo.trim()) extraDetails.push(`Acc: ${accountNo.trim()}`);
    if (extraDetails.length > 0) {
      combinedReference = `${combinedReference} (${extraDetails.join(' | ')})`;
    }

    // If user selected a saved Pakistani bank account, embed structured bank metadata
    const selectedAcc = savedBankAccounts.find((b) => b.id === selectedBankAccountId);
    if (selectedAcc) {
      combinedReference = `${combinedReference} ${encodeBankAccountInReference(selectedAcc)}`;
    } else if (accountNo.trim()) {
      // Create inline bank tag if typed manually
      const manualBankTag = `[Bank:Direct Account|Title:${personName.trim() || 'Beneficiary'}|Acc:${accountNo.trim()}]`;
      combinedReference = `${combinedReference} ${manualBankTag}`;
    }

    // Strictly tag with logged-in user id and email so only they can delete it
    combinedReference = `${combinedReference} [Owner:${user.id}] [User:${user.email.toLowerCase()}]`;

    const payload: NewBillPayload = {
      bill_type: finalBillType,
      amount: cleanAmount,
      reference_no: combinedReference,
      image_url: billPhotoData,
      status: 'unpaid',
    };

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await onBillSubmitted(payload);
      // Reset form on success
      setReferenceNo('');
      setPersonName('');
      setAccountNo('');
      setAmount('');
      setBillPhotoData('');
      setUploadedFileName('');
      setCustomOtherType('');
      setIsOtherSelected(false);
      setBillType('Electricity Bill / بجلی کا بل');
    } catch (err: any) {
      console.error('Error submitting bill to Supabase:', err);
      setErrorMsg(err.message || 'Failed to save bill to Supabase database. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="upload-box" className="w-full max-w-3xl mx-auto my-6 sm:my-8">
      <div className="glass-green-card rounded-3xl p-6 sm:p-9 relative overflow-hidden">
        {/* Soft green ambient blob behind glass */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full ambient-glow-sage pointer-events-none" />

        {/* Direct Peer Relief Banner */}
        <div className="clay-timer-badge p-4 rounded-2xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="clay-mint-icon w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
              <Clock size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black text-emerald-950">
                Direct Peer-to-Peer Bill Relief (Live on Supabase)
              </div>
              <div className="text-xs sm:text-sm text-emerald-800 font-urdu font-bold mt-0.5">
                مخیر حضرات کے تعاون سے بل کی براہِ راست ادائیگی کی کوشش کی جائے گی
              </div>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-900 bg-white/70 px-3 py-1 rounded-full border border-emerald-300/60 shrink-0">
            Realtime Cloud Sync · کلاؤڈ لائیو
          </span>
        </div>

        {/* ========================================================
            CASE 1: USER IS NOT LOGGED IN (ACCOUNT REQUIRED GATE)
           ======================================================== */}
        {!user ? (
          <div className="py-6 px-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Lock size={32} className="stroke-[2.2]" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-black tracking-tight mb-2">
              Account Required to Upload Bill / <span className="font-urdu font-black text-emerald-950">پہلے اکاؤنٹ بنائیں</span>
            </h3>

            <p className="text-sm sm:text-base text-slate-700 max-w-lg mx-auto font-medium">
              To keep bills safe and ensure that <strong>only you have the power to delete or manage your bill</strong>, you must create a free account before uploading.
            </p>

            <p className="text-xs sm:text-sm text-emerald-900 font-urdu font-bold mt-2 max-w-md mx-auto leading-relaxed">
              بل اپلوڈ کرنے کے لیے پہلے اکاؤنٹ بنانا لازمی ہے تاکہ کوئی اجنبی آپ کا بل ڈیلیٹ نہ کر سکے اور صرف آپ کو مکمل کنٹرول ملے۔
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              {onOpenAuth && (
                <>
                  <button
                    type="button"
                    onClick={() => onOpenAuth('signup')}
                    className="clay-mint-btn w-full sm:w-auto px-7 py-3.5 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <UserPlus size={18} className="stroke-[2.5]" />
                    <span>Create Account First / نیا اکاؤنٹ بنائیں</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenAuth('login')}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 bg-white hover:bg-emerald-50 border border-emerald-300 flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                  >
                    <LogIn size={16} />
                    <span>Already have account? Sign In / لاگ ان</span>
                  </button>
                </>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-100 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
              <ShieldCheck size={15} className="text-emerald-600" />
              <span>Takes only 10 seconds · بالکل مفت اور 100% محفوظ</span>
            </div>
          </div>
        ) : (
          /* ========================================================
             CASE 2: USER IS LOGGED IN (FORM UNLOCKED & SECURED)
             ======================================================== */
          <>
            {/* Logged in User Banner */}
            <div className="mb-6 p-4 bg-emerald-50/95 rounded-2xl border-2 border-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <UserCheck size={20} />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black text-emerald-950">
                    Logged In As: <span className="underline">{user.fullName || user.email}</span>
                  </div>
                  <div className="text-xs text-emerald-800 font-urdu font-bold mt-0.5">
                    آپ کا اکاؤنٹ تصدیق شدہ ہے! یہ بل آپ کے نام محفوظ ہوگا اور صرف آپ اسے ڈیلیٹ کر سکیں گے
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onOpenBankAccounts && (
                  <button
                    type="button"
                    onClick={onOpenBankAccounts}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                  >
                    <Building2 size={13} className="text-emerald-700" />
                    <span>Bank Accounts ({savedBankAccounts.length})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Form Title */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-emerald-100 pb-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                  Upload Your Bill / بل اپلوڈ کریں
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Saved directly in Supabase database & secured under your account.
                </p>
              </div>
              <span className="text-xs font-urdu font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
                آسان و محفوظ طریقہ
              </span>
            </div>

            {errorMsg && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Bill Category Selector including "Other Bills / دیگر بلز" */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Select Bill Category / بل کی قسم منتخب کریں
                  </label>
                  <span className="text-[11px] font-urdu text-emerald-800 font-bold">
                    بجلی، گیس، پانی، ادویات یا دیگر بل
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {BILL_CATEGORIES.map((item) => {
                    const isSelected =
                      item.id === 'other'
                        ? isOtherSelected
                        : !isOtherSelected && billType.startsWith(item.en);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleCategoryClick(item)}
                        className={`p-2.5 rounded-xl text-xs text-center border cursor-pointer transition-all ${
                          isSelected
                            ? 'clay-mint-btn font-black border-transparent shadow-xs'
                            : 'bg-white/80 border-emerald-100 text-slate-700 hover:bg-white'
                        }`}
                      >
                        <div className="font-bold flex items-center justify-center gap-1">
                          {item.id === 'other' && <Tag size={12} className="text-emerald-800" />}
                          <span>{item.en}</span>
                        </div>
                        <div className="font-urdu text-[11px] mt-0.5">{item.ur}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Subcategory Selector & Custom Specification for "Other Bills / دیگر بلز" */}
                {isOtherSelected && (
                  <div className="mt-3 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl animate-in fade-in duration-200 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-950 flex items-center gap-1">
                        <Tag size={13} className="text-emerald-700" />
                        <span>Other Bill Category / دیگر بل کی نوعیت منتخب یا درج کریں:</span>
                      </span>
                      <span className="text-[11px] font-urdu text-emerald-800">فوری انتخاب</span>
                    </div>

                    {/* Quick suggestion chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {OTHER_SUGGESTIONS.map((sug) => (
                        <button
                          key={sug.en}
                          type="button"
                          onClick={() => handleQuickOtherSuggestion(sug)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                            customOtherType.startsWith(sug.en)
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                              : 'bg-white text-slate-700 border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          <span>{sug.en}</span>
                          <span className="ml-1 font-urdu text-[10px] opacity-85">({sug.ur})</span>
                        </button>
                      ))}
                    </div>

                    {/* Custom input */}
                    <div>
                      <input
                        type="text"
                        value={customOtherType}
                        onChange={(e) => {
                          setCustomOtherType(e.target.value);
                          setBillType(`Other: ${e.target.value}`);
                        }}
                        placeholder="e.g. School Fee, House Rent, PTCL Internet, Doctor Fee / دیگر بل کا نام لکھیں"
                        className="w-full px-3.5 py-2.5 bg-white rounded-xl text-xs font-bold border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-[#34D399]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 1. Upload Bill Photo (image_url) */}
              <div>
                <label className="block text-xs sm:text-sm font-black text-slate-900 mb-2">
                  1. Upload Bill Photo / <span className="font-urdu font-bold text-emerald-800">بل کی تصویر لگائیں</span>
                </label>

                {billPhotoData ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-300 bg-white p-3 flex flex-col sm:flex-row items-center gap-4">
                    <img
                      src={billPhotoData}
                      alt="Bill preview"
                      className="w-full sm:w-36 h-28 object-cover rounded-xl border border-slate-200"
                    />
                    <div className="flex-1 text-center sm:text-left">
                      <div className="text-xs font-bold text-emerald-800 flex items-center justify-center sm:justify-start gap-1.5">
                        <CheckCircle2 size={15} className="text-emerald-600" />
                        <span>Photo Ready for Supabase / تصویر محفوظ ہونے کے لیے تیار</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-xs">
                        {uploadedFileName || 'bill_photo.jpg'}
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="mt-2.5 text-xs text-rose-600 hover:text-rose-800 font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <X size={14} />
                        <span>Change Photo / تصویر بدلیں</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="clay-mint-btn py-5 px-6 rounded-2xl flex items-center justify-center gap-3 cursor-pointer shadow-md group text-center w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isCompressing}
                    />
                    {isCompressing ? (
                      <Loader2 size={26} className="animate-spin text-emerald-900" />
                    ) : (
                      <UploadCloud size={28} className="stroke-[2.5]" />
                    )}
                    <div className="text-left">
                      <div className="font-black text-sm text-white">
                        {isCompressing ? 'Processing photo...' : 'Click to Upload Bill Photo / تصویر لگائیں'}
                      </div>
                      <div className="text-xs font-urdu font-bold text-emerald-100 mt-0.5">
                        موبائل کیمرے سے تصویر کھینچیں یا گیلری سے اپلوڈ کریں
                      </div>
                    </div>
                  </label>
                )}
              </div>

              {/* 2. Bill Reference ID (reference_no) */}
              <div>
                <label className="block text-xs sm:text-sm font-black text-slate-900 mb-1.5">
                  2. Bill Reference ID / Consumer No / <span className="font-urdu font-bold text-emerald-800">بل کا ریفرنس نمبر یا چالان نمبر</span>
                </label>
                <input
                  type="text"
                  required
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  placeholder="e.g. 14241150829100 / CH-92019 (ریفرنس یا کنزیومر نمبر)"
                  className="w-full px-4 py-3 bg-white rounded-xl text-sm font-mono border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-[#34D399] transition shadow-xs text-slate-900 font-bold"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Found on the bill so donors can directly enter it into online banking/EasyPaisa/JazzCash bill portals.
                </span>
              </div>

              {/* 3. Bill Amount (amount: numeric) */}
              <div>
                <label className="block text-xs sm:text-sm font-black text-slate-900 mb-1.5">
                  3. Payable Amount (Rs.) / <span className="font-urdu font-bold text-emerald-800">بل کی کل رقم</span>
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 4850"
                  className="w-full px-4 py-3 bg-white rounded-xl text-sm font-mono border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-[#34D399] transition shadow-xs text-slate-900 font-bold"
                />
              </div>

              {/* 4. Multiple Pakistani Bank Accounts / Direct Relief Receiving Details */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <label className="block text-xs font-black text-emerald-950 flex items-center gap-1.5">
                      <Building2 size={14} className="text-emerald-700" />
                      <span>Pakistani Bank / JazzCash / EasyPaisa (رقم وصولی کا اکاؤنٹ)</span>
                    </label>
                    <span className="text-[11px] text-slate-600 block">
                      Choose from your saved Pakistani accounts or type details for direct transfer.
                    </span>
                  </div>

                  {onOpenBankAccounts && (
                    <button
                      type="button"
                      onClick={onOpenBankAccounts}
                      className="text-xs text-emerald-800 hover:text-emerald-950 font-bold inline-flex items-center gap-1 underline cursor-pointer shrink-0"
                    >
                      <Plus size={13} />
                      <span>Manage / Add Multiple Banks (بینک اکاؤنٹس)</span>
                    </button>
                  )}
                </div>

                {/* Quick Selection of User's Multiple Pakistani Bank Accounts */}
                {savedBankAccounts.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                      Select Your Saved Receiving Account / اپنا اکاؤنٹ چنیں:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {savedBankAccounts.map((acc) => {
                        const isSelected = selectedBankAccountId === acc.id;
                        return (
                          <button
                            key={acc.id}
                            type="button"
                            onClick={() => handleSelectBankAccount(acc)}
                            className={`p-2.5 rounded-xl text-left border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                                : 'bg-white hover:bg-emerald-50 border-emerald-200 text-slate-800'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs truncate">{acc.bankName}</span>
                                {acc.isDefault && (
                                  <span className={`text-[9px] px-1.5 rounded-full font-bold ${
                                    isSelected ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
                                  }`}>
                                    Default
                                  </span>
                                )}
                              </div>
                              <div className={`text-[11px] truncate font-mono mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-600'}`}>
                                {acc.accountTitle} · {acc.accountNumber}
                              </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                              isSelected ? 'bg-white text-emerald-700 border-white' : 'border-slate-300'
                            }`}>
                              {isSelected && <CheckCircle2 size={14} className="fill-emerald-600 text-white" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Manual inputs fallback or adjustments */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Account Title / نام:
                    </label>
                    <input
                      type="text"
                      value={personName}
                      onChange={(e) => setPersonName(e.target.value)}
                      placeholder="e.g. Muhammad Arshad"
                      className="w-full px-3.5 py-2.5 bg-white rounded-xl text-xs font-bold border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-[#34D399]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Account / JazzCash / EasyPaisa / IBAN:
                    </label>
                    <input
                      type="text"
                      value={accountNo}
                      onChange={(e) => setAccountNo(e.target.value)}
                      placeholder="e.g. JazzCash: 0301-8492019"
                      className="w-full px-3.5 py-2.5 bg-white rounded-xl text-xs font-mono font-bold border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-[#34D399]"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button (بل جمع کریں) */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || isCompressing}
                  className="clay-mint-btn w-full py-4 rounded-2xl text-base sm:text-lg font-black text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={22} className="animate-spin text-emerald-950" />
                      <span>Saving to Database... سپابیس میں محفوظ ہو رہا ہے</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={22} className="stroke-[2.5]" />
                      <span>Submit Bill / بل جمع کریں</span>
                    </>
                  )}
                </button>
                <div className="text-center text-[11px] text-slate-500 mt-2 font-urdu">
                  بل جمع ہوتے ہی آپ کے اکاؤنٹ کے تحت براہ راست سپابیس ڈیٹا بیس میں محفوظ ہو جائے گا
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
