import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  Building2,
  Loader2,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BillItem } from '../types/bill';
import {
  cleanDisplayReference,
  extractBillBankAccount,
  extractPureReferenceNumber,
} from '../services/billService';
import { verifyPaymentReceipt } from '../services/receiptVerificationService';

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
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [verificationSuccess, setVerificationSuccess] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string>('');

  if (!isOpen || !bill) return null;

  const pureRef = extractPureReferenceNumber(bill.reference_no) || cleanDisplayReference(bill.reference_no);
  const attachedBank = extractBillBankAccount(bill.reference_no);

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setErrorMsg('');
      setVerificationSuccess('');
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setReceiptImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setReceiptImage('');
    setFileName('');
    setErrorMsg('');
    setVerificationSuccess('');
  };

  const handleConfirmReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptImage) {
      setErrorMsg('Please select a payment receipt screenshot / براہ کرم ادائیگی کی رسید منتخب کریں');
      return;
    }

    setErrorMsg('');
    setVerificationSuccess('');
    setIsVerifying(true);

    try {
      // Rigorous verification: check for authentic transaction receipt, TID, and provider
      const verification = await verifyPaymentReceipt(
        receiptImage,
        typeof bill.amount === 'number' ? bill.amount : parseFloat(String(bill.amount)),
        pureRef
      );

      if (!verification.isValid) {
        setIsVerifying(false);
        setErrorMsg(
          verification.reason ||
            'Fake or invalid receipt detected. Please upload an authentic payment screenshot with Transaction ID. / جعلی یا نامکمل رسید مسترد: برائے مہربانی درست ٹرانزیکشن رسید اپلوڈ کریں۔'
        );
        return;
      }

      // Verification passed!
      setVerificationSuccess(
        `✓ ${verification.reason || 'Verified authentic payment receipt'} (${verification.detectedProvider || 'Receipt Confirmed'})`
      );
      setIsVerifying(false);
      setIsSubmitting(true);

      // Multi-stage confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#059669', '#34D399', '#A7F3D0', '#10B981', '#064E3B'],
        });
      } catch {
        // ignore
      }

      setTimeout(() => {
        setIsSubmitting(false);
        onReceiptUploaded(
          bill.id,
          receiptImage,
          donorName.trim() || 'Kind Donor / مخیر بھائی'
        );
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Receipt verification process failed:', err);
      setIsVerifying(false);
      setErrorMsg(
        err.message ||
          'Failed to verify receipt authenticity. Please try again. / رسید کی تصدیق میں مسئلہ پیش آیا۔'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-green-card w-full max-w-lg rounded-3xl p-6 sm:p-8 relative my-8 border border-white/95 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-500 hover:text-black hover:bg-white/80 transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Modal Top */}
        <div className="text-center mb-5">
          <div className="clay-mint-icon w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 size={30} className="stroke-[2.5]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-black">
            Upload Payment Receipt / رسید اپلوڈ کریں
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-urdu">
            ادائیگی کی درست رسید اپلوڈ کریں۔ ہر رسید کو محفوظ کرنے سے پہلے سخت تصدیق سے گزارا جاتا ہے۔
          </p>
        </div>

        {/* Clean Bill Summary (No raw metadata tags leaking!) */}
        <div className="bg-white/95 p-4 rounded-2xl border border-emerald-200 mb-5 space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-slate-500">
            <span>Bill Category / بل کی قسم:</span>
            <span className="font-bold text-slate-900">{bill.bill_type}</span>
          </div>

          {/* Clean Bill Reference with Copy Button */}
          <div className="flex justify-between items-center text-slate-500 gap-2">
            <span className="shrink-0">Bill Reference / ریفرنس نمبر:</span>
            <div className="flex items-center gap-1.5 max-w-[65%]">
              <span className="font-mono font-bold text-emerald-950 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 truncate">
                {pureRef || 'N/A'}
              </span>
              {pureRef && (
                <button
                  type="button"
                  onClick={() => handleCopy(pureRef, 'ref')}
                  className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold rounded text-[10px] flex items-center gap-1 shrink-0 cursor-pointer"
                  title="Copy Reference"
                >
                  {copiedField === 'ref' ? <Check size={11} /> : <Copy size={11} />}
                  <span>{copiedField === 'ref' ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Clean Attached Bank Details (if present) */}
          {attachedBank && (
            <div className="p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-200 space-y-1">
              <div className="flex items-center justify-between text-emerald-900 font-bold text-[11px]">
                <span className="flex items-center gap-1">
                  <Building2 size={12} className="text-emerald-700" />
                  <span>{attachedBank.bankName}</span>
                </span>
                <span className="text-[10px] text-slate-600 font-normal">
                  Title: {attachedBank.accountTitle}
                </span>
              </div>
              <div className="flex items-center justify-between text-emerald-950 font-mono text-xs">
                <span className="font-bold">{attachedBank.accountNumber}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(attachedBank.accountNumber, 'bank')}
                  className="px-2 py-0.5 bg-white hover:bg-emerald-100 border border-emerald-200 rounded text-[10px] font-bold text-emerald-900 flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === 'bank' ? <Check size={11} /> : <Copy size={11} />}
                  <span>{copiedField === 'bank' ? 'Copied' : 'Copy Acc'}</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center text-slate-800 font-bold border-t border-slate-100 pt-2 text-sm">
            <span>Amount Paid / ادا شدہ رقم:</span>
            <span className="text-emerald-700 font-black">
              {typeof bill.amount === 'number'
                ? `Rs. ${bill.amount.toLocaleString()}`
                : `Rs. ${bill.amount}`}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-start gap-2 shadow-2xs">
            <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <strong>Verification Rejected / رسید مسترد:</strong>
              <div className="mt-0.5 font-urdu">{errorMsg}</div>
            </div>
          </div>
        )}

        {/* Verification Success Alert */}
        {verificationSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
            <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
            <div className="font-bold">{verificationSuccess}</div>
          </div>
        )}

        <form onSubmit={handleConfirmReceipt} className="space-y-4">
          {/* Upload Area / Image Preview */}
          <div>
            <label className="block text-xs font-black text-slate-900 mb-1.5">
              Payment Screenshot / Receipt Photo (رسید کی تصویر)
            </label>

            {receiptImage ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-400 bg-emerald-50/60 p-2">
                <div className="max-h-48 flex items-center justify-center overflow-hidden rounded-xl bg-black/5">
                  <img
                    src={receiptImage}
                    alt="Uploaded receipt preview"
                    className="max-h-44 object-contain"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between px-2 text-xs">
                  <span className="font-mono text-slate-700 font-bold truncate max-w-[200px]">
                    {fileName || 'Receipt Screenshot'}
                  </span>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Change Photo / تبدیل کریں</span>
                  </button>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-white/80 hover:bg-white rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <UploadCloud size={28} className="text-emerald-600 mb-2" />
                <span className="text-xs font-black text-slate-800">
                  Click to Select Payment Screenshot / تصویر لگائیں
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  JazzCash, Easypaisa, SadaPay, Banking App, or ATM receipt
                </span>
              </label>
            )}
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

          {/* Verification & Anti-Fake Guard Notice */}
          <div className="p-3 bg-emerald-50/90 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
            <ShieldCheck size={16} className="text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>100% Anti-Fake Verification / مکمل تصدیق شدہ رسید:</strong>
              <div>
                Each receipt is verified for authenticity before saving. Fake or blank screenshots are immediately rejected.
              </div>
              <div className="font-urdu text-[11px] text-emerald-950 mt-0.5">
                جعلی یا غلط تصویر قطعی محفوظ نہیں ہوگی۔ صرف تصدیق شدہ رسید ہی قبول کی جائے گی۔
              </div>
            </div>
          </div>

          {/* Confirm Button with Verification Indicator */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isVerifying || isSubmitting}
              className="clay-mint-btn w-full py-3.5 rounded-2xl text-sm sm:text-base font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-60"
            >
              {isVerifying ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin text-emerald-900" />
                  <span>Verifying Receipt Authenticity... رسید کی تصدیق جاری ہے</span>
                </div>
              ) : isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin text-emerald-900" />
                  <span>Saving Paid Record... ریکارڈ محفوظ ہو رہا ہے</span>
                </div>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Verify Receipt & Save to Paid Bills / تصدیق اور ادا شدہ محفوظ کریں</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
