import React, { useState } from 'react';
import {
  X,
  Printer,
  FileText,
  Tag,
  Truck,
  CheckCircle2,
  Phone,
  MapPin,
  Building2,
  Calendar,
  CreditCard,
  Barcode as BarcodeIcon
} from 'lucide-react';
import { UserOrder } from '../types/store';

interface OrderPrintModalProps {
  order: UserOrder | null;
  initialView?: 'invoice' | 'courier_label';
  onClose: () => void;
}

export const OrderPrintModal: React.FC<OrderPrintModalProps> = ({
  order,
  initialView = 'invoice',
  onClose
}) => {
  const [view, setView] = useState<'invoice' | 'courier_label'>(initialView);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  // Barcode pattern generator for visual courier label
  const barcodePattern = [
    3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 3, 1, 2, 4,
    1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-stone-300 flex flex-col max-h-[92vh] overflow-hidden my-auto">
        
        {/* Top Control Bar (Hidden during print) */}
        <div className="p-4 bg-stone-900 text-white flex items-center justify-between no-print border-b border-stone-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('invoice')}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                view === 'invoice'
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-800 text-stone-300 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Tax Invoice / Bill</span>
            </button>
            <button
              onClick={() => setView('courier_label')}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                view === 'courier_label'
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-800 text-stone-300 hover:text-white'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Courier Delivery Label</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Document</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white cursor-pointer rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-stone-100/70">
          <div className="printable-document bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-stone-200 max-w-2xl mx-auto text-stone-900 font-sans">
            
            {/* VIEW 1: TAX INVOICE / ORDER BILL */}
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
                    <p className="text-xs text-stone-600 mt-1">
                      Edayarpalayam Road, Kovundampalayam, Coimbatore - 641030, Tamil Nadu
                    </p>
                    <p className="text-xs text-stone-600">
                      Phone: +91 9894088349 · Email: shruthifashion01@gmail.com
                    </p>
                    <p className="text-[11px] font-mono text-stone-500 mt-0.5">
                      GSTIN / Reg: 33ABCPS1234F1Z5
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

                  <div className="border-t sm:border-t-0 sm:border-l border-stone-200 pt-3 sm:pt-0 sm:pl-4">
                    <p className="font-bold uppercase tracking-wider text-stone-500 text-[10px] mb-1">
                      Dispatch &amp; Delivery Method:
                    </p>
                    <p className="font-semibold text-stone-900">
                      {order.courierPartner || 'Shruthi Fashion Express Courier'}
                    </p>
                    <p className="text-stone-600">Tracking Ref: <span className="font-mono font-bold text-stone-900">{order.trackingNumber || 'SF-TRK-COIMBATORE'}</span></p>
                    <p className="text-stone-600">Delivery Timeline: {order.estimatedDelivery || '2 - 4 Business Days'}</p>
                    <p className="text-stone-600 mt-1">
                      Status: <strong className="text-emerald-700">{order.deliveryStatus || 'Confirmed & Dispatched'}</strong>
                    </p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-stone-300">
                    <thead className="bg-stone-100 text-stone-800 uppercase font-bold text-[10px] border-b border-stone-300">
                      <tr>
                        <th className="py-2.5 px-3 w-8">#</th>
                        <th className="py-2.5 px-3">Item Description</th>
                        <th className="py-2.5 px-3">Size / Color</th>
                        <th className="py-2.5 px-3 text-right">Rate</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 text-stone-800">
                      {order.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-stone-50/50">
                          <td className="py-2.5 px-3 text-stone-500">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-stone-900">
                            {item.product.title}
                            <span className="block text-[10px] font-normal text-stone-500">
                              {item.product.fabric} · {item.product.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            {item.selectedSize}
                            {item.selectedColor ? ` / ${item.selectedColor}` : ''}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums">
                            ₹{item.product.price.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold">
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
                      • In case of any courier package issues, please reach our Coimbatore helpdesk via WhatsApp at +91 9894088349.
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

            {/* VIEW 2: COURIER DELIVERY SHIPPING LABEL */}
            {view === 'courier_label' && (
              <div className="border-4 border-stone-900 rounded-lg p-5 space-y-4 max-w-lg mx-auto bg-white">
                
                {/* Header Badge */}
                <div className="flex items-center justify-between border-b-2 border-stone-900 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-stone-900 text-white rounded flex items-center justify-center font-bold text-xs">
                      SF
                    </div>
                    <div>
                      <h2 className="font-black text-base text-stone-950 uppercase tracking-tight leading-tight">
                        Shruthi Fashion
                      </h2>
                      <span className="text-[10px] text-stone-600 block">Coimbatore Dispatch Centre</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2 py-0.5 bg-stone-900 text-white text-[11px] font-black uppercase tracking-wider rounded">
                      PREPAID
                    </span>
                    <p className="text-[10px] font-bold text-emerald-700 mt-0.5">
                      DO NOT COLLECT CASH
                    </p>
                  </div>
                </div>

                {/* Courier Partner & Routing Barcode */}
                <div className="border-b-2 border-stone-900 pb-3 text-center space-y-1">
                  <div className="flex justify-between text-xs font-bold text-stone-800 px-1">
                    <span>COURIER: {order.courierPartner || 'ST COURIER / DTDC'}</span>
                    <span>TYPE: STANDARD SURFACE APPAREL</span>
                  </div>

                  {/* Visual Barcode Bars */}
                  <div className="py-2 flex items-center justify-center gap-0.5 h-12 bg-stone-50 border border-stone-200 rounded">
                    {barcodePattern.map((width, i) => (
                      <span
                        key={i}
                        className="bg-stone-900 h-9 inline-block"
                        style={{ width: `${width * 2}px` }}
                      />
                    ))}
                  </div>

                  <p className="font-mono font-bold text-xs tracking-widest text-stone-900">
                    AWB / TRK: {order.trackingNumber || `SF-${order.address.pincode}-${order.orderNumber}`}
                  </p>
                </div>

                {/* DESTINATION / SHIP TO (VERY LARGE AND CLEAR FOR COURIER) */}
                <div className="border-2 border-stone-900 rounded-md p-3.5 bg-stone-50">
                  <p className="font-black uppercase tracking-widest text-[11px] text-stone-500 mb-1 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-stone-800" />
                    <span>DELIVER TO / RECIPIENT:</span>
                  </p>

                  <h3 className="text-lg font-black text-stone-950 uppercase">
                    {order.address.fullName}
                  </h3>

                  <div className="text-sm font-semibold text-stone-900 mt-1 leading-snug">
                    <p>{order.address.street}</p>
                    <p>{order.address.area}</p>
                    <p>{order.address.city}, {order.address.state || 'Tamil Nadu'}</p>
                  </div>

                  {/* BIG PIN CODE BOX */}
                  <div className="mt-3 pt-2.5 border-t-2 border-stone-900 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-stone-500 block">
                        DESTINATION PIN:
                      </span>
                      <span className="text-2xl font-black text-stone-950 font-mono tracking-wider">
                        {order.address.pincode}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-black uppercase text-stone-500 block">
                        CONTACT PHONE:
                      </span>
                      <span className="text-base font-black text-stone-950 font-mono">
                        {order.address.phone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RETURN ADDRESS / SHIPPER */}
                <div className="border-t-2 border-stone-900 pt-2.5 text-xs text-stone-700 space-y-0.5">
                  <p className="font-bold uppercase tracking-wider text-[10px] text-stone-500">
                    RETURN ADDRESS / SHIPPED BY:
                  </p>
                  <p className="font-bold text-stone-900">SHRUTHI FASHION</p>
                  <p>Edayarpalayam Road, Kovundampalayam, Coimbatore - 641030</p>
                  <p>Tamil Nadu, India · Ph: +91 9894088349</p>
                </div>

                {/* Package Specs */}
                <div className="border-t border-stone-300 pt-2 flex justify-between text-[11px] font-mono text-stone-600">
                  <span>ORDER: #{order.orderNumber}</span>
                  <span>ITEMS: {order.items.reduce((s, i) => s + i.quantity, 0)} PCS</span>
                  <span>WT: ~0.45 KG</span>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
