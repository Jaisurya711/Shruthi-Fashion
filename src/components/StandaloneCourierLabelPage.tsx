import React, { useEffect, useState } from 'react';
import { Printer, X, ArrowLeft, Scissors, Edit3, Check } from 'lucide-react';
import { Address } from '../types/store';

export const StandaloneCourierLabelPage: React.FC = () => {
  const [toAddress, setToAddress] = useState<Address>(() => {
    const urlParams = new URLSearchParams(window.location.search || (window.location.hash.includes('?') ? window.location.hash.split('?')[1] : ''));
    const urlName = urlParams.get('toName');

    if (urlName) {
      return {
        id: 'print-addr-direct',
        fullName: decodeURIComponent(urlName),
        phone: decodeURIComponent(urlParams.get('toPhone') || '9894088349'),
        street: decodeURIComponent(urlParams.get('toStreet') || 'Door No, Street Name'),
        area: decodeURIComponent(urlParams.get('toArea') || ''),
        city: decodeURIComponent(urlParams.get('toCity') || 'Coimbatore'),
        pincode: decodeURIComponent(urlParams.get('toPincode') || '641030'),
        state: decodeURIComponent(urlParams.get('toState') || 'Tamil Nadu')
      };
    }

    try {
      const saved = localStorage.getItem('shruthi_active_print_label');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.toAddress) return parsed.toAddress;
      }
    } catch {}

    return {
      id: 'print-addr-default',
      fullName: 'Customer Name',
      phone: '9894088349',
      street: 'Door No, Street Name',
      area: 'Area / Landmark',
      city: 'Coimbatore',
      pincode: '641030',
      state: 'Tamil Nadu'
    };
  });

  const [orderNo, setOrderNo] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search || (window.location.hash.includes('?') ? window.location.hash.split('?')[1] : ''));
    return urlParams.get('orderId') || 'SF-ORD-2026';
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Address>(toAddress);

  useEffect(() => {
    document.body.classList.add('standalone-print-page');
    document.body.classList.remove('order-print-active');

    const prevTitle = document.title;
    const sanitizedName = (toAddress.fullName || 'Customer').replace(/[^a-zA-Z0-9]/g, '_');
    document.title = `Courier_Label_${sanitizedName}_${toAddress.pincode || '641030'}`;

    const timer = setTimeout(() => {
      window.print();
    }, 600);

    return () => {
      clearTimeout(timer);
      document.title = prevTitle;
      document.body.classList.remove('standalone-print-page');
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

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setToAddress(editForm);
    setIsEditing(false);
    try {
      localStorage.setItem('shruthi_active_print_label', JSON.stringify({ toAddress: editForm, labelOrderNo: orderNo }));
    } catch {}
  };

  return (
    <div className="standalone-courier-wrapper min-h-screen bg-stone-100 p-2 sm:p-6 flex flex-col items-center justify-start text-stone-900 font-sans print:p-0 print:m-0 print:bg-white">
      <style>{`
        @media print {
          @page {
            size: A5 landscape !important;
            margin: 4mm !important;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #root {
            display: block !important;
            visibility: visible !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
          }
          .standalone-courier-wrapper {
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            display: block !important;
          }
          .landscape-courier-box {
            display: flex !important;
            border: 3px solid #000000 !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          .landscape-courier-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 16px !important;
            width: 100% !important;
          }
        }
      `}</style>

      {/* Top Bar */}
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
            onClick={() => {
              setEditForm(toAddress);
              setIsEditing(!isEditing);
            }}
            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-stone-300"
          >
            <Edit3 className="w-3.5 h-3.5 text-stone-600" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Address'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Label (A5 Landscape)</span>
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

      {isEditing && (
        <form onSubmit={handleSaveEdit} className="no-print w-full max-w-3xl mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg shadow-sm text-xs space-y-3">
          <h4 className="font-bold text-amber-950 flex items-center gap-1.5">
            <Edit3 className="w-4 h-4 text-amber-800" />
            <span>Edit Customer Shipping Address</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-stone-700 font-semibold mb-0.5">Customer Name</label>
              <input
                type="text"
                value={editForm.fullName}
                onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-stone-700 font-semibold mb-0.5">Phone Number</label>
              <input
                type="text"
                value={editForm.phone}
                onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded font-mono font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-stone-700 font-semibold mb-0.5">Door No & Street</label>
              <input
                type="text"
                value={editForm.street}
                onChange={e => setEditForm({ ...editForm, street: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-stone-700 font-semibold mb-0.5">Area / Landmark</label>
              <input
                type="text"
                value={editForm.area || ''}
                onChange={e => setEditForm({ ...editForm, area: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded"
              />
            </div>
            <div>
              <label className="block text-stone-700 font-semibold mb-0.5">City</label>
              <input
                type="text"
                value={editForm.city}
                onChange={e => setEditForm({ ...editForm, city: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-stone-700 font-semibold mb-0.5">PIN Code</label>
              <input
                type="text"
                value={editForm.pincode}
                onChange={e => setEditForm({ ...editForm, pincode: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded font-mono font-bold"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Update Label</span>
            </button>
          </div>
        </form>
      )}

      {/* Printable Courier Sticker (A5 Landscape) */}
      <div className="w-full max-w-3xl bg-white p-3 sm:p-5 rounded-xl shadow-md border border-stone-300 print:shadow-none print:border-none print:p-0 print:m-0 print:w-full">
        <div className="no-print flex items-center justify-between text-[11px] text-stone-500 pb-2 mb-3 border-b border-stone-200">
          <span className="flex items-center gap-1">
            <Scissors className="w-3.5 h-3.5" /> Cut along solid black border to paste on courier parcel / polybag
          </span>
          <span className="font-mono text-stone-600 font-semibold">
            {orderNo}
          </span>
        </div>

        <div className="landscape-courier-box border-3 border-black p-4 sm:p-6 bg-white text-black font-sans min-h-[350px] sm:min-h-[380px] flex flex-col justify-between">
          <div className="landscape-courier-grid grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-stretch flex-1">
            
            {/* FROM ADDRESS (Bottom Left) */}
            <div className="flex flex-col justify-end border-b-2 md:border-b-0 md:border-r-2 border-black pr-0 md:pr-4 pb-3 md:pb-0 h-full">
              <div className="pb-1 mb-auto border-b border-black/30 flex items-center justify-between">
                <span className="font-black text-xs uppercase tracking-wider text-black">
                  DISPATCH FROM:
                </span>
                <span className="text-[10px] font-bold text-stone-700 uppercase">
                  COIMBATORE
                </span>
              </div>

              <div className="flex-1 min-h-[24px]" />

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

            {/* TO ADDRESS (Top Right) */}
            <div className="flex flex-col justify-start pl-0 md:pl-2 space-y-1.5 h-full">
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

              <div className="flex-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandaloneCourierLabelPage;