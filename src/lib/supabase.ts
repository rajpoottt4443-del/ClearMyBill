import { createClient } from '@supabase/supabase-js';

// Universal safe environment variable resolution (Vite client, Node, Vercel)
const getEnvVar = (key: string): string | undefined => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta && import.meta.env) {
      return import.meta.env[key];
    }
  } catch {
    // ignore
  }
  try {
    if (typeof process !== 'undefined' && process && process.env) {
      return process.env[key];
    }
  } catch {
    // ignore
  }
  return undefined;
};

// Supabase credentials directly provided with fallback to environment
export const SUPABASE_URL =
  getEnvVar('VITE_SUPABASE_URL') || 'https://guofvbpjsdyngalozvvp.supabase.co';

export const SUPABASE_KEY =
  getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY') ||
  getEnvVar('VITE_SUPABASE_ANON_KEY') ||
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
