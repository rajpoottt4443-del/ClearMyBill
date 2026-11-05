import { supabase } from '../lib/supabase';
import { AppUser } from '../types/user';

const LOCAL_STORAGE_USER_KEY = 'clearmybill_user_session';
const MY_BILLS_STORAGE_KEY = 'clearmybill_my_uploaded_ids';

export async function getCurrentUser(): Promise<AppUser | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('Supabase getSession warning:', error.message);
    }
    if (session?.user) {
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

  // Fallback to local stored session if available
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
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('User creation failed. Please check your details.');
  }

  const user: AppUser = {
    id: data.user.id,
    email: data.user.email || email,
    fullName: fullName || email.split('@')[0],
    createdAt: data.user.created_at,
  };

  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
  return user;
}

export async function signInUser(email: string, password: string): Promise<AppUser> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('Sign in failed. Invalid email or password.');
  }

  const user: AppUser = {
    id: data.user.id,
    email: data.user.email || email,
    fullName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
    createdAt: data.user.created_at,
  };

  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
  return user;
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

// Track local uploaded bills on this device so the user can manage them even before signing in
export function recordUploadedBillLocally(billId: string): void {
  try {
    const existing = getLocallyUploadedBillIds();
    if (!existing.includes(billId)) {
      existing.push(billId);
      localStorage.setItem(MY_BILLS_STORAGE_KEY, JSON.stringify(existing));
    }
  } catch (e) {
    console.error('Error saving local bill id:', e);
  }
}

export function getLocallyUploadedBillIds(): string[] {
  try {
    const raw = localStorage.getItem(MY_BILLS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
