import React, { useState } from 'react';
import { X, Copy, Check, Trash2 } from 'lucide-react';
import { BillItem } from '../types/bill';
import { BillPhotoPreview } from './BillPhotoPreview';
import { cleanDisplayReference } from '../services/billService';

interface BillZoomModalProps {
  bill: BillItem | null;
  isOpen: boolean;
  onClose: () => void;
  onPayClick: (bill: BillItem) => void;
  onDeleteClick?: (bill: BillItem) => void;
}

export const BillZoomModal: React.FC<BillZoomModalProps> = ({
  bill,
  isOpen,
  onClose,
  onPayClick,
  onDeleteClick,
}) => {
  const [copiedRef, setCopiedRef] = useState(false);

  if (!isOpen || !bill) return null;

  const displayRef = cleanDisplayReference(bill.reference_no);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(cleanDisplayReference(text));
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const formattedAmount =
    typeof bill.amount === 'number'
      ? `Rs. ${bill.amount.toLocaleString()}`
      : `Rs. ${bill.amount}`;

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
            {bill.bill_type}
          </h3>
          <div className="text-xs text-slate-600 mt-0.5">
            Amount: <strong className="text-emerald-800 text-sm">{formattedAmount}</strong>
          </div>
        </div>

        {/* Large Bill Preview */}
        <div className="my-4">
          <BillPhotoPreview
            photoKey={bill.image_url}
            referenceId={displayRef}
            amount={bill.amount}
            billType={bill.bill_type}
            className="w-full"
          />
        </div>

        {/* 1-Click Copy Reference ID */}
        <div className="my-4">
          <div className="bg-white/90 p-3.5 rounded-2xl border border-emerald-200 flex items-center justify-between">
            <div className="truncate mr-2">
              <span className="text-[10px] font-bold text-slate-500 block">
                Bill Reference ID / بل کا ریفرنس نمبر
              </span>
              <span className="font-mono font-bold text-sm text-slate-900 truncate block">
                {displayRef}
              </span>
            </div>
            <button
              onClick={() => handleCopy(bill.reference_no)}
              className="clay-mint-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              {copiedRef ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedRef ? 'Copied' : 'Copy Ref ID'}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 pt-3 border-t border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onDeleteClick && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDeleteClick(bill);
                }}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                title="Delete this bill / بل ڈیلیٹ کریں"
              >
                <Trash2 size={14} />
                <span>Delete Bill / بل ڈیلیٹ کریں</span>
              </button>
            )}
            <div className="text-xs text-slate-600 font-urdu text-center sm:text-left">
              بل ادا کرنے کے بعد رسید اپلوڈ کریں تاکہ بل فوراً ہٹ جائے
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              onPayClick(bill);
            }}
            className="clay-mint-btn w-full sm:w-auto px-6 py-3 rounded-full text-xs sm:text-sm font-black text-[#064E3B] flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span>I Paid This - Upload Receipt / رسید اپلوڈ کریں</span>
          </button>
        </div>
      </div>
    </div>
  );
};
