export interface BillItem {
  id: string;
  created_at: string;
  bill_type: string;
  amount: number;
  reference_no: string;
  image_url: string;
  status: 'unpaid' | 'paid';
}

export interface NewBillPayload {
  bill_type: string;
  amount: number;
  reference_no: string;
  image_url: string;
  status?: 'unpaid';
}
