import { BillItem } from '../types/bill';

// Fresh production storage keys - ensures all previous demo bills are completely wiped
const STORAGE_KEY = 'clearmybill_live_unpaid_bills';
const CLEARED_STORAGE_KEY = 'clearmybill_live_cleared_archive';

// Clean initial empty state: Zero demo bills
export const INITIAL_BILLS: BillItem[] = [];

export function loadStoredBills(): BillItem[] {
  if (typeof window === 'undefined') return [];
  try {
    // Clear out any obsolete demo keys if present
    localStorage.removeItem('clearmybill_bilingual_v2');
    localStorage.removeItem('clearmybill_active_bills_v1');

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    // Filter out any lingering mock items with IDs like 'bill-1', 'bill-2', 'bill-3', 'bill-4'
    if (Array.isArray(parsed)) {
      const cleaned = parsed.filter(
        (b) => b && !['bill-1', 'bill-2', 'bill-3', 'bill-4', 'bill-101', 'bill-102'].includes(b.id)
      );
      return cleaned;
    }
    return [];
  } catch (err) {
    console.error('Error loading bills:', err);
    return [];
  }
}

export function saveStoredBills(bills: BillItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
  } catch (err) {
    console.error('Error saving bills:', err);
  }
}

export function loadClearedBillsArchive(): BillItem[] {
  if (typeof window === 'undefined') return [];
  try {
    localStorage.removeItem('clearmybill_cleared_archive_v2');
    const raw = localStorage.getItem(CLEARED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

export function saveClearedBillsArchive(bills: BillItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CLEARED_STORAGE_KEY, JSON.stringify(bills));
  } catch (err) {
    console.error('Error saving cleared bills archive:', err);
  }
}
