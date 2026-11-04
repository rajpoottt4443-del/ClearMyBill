import { supabase } from '../lib/supabase';
import { BillItem, NewBillPayload } from '../types/bill';

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

export async function markBillAsPaid(billId: string): Promise<void> {
  const { error } = await supabase
    .from('bills')
    .update({ status: 'paid' })
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
