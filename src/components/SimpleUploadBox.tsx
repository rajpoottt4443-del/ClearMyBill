import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, Clock, Image as ImageIcon, AlertCircle, X } from 'lucide-react';
import { BillItem } from '../types/bill';

interface SimpleUploadBoxProps {
  onBillSubmitted: (newBill: BillItem) => void;
}

export const SimpleUploadBox: React.FC<SimpleUploadBoxProps> = ({ onBillSubmitted }) => {
  const [personName, setPersonName] = useState<string>('');
  const [referenceId, setReferenceId] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [billType, setBillType] = useState<string>('Electricity Bill / بجلی کا بل');
  const [billPhotoData, setBillPhotoData] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setBillPhotoData(reader.result);
        }
      };
      reader.readAsDataURL(file);
      setErrorMsg('');
    }
  };

  const handleRemovePhoto = () => {
    setBillPhotoData('');
    setUploadedFileName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billPhotoData) {
      setErrorMsg('Please upload a photo of your bill / براہ کرم بل کی تصویر لگائیں');
      return;
    }
    if (!personName.trim()) {
      setErrorMsg('Please enter your Full Name / براہ کرم اپنا نام درج کریں');
      return;
    }
    if (!referenceId.trim()) {
      setErrorMsg('Please enter the Bill Reference ID / براہ کرم بل کا ریفرنس نمبر درج کریں');
      return;
    }
    if (!accountNumber.trim()) {
      setErrorMsg('Please enter your JazzCash, Easypaisa, or Account Number / براہ کرم اکاؤنٹ یا جیز کیش نمبر درج کریں');
      return;
    }

    const newBill: BillItem = {
      id: `bill-${Date.now()}`,
      personName: personName.trim(),
      referenceId: referenceId.trim(),
      accountNumber: accountNumber.trim(),
      accountType: accountNumber.toLowerCase().includes('jazz')
        ? 'JazzCash'
        : accountNumber.toLowerCase().includes('easy')
        ? 'Easypaisa'
        : 'Bank',
      billPhotoUrl: billPhotoData,
      billType: billType.split('/')[0].trim(),
      billTypeUrdu: billType.split('/')[1]?.trim() || 'بل',
      amount: amount.trim() ? (amount.includes('Rs') ? amount.trim() : `Rs. ${amount.trim()}`) : 'Rs. Required',
      uploadedAt: Date.now(),
      expiresAt: Date.now() + 48 * 60 * 60 * 1000,
      status: 'unpaid'
    };

    onBillSubmitted(newBill);

    // Reset inputs
    setPersonName('');
    setReferenceId('');
    setAccountNumber('');
    setAmount('');
    setBillPhotoData('');
    setUploadedFileName('');
    setErrorMsg('');
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
                48-Hour Relief Promise
              </div>
              <div className="text-xs sm:text-sm text-emerald-800 font-urdu font-bold mt-0.5">
                انشاءاللہ آپ کا بل 48 گھنٹے میں ادا ہو جائے گا
              </div>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-900 bg-white/70 px-3 py-1 rounded-full border border-emerald-300/60 shrink-0">
            100% Free · بلا معاوضہ خدمت
          </span>
        </div>

        {/* Form Title */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-emerald-100 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
              Upload Your Bill / بل اپلوڈ کریں
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Fill in 4 simple details below. Donors worldwide will pay it directly.
            </p>
          </div>
          <span className="text-xs font-urdu font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
            آسان 4 خانے
          </span>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Bill Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Bill Type / بل کی قسم
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

          {/* 1. Upload Bill Photo (بل کی تصویر لگائیں) */}
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
                    <span>Photo Attached / تصویر منسلک ہو گئی</span>
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
                    <span>Remove / تصویر تبدیل کریں</span>
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
                />
                <UploadCloud size={28} className="stroke-[2.5]" />
                <div className="text-left">
                  <div className="font-black text-sm text-[#064E3B]">
                    Click to Upload Bill Photo / تصویر لگائیں
                  </div>
                  <div className="text-xs font-urdu font-bold text-emerald-950 mt-0.5">
                    موبائل کیمرے سے تصویر کھینچیں یا گیلری سے اپلوڈ کریں
                  </div>
                </div>
              </label>
            )}
          </div>

          {/* 2. Full Name (اپنا نام لکھیں) */}
          <div>
            <label className="block text-xs sm:text-sm font-black text-slate-900 mb-1.5">
              2. Full Name / <span className="font-urdu font-bold text-emerald-800">اپنا نام لکھیں</span>
            </label>
            <input
              type="text"
              required
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="e.g. Muhammad Arshad / اپنا پورا نام لکھیں"
              className="w-full px-4 py-3 bg-white rounded-xl text-sm border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-[#34D399] transition shadow-xs text-slate-900 font-medium"
            />
          </div>

          {/* 3. Bill Reference ID (بل کا ریفرنس نمبر) */}
          <div>
            <label className="block text-xs sm:text-sm font-black text-slate-900 mb-1.5">
              3. Bill Reference ID / <span className="font-urdu font-bold text-emerald-800">بل کا ریفرنس نمبر</span>
            </label>
            <input
              type="text"
              required
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              placeholder="e.g. 14241150829100 (بل کے اوپر لکھا 14 ہندسوں کا ریفرنس نمبر)"
              className="w-full px-4 py-3 bg-white rounded-xl text-sm font-mono border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-[#34D399] transition shadow-xs text-slate-900 font-bold"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Donors use this Reference ID to pay your bill directly on utility portals or banking apps.
            </span>
          </div>

          {/* 4. Account / JazzCash / Easypaisa Number (اکاؤنٹ یا جیز کیش نمبر) */}
          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <label className="text-xs sm:text-sm font-black text-slate-900">
                4. Account / JazzCash / Easypaisa / <span className="font-urdu font-bold text-emerald-800">اکاؤنٹ یا جیز کیش نمبر</span>
              </label>
              <span className="text-[11px] text-emerald-700 font-bold">
                Direct Cash Option
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 0301-1234567 (JazzCash / Easypaisa / Bank)"
                  className="w-full px-4 py-3 bg-white rounded-xl text-sm border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-[#34D399] transition shadow-xs text-slate-900 font-medium"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Total Amount / بل کی رقم (Rs.)"
                  className="w-full px-4 py-3 bg-white rounded-xl text-sm border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-[#34D399] transition shadow-xs text-slate-900 font-bold"
                />
              </div>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              اگر کوئی ریفرنس نمبر کے ذریعے بل نہ بھر سکے تو وہ اس نمبر پر رقم بھیج سکتا ہے۔
            </span>
          </div>

          {/* Submit Button (بل جمع کریں) */}
          <div className="pt-2">
            <button
              type="submit"
              className="clay-mint-btn w-full py-4 rounded-2xl text-base sm:text-lg font-black text-[#064E3B] flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <CheckCircle2 size={22} className="stroke-[2.5]" />
              <span>Submit Bill / بل جمع کریں</span>
            </button>
            <div className="text-center text-[11px] text-slate-500 mt-2 font-urdu">
              بل جمع ہوتے ہی نیچے دیے گئے مدد کے منتظر بلوں میں شامل ہو جائے گا
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
