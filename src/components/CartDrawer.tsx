import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQty,
    removeFromCart,
    cartSubtotal,
    setIsCheckoutOpen,
    user,
    setIsAuthOpen,
    setPendingCheckoutAfterAuth
  } = useStore();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    if (!user) {
      setPendingCheckoutAfterAuth(true);
      setIsAuthOpen(true);
    } else {
      setIsCheckoutOpen(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/40 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="w-full max-w-md bg-[#FAF9F5] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-800" />
            <h2 className="font-serif font-bold text-lg text-stone-900">
              Shopping Bag ({cart.reduce((s, i) => s + i.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart items summary count */}
        <div className="bg-stone-100 border-b border-stone-200 px-4 py-2 text-xs flex items-center justify-between text-stone-600">
          <span>Items in Bag: <strong>{cart.reduce((sum, item) => sum + item.quantity, 0)}</strong></span>
          <span>Direct Store & Courier Dispatch</span>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
              <ShoppingBag className="w-12 h-12 text-stone-300 mb-3 stroke-[1.5]" />
              <p className="font-serif text-lg font-semibold text-stone-800">Your bag is empty</p>
              <p className="text-xs text-stone-500 mt-1 max-w-xs">
                Explore trending short kurtis, straight cut, umbrella, feeding kurtis, western wear, jeans, and shawls at Shruthi Fashion.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-5 px-5 py-2.5 bg-stone-900 text-white text-xs font-medium rounded-md hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Browse Collections
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 bg-white p-3 rounded-md border border-stone-200 shadow-2xs"
              >
                {/* Thumbnail */}
                <div className="w-20 h-24 rounded bg-stone-100 overflow-hidden shrink-0">
                  <img
                    src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80'}
                    alt={item.product.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between text-xs">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-semibold text-stone-900 line-clamp-1">
                        {item.product.title}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-400 hover:text-rose-600 p-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-[11px] text-stone-500 mt-0.5 space-x-1.5">
                      <span>Size: <strong>{item.selectedSize}</strong></span>
                      <span>·</span>
                      <span>Color: <strong>{item.selectedColor}</strong></span>
                    </div>
                  </div>

                  {/* Quantity and Price */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                    <div className="flex items-center border border-stone-200 rounded">
                      <button
                        onClick={() => updateCartQty(item.id, item.quantity - 1)}
                        className="px-2 py-0.5 text-stone-600 hover:text-stone-900 font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-2 py-0.5 font-semibold text-stone-900 tabular-nums text-[11px]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQty(item.id, item.quantity + 1)}
                        className="px-2 py-0.5 text-stone-600 hover:text-stone-900 font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-semibold text-stone-900 tabular-nums text-sm">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-stone-200 bg-white space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-medium text-stone-900 tabular-nums">
                  ₹{cartSubtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Standard Courier Delivery</span>
                <span className="font-medium text-stone-800">
                  ₹80
                </span>
              </div>
              <div className="flex justify-between text-stone-900 font-bold text-sm pt-2 border-t border-stone-100">
                <span>Total Amount</span>
                <span className="tabular-nums text-amber-900">
                  ₹{(cartSubtotal + 80).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs sm:text-sm rounded-md shadow-sm transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Proceed to Razorpay Checkout</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              <span>256-Bit SSL Encrypted · Razorpay Payment Gateway</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
