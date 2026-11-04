import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, Clock, Image as ImageIcon, AlertCircle, X, Loader2 } from 'lucide-react';
import { NewBillPayload } from '../types/bill';
import { compressImage } from '../lib/imageUtils';

interface SimpleUploadBoxProps {
  onBillSubmitted: (payload: NewBillPayload) => Promise<void>;
}

export const SimpleUploadBox: React.FC<SimpleUploadBoxProps> = ({ onBillSubmitted }) => {
  const [billType, setBillType] = useState<string>('Electricity Bill / بجلی کا بل');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [personName, setPersonName] = useState<string>('');
  const [accountNo, setAccountNo] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [billPhotoData, setBillPhotoData] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    // Combine reference_no with optional account or person info if entered
    let combinedReference = referenceNo.trim();
    const extraDetails: string[] = [];
    if (personName.trim()) extraDetails.push(`Name: ${personName.trim()}`);
    if (accountNo.trim()) extraDetails.push(`Acc: ${accountNo.trim()}`);
    if (extraDetails.length > 0) {
      combinedReference = `${combinedReference} (${extraDetails.join(' | ')})`;
    }

    const payload: NewBillPayload = {
      bill_type: billType,
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

        {/* 48-Hour Promise Banner */}
        <div className="clay-timer-badge p-4 rounded-2xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="clay-mint-icon w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
              <Clock size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black text-emerald-950">
                48-Hour Relief Promise (Live on Supabase)
              </div>
              <div className="text-xs sm:text-sm text-emerald-800 font-urdu font-bold mt-0.5">
                انشاءاللہ آپ کا بل 48 گھنٹے میں ادا ہو جائے گا
              </div>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-900 bg-white/70 px-3 py-1 rounded-full border border-emerald-300/60 shrink-0">
            Realtime Cloud Sync · کلاؤڈ لائیو
          </span>
        </div>

        {/* Form Title */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-emerald-100 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
              Upload Your Bill / بل اپلوڈ کریں
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Saved instantly in Supabase database & visible to donors worldwide.
            </p>
          </div>
          <span className="text-xs font-urdu font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
            آسان طریقہ
          </span>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Bill Type Selector (bill_type) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Bill Category / بل کی قسم منتخب کریں
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { en: 'Electricity Bill', ur: 'بجلی کا بل' },
                { en: 'Sui Gas Bill', ur: 'سوئی گیس کا بل' },
                { en: 'Water Bill', ur: 'پانی کا بل' },
                { en: 'Medicine / Hospital', ur: 'ادویات و علاج' },
              ].map((item) => {
                const fullVal = `${item.en} / ${item.ur}`;
                const isSelected = billType.startsWith(item.en);
                return (
                  <button
                    key={item.en}
                    type="button"
                    onClick={() => setBillType(fullVal)}
                    className={`p-2.5 rounded-xl text-xs text-center border cursor-pointer transition-all ${
                      isSelected
                        ? 'clay-mint-btn font-black border-transparent'
                        : 'bg-white/80 border-emerald-100 text-slate-700 hover:bg-white'
                    }`}
                  >
                    <div className="font-bold">{item.en}</div>
                    <div className="font-urdu text-[11px] mt-0.5">{item.ur}</div>
                  </button>
                );
              })}
            </div>
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
                  <div className="font-black text-sm text-[#064E3B]">
                    {isCompressing ? 'Processing photo...' : 'Click to Upload Bill Photo / تصویر لگائیں'}
                  </div>
                  <div className="text-xs font-urdu font-bold text-emerald-950 mt-0.5">
                    موبائل کیمرے سے تصویر کھینچیں یا گیلری سے اپلوڈ کریں
                  </div>
                </div>
              </label>
            )}
          </div>

          {/* 2. Bill Reference ID (reference_no) */}
          <div>
            <label className="block text-xs sm:text-sm font-black text-slate-900 mb-1.5">
              2. Bill Reference ID / <span className="font-urdu font-bold text-emerald-800">بل کا ریفرنس نمبر</span>
            </label>
            <input
              type="text"
              required
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              placeholder="e.g. 14241150829100 (14 ہندسوں کا ریفرنس نمبر)"
              className="w-full px-4 py-3 bg-white rounded-xl text-sm font-mono border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-[#34D399] transition shadow-xs text-slate-900 font-bold"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Found on the bill so donors can directly enter it into electricity / gas banking portals.
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

          {/* 4. Optional Beneficiary Name & JazzCash/Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name / نام (اختیاری):
              </label>
              <input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="e.g. Muhammad Arshad"
                className="w-full px-3.5 py-2.5 bg-white rounded-xl text-xs border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-[#34D399]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Account / JazzCash (اختیاری رقم منتقلی):
              </label>
              <input
                type="text"
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value)}
                placeholder="e.g. 0301-8492019"
                className="w-full px-3.5 py-2.5 bg-white rounded-xl text-xs border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-[#34D399]"
              />
            </div>
          </div>

          {/* Submit Button (بل جمع کریں) */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isCompressing}
              className="clay-mint-btn w-full py-4 rounded-2xl text-base sm:text-lg font-black text-[#064E3B] flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-60"
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
              بل جمع ہوتے ہی براہ راست کلاؤڈ ڈیٹا بیس میں محفوظ ہو جائے گا
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
