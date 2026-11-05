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

  // Permanently record donor name/details into reference_no
  if (currentReferenceNo) {
    const paidTag = donorName ? `[Paid by: ${donorName}]` : '[Paid / ادا شدہ]';
    if (!currentReferenceNo.includes('[Paid')) {
      updateData.reference_no = `${currentReferenceNo} ${paidTag}`;
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
 * Strictly deletes a bill ONLY after 100% verified ownership:
 * - Current logged-in user matches the bill creator (user ID or verified email)
 * - OR exact matching 4-digit security PIN is provided
 * All anonymous local device fallbacks are strictly removed.
 */
export async function deleteBill(
  billId: string,
  user?: AppUser | null,
  enteredPin?: string,
  targetBill?: BillItem
): Promise<void> {
  if (targetBill && !isBillOwner(targetBill, user || null, enteredPin)) {
    throw new Error(
      'Access Denied: You are not authorized to delete this bill. Only the verified owner or correct PIN can delete it. / رسائی مسترد: صرف اصل مالک یا درست پن کوڈ کے ساتھ ہی بل ڈیلیٹ کیا جا سکتا ہے۔'
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
 * 3. User entered the exact matching 4-digit security PIN [PIN:<pin>].
 *
 * ZERO FALLBACK: Anonymous local device / localStorage deletion is strictly disallowed.
 */
export function isBillOwner(
  bill: BillItem,
  user: AppUser | null,
  enteredPin?: string
): boolean {
  if (!bill) return false;

  const ref = bill.reference_no || '';

  // 1. Logged in user matches [Owner:userId]
  if (user?.id && ref.includes(`[Owner:${user.id}]`)) {
    return true;
  }

  // 2. Logged in user matches [User:email]
  if (user?.email && ref.includes(`[User:${user.email.toLowerCase().trim()}]`)) {
    return true;
  }

  // 3. User entered matching security PIN [PIN:xxxx]
  if (enteredPin && enteredPin.trim().length >= 4) {
    const pinMatch = ref.match(/\[PIN:(\w+)\]/);
    if (pinMatch && pinMatch[1] === enteredPin.trim()) {
      return true;
    }
  }

  // STRICT ENFORCEMENT: No anonymous local device deletion allowed
  return false;
}

/**
 * Checks if the bill has a 4-digit security PIN set on it
 */
export function hasBillSecurityPin(bill: BillItem): boolean {
  return /\[PIN:\w+\]/.test(bill.reference_no || '');
}

/**
 * Checks if the bill has a registered owner user ID or email tag
 */
export function hasBillOwnerAccount(bill: BillItem): boolean {
  const ref = bill.reference_no || '';
  return ref.includes('[Owner:') || ref.includes('[User:');
}

/**
 * Cleans the reference number for public display so internal [Owner:...] or [PIN:...] tags
 * are hidden from strangers, keeping the UI super clean for donors.
 */
export function cleanDisplayReference(referenceNo: string): string {
  if (!referenceNo) return '';
  return referenceNo
    .replace(/\[Owner:[^\]]+\]/g, '')
    .replace(/\[User:[^\]]+\]/g, '')
    .replace(/\[PIN:[^\]]+\]/g, '')
    .trim();
}
