import { supabase } from '../lib/supabase';
import { BillItem, NewBillPayload } from '../types/bill';
import { AppUser } from '../types/user';

export async function fetchUnpaidBills(): Promise<BillItem[]> {
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .eq('status', 'unpaid')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching unpaid bills from Supabase:', error);
    throw error;
  }
  return data || [];
}

export async function fetchPaidBills(): Promise<BillItem[]> {
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .eq('status', 'paid')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching paid bills from Supabase:', error);
    throw error;
  }
  return data || [];
}

export async function insertBill(payload: NewBillPayload): Promise<BillItem> {
  const { data, error } = await supabase
    .from('bills')
    .insert([
      {
        bill_type: payload.bill_type,
        amount: payload.amount,
        reference_no: payload.reference_no,
        image_url: payload.image_url,
        status: payload.status || 'unpaid',
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error inserting bill to Supabase:', error);
    throw error;
  }

  return data;
}

export async function markBillAsPaid(
  billId: string,
  receiptImageUrl?: string,
  donorName?: string,
  currentReferenceNo?: string
): Promise<void> {
  const updateData: Record<string, any> = {
    status: 'paid',
  };

  // Permanently save the payment receipt screenshot in the database record
  if (receiptImageUrl) {
    updateData.image_url = receiptImageUrl;
  }

  // Permanently record donor name/details and AutoVerified status into reference_no
  if (currentReferenceNo) {
    const paidTag = donorName ? `[Paid by: ${donorName}] [AutoVerified]` : '[Paid / ادا شدہ] [AutoVerified]';
    if (!currentReferenceNo.includes('[Paid')) {
      updateData.reference_no = `${currentReferenceNo} ${paidTag}`;
    } else if (!currentReferenceNo.includes('[AutoVerified]')) {
      updateData.reference_no = `${currentReferenceNo} [AutoVerified]`;
    }
  }

  const { error } = await supabase
    .from('bills')
    .update(updateData)
    .eq('id', billId);

  if (error) {
    console.error('Error marking bill as paid in Supabase:', error);
    throw error;
  }
}

/**
 * Strictly deletes a bill ONLY after 100% verified creator account ownership:
 * - Current logged-in user matches the bill creator (user ID or verified email)
 * All other options (PIN or anonymous device) are strictly removed.
 */
export async function deleteBill(
  billId: string,
  user?: AppUser | null,
  targetBill?: BillItem
): Promise<void> {
  if (!user || (targetBill && !isBillOwner(targetBill, user))) {
    throw new Error(
      'Access Denied: You must be logged into the verified creator account to delete this bill. / رسائی مسترد: صرف بل کا اصل بنانے والا اکاؤنٹ ہی اسے ڈیلیٹ کر سکتا ہے۔'
    );
  }

  const { error } = await supabase
    .from('bills')
    .delete()
    .eq('id', billId);

  if (error) {
    console.error('Error deleting bill from Supabase:', error);
    throw error;
  }
}

/**
 * Strictly checks whether the current user is authorized to delete this bill:
 * 1. Logged-in user matches [Owner:<userId>] in reference metadata.
 * 2. Logged-in user matches [User:<email>] in reference metadata.
 *
 * ONLY accounts that created the bill can delete it. Strangers cannot delete any bill.
 */
export function isBillOwner(
  bill: BillItem,
  user: AppUser | null
): boolean {
  if (!bill || !user) return false;

  const ref = bill.reference_no || '';

  // 1. Logged in user matches [Owner:userId]
  if (user.id && ref.includes(`[Owner:${user.id}]`)) {
    return true;
  }

  // 2. Logged in user matches [User:email]
  if (user.email && ref.includes(`[User:${user.email.toLowerCase().trim()}]`)) {
    return true;
  }

  return false;
}

/**
 * Checks if the bill has a registered owner user ID or email tag
 */
export function hasBillOwnerAccount(bill: BillItem): boolean {
  const ref = bill.reference_no || '';
  return ref.includes('[Owner:') || ref.includes('[User:');
}

/**
 * Extracts pure clean bill reference number without any metadata or accounts
 */
export function extractPureReferenceNumber(referenceNo: string): string {
  if (!referenceNo) return '';
  return referenceNo
    .replace(/\[Owner:[^\]]+\]/g, '')
    .replace(/\[User:[^\]]+\]/g, '')
    .replace(/\[PIN:[^\]]+\]/g, '')
    .replace(/\[Bank:[^\]]+\]/g, '')
    .replace(/\[Paid[^\]]*\]/g, '')
    .replace(/\[AutoVerified\]/g, '')
    .replace(/\([^)]*\)/g, '')
    .trim();
}

/**
 * Cleans the reference number for public display so internal [Owner:...], [User:...], [PIN:...],
 * [Paid...], [AutoVerified], and inline extra text are completely hidden from the main reference field,
 * preventing any overflowing or leaking internal tags.
 */
export function cleanDisplayReference(referenceNo: string): string {
  if (!referenceNo) return '';
  const pure = extractPureReferenceNumber(referenceNo);
  if (pure) return pure;
  return referenceNo
    .replace(/\[Owner:[^\]]+\]/g, '')
    .replace(/\[User:[^\]]+\]/g, '')
    .replace(/\[PIN:[^\]]+\]/g, '')
    .replace(/\[Bank:[^\]]+\]/g, '')
    .replace(/\[Paid[^\]]*\]/g, '')
    .replace(/\[AutoVerified\]/g, '')
    .trim();
}

/**
 * Extracts attached bank account metadata from reference string if present
 */
export function extractBillBankAccount(
  referenceNo: string
): { bankName: string; accountTitle: string; accountNumber: string } | null {
  if (!referenceNo) return null;

  // 1. Check structured tag [Bank:...|Title:...|Acc:...]
  const match = referenceNo.match(/\[Bank:([^|\]]+)\|Title:([^|\]]+)\|Acc:([^|\]]+)\]/);
  if (match) {
    return {
      bankName: match[1].trim(),
      accountTitle: match[2].trim(),
      accountNumber: match[3].trim(),
    };
  }

  // 2. Check legacy inline tag (Name: ... | Acc: ...)
  const legacyMatch = referenceNo.match(/\(Name:\s*([^|)]+)\s*\|\s*Acc:\s*([^)]+)\)/);
  if (legacyMatch) {
    const rawAcc = legacyMatch[2].trim();
    let bank = 'Direct Account';
    let num = rawAcc;
    if (rawAcc.includes(':')) {
      const parts = rawAcc.split(':');
      bank = parts[0].trim();
      num = parts.slice(1).join(':').trim();
    }
    return {
      bankName: bank,
      accountTitle: legacyMatch[1].trim(),
      accountNumber: num,
    };
  }

  return null;
}

/**
 * Extracts beneficiary or account holder name from bill reference string
 */
export function extractBillBeneficiaryName(referenceNo: string): string {
  if (!referenceNo) return '';
  const bank = extractBillBankAccount(referenceNo);
  if (bank?.accountTitle) return bank.accountTitle;
  const match = referenceNo.match(/\(Name:\s*([^|)]+)/);
  if (match) return match[1].trim();
  return '';
}

/**
 * Checks if a bill has already been verified and paid.
 * Once verified, the verification option is permanently removed.
 */
export function isBillAutoVerified(bill: BillItem): boolean {
  if (!bill) return false;
  return bill.status === 'paid' || (!!bill.reference_no && bill.reference_no.includes('[AutoVerified]'));
}


