import React, { useState } from 'react';
import {
  X,
  Printer,
  FileText,
  Tag,
  Truck,
  Phone,
  CheckCircle2,
  Calendar,
  CreditCard,
  MapPin,
  Scissors
} from 'lucide-react';
import { UserOrder } from '../types/store';

interface OrderPrintModalProps {
  order: UserOrder | null;
  initialView?: 'invoice' | 'courier_label';
  onClose: () => void;
}

export const OrderPrintModal: React.FC<OrderPrintModalProps> = ({
  order,
  initialView = 'courier_label',
  onClose
}) => {
  const [view, setView] = useState<'invoice' | 'courier_label'>(initialView);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  // Barcode pattern for visual courier routing sticker
  const barcodePattern = [
    3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 3, 1, 2, 4,
    1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 3, 1, 4
  ];

  const totalQuantity = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-stone-300 flex flex-col max-h-[94vh] overflow-hidden my-auto">
        
        {/* Top Control Bar (Hidden during print) */}
        <div className="p-4 bg-stone-900 text-white flex items-center justify-between no-print border-b border-stone-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('courier_label')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                view === 'courier_label'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-800 text-stone-300 hover:text-white'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Courier Delivery Label</span>
            </button>
            <button
              onClick={() => setView('invoice')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                view === 'invoice'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-800 text-stone-300 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Tax Invoice / Bill</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Label</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white cursor-pointer rounded-lg hover:bg-stone-800 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-stone-100/70">
          <div className="printable-document bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-stone-200 max-w-2xl mx-auto text-stone-900 font-sans">
            
            {/* VIEW 1: COURIER DELIVERY SHIPPING LABEL (MATCHES PARCEL POUCH EXACTLY) */}
            {view === 'courier_label' && (
              <div className="courier-shipping-label border-2 border-dashed border-stone-400 p-2 sm:p-3 rounded-lg bg-white">
                
                {/* Cut helper notice (visible in web preview) */}
                <div className="no-print flex items-center justify-between text-[11px] text-stone-500 pb-2 mb-2 border-b border-stone-200">
                  <span className="flex items-center gap-1">
                    <Scissors className="w-3.5 h-3.5" /> Cut along dashed border to stick on courier polybag / parcel
                  </span>
                  <span className="font-semibold text-stone-700">Size: Standard Courier Sticker (4×6")</span>
                </div>

                {/* The Physical Courier Sticker Box */}
                <div className="border-3 border-black p-4 sm:p-5 bg-white space-y-4 text-black font-sans">
                  
                  {/* TOP ROW: [TOP LEFT: Courier / Booking Details] & [TOP RIGHT: TO ADDRESS CORNER] */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pb-3 border-b-2 border-black">
                    
                    {/* TOP LEFT (5 cols): Courier Service & Booking Meta */}
                    <div className="sm:col-span-5 flex flex-col justify-between pr-2 border-b sm:border-b-0 sm:border-r-2 border-black pb-3 sm:pb-0">
                      <div>
                        {/* Courier Dispatch Stamp */}
                        <div className="inline-block px-2.5 py-1 bg-red-600 text-white font-black text-xs uppercase tracking-wider rounded-xs mb-2">
                          SPEED COURIER / AIR CARGO
                        </div>
                        <div className="text-[11px] leading-tight font-semibold text-stone-800 space-y-0.5">
                          <p><strong className="text-black">SERVICE:</strong> SURFACE APPAREL</p>
                          <p><strong className="text-black">DATE:</strong> {order.date}</p>
                          <p><strong className="text-black">ORDER ID:</strong> #{order.orderNumber}</p>
                          <p><strong className="text-black">PIECES:</strong> {totalQuantity} {totalQuantity === 1 ? 'Item' : 'Items'}</p>
                          <p><strong className="text-black">WEIGHT:</strong> ~{(0.35 * totalQuantity).toFixed(2)} KG</p>
                        </div>
                      </div>

                      {/* Payment Status Stamp */}
                      <div className="mt-3 pt-2 border-t border-black/40">
                        {order.paymentMethod === 'COD' ? (
                          <div className="px-2 py-1 bg-amber-50 border-2 border-amber-700 text-amber-900 text-center font-black text-xs uppercase">
                            COLLECT CASH: ₹{order.total}
                          </div>
                        ) : (
                          <div className="px-2 py-1 bg-emerald-50 border-2 border-black text-black text-center font-black text-xs uppercase tracking-wider">
                            PREPAID · DO NOT COLLECT CASH
                          </div>
                        )}
                      </div>
                    </div>

                    {/* TOP RIGHT (7 cols): TO ADDRESS (PLACED AT TOP RIGHT SIDE CORNER) */}
                    <div className="sm:col-span-7 pl-0 sm:pl-3 space-y-1">
                      <div className="flex items-center justify-between border-b border-black pb-1 mb-1.5">
                        <span className="font-black text-sm uppercase tracking-wider text-black">
                          TO ADDRESS:
                        </span>
                        <span className="text-[10px] font-bold bg-black text-white px-1.5 py-0.5 uppercase">
                          DESTINATION
                        </span>
                      </div>

                      <div className="text-sm font-black uppercase text-black tracking-wide leading-tight">
                        TO,
                      </div>
                      <div className="text-base font-black uppercase text-black leading-snug">
                        {order.address.fullName}
                      </div>

                      <div className="text-xs font-bold text-black leading-tight space-y-0.5 pt-0.5">
                        <p>{order.address.street}</p>
                        <p>{order.address.area}</p>
                        <p className="uppercase">{order.address.city}, {order.address.state || 'Tamil Nadu'}</p>
                      </div>

                      {/* Highlighted PIN & Contact */}
                      <div className="pt-2 mt-2 border-t-2 border-black space-y-1">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs font-black uppercase text-black">
                            PIN CODE:
                          </span>
                          <span className="font-mono text-xl sm:text-2xl font-black text-black tracking-widest bg-yellow-100/80 px-2 py-0.5 border border-black/30 rounded-xs">
                            {order.address.pincode}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="font-bold text-black">PH / MOBILE:</span>
                          <span className="font-mono text-sm font-black text-black">
                            {order.address.phone}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* BOTTOM ROW: [LEFT BOTTOM: DEFAULT FROM ADDRESS] & [BOTTOM RIGHT: BARCODE & ROUTING] */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1 items-start">
                    
                    {/* LEFT BOTTOM DEFAULT ADDRESS (WORD-FOR-WORD AS REQUESTED) */}
                    <div className="sm:col-span-6 pr-0 sm:pr-3 border-b sm:border-b-0 sm:border-r-2 border-black pb-3 sm:pb-0 space-y-0.5 text-xs font-semibold text-black leading-snug">
                      <p className="font-black text-sm uppercase tracking-wider border-b border-black pb-1 mb-1">
                        FROM ADDRESS:
                      </p>
                      
                      {/* Exact user requested block */}
                      <p className="font-black text-xs uppercase">FROM,</p>
                      <p className="font-black text-sm uppercase text-black tracking-wide">
                        SHRUTHI FASHION
                      </p>
                      <p>1st floor (City cake shop)</p>
                      <p>edayarpalayam road,</p>
                      <p>Kovundampalayam,</p>
                      <p>Coimbatore. TN</p>
                      <p className="font-mono font-bold text-xs mt-1">pin code:641030</p>
                      <p className="font-mono font-bold text-xs">Ph:9962278349</p>
                    </div>

                    {/* BOTTOM RIGHT: BARCODE, AWB ROUTING & INSTRUCTIONS */}
                    <div className="sm:col-span-6 pl-0 sm:pl-2 flex flex-col justify-between text-center space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-wider text-stone-700">
                        COURIER TRACKING / AWB ROUTING
                      </p>

                      {/* Scannable Visual Barcode */}
                      <div className="py-2 px-1 flex items-center justify-center gap-[2px] h-12 bg-white border border-black rounded-xs">
                        {barcodePattern.map((width, i) => (
                          <span
                            key={i}
                            className="bg-black h-8 inline-block"
                            style={{ width: `${Math.min(width * 2, 6)}px` }}
                          />
                        ))}
                      </div>

                      <p className="font-mono font-black text-xs tracking-widest text-black">
                        AWB: {order.trackingNumber || `SF-${order.address.pincode}-${order.orderNumber}`}
                      </p>

                      <div className="pt-1 border-t border-black/40 text-[10px] font-bold text-stone-800 uppercase flex justify-between">
                        <span>DEST: {order.address.city || 'COIMBATORE'}</span>
                        <span className="text-red-700">HANDLE WITH CARE</span>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Footer dispatch tag */}
                <div className="pt-2 text-[10px] text-stone-500 flex justify-between uppercase font-mono">
                  <span>Shruthi Fashion Coimbatore · Dispatch Dept</span>
                  <span>Printed via Shruthi Fashion Portal</span>
                </div>

              </div>
            )}

            {/* VIEW 2: TAX INVOICE / ORDER BILL */}
            {view === 'invoice' && (
              <div className="space-y-6">
                {/* Invoice Header */}
                <div className="border-b-2 border-stone-900 pb-4 flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <h1 className="font-serif font-black text-2xl tracking-wide text-stone-950 uppercase">
                      Shruthi Fashion
                    </h1>
                    <p className="text-xs text-stone-600 font-medium mt-0.5">
                      Women's Ethnic Wear · Daily Collections · Coimbatore Handlooms
                    </p>
                    <p className="text-xs text-stone-700 mt-1">
                      1st floor (City cake shop), Edayarpalayam Road, Kovundampalayam, Coimbatore - 641030, Tamil Nadu
                    </p>
                    <p className="text-xs text-stone-700">
                      Phone: +91 9962278349 · WhatsApp: +91 9894088349
                    </p>
                  </div>

                  <div className="sm:text-right bg-stone-50 p-3 rounded border border-stone-200 sm:border-0 sm:bg-transparent sm:p-0">
                    <span className="inline-block px-2.5 py-1 bg-stone-900 text-white text-[11px] font-bold uppercase tracking-widest rounded-xs mb-1.5">
                      TAX INVOICE / BILL
                    </span>
                    <p className="text-xs font-mono font-bold text-stone-900">
                      Invoice No: INV-2026-{order.orderNumber.replace(/[^0-9]/g, '').slice(-4) || '1021'}
                    </p>
                    <p className="text-xs text-stone-600">
                      Date: <strong className="text-stone-900">{order.date}</strong>
                    </p>
                    <p className="text-xs text-stone-600">
                      Order ID: <strong className="font-mono text-stone-900">{order.orderNumber}</strong>
                    </p>
                    <p className="text-xs text-emerald-800 font-semibold mt-1">
                      Payment: {order.paymentMethod} (PAID)
                    </p>
                  </div>
                </div>

                {/* Bill To & Ship To Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-stone-200 rounded p-4 bg-stone-50/50 text-xs">
                  <div>
                    <p className="font-bold uppercase tracking-wider text-stone-500 text-[10px] mb-1">
                      Billed &amp; Shipped To:
                    </p>
                    <p className="text-sm font-bold text-stone-900">{order.address.fullName}</p>
                    <p className="text-stone-700 mt-0.5">{order.address.street}</p>
                    <p className="text-stone-700">{order.address.area}</p>
                    <p className="text-stone-900 font-medium">
                      {order.address.city} - {order.address.pincode}, {order.address.state || 'Tamil Nadu'}
                    </p>
                    <p className="font-mono font-semibold text-stone-900 mt-1">
                      Mobile: {order.address.phone}
                    </p>
                  </div>

                  <div>
                    <p className="font-bold uppercase tracking-wider text-stone-500 text-[10px] mb-1">
                      Dispatch &amp; Dispatcher Details:
                    </p>
                    <p className="font-semibold text-stone-900">Shruthi Fashion Dispatch Unit</p>
                    <p className="text-stone-600">Courier Partner: {order.courierPartner || 'Speed Courier / ST Courier'}</p>
                    <p className="text-stone-600">
                      Tracking No: <span className="font-mono font-semibold text-stone-900">{order.trackingNumber || 'Assigned upon pickup'}</span>
                    </p>
                    <p className="text-stone-600">Origin: Kovundampalayam, Coimbatore</p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border border-stone-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-900 text-white text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Item Description</th>
                        <th className="py-2.5 px-3">Size &amp; Color</th>
                        <th className="py-2.5 px-3 text-right">Price</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {order.items.map((item, index) => (
                        <tr key={index} className="hover:bg-stone-50/50">
                          <td className="py-2.5 px-3 text-stone-500 font-mono">{index + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-stone-900">
                            {item.product.title}
                          </td>
                          <td className="py-2.5 px-3 text-stone-600">
                            {item.selectedSize} / {item.selectedColor}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums text-stone-700">
                            ₹{item.product.price.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3 text-center tabular-nums text-stone-900 font-medium">
                            {item.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold tabular-nums text-stone-900">
                            ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Calculations & Totals */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-1">
                  <div className="text-[11px] text-stone-500 space-y-1 sm:max-w-xs">
                    <p className="font-bold text-stone-800 uppercase tracking-wide">
                      Terms &amp; Exchange Policy:
                    </p>
                    <p>
                      • 7 days size exchange for unworn apparel with original tags intact.
                    </p>
                    <p>
                      • In case of any courier package issues, please reach our Coimbatore helpdesk at +91 9962278349.
                    </p>
                  </div>

                  <div className="w-full sm:w-64 space-y-1.5 text-xs bg-stone-50 p-3 rounded border border-stone-200">
                    <div className="flex justify-between text-stone-600">
                      <span>Items Subtotal:</span>
                      <span className="tabular-nums font-medium">₹{order.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Courier Delivery Fee:</span>
                      <span className="tabular-nums font-semibold text-stone-900">
                        {order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}
                      </span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Discount:</span>
                        <span className="tabular-nums">-₹{order.discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-sm text-stone-950 pt-2 border-t border-stone-300">
                      <span>Net Total Paid:</span>
                      <span className="tabular-nums text-amber-900">₹{order.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Stamp & Authorized Signature */}
                <div className="pt-6 border-t border-stone-200 flex justify-between items-end text-xs text-stone-500">
                  <div>
                    <p className="font-serif font-bold text-stone-900">Shruthi Fashion · Kovundampalayam</p>
                    <p className="text-[10px]">Computer generated invoice. No signature required.</p>
                  </div>
                  <div className="text-right">
                    <div className="w-32 h-10 border-b border-stone-400 mb-1 mx-auto sm:ml-auto"></div>
                    <p className="font-semibold text-stone-800 text-[11px]">Authorized Signatory</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderPrintModal;
