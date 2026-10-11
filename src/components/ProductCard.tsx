import React, { useState } from 'react';
import { Heart, ShoppingBag, Star, CreditCard } from 'lucide-react';
import { Product } from '../types/store';
import { useStore } from '../context/StoreContext';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const {
    setActiveProduct,
    addToCart,
    toggleWishlist,
    isWishlisted,
    user,
    setIsAuthOpen,
    setPendingCheckoutAfterAuth,
    setIsCheckoutOpen
  } = useStore();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const wishlisted = isWishlisted(product.id);

  const price = Number(product.price) || 0;
  const originalPrice = Number(product.originalPrice) || price;
  const discountPercent = originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Use first available size and color
    addToCart(
      product,
      product.sizes?.[0] || 'Standard',
      product.colors?.[0]?.name || 'Original',
      1
    );
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(
      product,
      product.sizes?.[0] || 'Standard',
      product.colors?.[0]?.name || 'Original',
      1
    );
    if (!user) {
      setPendingCheckoutAfterAuth(true);
      setIsAuthOpen(true);
    } else {
      setIsCheckoutOpen(true);
    }
  };

  const displayImage = product.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';

  return (
    <article
      onClick={() => setActiveProduct(product)}
      className="group relative flex flex-col bg-white border border-stone-200/90 rounded-md overflow-hidden transition-all duration-200 hover:shadow-md hover:border-stone-300 cursor-pointer"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
        {/* Fallback container if image fails or loading */}
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 bg-stone-200 animate-pulse" />
        )}

        {imgError ? (
          <div className="absolute inset-0 bg-stone-100 flex flex-col items-center justify-center p-4 text-center">
            <span className="font-serif text-lg font-bold text-stone-700">{product.title}</span>
            <span className="text-xs text-stone-500 mt-1">{product.fabric}</span>
          </div>
        ) : (
          <img
            src={displayImage}
            alt={product.title}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-3.5 flex flex-col flex-1 justify-between bg-white">
        {/* Category & Subcategory Text + Wishlist Action */}
        <div>
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider mb-1">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-semibold text-amber-900">{product.subcategory || product.category}</span>
              <span className="text-stone-400">/</span>
              <span className="truncate text-stone-500 font-normal">{product.fabric}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              className="text-stone-400 hover:text-rose-600 transition-colors p-1 cursor-pointer shrink-0"
            >
              <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
            </button>
          </div>

          {/* Product Title */}
          <h3 className="text-sm font-semibold text-stone-900 line-clamp-1 group-hover:text-amber-800 transition-colors">
            {product.title}
          </h3>

          <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
            {product.subtitle}
          </p>
        </div>

        {/* Pricing & Rating Row */}
        <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-stone-900 tabular-nums">
              ₹{price.toLocaleString('en-IN')}
            </span>
            {originalPrice > price && (
              <span className="text-xs text-stone-400 line-through tabular-nums">
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-[11px] font-medium text-emerald-700">
                {discountPercent}% off
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs text-stone-600">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span className="font-medium tabular-nums">{product.rating || 4.8}</span>
            <span className="text-[11px] text-stone-400">({product.reviewCount || 10})</span>
          </div>
        </div>

        {/* Direct Action Buttons - Always Visible for 1-Click Buy Now */}
        <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center gap-2">
          <button
            onClick={handleQuickAdd}
            className="flex-1 py-2 px-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Bag</span>
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-2 py-2 px-3 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </article>
  );
};
