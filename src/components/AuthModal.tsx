import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, AlertCircle, Loader2, Eye, EyeOff, Check, AlertTriangle } from 'lucide-react';
import { signInUser, signUpUser } from '../services/authService';
import { AppUser } from '../types/user';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AppUser) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'signup',
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleTabSwitch = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setErrorMsg('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password / ای میل اور پاس ورڈ دونوں درج کریں');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters / پاس ورڈ کم از کم 6 ہندسوں کا ہونا چاہیے');
      return;
    }

    // Password Mismatch Validation for Sign Up
    if (mode === 'signup') {
      if (!confirmPassword.trim()) {
        setErrorMsg('Please retype your password to confirm / تصدیق کے لیے پاس ورڈ دوبارہ درج کریں');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match! Please check and type again / دونوں پاس ورڈ ایک جیسے نہیں ہیں، برائے مہربانی دوبارہ ٹائپ کریں۔');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (mode === 'signup') {
        const user = await signUpUser(email.trim(), password, fullName.trim());
        onAuthSuccess(user);
        onClose();
      } else {
        const user = await signInUser(email.trim(), password);
        onAuthSuccess(user);
        onClose();
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'Authentication failed. Please check your credentials.';
      if (msg.includes('Invalid login credentials')) {
        msg = 'Invalid email or password / غلط ای میل یا پاس ورڈ';
      } else if (msg.includes('User already registered')) {
        msg = 'This email is already registered. Please switch to Sign In / یہ ای میل پہلے سے موجود ہے، لاگ ان کریں۔';
      }
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const isPasswordMismatch =
    mode === 'signup' &&
    confirmPassword.length > 0 &&
    password !== confirmPassword;

  const isPasswordMatched =
    mode === 'signup' &&
    confirmPassword.length >= 6 &&
    password === confirmPassword;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-green-card w-full max-w-md rounded-3xl p-6 sm:p-8 relative my-8 border border-white/95 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-black hover:bg-white/80 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Top Header */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <ShieldCheck size={28} className="stroke-[2.2]" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
          </h3>
          <p className="text-xs sm:text-sm text-emerald-900 font-urdu font-bold mt-1">
            {mode === 'signup'
              ? 'اپنا اکاؤنٹ بنائیں تاکہ صرف آپ اپنے بل کو ڈیلیٹ کر سکیں'
              : 'اپنے اکاؤنٹ میں لاگ ان کریں'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-emerald-100/60 p-1.5 rounded-2xl mb-5 border border-emerald-200/80">
          <button
            type="button"
            onClick={() => handleTabSwitch('signup')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              mode === 'signup'
                ? 'clay-mint-btn font-black shadow-xs'
                : 'text-slate-600 hover:text-black'
            }`}
          >
            <span>Sign Up / نیا اکاؤنٹ</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              mode === 'login'
                ? 'clay-mint-btn font-black shadow-xs'
                : 'text-slate-600 hover:text-black'
            }`}
          >
            <span>Sign In / لاگ ان</span>
          </button>
        </div>

        {/* Security Feature Explanation */}
        <div className="p-3 bg-emerald-50/90 rounded-2xl border border-emerald-200/70 text-[11px] text-emerald-950 flex items-start gap-2 mb-4">
          <ShieldCheck size={16} className="text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <strong>100% Protected Bills:</strong> Only you will be able to delete or manage your uploaded bills. No stranger can touch or delete them.
            <div className="font-urdu font-bold text-emerald-900 mt-0.5">
              کوئی بھی اجنبی آپ کا بل ڈیلیٹ نہیں کر سکے گا، صرف آپ کو اختیار ہوگا۔
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Name / آپ کا نام
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Muhammad Usman"
                  className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl text-xs sm:text-sm border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-[#34D399]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address / ای میل ایڈریس
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. myname@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl text-xs sm:text-sm border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-[#34D399]"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password / پاس ورڈ (کم از کم 6 ہندسے)
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-white rounded-xl text-xs sm:text-sm border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-[#34D399]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Retype / Confirm Password Field (Only for Sign Up) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Retype Password / <span className="font-urdu font-bold text-emerald-800">پاس ورڈ دوبارہ درج کریں</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="پاس ورڈ دوبارہ ٹائپ کریں"
                  className={`w-full pl-10 pr-10 py-2.5 bg-white rounded-xl text-xs sm:text-sm border transition focus:outline-none ${
                    isPasswordMismatch
                      ? 'border-rose-400 ring-2 ring-rose-200'
                      : isPasswordMatched
                      ? 'border-emerald-400 ring-2 ring-emerald-200'
                      : 'border-emerald-200 focus:ring-2 focus:ring-[#34D399]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Instant Mismatch / Match Feedback */}
              {isPasswordMismatch && (
                <div className="flex items-center gap-1.5 text-[11px] text-rose-600 font-bold mt-1.5 animate-in fade-in">
                  <AlertTriangle size={13} className="shrink-0" />
                  <span>Passwords do not match / پاس ورڈ میچ نہیں ہو رہا</span>
                </div>
              )}
              {isPasswordMatched && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold mt-1.5 animate-in fade-in">
                  <Check size={13} className="shrink-0" />
                  <span>Passwords match! / دونوں پاس ورڈ بالکل درست ہیں</span>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || (mode === 'signup' && isPasswordMismatch)}
            className="clay-mint-btn w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black text-[#064E3B] flex items-center justify-center gap-2 cursor-pointer shadow-md mt-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin text-emerald-950" />
                <span>Processing... برائے مہربانی انتظار کریں</span>
              </>
            ) : (
              <span>
                {mode === 'signup' ? 'Create Account / اکاؤنٹ بنائیں' : 'Sign In / لاگ ان کریں'}
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
