import { PakistaniBankAccount, BankPreset } from '../types/bankAccount';

const BANK_STORAGE_KEY_PREFIX = 'clearmybill_user_banks_';

export const POPULAR_PAKISTANI_BANKS: BankPreset[] = [
  {
    id: 'easypaisa',
    nameEn: 'EasyPaisa',
    nameUr: 'ایزی پیسہ (موبائل والیٹ)',
    category: 'wallet',
    shortCode: 'EP',
    color: 'text-emerald-700 border-emerald-300',
    bgLight: 'bg-emerald-50',
  },
  {
    id: 'jazzcash',
    nameEn: 'JazzCash',
    nameUr: 'جاز کیش (موبائل والیٹ)',
    category: 'wallet',
    shortCode: 'JC',
    color: 'text-rose-700 border-rose-300',
    bgLight: 'bg-rose-50',
  },
  {
    id: 'sadapay',
    nameEn: 'SadaPay',
    nameUr: 'سادہ پے (ڈیجیٹل والیٹ)',
    category: 'wallet',
    shortCode: 'SP',
    color: 'text-amber-700 border-amber-300',
    bgLight: 'bg-amber-50',
  },
  {
    id: 'nayapay',
    nameEn: 'NayaPay',
    nameUr: 'نیا پے (ڈیجیٹل والیٹ)',
    category: 'wallet',
    shortCode: 'NP',
    color: 'text-orange-700 border-orange-300',
    bgLight: 'bg-orange-50',
  },
  {
    id: 'meezan',
    nameEn: 'Meezan Bank',
    nameUr: 'میزان بینک (اسلامک بینکنگ)',
    category: 'bank',
    shortCode: 'MBL',
    color: 'text-indigo-800 border-indigo-300',
    bgLight: 'bg-indigo-50',
  },
  {
    id: 'hbl',
    nameEn: 'HBL (Habib Bank Limited)',
    nameUr: 'حبیب بینک لمیٹڈ',
    category: 'bank',
    shortCode: 'HBL',
    color: 'text-teal-800 border-teal-300',
    bgLight: 'bg-teal-50',
  },
  {
    id: 'ubl',
    nameEn: 'UBL (United Bank Limited)',
    nameUr: 'یونائیٹڈ بینک لمیٹڈ',
    category: 'bank',
    shortCode: 'UBL',
    color: 'text-blue-800 border-blue-300',
    bgLight: 'bg-blue-50',
  },
  {
    id: 'mcb',
    nameEn: 'MCB Bank',
    nameUr: 'ایم سی بی بینک',
    category: 'bank',
    shortCode: 'MCB',
    color: 'text-orange-800 border-orange-300',
    bgLight: 'bg-orange-50',
  },
  {
    id: 'alfalah',
    nameEn: 'Bank Alfalah',
    nameUr: 'بینک الفلاح',
    category: 'bank',
    shortCode: 'BAFL',
    color: 'text-red-800 border-red-300',
    bgLight: 'bg-red-50',
  },
  {
    id: 'abl',
    nameEn: 'Allied Bank (ABL)',
    nameUr: 'الائیڈ بینک لمیٹڈ',
    category: 'bank',
    shortCode: 'ABL',
    color: 'text-sky-800 border-sky-300',
    bgLight: 'bg-sky-50',
  },
  {
    id: 'nbp',
    nameEn: 'National Bank of Pakistan (NBP)',
    nameUr: 'نیشنل بینک آف پاکستان',
    category: 'bank',
    shortCode: 'NBP',
    color: 'text-emerald-900 border-emerald-400',
    bgLight: 'bg-emerald-50',
  },
  {
    id: 'faysal',
    nameEn: 'Faysal Bank',
    nameUr: 'فیصل بینک',
    category: 'bank',
    shortCode: 'FBL',
    color: 'text-purple-800 border-purple-300',
    bgLight: 'bg-purple-50',
  },
  {
    id: 'askari',
    nameEn: 'Askari Bank',
    nameUr: 'عسکری بینک',
    category: 'bank',
    shortCode: 'AKBL',
    color: 'text-cyan-800 border-cyan-300',
    bgLight: 'bg-cyan-50',
  },
  {
    id: 'bop',
    nameEn: 'Bank of Punjab (BOP)',
    nameUr: 'بینک آف پنجاب',
    category: 'bank',
    shortCode: 'BOP',
    color: 'text-yellow-800 border-yellow-300',
    bgLight: 'bg-yellow-50',
  },
  {
    id: 'other',
    nameEn: 'Other Pakistani Bank',
    nameUr: 'دیگر پاکستانی بینک / اکاؤنٹ',
    category: 'bank',
    shortCode: 'BANK',
    color: 'text-slate-800 border-slate-300',
    bgLight: 'bg-slate-50',
  },
];

