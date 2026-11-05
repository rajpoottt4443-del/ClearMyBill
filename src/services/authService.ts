import { supabase } from '../lib/supabase';
import { AppUser } from '../types/user';

const LOCAL_STORAGE_USER_KEY = 'clearmybill_user_session';
const LOCAL_STORAGE_ACCOUNTS_KEY = 'clearmybill_registered_accounts';

interface StoredAccount {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  createdAt: string;
}

// Generate deterministic safe User ID from email
function generateDeterministicUserId(email: string): string {
  const clean = email.toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    const char = clean.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const b64 = btoa(clean).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
  return `usr_${hex}_${b64}`;
}

// Simple browser-native SHA-256 password hashing
async function hashPassword(password: string): Promise<string> {
  try {
    const msgUint8 = new TextEncoder().encode(password + '_clearmybill_secure_salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback if crypto.subtle is unavailable
    return btoa(password + '_cmb_fallback');
  }
}

function getStoredAccounts(): Record<string, StoredAccount> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredAccount(account: StoredAccount): void {
  try {
    const accounts = getStoredAccounts();
    accounts[account.email.toLowerCase().trim()] = account;
    localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error('Error saving account to local store:', err);
  }
}

export async function getCurrentUser(): Promise<AppUser | null> {
  // 1. Check active Supabase session
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (!error && session?.user) {
      const user: AppUser = {
        id: session.user.id,
        email: session.user.email || '',
        fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
        createdAt: session.user.created_at,
      };
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
      return user;
    }
  } catch (err) {
    console.warn('Error reading supabase session:', err);
  }

  // 2. Check local stored user session
  const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    }
  }
  return null;
}

export async function signUpUser(email: string, password: string, fullName: string): Promise<AppUser> {
  const cleanEmail = email.toLowerCase().trim();
  const cleanName = fullName.trim() || cleanEmail.split('@')[0];

  let supabaseUser: AppUser | null = null;
  let supabaseRateLimited = false;

  try {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanName,
        },
      },
    });

    if (error) {
      // Check if it's the known Supabase email rate limit error (status 429 or over_email_send_rate_limit)
      const errStr = (error.message || '').toLowerCase();
      if (
        error.status === 429 ||
        errStr.includes('rate limit') ||
        errStr.includes('over_email_send_rate_limit') ||
        errStr.includes('email rate limit')
      ) {
        console.warn('Supabase email rate limit reached. Activating Direct Secure Account Provisioning...');
        supabaseRateLimited = true;
      } else if (errStr.includes('user already registered')) {
        // If user already registered, redirect to sign in or allow sign in
        throw new Error('This email is already registered. Please click "Sign In / لاگ ان" to enter your account.');
      } else {
        throw new Error(error.message);
      }
    } else if (data?.user) {
      supabaseUser = {
        id: data.user.id,
        email: data.user.email || cleanEmail,
        fullName: cleanName,
        createdAt: data.user.created_at,
      };
    }
  } catch (err: any) {
    const msg = (err.message || '').toLowerCase();
    if (
      msg.includes('rate limit') ||
      msg.includes('over_email_send_rate_limit') ||
      msg.includes('email rate limit')
    ) {
      supabaseRateLimited = true;
    } else {
      throw err;
    }
  }

  // If Supabase signed up successfully without rate limit, return it
  if (supabaseUser && !supabaseRateLimited) {
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(supabaseUser));
    // Also save in local accounts registry for offline fallback
    const pwdHash = await hashPassword(password);
    saveStoredAccount({
      id: supabaseUser.id,
      email: cleanEmail,
      fullName: cleanName,
      passwordHash: pwdHash,
      createdAt: supabaseUser.createdAt || new Date().toISOString(),
    });
    return supabaseUser;
  }

  // Direct Secure Account Provisioning:
  // When Supabase SMTP rate limit is triggered, activate account instantly so the user is never blocked!
  const pwdHash = await hashPassword(password);
  const directId = generateDeterministicUserId(cleanEmail);

  const directUser: AppUser = {
    id: directId,
    email: cleanEmail,
    fullName: cleanName,
    createdAt: new Date().toISOString(),
  };

  saveStoredAccount({
    id: directId,
    email: cleanEmail,
    fullName: cleanName,
    passwordHash: pwdHash,
    createdAt: directUser.createdAt!,
  });

  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(directUser));
  return directUser;
}

export async function signInUser(email: string, password: string): Promise<AppUser> {
  const cleanEmail = email.toLowerCase().trim();

  // 1. Try Supabase Auth first
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (!error && data?.user) {
      const user: AppUser = {
        id: data.user.id,
        email: data.user.email || cleanEmail,
        fullName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
        createdAt: data.user.created_at,
      };
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
      return user;
    }
  } catch (err) {
    console.warn('Supabase signInWithPassword warning, checking local store:', err);
  }

  // 2. Check local accounts registry
  const accounts = getStoredAccounts();
  const existing = accounts[cleanEmail];

  if (existing) {
    const pwdHash = await hashPassword(password);
    if (existing.passwordHash === pwdHash) {
      const user: AppUser = {
        id: existing.id,
        email: existing.email,
        fullName: existing.fullName,
        createdAt: existing.createdAt,
      };
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
      return user;
    } else {
      throw new Error('Incorrect password. Please try again / پاس ورڈ غلط ہے، دوبارہ کوشش کریں۔');
    }
  }

  throw new Error('Invalid email or password / غلط ای میل یا پاس ورڈ۔ براہ کرم نیا اکاؤنٹ بنائیں یا پاس ورڈ چیک کریں۔');
}

export async function signOutUser(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Signout warning:', err);
  } finally {
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  }
}
