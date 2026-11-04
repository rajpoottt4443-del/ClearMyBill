import React, { useState } from 'react';
import { X, Copy, Check, ShieldCheck, Download } from 'lucide-react';
import { BillItem } from '../types/bill';
import { BillPhotoPreview } from './BillPhotoPreview';

interface BillZoomModalProps {
  bill: BillItem | null;
  isOpen: boolean;
  onClose: () => void;
  onPayClick: (bill: BillItem) => void;
}

export const BillZoomModal: React.FC<BillZoomModalProps> = ({
  bill,
  isOpen,
  onClose,
  onPayClick,
}) => {
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  if (!isOpen || !bill) return null;

  const handleCopy = (text: string, isRef: boolean) => {
    navigator.clipboard.writeText(text);
    if (isRef) {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } else {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/55 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-green-card w-full max-w-2xl rounded-3xl p-6 sm:p-8 relative my-8 border border-white/90 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-500 hover:text-black hover:bg-white/80 transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-4">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Bill Photo & Verification / بل کی مکمل تفصیل
          </div>
          <h3 className="text-xl font-black text-black mt-0.5">
            {bill.personName}
          </h3>
          <div className="text-xs text-slate-600 mt-0.5">
            {bill.billType} ({bill.billTypeUrdu}) · Amount: <strong className="text-emerald-800 text-sm">{bill.amount}</strong>
          </div>
        </div>

        {/* Large Bill Preview */}
        <div className="my-4">
          <BillPhotoPreview
            photoKey={bill.billPhotoUrl}
            referenceId={bill.referenceId}
            personName={bill.personName}
            amount={bill.amount}
            billType={bill.billType}
            className="w-full"
          />
        </div>

        {/* 1-Click Copy Reference ID & Account */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
          <div className="bg-white/90 p-3 rounded-2xl border border-emerald-200 flex items-center justify-between">
            <div className="truncate mr-2">
              <span className="text-[10px] font-bold text-slate-500 block">
                Bill Reference ID / بل کا ریفرنس
              </span>
              <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 truncate block">
                {bill.referenceId}
              </span>
            </div>
            <button
              onClick={() => handleCopy(bill.referenceId, true)}
              className="clay-mint-btn px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
            >
              {copiedRef ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedRef ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="bg-white/90 p-3 rounded-2xl border border-emerald-200 flex items-center justify-between">
            <div className="truncate mr-2">
              <span className="text-[10px] font-bold text-slate-500 block">
                Account / JazzCash / اکاؤنٹ نمبر
              </span>
              <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 truncate block">
                {bill.accountNumber}
              </span>
            </div>
            <button
              onClick={() => handleCopy(bill.accountNumber, false)}
              className="clay-mint-btn px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
            >
              {copiedAccount ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedAccount ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5 pt-3 border-t border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 font-urdu text-center sm:text-left">
            بل ادا کرنے کے بعد رسید اپلوڈ کریں تاکہ بل فوراً ہٹ جائے
          </div>
          <button
            onClick={() => {
              onClose();
              onPayClick(bill);
            }}
            className="clay-mint-btn w-full sm:w-auto px-6 py-3 rounded-full text-xs sm:text-sm font-black text-[#064E3B] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>I Paid This - Upload Receipt / رسید اپلوڈ کریں</span>
          </button>
        </div>
      </div>
    </div>
  );
};
