import { createClient } from '@supabase/supabase-js';

// Supabase credentials directly provided with fallback to import.meta.env
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://guofvbpjsdyngalozvvp.supabase.co';

export const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_7vtoIBWTZ2yoacIqkoRQrQ_U2ckTE_g';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export interface SupabaseBill {
  id: string;
  created_at: string;
  bill_type: string;
  amount: number;
  reference_no: string;
  image_url: string;
  status: 'unpaid' | 'paid';
}
