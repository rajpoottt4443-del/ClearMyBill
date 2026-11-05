import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, Loader2, ShieldCheck, Lock, LogIn } from 'lucide-react';
import { BillItem } from '../types/bill';
import { AppUser } from '../types/user';
import { isBillOwner, cleanDisplayReference } from '../services/billService';

interface DeleteConfirmModalProps {
  bill: BillItem | null;
  user: AppUser | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (billId: string) => Promise<void>;
  onOpenAuth?: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  bill,
  user,
  isOpen,
  onClose,
  onConfirmDelete,
  onOpenAuth,
}) => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen || !bill) return null;

  const isOwner = isBillOwner(bill, user);

  const handleDelete = async () => {
    setErrorMsg('');
    if (!isOwner) {
      setErrorMsg(
        'Access Denied: You must be logged into the verified creator account to delete this bill. / رسائی مسترد: صرف بل بنانے والا رجسٹرڈ اکاؤنٹ ہی اسے ڈیلیٹ کر سکتا ہے۔'
      );
      return;
    }

    setIsDeleting(true);
    try {
      await onConfirmDelete(bill.id);
      onClose();
    } catch (err: any) {
      console.error('Delete error:', err);
      setErrorMsg(err.message || 'Failed to delete bill.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedAmount =
    typeof bill.amount === 'number'
      ? `Rs. ${bill.amount.toLocaleString()}`
      : `Rs. ${bill.amount}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-green-card w-full max-w-md rounded-3xl p-6 sm:p-7 relative my-8 border border-white/95 shadow-2xl">
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-black hover:bg-white/80 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="text-center">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner ${
              isOwner ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {isOwner ? <Trash2 size={26} className="stroke-[2.2]" /> : <Lock size={26} className="stroke-[2.2]" />}
          </div>

          <h3 className="text-xl font-black text-black">
            {isOwner ? 'Delete Your Bill? / بل ڈیلیٹ کریں؟' : 'Account Owner Required / صرف اصل اکاؤنٹ'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-urdu leading-relaxed">
            {isOwner
              ? 'کیا آپ واقعی اس بل کو ڈیٹا بیس سے مستقل ڈیلیٹ کرنا چاہتے ہیں؟'
              : 'یہ بل محفوظ ہے۔ صرف اس بل کو اپلوڈ کرنے والا تصدیق شدہ اکاؤنٹ ہی اسے ڈیلیٹ کر سکتا ہے۔'}
          </p>
        </div>

        {/* Bill Summary */}
        <div className="bg-white/95 p-3.5 rounded-2xl border border-slate-200/90 my-4 space-y-1.5 text-xs">
          <div className="flex justify-between items-center text-slate-500">
            <span>Category / نوعیت:</span>
            <span className="font-bold text-slate-900">{bill.bill_type}</span>
          </div>
          <div className="flex justify-between items-center text-slate-500">
            <span>Reference ID / ریفرنس:</span>
            <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[200px]">
              {cleanDisplayReference(bill.reference_no)}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-700 font-bold border-t border-slate-100 pt-1.5 text-sm">
            <span>Amount / رقم:</span>
            <span className="text-rose-600 font-black">{formattedAmount}</span>
          </div>
        </div>

        {/* Ownership Status */}
        {isOwner ? (
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-950 flex items-start gap-2 mb-5">
            <ShieldCheck size={16} className="text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-emerald-900">Verified Creator Account / آپ کی ملکیت تصدیق شدہ ہے:</strong>
              This bill belongs to your logged-in account ({user?.fullName || user?.email}). It will be permanently removed.
            </div>
          </div>
        ) : (
          <div className="space-y-3 mb-5">
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-[11px] text-rose-900 flex items-start gap-2">
              <AlertTriangle size={15} className="text-rose-600 shrink-0 mt-0.5" />
              <span>
                <strong>Access Restricted:</strong> You must be logged into the specific account that created this bill. Anonymous deletion is completely disabled.
              </span>
            </div>

            {onOpenAuth && (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="text-xs text-emerald-800 hover:text-emerald-950 font-bold inline-flex items-center gap-1.5 underline cursor-pointer"
                >
                  <LogIn size={13} />
                  <span>Log In to Owner Account / اصل اکاؤنٹ میں لاگ ان کریں</span>
                </button>
              </div>
            )}
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold text-center">
            {errorMsg}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer"
          >
            Cancel / منسوخ کریں
          </button>

          <button
            type="button"
            disabled={isDeleting || !isOwner}
            onClick={handleDelete}
            className={`flex-1 py-3 rounded-2xl text-xs font-black transition-colors flex items-center justify-center gap-1.5 shadow-md ${
              isOwner
                ? 'text-white bg-rose-600 hover:bg-rose-700 cursor-pointer'
                : 'text-slate-400 bg-slate-200 cursor-not-allowed opacity-60'
            }`}
          >
            {isDeleting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Deleting... ڈیلیٹ ہو رہا ہے</span>
              </>
            ) : isOwner ? (
              <>
                <Trash2 size={15} />
                <span>Yes, Delete / ہاں، ڈیلیٹ کریں</span>
              </>
            ) : (
              <>
                <Lock size={14} />
                <span>Locked / غیر مجاز</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
