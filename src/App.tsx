import React, { useState, useEffect, useCallback } from 'react';
import { StickyNavbar } from './components/StickyNavbar';
import { BrandHeader } from './components/BrandHeader';
import { SimpleUploadBox } from './components/SimpleUploadBox';
import { LiveUnpaidBillsGrid } from './components/LiveUnpaidBillsGrid';
import { BillZoomModal } from './components/BillZoomModal';
import { ReceiptUploadModal } from './components/ReceiptUploadModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { AuthModal } from './components/AuthModal';
import { SimpleFooter } from './components/SimpleFooter';
import { BillItem, NewBillPayload } from './types/bill';
import { AppUser } from './types/user';
import { fetchUnpaidBills, fetchPaidBills, insertBill, markBillAsPaid, deleteBill, isBillOwner } from './services/billService';
import { getCurrentUser, signOutUser } from './services/authService';
import { supabase } from './lib/supabase';
import { X, Sparkles } from 'lucide-react';

export default function App() {
  const [bills, setBills] = useState<BillItem[]>([]);
  const [clearedBills, setClearedBills] = useState<BillItem[]>([]);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [zoomedBill, setZoomedBill] = useState<BillItem | null>(null);
  const [payingBill, setPayingBill] = useState<BillItem | null>(null);
  const [deletingBill, setDeletingBill] = useState<BillItem | null>(null);
  const [confirmationBanner, setConfirmationBanner] = useState<string | null>(null);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('signup');

  // Feed Tab State
  const [activeFeedTab, setActiveFeedTab] = useState<'unpaid' | 'my_bills' | 'cleared'>('unpaid');

  // Load user session on mount
  useEffect(() => {
    getCurrentUser().then((u) => setUser(u));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load live data from Supabase
  const loadBillsFromSupabase = useCallback(async () => {
    setIsLoading(true);
    try {
      const [unpaid, paid] = await Promise.all([
        fetchUnpaidBills(),
        fetchPaidBills(),
      ]);
      setBills(unpaid);
      setClearedBills(paid);
    } catch (err) {
      console.error('Failed to load bills from Supabase:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBillsFromSupabase();

    // Setup Supabase Realtime channel for live updates across all devices & mobile phones
    const channel = supabase
      .channel('bills_realtime_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bills' },
        (payload) => {
          console.log('Realtime change received from Supabase:', payload);
          loadBillsFromSupabase();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadBillsFromSupabase]);

  // Insert bill into Supabase
  const handleBillSubmitted = async (payload: NewBillPayload) => {
    const saved = await insertBill(payload);
    // Optimistically update list
    setBills((prev) => [saved, ...prev.filter((b) => b.id !== saved.id)]);

    showConfirmation(
      'Your bill has been uploaded successfully! It is saved in Supabase and protected under your ownership. / آپ کا بل کامیابی سے ڈیٹا بیس میں محفوظ ہو گیا ہے اور آپ کے اکاؤنٹ کے تحت محفوظ ہے۔'
    );

    // Smooth scroll down to unpaid bills grid
    setTimeout(() => {
      document.getElementById('unpaid-bills')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  // Mark bill as paid in Supabase (persists record with receipt in Cleared Archive)
  const handleReceiptUploaded = async (billId: string, receiptData: string, donorName?: string) => {
    const targetBill = bills.find((b) => b.id === billId);
    if (!targetBill) return;

    // Optimistically remove from unpaid list and add to cleared archive with payment receipt
    const updatedClearedBill: BillItem = {
      ...targetBill,
      status: 'paid',
      image_url: receiptData || targetBill.image_url,
      reference_no: donorName
        ? `${targetBill.reference_no} [Paid by: ${donorName}]`
        : `${targetBill.reference_no} [Paid / ادا شدہ]`,
    };

    setBills((prev) => prev.filter((b) => b.id !== billId));
    setClearedBills((prev) => [updatedClearedBill, ...prev.filter((b) => b.id !== billId)]);

    try {
      await markBillAsPaid(billId, receiptData, donorName, targetBill.reference_no);
      showConfirmation(
        'JazakAllah / Thank you! Payment receipt saved to database & bill moved to Cleared Archive / شکریہ! ادائیگی کی رسید اور ریکارڈ ڈیٹا بیس میں کامیابی سے محفوظ ہو گیا ہے۔'
      );
    } catch (err: any) {
      console.error('Error updating status in Supabase:', err);
      // Refresh to sync with actual state
      loadBillsFromSupabase();
      showConfirmation(
        'Notice: Payment received. Synchronizing with cloud database... / رسید موصول ہو گئی ہے، ڈیٹا سنک ہو رہا ہے۔'
      );
    }
  };

  // Delete bill from Supabase database (بل ڈیٹا بیس سے ڈیلیٹ کریں)
  const handleDeleteBill = async (billId: string) => {
    // Optimistically remove from both active lists immediately
    setBills((prev) => prev.filter((b) => b.id !== billId));
    setClearedBills((prev) => prev.filter((b) => b.id !== billId));
    try {
      await deleteBill(billId);
      showConfirmation(
        'Bill deleted successfully from Supabase database! / بل کلاؤڈ ڈیٹا بیس سے کامیابی سے ڈیلیٹ کر دیا گیا ہے۔'
      );
    } catch (err: any) {
      console.error('Failed to delete bill from Supabase:', err);
      loadBillsFromSupabase();
      showConfirmation(
        'Notice: Failed to delete bill from database. Refreshing... / بل ڈیلیٹ کرنے میں مسئلہ آیا، دوبارہ کوشش کریں۔'
      );
    }
  };

  const handleOpenAuth = (mode: 'login' | 'signup' = 'signup') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLogout = async () => {
    await signOutUser();
    setUser(null);
    showConfirmation('Logged out successfully / آپ کا اکاؤنٹ لاگ آؤٹ ہو گیا ہے۔');
  };

  const handleAuthSuccess = (loggedUser: AppUser) => {
    setUser(loggedUser);
    showConfirmation(
      `Account Created! Welcome, ${loggedUser.fullName || loggedUser.email}. You can now upload your bill below. / اکاؤنٹ بن گیا ہے! اب آپ نیچے اپنا بل اپلوڈ کر سکتے ہیں۔`
    );
    setTimeout(() => {
      document.getElementById('upload-box')?.scrollIntoView({ behavior: 'smooth' });
    }, 350);
  };

  const handleViewMyBills = () => {
    setActiveFeedTab('my_bills');
    document.getElementById('unpaid-bills')?.scrollIntoView({ behavior: 'smooth' });
  };

  const showConfirmation = (msg: string) => {
    setConfirmationBanner(msg);
    setTimeout(() => {
      setConfirmationBanner((curr) => (curr === msg ? null : curr));
    }, 8000);
  };

  const scrollToUpload = () => {
    if (!user) {
      handleOpenAuth('signup');
      showConfirmation(
        'Account Required: Please create an account first to upload your bill / بل اپلوڈ کرنے کے لیے پہلے اکاؤنٹ بنائیں'
      );
      return;
    }
    document.getElementById('upload-box')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToBills = () => {
    setActiveFeedTab('unpaid');
    document.getElementById('unpaid-bills')?.scrollIntoView({ behavior: 'smooth' });
  };

  const myBillsCount = bills.filter((b) => isBillOwner(b, user)).length;

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#1E293B] antialiased flex flex-col selection:bg-[#34D399]/30 selection:text-black">
      {/* Sticky Glass Navbar with User Account Controls */}
      <StickyNavbar
        user={user}
        myBillsCount={myBillsCount}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onScrollToUpload={scrollToUpload}
        onScrollToBills={scrollToBills}
        onViewMyBills={handleViewMyBills}
      />

      {/* Soft Green Confirmation Toast Banner */}
      {confirmationBanner && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="clay-timer-badge p-4 rounded-2xl shadow-xl flex items-start justify-between gap-3 bg-[#ECFDF5] border-2 border-[#34D399]">
            <div className="flex items-start gap-3">
              <div className="clay-mint-icon w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles size={18} />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-black text-emerald-950 leading-snug">
                  {confirmationBanner.split('/')[0]}
                </div>
                <div className="text-xs sm:text-sm font-urdu font-bold text-emerald-900 mt-1 leading-relaxed">
                  {confirmationBanner.split('/')[1] || ''}
                </div>
              </div>
            </div>
            <button
              onClick={() => setConfirmationBanner(null)}
              className="p-1 text-emerald-700 hover:text-black transition-colors shrink-0"
              aria-label="Close notification"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {/* Brand Header */}
        <BrandHeader
          onScrollToUpload={scrollToUpload}
          onScrollToBills={scrollToBills}
          unpaidCount={bills.length}
        />

        {/* 1. Simple Bill Upload Box (بل اپلوڈ کرنے کا خانہ) */}
        <div className="px-4 sm:px-6">
          <SimpleUploadBox
            onBillSubmitted={handleBillSubmitted}
            user={user}
            onOpenAuth={handleOpenAuth}
          />
        </div>

        {/* 2. Live Unpaid Bills Grid & My Bills & Cleared Archive */}
        <LiveUnpaidBillsGrid
          bills={bills}
          clearedBills={clearedBills}
          user={user}
          activeTab={activeFeedTab}
          onTabChange={setActiveFeedTab}
          isLoading={isLoading}
          onRefresh={loadBillsFromSupabase}
          onOpenZoom={(bill) => setZoomedBill(bill)}
          onOpenReceiptUpload={(bill) => setPayingBill(bill)}
          onOpenDelete={(bill) => setDeletingBill(bill)}
          onOpenAuth={handleOpenAuth}
        />
      </main>

      {/* Footer */}
      <SimpleFooter />

      {/* Zoom Modal */}
      <BillZoomModal
        bill={zoomedBill}
        isOpen={!!zoomedBill}
        onClose={() => setZoomedBill(null)}
        onPayClick={(bill) => setPayingBill(bill)}
        onDeleteClick={(bill) => setDeletingBill(bill)}
      />

      {/* Receipt Upload & Auto-Delete Modal */}
      <ReceiptUploadModal
        bill={payingBill}
        isOpen={!!payingBill}
        onClose={() => setPayingBill(null)}
        onReceiptUploaded={handleReceiptUploaded}
      />

      {/* Delete Confirmation Modal with Ownership & Security PIN Verification */}
      <DeleteConfirmModal
        bill={deletingBill}
        user={user}
        isOpen={!!deletingBill}
        onClose={() => setDeletingBill(null)}
        onConfirmDelete={handleDeleteBill}
        onOpenAuth={() => handleOpenAuth('login')}
      />

      {/* User Account Auth Modal (Sign Up / Sign In) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />
    </div>
  );
}
