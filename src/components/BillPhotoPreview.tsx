import React from 'react';
import { Zap, Flame, HeartPulse, Droplets, FileText } from 'lucide-react';

interface BillPhotoPreviewProps {
  photoKey: string;
  referenceId: string;
  personName?: string;
  amount: number | string;
  billType: string;
  className?: string;
  onZoom?: () => void;
}

export const BillPhotoPreview: React.FC<BillPhotoPreviewProps> = ({
  photoKey,
  referenceId,
  personName,
  amount,
  billType,
  className = '',
  onZoom,
}) => {
  const formattedAmount =
    typeof amount === 'number'
      ? `Rs. ${amount.toLocaleString()}`
      : amount.startsWith('Rs')
      ? amount
      : `Rs. ${amount}`;

  // If it's a base64, data URL, blob, or http URL
  if (photoKey && (photoKey.startsWith('data:image') || photoKey.startsWith('blob:') || photoKey.startsWith('http'))) {
    return (
      <div
        onClick={onZoom}
        className={`relative rounded-2xl overflow-hidden border border-emerald-200/80 bg-white group cursor-pointer shadow-xs hover:border-emerald-400 transition-all ${className}`}
      >
        <img
          src={photoKey}
          alt={`Bill voucher ${referenceId}`}
          className="w-full h-44 object-cover group-hover:scale-102 transition-transform duration-200"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-between p-2.5">
          <span className="text-[10px] text-white font-mono bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
            Ref: {referenceId}
          </span>
          <span className="text-[11px] text-white font-bold bg-emerald-600/80 backdrop-blur-sm px-2.5 py-0.5 rounded-full">
            🔍 Zoom / بڑا کریں
          </span>
        </div>
      </div>
    );
  }

  // Fallback themed SVG document card
  const getTheme = () => {
    const lower = (billType || '').toLowerCase();
    if (lower.includes('elect') || lower.includes('بجلی')) {
      return {
        icon: <Zap size={16} className="text-amber-500 fill-amber-500" />,
        label: 'ELECTRICITY DISTRIBUTION CO.',
        labelUrdu: 'لیسکو / کے الیکٹرک / پیسکو',
        bgHeader: 'bg-amber-50 border-amber-200',
      };
    }
    if (lower.includes('gas') || lower.includes('گیس')) {
      return {
        icon: <Flame size={16} className="text-orange-500 fill-orange-500" />,
        label: 'SUI GAS TRANSMISSION CO.',
        labelUrdu: 'سوئی ناردرن گیس پائپ لائنز',
        bgHeader: 'bg-orange-50 border-orange-200',
      };
    }
    if (lower.includes('med') || lower.includes('دوائی') || lower.includes('علاج')) {
      return {
        icon: <HeartPulse size={16} className="text-rose-500" />,
        label: 'HEALTH PHARMACY & CLINIC',
        labelUrdu: 'میڈیکل سٹور و ہسپتال رسید',
        bgHeader: 'bg-rose-50 border-rose-200',
      };
    }
    if (lower.includes('water') || lower.includes('پانی')) {
      return {
        icon: <Droplets size={16} className="text-sky-500 fill-sky-500" />,
        label: 'MUNICIPAL WATER AGENCY',
        labelUrdu: 'پانی و صفائی ادارہ (واسا)',
        bgHeader: 'bg-sky-50 border-sky-200',
      };
    }
    return {
      icon: <FileText size={16} className="text-emerald-700" />,
      label: 'BILL VOUCHER / CHALLAN',
      labelUrdu: 'دیگر بل و فیس واؤچر',
      bgHeader: 'bg-emerald-50 border-emerald-200',
    };
  };

  const theme = getTheme();

  return (
    <div
      onClick={onZoom}
      className={`relative rounded-2xl overflow-hidden border border-emerald-200/80 bg-white p-3 font-sans group cursor-pointer shadow-xs hover:border-emerald-400 transition-all ${className}`}
      title="Click to zoom bill photo / بڑا کر کے دیکھنے کے لیے کلک کریں"
    >
      <div className={`flex items-center justify-between p-2 rounded-xl border mb-2.5 ${theme.bgHeader}`}>
        <div className="flex items-center gap-1.5">
          {theme.icon}
          <div>
            <div className="text-[10px] font-black tracking-tight text-slate-800 leading-none">
              {theme.label}
            </div>
            <div className="text-[9px] text-slate-500 font-urdu leading-none mt-0.5">
              {theme.labelUrdu}
            </div>
          </div>
        </div>
        <div className="text-[9px] font-mono font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
          OFFICIAL INVOICE
        </div>
      </div>

      <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80 space-y-1.5 text-xs font-mono">
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-slate-500">Ref / ریفرنس:</span>
          <span className="font-bold text-emerald-800 bg-emerald-50 px-1 rounded border border-emerald-200">
            {referenceId}
          </span>
        </div>
        {personName && (
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-500">Consumer:</span>
            <span className="font-semibold text-slate-700 truncate max-w-[130px]">{personName}</span>
          </div>
        )}
        <div className="flex justify-between items-center text-[11px] font-bold border-t border-slate-200 pt-1 text-slate-900">
          <span>Payable Amount:</span>
          <span className="text-emerald-700 font-black">{formattedAmount}</span>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between pt-1 border-t border-dashed border-slate-200">
        <div className="h-4 w-28 bg-[repeating-linear-gradient(90deg,#334155,#334155_2px,transparent_2px,transparent_4px)] opacity-60" />
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 group-hover:bg-emerald-100 px-2 py-0.5 rounded-full transition-colors">
          Zoom 🔍 بڑا کریں
        </span>
      </div>
    </div>
  );
};
