import { supabase } from '../lib/supabase';
import { BillItem, NewBillPayload } from '../types/bill';
import { AppUser } from '../types/user';
import { recordUploadedBillLocally, getLocallyUploadedBillIds } from './authService';

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

  // Record this bill ID locally so the uploader can immediately delete it even if they haven't made an account yet
  if (data?.id) {
    recordUploadedBillLocally(data.id);
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

export async function deleteBill(billId: string): Promise<void> {
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
 * Checks whether the current user is authorized to delete this bill:
 * 1. If bill has [Owner:<userId>] matching current logged-in user id.
 * 2. If bill has [User:<email>] matching current logged-in user email.
 * 3. If bill was uploaded from this specific browser/device (tracked in localStorage).
 * 4. If bill has [PIN:<4digit>] and user entered the matching PIN.
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
  if (user?.email && ref.includes(`[User:${user.email.toLowerCase()}]`)) {
    return true;
  }

  // 3. User entered matching security PIN [PIN:xxxx]
  if (enteredPin && enteredPin.trim().length >= 4) {
    const pinMatch = ref.match(/\[PIN:(\w+)\]/);
    if (pinMatch && pinMatch[1] === enteredPin.trim()) {
      return true;
    }
  }

  // 4. Device match (if uploaded on this device)
  const localIds = getLocallyUploadedBillIds();
  if (localIds.includes(bill.id)) {
    return true;
  }

  return false;
}

/**
 * Checks if the bill has a 4-digit security PIN set on it
 */
export function hasBillSecurityPin(bill: BillItem): boolean {
  return /\[PIN:\w+\]/.test(bill.reference_no || '');
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