function getStorageKey(userId: string): string {
  return `${BANK_STORAGE_KEY_PREFIX}${userId.toLowerCase().trim()}`;
}

export function getUserBankAccounts(userId?: string | null): PakistaniBankAccount[] {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    const accounts: PakistaniBankAccount[] = JSON.parse(raw);
    return Array.isArray(accounts) ? accounts : [];
  } catch (err) {
    console.error('Error fetching user bank accounts:', err);
    return [];
  }
}

export function saveUserBankAccount(
  userId: string,
  data: Omit<PakistaniBankAccount, 'id' | 'createdAt' | 'userId'>
): PakistaniBankAccount[] {
  if (!userId) return [];
  const existing = getUserBankAccounts(userId);

  const newAccount: PakistaniBankAccount = {
    id: `bank_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId,
    bankName: data.bankName.trim(),
    accountTitle: data.accountTitle.trim(),
    accountNumber: data.accountNumber.trim(),
    isDefault: data.isDefault || existing.length === 0,
    notes: data.notes?.trim() || '',
    createdAt: new Date().toISOString(),
  };

  let updated = [...existing];
  // If set to default, unmark other defaults
  if (newAccount.isDefault) {
    updated = updated.map((acc) => ({ ...acc, isDefault: false }));
  }

  updated.unshift(newAccount);

  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving bank account:', err);
  }

  return updated;
}

export function deleteUserBankAccount(userId: string, accountId: string): PakistaniBankAccount[] {
  if (!userId) return [];
  const existing = getUserBankAccounts(userId);
  const updated = existing.filter((acc) => acc.id !== accountId);

  // If we deleted the default account and there are remaining accounts, make the first one default
  if (updated.length > 0 && !updated.some((acc) => acc.isDefault)) {
    updated[0].isDefault = true;
  }

  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
  } catch (err) {
    console.error('Error deleting bank account:', err);
  }

  return updated;
}

export function setDefaultBankAccount(userId: string, accountId: string): PakistaniBankAccount[] {
  if (!userId) return [];
  const existing = getUserBankAccounts(userId);
  const updated = existing.map((acc) => ({
    ...acc,
    isDefault: acc.id === accountId,
  }));

  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
  } catch (err) {
    console.error('Error updating default bank account:', err);
  }

  return updated;
}

export function formatBankAccountDisplay(account: PakistaniBankAccount): string {
  return `${account.bankName} | ${account.accountTitle} (${account.accountNumber})`;
}

/**
 * Encodes a bank account into reference metadata so donors can see it:
 * e.g. [Bank:JazzCash|Title:Talha|Acc:03018492019]
 */
export function encodeBankAccountInReference(account: PakistaniBankAccount): string {
  const cleanBank = account.bankName.replace(/[|\][]/g, '').trim();
  const cleanTitle = account.accountTitle.replace(/[|\][]/g, '').trim();
  const cleanAcc = account.accountNumber.replace(/[|\][]/g, '').trim();
  return `[Bank:${cleanBank}|Title:${cleanTitle}|Acc:${cleanAcc}]`;
}

/**
 * Extracts attached bank account metadata from reference string if present
 */
export function extractBillBankAccount(
  referenceNo: string
): { bankName: string; accountTitle: string; accountNumber: string } | null {
  if (!referenceNo) return null;
  const match = referenceNo.match(/\[Bank:([^|\]]+)\|Title:([^|\]]+)\|Acc:([^|\]]+)\]/);
  if (match) {
    return {
      bankName: match[1].trim(),
      accountTitle: match[2].trim(),
      accountNumber: match[3].trim(),
    };
  }
  return null;
}
