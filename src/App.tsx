import React, { useState, useEffect, useCallback } from 'react';
import { BrandHeader } from './components/BrandHeader';
import { SimpleUploadBox } from './components/SimpleUploadBox';
import { LiveUnpaidBillsGrid } from './components/LiveUnpaidBillsGrid';
import { BillZoomModal } from './components/BillZoomModal';
import { ReceiptUploadModal } from './components/ReceiptUploadModal';
import { SimpleFooter } from './components/SimpleFooter';
import { BillItem, NewBillPayload } from './types/bill';
import { fetchUnpaidBills, fetchPaidBills, insertBill, markBillAsPaid } from './services/billService';
import { supabase } from './lib/supabase';
import { X, Sparkles } from 'lucide-react';

export default function App() {
  const [bills, setBills] = useState<BillItem[]>([]);
  const [clearedBills, setClearedBills] = useState<BillItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [zoomedBill, setZoomedBill] = useState<BillItem | null>(null);
  const [payingBill, setPayingBill] = useState<BillItem | null>(null);
  const [confirmationBanner, setConfirmationBanner] = useState<string | null>(null);

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
      'Your bill has been uploaded successfully! It is saved in Supabase and visible on all devices. / آپ کا بل کامیابی سے ڈیٹا بیس میں محفوظ ہو گیا ہے اور تمام ڈیوائسز پر لائیو ہو چکا ہے۔'
    );

    // Smooth scroll down to unpaid bills grid
    setTimeout(() => {
      document.getElementById('unpaid-bills')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  // Mark bill as paid in Supabase (removes from active unpaid list)
  const handleReceiptUploaded = async (billId: string, receiptData: string, donorName?: string) => {
    const targetBill = bills.find((b) => b.id === billId);
    if (!targetBill) return;

    // Optimistically remove from unpaid list
    setBills((prev) => prev.filter((b) => b.id !== billId));
    setClearedBills((prev) => [{ ...targetBill, status: 'paid' }, ...prev]);

    try {
      await markBillAsPaid(billId);
      showConfirmation(
        'JazakAllah / Thank you! Payment receipt uploaded & bill automatically removed / شکریہ! رسید اپلوڈ ہو گئی ہے اور بل لسٹ سے ہٹا دیا گیا ہے۔'
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

  const showConfirmation = (msg: string) => {
    setConfirmationBanner(msg);
    setTimeout(() => {
      setConfirmationBanner((curr) => (curr === msg ? null : curr));
    }, 8000);
  };

  const scrollToUpload = () => {
    document.getElementById('upload-box')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToBills = () => {
    document.getElementById('unpaid-bills')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#1E293B] antialiased flex flex-col selection:bg-[#34D399]/30 selection:text-black">
      {/* Soft Green Confirmation Toast Banner */}
      {confirmationBanner && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-in fade-in slide-in-from-top-4 duration-300">
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
          <SimpleUploadBox onBillSubmitted={handleBillSubmitted} />
        </div>

        {/* 2. Live Unpaid Bills Grid (مدد کے منتظر بل) & 3. Auto-Removal Logic */}
        <LiveUnpaidBillsGrid
          bills={bills}
          clearedBills={clearedBills}
          isLoading={isLoading}
          onRefresh={loadBillsFromSupabase}
          onOpenZoom={(bill) => setZoomedBill(bill)}
          onOpenReceiptUpload={(bill) => setPayingBill(bill)}
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
      />

      {/* Receipt Upload & Auto-Delete Modal */}
      <ReceiptUploadModal
        bill={payingBill}
        isOpen={!!payingBill}
        onClose={() => setPayingBill(null)}
        onReceiptUploaded={handleReceiptUploaded}
      />
    </div>
  );
}
