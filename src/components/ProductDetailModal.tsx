import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Heart,
  Star,
  Check,
  Truck,
  RotateCcw,
  ShieldCheck,
  Ruler,
  ShoppingBag,
  Sparkles,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  ArrowLeft
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ProductDetailModal: React.FC = () => {
  const {
    activeProduct,
    setActiveProduct,
    addToCart,
    toggleWishlist,
    isWishlisted,
    setIsCheckoutOpen,
    user,
    setIsAuthOpen,
    setPendingCheckoutAfterAuth
  } = useStore();

  const productImages = Array.isArray(activeProduct?.images) && activeProduct.images.length > 0
    ? activeProduct.images
    : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'];
  const productColors = Array.isArray(activeProduct?.colors) && activeProduct.colors.length > 0
    ? activeProduct.colors
    : [{ name: 'Standard', hex: '#842D2D' }];
  const productSizes = Array.isArray(activeProduct?.sizes) && activeProduct.sizes.length > 0
    ? activeProduct.sizes
    : ['Standard', 'Free Size'];
  const productReviews = Array.isArray(activeProduct?.reviews) ? activeProduct.reviews : [];

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(productColors[0]?.name || 'Standard');
  const [selectedSize, setSelectedSize] = useState(productSizes[0] || 'Standard');
  const [quantity, setQuantity] = useState(1);
  const [customNotes, setCustomNotes] = useState('');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  // Touch swipe tracking for mobile devices
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Sync state whenever activeProduct changes
  useEffect(() => {
    if (activeProduct) {
      const colors = Array.isArray(activeProduct.colors) && activeProduct.colors.length > 0
        ? activeProduct.colors
        : [{ name: 'Standard', hex: '#842D2D' }];
      const sizes = Array.isArray(activeProduct.sizes) && activeProduct.sizes.length > 0
        ? activeProduct.sizes
        : ['Standard', 'Free Size'];
      setSelectedImageIdx(0);
      setSelectedColor(colors[0]?.name || 'Standard');
      setSelectedSize(sizes[0] || 'Standard');
      setQuantity(1);
      setCustomNotes('');
      setShowSizeGuide(false);
      setIsZoomed(false);
      setAddedToast(false);

      // Lock body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [activeProduct]);

  if (!activeProduct) return null;

  const wishlisted = isWishlisted(activeProduct.id);
  const price = Number(activeProduct.price) || 0;
  const originalPrice = Number(activeProduct.originalPrice) || price;
  const discountPercent = originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  // Mobile swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchStartYRef.current = e.targetTouches[0].clientY;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const distanceX = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 40;

    if (distanceX > minSwipeDistance) {
      setSelectedImageIdx((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
    } else if (distanceX < -minSwipeDistance) {
      setSelectedImageIdx((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
    touchEndXRef.current = null;
  };

  const handleAddToCart = () => {
    addToCart(
      activeProduct,
      selectedSize || productSizes[0],
      selectedColor || productColors[0]?.name,
      quantity,
      customNotes
    );
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleBuyNow = () => {
    addToCart(
      activeProduct,
      selectedSize || productSizes[0],
      selectedColor || productColors[0]?.name,
      quantity,
      customNotes
    );
    setActiveProduct(null);

    if (!user) {
      setPendingCheckoutAfterAuth(true);
      setIsAuthOpen(true);
    } else {
      setIsCheckoutOpen(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-start sm:items-center justify-center p-0 sm:p-4 md:p-6 animate-in fade-in">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-[#FAF9F5] sm:rounded-xl shadow-2xl border-0 sm:border sm:border-stone-300 min-h-screen sm:min-h-0 sm:max-h-[92vh] flex flex-col md:flex-row overflow-y-auto sm:overflow-hidden pb-24 md:pb-0">
        
        {/* Mobile Header Bar with Back & Close */}
        <div className="md:hidden sticky top-0 z-30 bg-[#FAF9F5]/95 backdrop-blur-md px-4 py-3 border-b border-stone-200 flex items-center justify-between">
          <button
            onClick={() => setActiveProduct(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-stone-950 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-stone-600" />
            <span>Back to Collection</span>
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleWishlist(activeProduct.id)}
              className="p-1.5 rounded-full hover:bg-stone-200 text-stone-600 hover:text-rose-600 cursor-pointer"
              aria-label="Wishlist"
            >
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
            </button>
            <button
              onClick={() => setActiveProduct(null)}
              className="p-1.5 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-800 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Desktop Close Button */}
        <button
          onClick={() => setActiveProduct(null)}
          aria-label="Close product view"
          className="hidden md:flex absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-stone-950 shadow-md items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Side: Product Gallery & Touch Swiper */}
        <div className="w-full md:w-1/2 p-3 sm:p-5 md:p-6 flex flex-col bg-stone-100/70 border-b md:border-b-0 md:border-r border-stone-200 shrink-0">
          
          {/* Main Visual Frame with Touch Swiping */}
          <div
            className="relative aspect-[4/5] sm:aspect-[3/4] rounded-lg overflow-hidden bg-stone-200 shadow-inner group select-none touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={productImages[selectedImageIdx] || productImages[0]}
              alt={`${activeProduct.title} - view ${selectedImageIdx + 1}`}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover object-top transition-transform duration-300 ${
                isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
              }`}
              onClick={() => setIsZoomed(!isZoomed)}
            />

            {/* Mobile swipe helper badge */}
            {productImages.length > 1 && (
              <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold rounded-full flex items-center gap-1">
                <span>{selectedImageIdx + 1} / {productImages.length}</span>
                <span className="text-[10px] text-stone-300 sm:hidden">· Swipe</span>
              </div>
            )}

            {/* Gallery Navigation Chevron Buttons */}
            {productImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIdx((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-stone-800 flex items-center justify-center shadow-md cursor-pointer transition-opacity"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIdx((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-stone-800 flex items-center justify-center shadow-md cursor-pointer transition-opacity"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Zoom helper badge */}
            <button
              type="button"
              onClick={() => setIsZoomed(!isZoomed)}
              className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/65 hover:bg-black/80 text-white text-[11px] font-medium rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{isZoomed ? 'Zoom Out' : 'Zoom Fabric'}</span>
            </button>

            {/* Pagination dots on Mobile */}
            {productImages.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 bg-black/40 backdrop-blur-xs rounded-full sm:hidden">
                {productImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      selectedImageIdx === idx ? 'w-4 bg-amber-400' : 'bg-white/60'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnails Strip */}
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {productImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedImageIdx(idx);
                  setIsZoomed(false);
                }}
                className={`relative w-14 h-18 sm:w-16 sm:h-20 rounded-md overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                  selectedImageIdx === idx
                    ? 'border-amber-800 ring-2 ring-amber-800/40 scale-102'
                    : 'border-transparent opacity-65 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                />
              </button>
            ))}
          </div>

          {/* Workshop Assurance */}
          <div className="mt-4 p-3 bg-white border border-stone-200 rounded-lg text-xs text-stone-600 flex items-start gap-2.5 shadow-2xs">
            <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-stone-900">Shruthi Fashion Guarantee</p>
              <p className="mt-0.5 text-stone-500 leading-relaxed">
                1st Floor in City Cake Shop, Edayarpalayam Road. Premium color-fast fabrics inspected for smooth stitching, durable zippers, and long-lasting comfort.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Product Details & Purchase Controls */}
        <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-5">
            
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded text-[11px] font-semibold uppercase tracking-wider">
                    {activeProduct.category}
                  </span>
                  <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded text-[11px] font-medium">
                    {activeProduct.subcategory}
                  </span>
                  <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded text-[11px] font-medium">
                    {activeProduct.fabric}
                  </span>
                </div>
                
                {/* Desktop wishlist button */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(activeProduct.id)}
                  className="hidden md:flex items-center gap-1 text-xs text-stone-600 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                >
                  <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
                  <span>{wishlisted ? 'Saved' : 'Wishlist'}</span>
                </button>
              </div>

              <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 leading-snug">
                {activeProduct.title}
              </h1>

              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                {activeProduct.subtitle}
              </p>

              {/* Special Feature Badge */}
              {activeProduct.specialFeatures && (
                <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded text-xs font-semibold text-amber-900">
                    <Check className="w-3.5 h-3.5 text-amber-700" />
                    <span>{activeProduct.specialFeatures}</span>
                  </div>
                </div>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2 text-xs">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(activeProduct.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold text-stone-800 tabular-nums">{activeProduct.rating}</span>
                <span className="text-stone-300">/</span>
                <span className="text-stone-500">
                  {activeProduct.reviewCount} Verified Shopper Reviews
                </span>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="p-3.5 bg-white border border-stone-200 rounded-lg shadow-2xs">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tabular-nums">
                  ₹{activeProduct.price.toLocaleString('en-IN')}
                </span>
                {activeProduct.originalPrice > activeProduct.price && (
                  <span className="text-sm text-stone-400 line-through tabular-nums">
                    ₹{activeProduct.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Save {discountPercent}%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                Inclusive of all taxes · Safe doorstep courier delivery across India
              </p>
            </div>

            {/* Enhanced Mobile & Desktop Color Selection */}
            {productColors.length > 0 && (
              <div className="space-y-2.5 p-3.5 bg-stone-50/80 rounded-lg border border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Select Colour / Shade
                  </label>
                  <span className="text-xs font-semibold text-amber-900 bg-amber-100/70 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Selected: <strong>{selectedColor}</strong>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {productColors.map((c) => {
                    const isSelected = selectedColor === c.name;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c.name)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all cursor-pointer min-h-[42px] ${
                          isSelected
                            ? 'border-amber-800 bg-amber-50 shadow-xs'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-black/15 shadow-2xs shrink-0 flex items-center justify-center"
                          style={{ backgroundColor: c.hex }}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white drop-shadow-xs" />}
                        </span>
                        <span className={`text-xs ${isSelected ? 'font-bold text-amber-950' : 'text-stone-700'}`}>
                          {c.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Select Size
                </label>
                <button
                  type="button"
                  onClick={() => setShowSizeGuide(!showSizeGuide)}
                  className="flex items-center gap-1 text-xs text-amber-800 hover:text-amber-950 underline transition-colors cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Chart</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {productSizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`min-w-[44px] min-h-[40px] px-3.5 py-2 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                      selectedSize === sz
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                        : 'bg-white text-stone-800 border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>

              {/* Sizing drawer info if toggled */}
              {showSizeGuide && (
                <div className="mt-3 p-3 bg-stone-100 rounded text-xs border border-stone-200 space-y-2 animate-in fade-in">
                  <p className="font-semibold text-stone-900">Standard Tailoring Sizing Guide (Inches)</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] text-stone-600">
                      <thead>
                        <tr className="border-b border-stone-300 font-semibold text-stone-800">
                          <th className="py-1">Size</th>
                          <th className="py-1">Bust</th>
                          <th className="py-1">Waist</th>
                          <th className="py-1">Hip</th>
                          <th className="py-1">Length</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200">
                        <tr><td className="py-1 font-medium">S</td><td>34"</td><td>28"</td><td>38"</td><td>46"</td></tr>
                        <tr><td className="py-1 font-medium">M</td><td>36"</td><td>30"</td><td>40"</td><td>46"</td></tr>
                        <tr><td className="py-1 font-medium">L</td><td>38"</td><td>32"</td><td>42"</td><td>47"</td></tr>
                        <tr><td className="py-1 font-medium">XL</td><td>40"</td><td>34"</td><td>44"</td><td>47"</td></tr>
                        <tr><td className="py-1 font-medium">Free Size</td><td>Custom</td><td>Custom</td><td>Custom</td><td>Regular</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Quantity
              </label>
              <div className="flex items-center border border-stone-300 rounded-md bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-1.5 text-stone-600 hover:text-stone-900 text-sm font-bold cursor-pointer"
                >
                  -
                </button>
                <span className="px-3 py-1.5 text-xs font-semibold tabular-nums text-stone-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-1.5 text-stone-600 hover:text-stone-900 text-sm font-bold cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Fabric Details & Care instructions */}
            <div className="border-t border-stone-200 pt-3 space-y-2 text-xs text-stone-600">
              <p><strong className="text-stone-900">Fabric Composition:</strong> {activeProduct.fabricDetails || 'Premium cotton fabric'}</p>
              <p><strong className="text-stone-900">Care:</strong> {activeProduct.careInstructions || 'Dry in shade'}</p>
            </div>

            {/* Customer Reviews snippet */}
            {productReviews.length > 0 && (
              <div className="border-t border-stone-200 pt-3">
                <p className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
                  Customer Reviews ({productReviews.length})
                </p>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {productReviews.map((r) => (
                    <div key={r.id} className="p-2.5 bg-white border border-stone-200 rounded text-xs space-y-1">
                      <div className="flex items-center justify-between text-stone-500 text-[11px]">
                        <span className="font-semibold text-stone-900">{r.userName}</span>
                        <span>{r.date}</span>
                      </div>
                      <p className="text-stone-700 italic">"{r.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Desktop Action Buttons */}
            <div className="hidden md:block pt-4 border-t border-stone-200 space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="py-3 px-4 bg-white border border-stone-800 hover:bg-stone-50 text-stone-900 text-xs sm:text-sm font-semibold rounded-md shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{addedToast ? 'Added to Bag!' : 'Add to Bag'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-bold rounded-md shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-white" />
                  <span>Buy Now (Razorpay)</span>
                </button>
              </div>

              {/* Delivery info */}
              <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2">
                <div className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-stone-600" />
                  <span>Doorstep Courier</span>
                </div>
                <div className="flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-stone-600" />
                  <span>7-Day Exchange</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-stone-600" />
                  <span>100% Genuine Quality</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Sticky Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/98 backdrop-blur-md border-t border-stone-300 p-3 shadow-2xl flex items-center justify-between gap-2.5">
        <div className="flex flex-col">
          <span className="text-xs text-stone-500">Total Price</span>
          <span className="text-base font-serif font-bold text-stone-900 tabular-nums">
            ₹{(price * quantity).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-amber-900 font-medium truncate max-w-[110px]">
            {selectedColor} · {selectedSize}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 py-2.5 px-3 bg-white border border-stone-800 text-stone-900 text-xs font-semibold rounded-md shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-transform"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{addedToast ? 'Added!' : 'Add to Bag'}</span>
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            className="flex-1 py-2.5 px-3 bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-md shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-transform"
          >
            <CreditCard className="w-4 h-4 text-white" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>

    </div>
  );
};