import React, { useState } from 'react';
import {
  CheckCircle2,
  X,
  Truck,
  Printer,
  FileText,
  Tag,
  Sparkles
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { OrderPrintModal } from './OrderPrintModal';

export const OrderSuccessModal: React.FC = () => {
  const { orderSuccess, setOrderSuccess } = useStore();
  const [printModalView, setPrintModalView] = useState<'invoice' | 'courier_label' | null>(null);

  if (!orderSuccess) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-stone-300 overflow-hidden my-6">
          
          {/* Close Button */}
          <button
            onClick={() => setOrderSuccess(null)}
            className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Header Banner */}
          <div className="bg-emerald-800 text-white p-6 sm:p-8 text-center relative">
            <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/20 shadow-inner">
              <CheckCircle2 className="w-8 h-8 text-emerald-300" />
            </div>
            <span className="text-xs uppercase tracking-widest text-emerald-200 font-semibold flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Payment Successful &amp; Order Placed</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold mt-1">Thank You for Your Order!</h2>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1">
              Order Reference: <strong className="font-mono text-white tracking-wider">{orderSuccess.orderNumber}</strong>
            </p>
          </div>

          {/* Order Content Stage */}
          <div className="p-5 sm:p-8 space-y-5 text-xs text-stone-700">
            
            {/* Automatic Confirmation Notice (Customer doesn't need to click WhatsApp) */}
            <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-xl flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-emerald-950 text-xs">
                  Order Confirmed &amp; Automatically Registered
                </p>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Your order is confirmed and automatically registered in our Coimbatore store management system. An itemized order summary and invoice will be sent directly to your WhatsApp (<strong className="text-emerald-950 font-semibold">+91 {orderSuccess.address.phone}</strong>) from Shruthi Sarees (<strong className="text-emerald-950 font-semibold">+91 98940 88349</strong>). No action required from you!
                </p>
              </div>
            </div>

            {/* Dispatch Notice */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg flex items-start gap-3">
              <Truck className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold text-stone-900">
                  Courier Doorstep Delivery (₹{orderSuccess.shippingFee})
                </p>
                <p className="text-stone-600">
                  Estimated Delivery: <strong className="text-stone-900">{orderSuccess.estimatedDelivery}</strong>. Your apparel will be securely packed at our Coimbatore workshop.
                </p>
              </div>
            </div>

            {/* Delivery & Billing Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-stone-200 pb-4">
              <div>
                <p className="font-bold text-stone-900 uppercase tracking-wider text-[11px] mb-1">
                  Shipping Destination
                </p>
                <p className="font-medium text-stone-900">{orderSuccess.address.fullName}</p>
                <p>{orderSuccess.address.street}, {orderSuccess.address.area}</p>
                <p>{orderSuccess.address.city} - {orderSuccess.address.pincode}</p>
                <p className="text-stone-500 font-mono mt-0.5">Phone: {orderSuccess.address.phone}</p>
              </div>
              <div>
                <p className="font-bold text-stone-900 uppercase tracking-wider text-[11px] mb-1">
                  Payment &amp; Invoice
                </p>
                <p>Payment Method: <strong className="text-stone-900">{orderSuccess.paymentMethod}</strong></p>
                <p>Status: <strong className="text-emerald-700 font-medium">Completed &amp; Verified</strong></p>
                {orderSuccess.paymentDetails?.razorpayPaymentId && (
                  <p className="text-[11px] font-mono text-blue-900 mt-0.5">
                    Razorpay ID: {orderSuccess.paymentDetails.razorpayPaymentId}
                  </p>
                )}
                <p className="text-stone-500 mt-0.5">Date: {orderSuccess.date}</p>
              </div>
            </div>

            {/* Purchased Items List */}
            <div>
              <p className="font-bold text-stone-900 uppercase tracking-wider text-[11px] mb-2.5">
                Itemized Order Summary
              </p>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                {orderSuccess.items.map((item) => (
                  <div key={item.id} className="p-2.5 bg-stone-50/50 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=128&q=80'}
                        alt={item.product.title}
                        referrerPolicy="no-referrer"
                        className="w-10 h-12 object-cover object-top rounded border border-stone-200 shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-stone-900 line-clamp-1">{item.product.title}</p>
                        <p className="text-[11px] text-stone-500">
                          {item.selectedSize} · {item.selectedColor} · Qty {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-stone-900 tabular-nums shrink-0">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="p-3.5 bg-stone-50 rounded-lg space-y-1.5 border border-stone-200 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal:</span>
                <span className="tabular-nums font-medium">₹{orderSuccess.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Courier Delivery Fee:</span>
                <span className="tabular-nums font-semibold text-stone-900">
                  {orderSuccess.shippingFee === 0 ? 'FREE' : `₹${orderSuccess.shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-stone-900 pt-2 border-t border-stone-200">
                <span>Total Paid:</span>
                <span className="tabular-nums text-amber-900">
                  ₹{orderSuccess.total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Action Buttons: Print Bill / Label and Continue */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPrintModalView('invoice')}
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-md font-semibold text-xs flex items-center gap-1.5 cursor-pointer border border-stone-300 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-stone-600" />
                  <span>Print Bill / Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintModalView('courier_label')}
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-md font-semibold text-xs flex items-center gap-1.5 cursor-pointer border border-stone-300 transition-colors"
                >
                  <Tag className="w-3.5 h-3.5 text-amber-800" />
                  <span>Courier Label</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setOrderSuccess(null)}
                className="w-full sm:w-auto px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-md font-semibold cursor-pointer transition-colors shadow-sm text-center"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Invoice / Courier Label Modal */}
      {printModalView && (
        <OrderPrintModal
          order={orderSuccess}
          initialView={printModalView}
          onClose={() => setPrintModalView(null)}
        />
      )}
    </>
  );
};