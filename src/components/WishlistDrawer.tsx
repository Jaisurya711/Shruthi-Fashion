import React from 'react';
import { X, Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const WishlistDrawer: React.FC = () => {
  const {
    isWishlistOpen,
    setIsWishlistOpen,
    wishlist,
    products,
    toggleWishlist,
    addToCart,
    setActiveProduct
  } = useStore();

  if (!isWishlistOpen) return null;

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/40 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="w-full max-w-md bg-[#FAF9F5] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 fill-rose-600 text-rose-600" />
            <h2 className="font-serif font-bold text-lg text-stone-900">
              My Wishlist ({wishlistedProducts.length})
            </h2>
          </div>
          <button
            onClick={() => setIsWishlistOpen(false)}
            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {wishlistedProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
              <Heart className="w-12 h-12 text-stone-300 stroke-[1.5] mb-3" />
              <p className="font-serif text-lg font-semibold text-stone-800">Your wishlist is empty</p>
              <p className="text-xs text-stone-500 mt-1 max-w-xs">
                Save your favorite kurtis, western wear, jeans, and shawls to review later.
              </p>
            </div>
          ) : (
            wishlistedProducts.map((p) => (
              <div
                key={p.id}
                className="flex gap-3 bg-white p-3 rounded-md border border-stone-200 shadow-2xs"
              >
                <div
                  onClick={() => {
                    setActiveProduct(p);
                    setIsWishlistOpen(false);
                  }}
                  className="w-20 h-24 rounded bg-stone-100 overflow-hidden shrink-0 cursor-pointer"
                >
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between text-xs">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h4
                        onClick={() => {
                          setActiveProduct(p);
                          setIsWishlistOpen(false);
                        }}
                        className="font-semibold text-stone-900 line-clamp-1 cursor-pointer hover:text-amber-800"
                      >
                        {p.title}
                      </h4>
                      <button
                        onClick={() => toggleWishlist(p.id)}
                        className="text-stone-400 hover:text-rose-600 p-0.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-stone-500 mt-0.5">{p.fabric}</p>
                    <p className="font-bold text-stone-900 tabular-nums mt-1 text-sm">
                      ₹{p.price.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      addToCart(p, p.sizes[0] || 'Standard', p.colors[0]?.name || 'Original', 1);
                      toggleWishlist(p.id);
                    }}
                    className="mt-2 py-1.5 px-3 bg-stone-900 hover:bg-stone-800 text-[#FAF9F5] text-xs font-medium rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move to Bag</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
