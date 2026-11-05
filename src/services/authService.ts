import { supabase } from '../lib/supabase';
import { AppUser } from '../types/user';

export const DUPLICATE_EMAIL_MESSAGE_EN = 'This email is already registered. Please sign in instead.';
export const DUPLICATE_EMAIL_MESSAGE_UR = 'یہ ای میل پہلے سے رجسٹرڈ ہے۔ براہ کرم لاگ اِن کریں۔';
export const DUPLICATE_EMAIL_FULL_MESSAGE = `${DUPLICATE_EMAIL_MESSAGE_EN} / ${DUPLICATE_EMAIL_MESSAGE_UR}`;

export class DuplicateEmailError extends Error {
  constructor(message = DUPLICATE_EMAIL_FULL_MESSAGE) {
    super(message);
    this.name = 'DuplicateEmailError';
  }
}

/**
 * Normalizes email address by trimming whitespace and converting to lowercase.
 */
export function normalizeEmail(email: string): string {
  return (email || '').toLowerCase().trim();
}

/**
 * Checks whether an error message or status code represents a duplicate user registration.
 */
export function isDuplicateEmailError(errorMsg?: string, status?: number): boolean {
  if (!errorMsg) return false;
  const lower = errorMsg.toLowerCase();
  return (
    lower.includes('user already registered') ||
    lower.includes('user already exists') ||
    lower.includes('already been registered') ||
    lower.includes('email address already registered') ||
    lower.includes('email already in use') ||
    lower.includes('user with this email already exists') ||
    (status === 422 && lower.includes('already'))
  );
}

export interface SignUpResult {
  user: AppUser | null;
  isPendingConfirmation: boolean;
  message?: string;
}

/**
 * Retrieves the currently authenticated Supabase user session.
 * Supabase Auth is the STRICT single source of truth.
 * No localStorage user objects or local fallback accounts are accepted.
 */
export async function getCurrentUser(): Promise<AppUser | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) {
      return null;
    }

    const authUser = session.user;
    return {
      id: authUser.id,
      email: normalizeEmail(authUser.email || ''),
      fullName: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
      createdAt: authUser.created_at,
    };
  } catch (err) {
    console.error('Error getting Supabase session:', err);
    return null;
  }
}

/**
 * Registers a new user strictly through Supabase Auth.
 * Enforces email normalization and strictly prevents duplicate email registration.
 * Never creates local fallback accounts or bypasses authentication errors.
 */
export async function signUpUser(
  email: string,
  password: string,
  fullName: string
): Promise<SignUpResult> {
  const cleanEmail = normalizeEmail(email);
  const cleanName = fullName.trim() || cleanEmail.split('@')[0];

  if (!cleanEmail) {
    throw new Error('Please enter a valid email address / براہ کرم درست ای میل درج کریں');
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters / پاس ورڈ کم از کم 6 ہندسوں کا ہونا چاہیے');
  }

  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: {
        full_name: cleanName,
      },
    },
  });

  // 1. Handle explicit Supabase Auth error responses
  if (error) {
    const errStr = (error.message || '').toLowerCase();
    if (isDuplicateEmailError(error.message, error.status)) {
      throw new DuplicateEmailError();
    }
    if (
      error.status === 429 ||
      errStr.includes('rate limit') ||
      errStr.includes('over_email_send_rate_limit')
    ) {
      throw new Error(
        'Email rate limit reached. Please wait a few minutes before trying again or sign in if you already have an account. / ای میل کی حد ختم ہو چکی ہے۔ براہ کرم کچھ منٹ بعد کوشش کریں یا لاگ ان کریں۔'
      );
    }
    throw new Error(error.message);
  }

  // 2. Handle Supabase existing-user response behavior when email confirmation is enabled:
  // When confirmation is enabled and the email is already registered, Supabase returns a fake/obfuscated
  // user object with an EMPTY identities array ([]). This must be strictly caught as a duplicate registration!
  if (
    data?.user &&
    Array.isArray(data.user.identities) &&
    data.user.identities.length === 0
  ) {
    throw new DuplicateEmailError();
  }

  // 3. Handle email confirmation pending state:
  // A new user was created, but email confirmation is pending and no authenticated session is returned yet.
  if (!data?.session) {
    return {
      user: null,
      isPendingConfirmation: true,
      message:
        'Registration successful! Please check your email inbox to verify your account, then sign in. / رجسٹریشن مکمل! براہ کرم لاگ ان کرنے سے پہلے اپنی ای میل کھول کر اکاؤنٹ کی تصدیق کریں۔',
    };
  }

  // 4. Session established immediately (email confirmation disabled or auto-confirmed)
  if (!data.user) {
    throw new Error('Registration could not be completed. Please try again. / رجسٹریشن مکمل نہیں ہو سکی۔');
  }

  const appUser: AppUser = {
    id: data.user.id,
    email: normalizeEmail(data.user.email || cleanEmail),
    fullName: cleanName,
    createdAt: data.user.created_at,
  };

  return {
    user: appUser,
    isPendingConfirmation: false,
  };
}

/**
 * Signs in an existing user strictly using Supabase Auth.
 * Never falls back to local password validation or fake credentials.
 */
export async function signInUser(email: string, password: string): Promise<AppUser> {
  const cleanEmail = normalizeEmail(email);

  if (!cleanEmail || !password) {
    throw new Error('Please enter both email and password / ای میل اور پاس ورڈ دونوں درج کریں');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  });

  if (error) {
    const msg = (error.message || '').toLowerCase();
    if (msg.includes('invalid login credentials')) {
      throw new Error(
        'Incorrect email or password. Please try again / غلط ای میل یا پاس ورڈ۔ برائے مہربانی دوبارہ کوشش کریں۔'
      );
    }
    if (msg.includes('email not confirmed')) {
      throw new Error(
        'Please confirm your email address before signing in. Check your inbox / لاگ ان کرنے سے پہلے اپنی ای میل کی تصدیق کریں۔ اپنے ان باکس میں تصدیقی لنک چیک کریں۔'
      );
    }
    if (error.status === 429 || msg.includes('rate limit')) {
      throw new Error(
        'Too many login attempts. Please wait a moment and try again. / بہت زیادہ کوششیں کی گئی ہیں، براہ کرم کچھ دیر بعد کوشش کریں۔'
      );
    }
    throw new Error(error.message || 'Login failed. Please check your credentials.');
  }

  if (!data?.user) {
    throw new Error('Unable to complete login. Please try again. / لاگ ان مکمل نہیں ہو سکا۔');
  }

  return {
    id: data.user.id,
    email: normalizeEmail(data.user.email || cleanEmail),
    fullName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
    createdAt: data.user.created_at,
  };
}

/**
 * Signs out the current user via Supabase Auth and cleans up any legacy storage.
 */
export async function signOutUser(): Promise<void> {
  try {
    // Clean up any legacy localStorage keys from prior sessions
    localStorage.removeItem('clearmybill_user_session');
    localStorage.removeItem('clearmybill_registered_accounts');
  } catch {
    // ignore
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Supabase signOut error:', error);
    throw error;
  }
}
