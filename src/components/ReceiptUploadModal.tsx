import React, { useState } from 'react';
import { X, UploadCloud, CheckCircle2, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BillItem } from '../types/bill';

interface ReceiptUploadModalProps {
  bill: BillItem | null;
  isOpen: boolean;
  onClose: () => void;
  onReceiptUploaded: (billId: string, receiptData: string, donorName?: string) => void;
}

export const ReceiptUploadModal: React.FC<ReceiptUploadModalProps> = ({
  bill,
  isOpen,
  onClose,
  onReceiptUploaded,
}) => {
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [donorName, setDonorName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen || !bill) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setReceiptImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
      setErrorMsg('');
    }
  };

  const handleConfirmReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptImage && !fileName) {
      setErrorMsg('Please upload payment receipt screenshot / براہ کرم ادائیگی کی رسید اپلوڈ کریں');
      return;
    }

    setIsSubmitting(true);

    // Multi-stage confetti celebration
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#34D399', '#A7F3D0', '#10B981', '#F8FAF9']
      });
    } catch (e) {
      // ignore
    }

    setTimeout(() => {
      setIsSubmitting(false);
      onReceiptUploaded(bill.id, receiptImage || 'payment_receipt.jpg', donorName.trim() || 'Kind Donor / مخیر بھائی');
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/55 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-green-card w-full max-w-lg rounded-3xl p-6 sm:p-8 relative my-8 border border-white/95 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-500 hover:text-black hover:bg-white/80 transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Modal Top */}
        <div className="text-center mb-6">
          <div className="clay-mint-icon w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 size={30} className="stroke-[2.5]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-black">
            Upload Payment Receipt / رسید اپلوڈ کریں
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-urdu">
            ادائیگی کی رسید اپلوڈ کریں تاکہ یہ بل ادا شدہ ریکارڈ کے طور پر ہمیشہ محفوظ ہو جائے
          </p>
        </div>

        {/* Bill Summary */}
        <div className="bg-white/90 p-4 rounded-2xl border border-emerald-200 mb-5 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-500">
            <span>Bill Category / بل کی قسم:</span>
            <span className="font-bold text-slate-900">{bill.bill_type}</span>
          </div>
          <div className="flex justify-between items-center text-slate-500">
            <span>Bill Reference / ریفرنس نمبر:</span>
            <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              {bill.reference_no}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-700 font-bold border-t border-slate-100 pt-2 text-sm">
            <span>Amount Paid / ادا شدہ رقم:</span>
            <span className="text-emerald-700 font-black">
              {typeof bill.amount === 'number' ? `Rs. ${bill.amount.toLocaleString()}` : `Rs. ${bill.amount}`}
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleConfirmReceipt} className="space-y-4">
          {/* Upload Area */}
          <div>
            <label className="block text-xs font-black text-slate-900 mb-1.5">
              Payment Screenshot / Receipt Photo (رسید کی تصویر)
            </label>

            <label className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-white/80 hover:bg-white rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all text-center">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <UploadCloud size={28} className="text-emerald-600 mb-2" />
              <span className="text-xs font-black text-slate-800">
                {fileName ? fileName : 'Click to Select Payment Screenshot / تصویر لگائیں'}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">
                JazzCash, Easypaisa, Banking App, or ATM receipt
              </span>
            </label>
          </div>

          {/* Donor Name or Anonymous */}
          <div>
            <label className="block text-xs font-black text-slate-900 mb-1">
              Donor Name / نام (اختیاری):
            </label>
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="e.g. Anonymous / گمنام بھائی یا اپنا نام"
              className="w-full px-3.5 py-2.5 bg-white rounded-xl text-xs border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-[#34D399]"
            />
          </div>

          {/* Paid Record Notice */}
          <div className="p-3 bg-emerald-50/90 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
            <ShieldCheck size={16} className="text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>Permanent Paid Record / مستقل محفوظ ریکارڈ:</strong> Submitting this receipt marks the bill as PAID and preserves your payment receipt screenshot permanently in the Cleared Bills Archive so all donors can see proof of relief!
            </div>
          </div>

          {/* Confirm Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="clay-mint-btn w-full py-3.5 rounded-2xl text-sm sm:text-base font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-60"
            >
              {isSubmitting ? (
                <span>Saving paid record... رسید اور ریکارڈ محفوظ ہو رہا ہے</span>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Confirm Receipt & Save to Paid Bills / رسید جمع اور ادا شدہ محفوظ کریں</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
