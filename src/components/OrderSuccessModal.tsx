import React from 'react';
import {
  CheckCircle2,
  X,
  Truck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const OrderSuccessModal: React.FC = () => {
  const { orderSuccess, setOrderSuccess } = useStore();

  if (!orderSuccess) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl border border-stone-300 overflow-hidden my-6">
        
        {/* Close Button */}
        <button
          onClick={() => setOrderSuccess(null)}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Banner */}
        <div className="bg-emerald-800 text-white p-6 sm:p-8 text-center relative">
          <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/20">
            <CheckCircle2 className="w-8 h-8 text-emerald-300" />
          </div>
          <span className="text-xs uppercase tracking-widest text-emerald-200 font-semibold">Payment Successful & Confirmed</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold mt-1">Thank You for Your Order!</h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            Order Reference: <strong className="font-mono text-white">{orderSuccess.orderNumber}</strong>
          </p>
        </div>

        {/* Order Content Stage */}
        <div className="p-6 sm:p-8 space-y-6 text-xs text-stone-700">

          {/* Dispatch Notice (Without Tracking ID) */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-md flex items-start gap-3">
            <Truck className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-stone-900">
                Dispatched via Shruthi Fashion Courier Service (Doorstep Delivery)
              </p>
              <p className="text-stone-600">
                Estimated Delivery: <strong className="text-stone-900">{orderSuccess.estimatedDelivery}</strong>. Your garments will be packed securely with care.
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
              <p className="text-stone-500 font-mono mt-0.5">{orderSuccess.address.phone}</p>
            </div>

            <div>
              <p className="font-bold text-stone-900 uppercase tracking-wider text-[11px] mb-1">
                Payment & Invoice Details
              </p>
              <p>Method: <strong className="text-stone-900">{orderSuccess.paymentMethod}</strong></p>
              <p>Status: <strong className="text-emerald-700 font-medium">Completed (Verified)</strong></p>
              {orderSuccess.paymentDetails?.razorpayPaymentId && (
                <p className="text-[11px] font-mono text-blue-900 mt-0.5">
                  Razorpay Payment ID: <strong>{orderSuccess.paymentDetails.razorpayPaymentId}</strong>
                </p>
              )}
              <p>Store: <strong>Shruthi Fashion, Kovundampalayam, Coimbatore (641030)</strong></p>
              <p className="text-stone-500 mt-0.5">Date: {orderSuccess.date}</p>
            </div>
          </div>

          {/* Purchased Items List */}
          <div>
            <p className="font-bold text-stone-900 uppercase tracking-wider text-[11px] mb-3">
              Itemized Order Summary
            </p>
            <div className="divide-y divide-stone-100 border border-stone-200 rounded-md overflow-hidden">
              {orderSuccess.items.map((item) => (
                <div key={item.id} className="p-3 bg-stone-50/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      referrerPolicy="no-referrer"
                      className="w-10 h-12 object-cover object-top rounded border border-stone-200"
                    />
                    <div>
                      <p className="font-semibold text-stone-900">{item.product.title}</p>
                      <p className="text-[11px] text-stone-500">
                        {item.selectedSize} · {item.selectedColor} · Qty {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-stone-900 tabular-nums text-xs">
                    ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="p-4 bg-stone-50 rounded-md space-y-1.5 border border-stone-200 text-xs">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="tabular-nums">₹{orderSuccess.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span className="tabular-nums text-emerald-700">
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

          {/* Action */}
          <div className="flex items-center justify-end pt-2">
            <button
              onClick={() => setOrderSuccess(null)}
              className="w-full sm:w-auto px-8 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded font-semibold cursor-pointer transition-colors shadow-sm text-center"
            >
              Continue Shopping
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
