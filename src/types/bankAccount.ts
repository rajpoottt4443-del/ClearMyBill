export interface PakistaniBankAccount {
  id: string;
  userId: string;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  isDefault?: boolean;
  notes?: string;
  createdAt: string;
}

export interface BankPreset {
  id: string;
  nameEn: string;
  nameUr: string;
  category: 'wallet' | 'bank';
  shortCode: string;
  color: string;
  bgLight: string;
}
