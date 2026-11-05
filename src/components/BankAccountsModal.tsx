import React, { useState, useEffect } from 'react';
import { X, Building2, Plus, Trash2, Check, Copy, Star, AlertCircle, Smartphone } from 'lucide-react';
import { AppUser } from '../types/user';
import { PakistaniBankAccount, BankPreset } from '../types/bankAccount';
import {
  POPULAR_PAKISTANI_BANKS,
  getUserBankAccounts,
  saveUserBankAccount,
  deleteUserBankAccount,
  setDefaultBankAccount,
} from '../services/bankAccountService';

interface BankAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AppUser | null;
  onAccountsUpdated?: (accounts: PakistaniBankAccount[]) => void;
}

export const BankAccountsModal: React.FC<BankAccountsModalProps> = ({
  isOpen,
  onClose,
  user,
  onAccountsUpdated,
}) => {
  const [accounts, setAccounts] = useState<PakistaniBankAccount[]>([]);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [selectedBankId, setSelectedBankId] = useState<string>('jazzcash');
  const [customBankName, setCustomBankName] = useState<string>('');
  const [accountTitle, setAccountTitle] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [isDefault, setIsDefault] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    if (user?.id) {
      const loaded = getUserBankAccounts(user.id);
      setAccounts(loaded);
      if (onAccountsUpdated) onAccountsUpdated(loaded);
      if (loaded.length === 0) {
        setIsAddingNew(true);
      }
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleCopy = (accNum: string, id: string) => {
    navigator.clipboard.writeText(accNum);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!user?.id) {
      setErrorMsg('Please log in first to save bank accounts.');
      return;
    }

    if (!accountTitle.trim()) {
      setErrorMsg('Please enter Account Title / نام برائے اکاؤنٹ درج کریں');
      return;
    }

    if (!accountNumber.trim()) {
      setErrorMsg('Please enter Account / Mobile / IBAN Number / اکاؤنٹ نمبر درج کریں');
      return;
    }

    let finalBankName = '';
    const preset = POPULAR_PAKISTANI_BANKS.find((b) => b.id === selectedBankId);
    if (selectedBankId === 'other') {
      if (!customBankName.trim()) {
        setErrorMsg('Please specify bank name / بینک کا نام درج کریں');
        return;
      }
      finalBankName = customBankName.trim();
    } else {
      finalBankName = preset ? preset.nameEn : 'Pakistani Bank';
    }

    const updated = saveUserBankAccount(user.id, {
      bankName: finalBankName,
      accountTitle: accountTitle.trim(),
      accountNumber: accountNumber.trim(),
      isDefault: isDefault || accounts.length === 0,
    });

    setAccounts(updated);
    if (onAccountsUpdated) onAccountsUpdated(updated);

    // Reset form
    setAccountTitle('');
    setAccountNumber('');
    setCustomBankName('');
    setIsDefault(false);
    setIsAddingNew(false);
    setSuccessMsg('Bank account added successfully! / بینک اکاؤنٹ کامیابی سے شامل ہو گیا۔');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDelete = (accountId: string) => {
    if (!user?.id) return;
    const updated = deleteUserBankAccount(user.id, accountId);
    setAccounts(updated);
    if (onAccountsUpdated) onAccountsUpdated(updated);
  };

  const handleSetDefault = (accountId: string) => {
    if (!user?.id) return;
    const updated = setDefaultBankAccount(user.id, accountId);
    setAccounts(updated);
    if (onAccountsUpdated) onAccountsUpdated(updated);
  };

  const selectedPreset = POPULAR_PAKISTANI_BANKS.find((b) => b.id === selectedBankId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-green-card w-full max-w-xl rounded-3xl p-6 sm:p-7 relative my-8 border border-white/95 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-black hover:bg-white/80 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="clay-mint-icon w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
            <Building2 size={24} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Pakistani Bank & Wallet Accounts
            </div>
            <h3 className="text-xl font-black text-black">
              Manage Bank Accounts / <span className="font-urdu font-black text-emerald-950">بینک اکاؤنٹس</span>
            </h3>
            <p className="text-xs text-slate-600 font-urdu mt-0.5">
              یہاں آپ اپنے JazzCash، EasyPaisa، SadaPay یا کسی بھی بینک کے متعدد اکاؤنٹس محفوظ کر سکتے ہیں
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2">
            <Check size={16} className="text-emerald-700" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Action Bar: Current Count + Add Button */}
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-emerald-100">
          <div className="text-xs font-bold text-slate-700">
            Saved Accounts ({accounts.length}):
          </div>
          {!isAddingNew && (
            <button
              type="button"
              onClick={() => setIsAddingNew(true)}
              className="clay-mint-btn px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus size={14} />
              <span>Add Account / نیا اکاؤنٹ شامل کریں</span>
            </button>
          )}
        </div>

        {/* Form: Add New Account */}
        {isAddingNew && (
          <form
            onSubmit={handleAddAccount}
            className="mb-6 p-4 sm:p-5 bg-white/95 rounded-2xl border-2 border-emerald-300 shadow-sm space-y-4 animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Plus size={16} className="text-emerald-700" />
                <span>Add Pakistani Bank / Wallet / نیا اکاؤنٹ شامل کریں</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="text-xs text-slate-400 hover:text-slate-700 font-bold"
              >
                Cancel / بند کریں
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-1.5 font-bold">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Popular Wallets Quick Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select Bank / Wallet / بینک یا والیٹ منتخب کریں:
              </label>

              {/* Quick Wallet Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2.5">
                {POPULAR_PAKISTANI_BANKS.filter((b) => b.category === 'wallet').map((wallet) => (
                  <button
                    key={wallet.id}
                    type="button"
                    onClick={() => setSelectedBankId(wallet.id)}
                    className={`p-2 rounded-xl text-xs font-bold text-center border cursor-pointer transition-all flex flex-col items-center justify-center gap-0.5 ${
                      selectedBankId === wallet.id
                        ? 'clay-mint-btn font-black border-transparent shadow-xs'
                        : `${wallet.bgLight} border-slate-200 text-slate-700 hover:border-emerald-300`
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Smartphone size={11} />
                      <span>{wallet.nameEn}</span>
                    </div>
                    <span className="text-[10px] font-urdu opacity-80">{wallet.nameUr.split(' ')[0]}</span>
                  </button>
                ))}
              </div>

              {/* Full Bank Dropdown */}
              <select
                value={selectedBankId}
                onChange={(e) => setSelectedBankId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl text-xs font-bold border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-[#34D399]"
              >
                <optgroup label="Mobile Wallets / موبائل والٹس">
                  {POPULAR_PAKISTANI_BANKS.filter((b) => b.category === 'wallet').map((b) => (
                    <option key={b.id} value={b.id}>
                      📱 {b.nameEn} - {b.nameUr}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Pakistani Commercial Banks / کمرشل بینکس">
                  {POPULAR_PAKISTANI_BANKS.filter((b) => b.category === 'bank').map((b) => (
                    <option key={b.id} value={b.id}>
                      🏛️ {b.nameEn} - {b.nameUr}
                    </option>
                  ))}
                </optgroup>
              </select>

              {selectedBankId === 'other' && (
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    value={customBankName}
                    onChange={(e) => setCustomBankName(e.target.value)}
                    placeholder="Enter Bank Name / بینک کا نام درج کریں"
                    className="w-full px-3.5 py-2 bg-white rounded-xl text-xs border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-[#34D399]"
                  />
                </div>
              )}
            </div>

            {/* Account Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Account Title (Beneficiary Name) / <span className="font-urdu text-emerald-900">نام برائے اکاؤنٹ</span>:
              </label>
              <input
                type="text"
                required
                value={accountTitle}
                onChange={(e) => setAccountTitle(e.target.value)}
                placeholder="e.g. Muhammad Talha / محمد طلحہ"
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#34D399]"
              />
            </div>

            {/* Account / Mobile / IBAN Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Account / Mobile / IBAN Number / <span className="font-urdu text-emerald-900">اکاؤنٹ نمبر یا موبائل نمبر</span>:
              </label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder={
                  selectedPreset?.category === 'wallet'
                    ? 'e.g. 0301-8492019'
                    : 'e.g. PK36MEZN0001020304050607 یا 0102030405'
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl text-xs font-mono font-bold border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#34D399]"
              />
            </div>

            {/* Default Account Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="default-account-check"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <label htmlFor="default-account-check" className="text-xs font-bold text-slate-700 cursor-pointer">
                Set as Primary / Default Account (بل اپلوڈ میں بنیادی اکاؤنٹ کے طور پر دکھائیں)
              </label>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="clay-mint-btn flex-1 py-2.5 rounded-xl text-xs font-black text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Check size={14} className="stroke-[2.5]" />
                <span>Save Bank Account / اکاؤنٹ محفوظ کریں</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* List of Saved Bank Accounts */}
        {accounts.length === 0 && !isAddingNew ? (
          <div className="text-center py-8 bg-white/70 rounded-2xl border border-dashed border-emerald-300 p-6">
            <Building2 size={36} className="mx-auto text-emerald-600/70 mb-2" />
            <h4 className="text-sm font-black text-slate-800">
              No Bank Accounts Added Yet / کوئی اکاؤنٹ شامل نہیں ہے
            </h4>
            <p className="text-xs text-slate-600 font-urdu mt-1 max-w-sm mx-auto">
              آپ اپنے JazzCash، EasyPaisa یا بینک کا اکاؤنٹ شامل کریں تاکہ مخیر حضرات یا ضرورت پڑنے پر براہ راست رقم پہنچائی جا سکے۔
            </p>
            <button
              type="button"
              onClick={() => setIsAddingNew(true)}
              className="clay-mint-btn inline-flex items-center gap-1.5 mt-4 px-5 py-2.5 rounded-xl text-xs font-black text-white shadow-sm cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Your First Bank Account / پہلا اکاؤنٹ شامل کریں</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {accounts.map((acc) => {
              const preset = POPULAR_PAKISTANI_BANKS.find(
                (b) => b.nameEn.toLowerCase() === acc.bankName.toLowerCase() || b.id === acc.bankName.toLowerCase()
              );

              return (
                <div
                  key={acc.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    acc.isDefault
                      ? 'bg-emerald-50/90 border-emerald-400 shadow-xs'
                      : 'bg-white/95 border-emerald-200/80 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                        {preset?.shortCode || 'PK'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-black text-slate-900 truncate">
                            {acc.bankName}
                          </span>
                          {acc.isDefault && (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/80 px-2 py-0.2 rounded-full inline-flex items-center gap-0.5">
                              <Star size={10} className="fill-emerald-800" />
                              <span>Primary</span>
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-700 font-bold mt-0.5 truncate">
                          Title: <span className="text-slate-900">{acc.accountTitle}</span>
                        </div>
                        <div className="text-xs font-mono font-bold text-emerald-950 mt-0.5 break-all">
                          {acc.accountNumber}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopy(acc.accountNumber, acc.id)}
                        title="Copy Account Number / اکاؤنٹ نمبر کاپی کریں"
                        className="p-1.5 rounded-lg text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        {copiedId === acc.id ? <Check size={14} className="text-emerald-700" /> : <Copy size={14} />}
                      </button>

                      {!acc.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(acc.id)}
                          title="Make Primary / بنیادی اکاؤنٹ بنائیں"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                        >
                          <Star size={14} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(acc.id)}
                        title="Delete Account / اکاؤنٹ ختم کریں"
                        className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs text-slate-500">
          <span className="font-urdu">تمام اکاؤنٹس محفوظ طریقے سے رجسٹرڈ ہیں</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
          >
            Done / مکمل
          </button>
        </div>
      </div>
    </div>
  );
};
