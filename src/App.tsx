import React, { useState, useEffect } from 'react';
import { BrandHeader } from './components/BrandHeader';
import { SimpleUploadBox } from './components/SimpleUploadBox';
import { LiveUnpaidBillsGrid } from './components/LiveUnpaidBillsGrid';
import { BillZoomModal } from './components/BillZoomModal';
import { ReceiptUploadModal } from './components/ReceiptUploadModal';
import { SimpleFooter } from './components/SimpleFooter';
import { BillItem } from './types/bill';
import {
  loadStoredBills,
  saveStoredBills,
  loadClearedBillsArchive,
  saveClearedBillsArchive
} from './data/mockBills';
import { CheckCircle2, X, Sparkles } from 'lucide-react';

export default function App() {
  const [bills, setBills] = useState<BillItem[]>([]);
  const [clearedBills, setClearedBills] = useState<BillItem[]>([]);
  const [zoomedBill, setZoomedBill] = useState<BillItem | null>(null);
  const [payingBill, setPayingBill] = useState<BillItem | null>(null);
  const [confirmationBanner, setConfirmationBanner] = useState<string | null>(null);

  useEffect(() => {
    setBills(loadStoredBills());
    setClearedBills(loadClearedBillsArchive());
  }, []);

  const handleBillSubmitted = (newBill: BillItem) => {
    const updated = [newBill, ...bills];
    setBills(updated);
    saveStoredBills(updated);

    // Show confirmation
    showConfirmation(
      'Your bill has been uploaded successfully! It will be paid within 48 hours. / آپ کا بل کامیابی سے اپلوڈ ہو گیا ہے، انشاءاللہ 48 گھنٹے میں ادا ہو جائے گا۔'
    );

    // Smooth scroll down to unpaid bills grid
    setTimeout(() => {
      document.getElementById('unpaid-bills')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  const handleReceiptUploaded = (billId: string, receiptData: string, donorName?: string) => {
    const billToClear = bills.find((b) => b.id === billId);
    if (!billToClear) return;

    // Instant Auto-Delete Logic: Remove bill from active unpaid bills list
    const updatedUnpaid = bills.filter((b) => b.id !== billId);
    setBills(updatedUnpaid);
    saveStoredBills(updatedUnpaid);

    // Add to cleared bills archive for transparency & record
    const clearedItem: BillItem = {
      ...billToClear,
      status: 'paid_removed',
      paidReceiptUrl: receiptData,
      paidAt: Date.now(),
      donorNote: donorName || 'Kind Donor'
    };
    const updatedCleared = [clearedItem, ...clearedBills];
    setClearedBills(updatedCleared);
    saveClearedBillsArchive(updatedCleared);

    // Show requested exact confirmation message
    showConfirmation(
      'JazakAllah / Thank you! Payment receipt uploaded & bill automatically removed / شکریہ! رسید اپلوڈ ہو گئی ہے اور بل لسٹ سے ہٹا دیا گیا ہے۔'
    );
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
