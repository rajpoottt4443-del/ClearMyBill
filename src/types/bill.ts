export interface BillItem {
  id: string;
  personName: string;
  referenceId: string;
  accountNumber: string;
  accountType?: 'JazzCash' | 'Easypaisa' | 'Bank' | 'Direct Reference';
  billPhotoUrl: string;
  billType: string;
  billTypeUrdu: string;
  amount: string;
  uploadedAt: number; // Date.now()
  expiresAt: number;  // 48 hours from upload
  status: 'unpaid' | 'paid_removed';
  paidReceiptUrl?: string;
  paidAt?: number;
  donorNote?: string;
}

export interface NewBillInput {
  personName: string;
  referenceId: string;
  accountNumber: string;
  billPhotoUrl: string;
  billType: string;
  billTypeUrdu: string;
  amount: string;
}
