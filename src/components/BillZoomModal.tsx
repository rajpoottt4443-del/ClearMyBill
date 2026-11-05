import React, { useState } from 'react';
import { X, Copy, Check, Building2 } from 'lucide-react';
import { BillItem } from '../types/bill';
import { AppUser } from '../types/user';
import { BillPhotoPreview } from './BillPhotoPreview';
import { cleanDisplayReference, extractBillBankAccount, isBillAutoVerified } from '../services/billService';
import { CheckCircle2 } from 'lucide-react';

interface BillZoomModalProps {
  bill: BillItem | null;
  isOpen: boolean;
  onClose: () => void;
  onPayClick: (bill: BillItem) => void;
  user?: AppUser | null;
}

export const BillZoomModal: React.FC<BillZoomModalProps> = ({
  bill,
  isOpen,
  onClose,
  onPayClick,
}) => {
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);

  if (!isOpen || !bill) return null;

  const displayRef = cleanDisplayReference(bill.reference_no);
  const attachedBank = extractBillBankAccount(bill.reference_no);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(cleanDisplayReference(text));
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleCopyBank = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
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

          {/* Attached Beneficiary Receiving Pakistani Bank Account (JazzCash / EasyPaisa / Bank) */}
          {attachedBank && (
            <div className="mt-3 bg-emerald-50/90 p-3.5 rounded-2xl border border-emerald-300 flex items-center justify-between">
              <div className="truncate mr-2">
                <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                  <Building2 size={12} className="text-emerald-700" />
                  <span>Direct Transfer / JazzCash / EasyPaisa / بینک اکاؤنٹ:</span>
                </span>
                <span className="text-xs font-bold text-slate-800 block mt-0.5 truncate">
                  {attachedBank.bankName} · {attachedBank.accountTitle}
                </span>
                <span className="font-mono font-bold text-sm text-emerald-950 block truncate">
                  {attachedBank.accountNumber}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyBank(attachedBank.accountNumber)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-emerald-100 border border-emerald-200 text-emerald-900 flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
              >
                {copiedBank ? <Check size={14} className="text-emerald-700" /> : <Copy size={14} />}
                <span>{copiedBank ? 'Copied' : 'Copy Acc'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons: If already verified & paid, hide upload/verification option permanently */}
        <div className="mt-5 pt-3 border-t border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          {isBillAutoVerified(bill) || bill.status === 'paid' ? (
            <div className="w-full p-3.5 bg-emerald-50 rounded-2xl border border-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-700" />
                <div>
                  <span className="text-xs sm:text-sm font-black text-emerald-950 block">
                    100% Auto-Verified & Paid / خودکار تصدیق شدہ اور ادا شدہ
                  </span>
                  <span className="text-[10px] text-emerald-800 font-urdu block">
                    ریفرنس، نام اور رقم کی تصدیق مکمل ہو چکی ہے۔
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-white px-3 py-1 rounded-full border border-emerald-200 shrink-0">
                Verified & Locked / تصدیق مکمل
              </span>
            </div>
          ) : (
            <>
              <div className="text-xs text-slate-600 font-urdu text-center sm:text-left">
                بل ادا کرنے کے بعد رسید لگائیں تاکہ ریفرنس، نام اور رقم کی خودکار تصدیق کے بعد ریکارڈ محفوظ ہو
              </div>
              <button
                onClick={() => {
                  onClose();
                  onPayClick(bill);
                }}
                className="clay-mint-btn w-full sm:w-auto px-6 py-3 rounded-full text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>I Paid This - Auto-Verify / رسید اپلوڈ کریں</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
