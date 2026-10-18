import React, { useEffect, useState } from 'react';
import { Printer, X, ArrowLeft, Scissors } from 'lucide-react';
import { Address } from '../types/store';

export const StandaloneCourierLabelPage: React.FC = () => {
  const [toAddress, setToAddress] = useState<Address>(() => {
    // 1. Try localStorage
    try {
      const saved = localStorage.getItem('shruthi_active_print_label');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.toAddress) return parsed.toAddress;
      }
    } catch {}

    // 2. Try URL query parameters
    const params = new URLSearchParams(window.location.search);
    return {
      id: 'print-addr-direct',
      fullName: params.get('toName') || 'Customer Name',
      phone: params.get('toPhone') || '9894088349',
      street: params.get('toStreet') || 'Door No, Street Name',
      area: params.get('toArea') || 'Area / Landmark',
      city: params.get('toCity') || 'Coimbatore',
      pincode: params.get('toPincode') || '641030',
      state: params.get('toState') || 'Tamil Nadu'
    };
  });

  const [orderNo, setOrderNo] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('orderId') || 'SF-ORD-2026';
  });

  // Automatically trigger Chrome print dialog after short delay once page renders
  useEffect(() => {
    const prevTitle = document.title;
    const sanitizedName = (toAddress.fullName || 'Customer').replace(/[^a-zA-Z0-9]/g, '_');
    document.title = `Courier_Label_${sanitizedName}_${toAddress.pincode || '641030'}`;

    const timer = setTimeout(() => {
      window.print();
    }, 450);

    return () => {
      clearTimeout(timer);
      document.title = prevTitle;
    };
  }, [toAddress]);

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    if (window.opener) {
      window.close();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 p-3 sm:p-6 flex flex-col items-center justify-start text-stone-900 font-sans print:p-0 print:m-0 print:bg-white">
      
      {/* Top Controls Bar (Hidden during print) */}
      <div className="no-print w-full max-w-3xl mb-4 bg-white p-3 rounded-lg shadow-sm border border-stone-300 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleClose}
            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-stone-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Close Page</span>
          </button>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            🖨️ Dedicated Chrome Print Page · Size A5 Landscape
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Label Now (A5)</span>
          </button>
          <button
            onClick={handleClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* The Printable Courier Sticker (A5 Landscape) */}
      <div className="w-full max-w-3xl bg-white p-3 sm:p-4 rounded-xl shadow-md border border-stone-300 print:shadow-none print:border-none print:p-0 print:m-0 print:w-full">
        
        {/* Cut guide notice (visible on screen, hidden on print) */}
        <div className="no-print flex items-center justify-between text-[11px] text-stone-500 pb-2 mb-3 border-b border-stone-200">
          <span className="flex items-center gap-1">
            <Scissors className="w-3.5 h-3.5" /> Cut along border to paste on courier parcel / polybag
          </span>
          <span className="font-mono text-stone-600 font-semibold">
            {orderNo}
          </span>
        </div>

        {/* The Physical Courier Sticker Box - Strict A5 Landscape Format */}
        <div className="landscape-courier-box border-3 border-black p-4 sm:p-6 bg-white text-black font-sans min-h-[350px] sm:min-h-[380px] flex flex-col justify-between">
          
          {/* 2-COLUMN GRID: LEFT = FROM (BOTTOM LEFT), RIGHT = TO (TOP RIGHT) */}
          <div className="landscape-courier-grid grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-stretch flex-1">
            
            {/* LEFT COLUMN: FROM ADDRESS (Positioned strictly at bottom-left corner) */}
            <div className="flex flex-col justify-end border-b-2 md:border-b-0 md:border-r-2 border-black pr-0 md:pr-4 pb-3 md:pb-0 h-full">
              
              {/* Top Header for Sender Column */}
              <div className="pb-1 mb-auto border-b border-black/30 flex items-center justify-between">
                <span className="font-black text-xs uppercase tracking-wider text-black">
                  DISPATCH FROM:
                </span>
                <span className="text-[10px] font-bold text-stone-700 uppercase">
                  COIMBATORE
                </span>
              </div>

              {/* Flexible spacer pushing FROM address to the bottom-left corner */}
              <div className="flex-1 min-h-[24px]" />

              {/* LEFT BOTTOM DEFAULT ADDRESS (EXACT WORD-FOR-WORD AS REQUESTED) */}
              <div className="space-y-0.5 text-xs sm:text-sm font-semibold text-black leading-snug">
                <p className="font-black text-xs sm:text-sm uppercase text-stone-800">FROM,</p>
                <p className="font-black text-base sm:text-lg uppercase text-black tracking-wide">
                  SHRUTHI FASHION
                </p>
                <p>1st floor (City cake shop)</p>
                <p>edayarpalayam road,</p>
                <p>Kovundampalayam,</p>
                <p>Coimbatore. TN</p>
                <p className="font-mono font-bold text-sm sm:text-base mt-1">pin code:641030</p>
                <p className="font-mono font-bold text-sm sm:text-base">Ph:9962278349</p>
              </div>

            </div>

            {/* RIGHT COLUMN: TO ADDRESS (Positioned strictly at top-right corner) */}
            <div className="flex flex-col justify-start pl-0 md:pl-2 space-y-1.5 h-full">
              
              {/* Top Header for Destination */}
              <div className="flex items-center justify-between border-b-2 border-black pb-1 mb-1">
                <span className="font-black text-xs sm:text-sm uppercase tracking-wider text-black">
                  TO ADDRESS:
                </span>
                <span className="text-[10px] font-black bg-black text-white px-2 py-0.5 uppercase tracking-wider">
                  DESTINATION
                </span>
              </div>

              <div className="text-xs sm:text-sm font-black uppercase text-black tracking-wide leading-tight">
                TO,
              </div>
              <div className="text-base sm:text-xl font-black uppercase text-black leading-snug">
                {toAddress.fullName || 'CUSTOMER'}
              </div>

              <div className="text-xs sm:text-sm font-bold text-black leading-tight space-y-0.5 pt-0.5">
                <p>{toAddress.street}</p>
                {toAddress.area && <p>{toAddress.area}</p>}
                <p className="uppercase">{toAddress.city}, {toAddress.state || 'Tamil Nadu'}</p>
              </div>

              {/* Highlighted PIN & Contact */}
              <div className="pt-2 mt-2 border-t-2 border-black space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs sm:text-sm font-black uppercase text-black">
                    PIN CODE:
                  </span>
                  <span className="font-mono text-xl sm:text-2xl font-black text-black tracking-widest bg-yellow-100/90 px-3 py-0.5 border border-black/40 rounded-xs">
                    {toAddress.pincode || '641030'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm pt-0.5">
                  <span className="font-bold text-black">PH / MOBILE:</span>
                  <span className="font-mono text-sm sm:text-base font-black text-black tracking-wide">
                    {toAddress.phone || '9962278349'}
                  </span>
                </div>
              </div>

              {/* Empty spacer below TO address */}
              <div className="flex-1" />

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default StandaloneCourierLabelPage;
