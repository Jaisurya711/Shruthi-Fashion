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
  ZoomIn,
  ZoomOut,
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
  const [sizeUnit, setSizeUnit] = useState<'in' | 'cm'>('in');
  const [imageFitMode, setImageFitMode] = useState<'contain' | 'cover'>('contain');
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);
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
      
      // Auto-select first in-stock size if available
      const inStockSize = sizes.find(
        (sz) => !activeProduct.sizeStock || activeProduct.sizeStock[sz] === undefined || activeProduct.sizeStock[sz] > 0
      ) || sizes[0];
      setSelectedSize(inStockSize || 'Standard');
      setQuantity(1);
      setCustomNotes('');
      setShowSizeGuide(false);
      setImageFitMode('contain');
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

  const allSizesOutOfStock = activeProduct.sizeStock && Object.keys(activeProduct.sizeStock).length > 0
    ? Object.values(activeProduct.sizeStock).every((cnt) => (Number(cnt) || 0) <= 0)
    : false;
  const isProductOutOfStock =
    (activeProduct.stockCount !== undefined && activeProduct.stockCount <= 0) ||
    activeProduct.inStock === false ||
    allSizesOutOfStock;

  const isCurrentSizeOutOfStock = Boolean(
    (activeProduct.sizeStock && selectedSize && activeProduct.sizeStock[selectedSize] !== undefined && activeProduct.sizeStock[selectedSize] <= 0) ||
    isProductOutOfStock
  );

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
    const minSwipeDistance = 35; // minimum pixels to count as swipe

    if (distanceX > minSwipeDistance) {
      // Swiped Left -> Next Image
      setSelectedImageIdx((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
    } else if (distanceX < -minSwipeDistance) {
      // Swiped Right -> Previous Image
      setSelectedImageIdx((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
    touchEndXRef.current = null;
  };

  const handleAddToCart = () => {
    if (isCurrentSizeOutOfStock || isProductOutOfStock) return;
    addToCart(
      activeProduct,
      selectedSize || productSizes[0],
      selectedColor || productColors[0]?.name,
      quantity,
      customNotes
    );
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2200);
  };

  const handleBuyNow = () => {
    if (isCurrentSizeOutOfStock || isProductOutOfStock) return;
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
    <div className="fixed inset-0 z-50 bg-[#FAF9F5] sm:bg-stone-950/75 flex flex-col items-center justify-center sm:p-4 md:p-6 overflow-hidden">
      
      {/* Modal Dialog Container: full viewport on mobile (100dvh), card dialog on desktop */}
      <div className="relative w-full max-w-5xl h-[100dvh] sm:h-auto sm:max-h-[92vh] bg-[#FAF9F5] sm:rounded-2xl sm:shadow-2xl sm:border sm:border-stone-300 flex flex-col overflow-hidden">
        
        {/* Top Header Bar: Sticky on mobile and desktop */}
        <div className="shrink-0 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-stone-200 flex items-center justify-between z-20">
          <button
            onClick={() => setActiveProduct(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-stone-950 cursor-pointer"
            aria-label="Back to collection"
          >
            <ArrowLeft className="w-4 h-4 text-stone-600" />
            <span>Back to Collection</span>
          </button>

          <span className="text-xs font-serif font-bold text-amber-900 tracking-wider truncate px-2 hidden sm:inline">
            Shruthi Fashion
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleWishlist(activeProduct.id)}
              className="p-1.5 rounded-full hover:bg-stone-100 text-stone-600 hover:text-rose-600 transition-colors cursor-pointer"
              aria-label="Toggle wishlist"
            >
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
            </button>
            <button
              onClick={() => setActiveProduct(null)}
              className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body: Smooth vertical scrolling for both mobile and desktop */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="flex flex-col md:flex-row">

            {/* Left Column: Mobile & Desktop Image Stage */}
            <div className="w-full md:w-1/2 p-3 sm:p-5 md:p-6 flex flex-col bg-stone-100/50 border-b md:border-b-0 md:border-r border-stone-200 shrink-0">
              
              {/* Main Visual Frame: Golden 3:4 Fashion Ratio, Perfectly Aligned in Dimensions */}
              <div
                className="relative w-full aspect-[3/4] max-h-[52vh] sm:max-h-[60vh] md:max-h-[66vh] rounded-2xl overflow-hidden bg-[#FAF9F5] border border-stone-200/90 shadow-2xs group select-none touch-pan-y flex items-center justify-center cursor-pointer"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={() => setIsLightboxOpen(true)}
              >
                {/* Out of Stock Dark Overlay */}
                {((activeProduct.stockCount !== undefined && activeProduct.stockCount <= 0) || activeProduct.inStock === false) && (
                  <div className="absolute inset-0 bg-stone-900/60 z-20 flex items-center justify-center p-3 backdrop-blur-[2px]">
                    <span className="bg-stone-950/90 text-white font-bold text-xs uppercase tracking-wider px-3.5 py-2 rounded shadow-md border border-white/20">
                      Currently Sold Out
                    </span>
                  </div>
                )}

                {/* Primary uncropped image with perfect dimensional centering */}
                <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-3">
                  <img
                    src={productImages[selectedImageIdx] || productImages[0]}
                    alt={`${activeProduct.title} - angle ${selectedImageIdx + 1}`}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full transition-transform duration-300 ${
                      imageFitMode === 'cover'
                        ? 'object-cover object-top p-0'
                        : 'object-contain object-center'
                    }`}
                  />
                </div>

                {/* Photo Counter Pill Badge */}
                {productImages.length > 1 && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-stone-900/75 backdrop-blur-xs text-white text-[11px] font-semibold rounded-full flex items-center gap-1 shadow-xs z-20">
                    <span>{selectedImageIdx + 1} / {productImages.length}</span>
                    <span className="text-[10px] text-stone-300 sm:hidden">· Swipe</span>
                  </div>
                )}

                {/* Left & Right Chevron Arrows */}
                {productImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIdx((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
                      }}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 hover:bg-white text-stone-800 flex items-center justify-center shadow-md cursor-pointer transition-transform active:scale-95 z-20"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIdx((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 hover:bg-white text-stone-800 flex items-center justify-center shadow-md cursor-pointer transition-transform active:scale-95 z-20"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </>
                )}

                {/* Floating Controls: Fit Toggle & HD Fullscreen Zoom */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-20">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageFitMode(prev => prev === 'contain' ? 'cover' : 'contain');
                    }}
                    className="px-2.5 py-1 bg-stone-900/80 hover:bg-stone-900 text-white text-[11px] font-medium rounded-md flex items-center gap-1 transition-colors cursor-pointer shadow-xs backdrop-blur-xs"
                    title="Toggle between full uncropped photo and frame fit"
                  >
                    <span>{imageFitMode === 'contain' ? 'Fit Complete' : 'Fill Frame'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLightboxOpen(true);
                      setLightboxZoom(1);
                    }}
                    className="px-2.5 py-1 bg-stone-900/80 hover:bg-stone-900 text-white text-[11px] font-medium rounded-md flex items-center gap-1 transition-colors cursor-pointer shadow-xs backdrop-blur-xs"
                    title="Open Fullscreen High-Definition Viewer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>HD Zoom</span>
                  </button>
                </div>

                {/* Mobile Pagination Dots */}
                {productImages.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 bg-black/50 backdrop-blur-xs rounded-full sm:hidden z-20">
                    {productImages.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageIdx(idx);
                        }}
                        className={`h-1.5 rounded-full transition-all ${
                          selectedImageIdx === idx ? 'w-4 bg-amber-400' : 'w-1.5 bg-white/70'
                        }`}
                        aria-label={`Angle ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnails Strip - Dimensional 3:4 Proportion */}
              {productImages.length > 1 && (
                <div className="mt-3 flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                  {productImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIdx(idx)}
                      className={`relative w-14 h-18 sm:w-16 sm:h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer bg-[#FAF9F5] ${
                        selectedImageIdx === idx
                          ? 'border-amber-800 ring-2 ring-amber-800/40 shadow-xs scale-[1.02]'
                          : 'border-stone-200/80 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Angle thumbnail ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain object-center p-0.5"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Desktop Workshop Assurance */}
              <div className="hidden md:flex mt-4 p-3 bg-white border border-stone-200 rounded-lg text-xs text-stone-600 items-start gap-2.5 shadow-2xs">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-stone-900">Shruthi Fashion Guarantee</p>
                  <p className="mt-0.5 text-stone-500 leading-relaxed">
                    1st Floor in City Cake Shop, Edayarpalayam Road. Premium color-fast fabrics inspected for smooth stitching, durable zippers, and long-lasting comfort.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Title, Price, Colors, Sizes & CTAs */}
            <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-8 flex flex-col justify-between space-y-5 pb-28 md:pb-8">
              <div className="space-y-4">
                
                {/* Category & Tags */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded text-[11px] font-semibold uppercase tracking-wider">
                    {activeProduct.category}
                  </span>
                  <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded text-[11px] font-medium">
                    {activeProduct.subcategory}
                  </span>
                  <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded text-[11px] font-medium">
                    {activeProduct.fabric}
                  </span>
                </div>

                {/* Product Title & Subtitle */}
                <div>
                  <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 leading-snug">
                    {activeProduct.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1">
                    {activeProduct.subtitle}
                  </p>
                </div>

                {/* Special Feature */}
                {activeProduct.specialFeatures && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded text-xs font-semibold text-amber-900">
                    <Check className="w-3.5 h-3.5 text-amber-700" />
                    <span>{activeProduct.specialFeatures}</span>
                  </div>
                )}

                {/* Rating */}
                <div className="flex items-center gap-2 text-xs">
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
                    {activeProduct.reviewCount} Verified Reviews
                  </span>
                </div>

                {/* Pricing Box */}
                <div className="p-3.5 bg-white border border-stone-200 rounded-xl shadow-2xs">
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl sm:text-3xl font-sans font-bold text-stone-900 tabular-nums">
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
                    Inclusive of all taxes · Doorstep courier across all over India
                  </p>

                  {/* Live Stock Availability Badge */}
                  <div className="pt-2 mt-2 border-t border-stone-100">
                    {((activeProduct.stockCount !== undefined && activeProduct.stockCount <= 0) || activeProduct.inStock === false) ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-800 rounded-md text-xs font-bold">
                        <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                        <span>Sold Out / Currently Out of Stock</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>In Stock · Ready for Immediate Dispatch</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* PROMINENT COLOR SELECTION (Right under Price) */}
                {productColors.length > 0 && (
                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                        Select Colour / Shade
                      </label>
                      <span className="text-xs font-semibold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
                        Selected: <strong>{selectedColor}</strong>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {productColors.map((c) => {
                        const isSelected = selectedColor === c.name;
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => setSelectedColor(c.name)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all cursor-pointer min-h-[42px] ${
                              isSelected
                                ? 'border-amber-800 bg-amber-50 shadow-xs ring-1 ring-amber-800'
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

                {/* SIZE SELECTION */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                      Select Size: <span className="font-normal text-stone-700">{selectedSize}</span>
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
                    {productSizes.map((sz) => {
                      const isSizeOutOfStock = Boolean(
                        (activeProduct.sizeStock && activeProduct.sizeStock[sz] !== undefined && activeProduct.sizeStock[sz] <= 0) ||
                        activeProduct.inStock === false
                      );
                      const isSelected = selectedSize === sz;

                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className={`relative min-w-[54px] min-h-[46px] px-3.5 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer flex flex-col items-center justify-center ${
                            isSizeOutOfStock
                              ? isSelected
                                ? 'bg-rose-50 text-rose-800 border-rose-400 ring-2 ring-rose-400'
                                : 'bg-stone-100 text-stone-400 border-stone-200 hover:border-stone-300'
                              : isSelected
                              ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                              : 'bg-white text-stone-800 border-stone-300 hover:bg-stone-50'
                          }`}
                        >
                          <span className={isSizeOutOfStock ? 'line-through decoration-rose-500 font-bold' : ''}>{sz}</span>
                          {isSizeOutOfStock ? (
                            <span className="text-[9px] font-bold text-rose-600 block no-underline -mt-0.5">
                              Out of Stock
                            </span>
                          ) : (
                            <span className="text-[9px] text-emerald-600 font-medium block -mt-0.5">
                              In Stock
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Size Out of Stock Alert Message */}
                  {isCurrentSizeOutOfStock && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2 animate-in fade-in">
                      <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                      <span>
                        Size <strong>{selectedSize}</strong> is currently <strong>Out of Stock</strong>. Please select another available size.
                      </span>
                    </div>
                  )}

                  {/* Size Chart Accordion */}
                  {showSizeGuide && (
                    <div className="mt-3 p-3.5 bg-stone-50 rounded-xl text-xs border border-stone-200 space-y-2.5 animate-in fade-in shadow-2xs">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-stone-900">Shruthi Fashion Sizing Chart</p>
                        <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-white text-[11px] font-semibold">
                          <button
                            type="button"
                            onClick={() => setSizeUnit('in')}
                            className={`px-2.5 py-1 transition-colors ${
                              sizeUnit === 'in' ? 'bg-amber-800 text-white' : 'text-stone-600 hover:bg-stone-50'
                            }`}
                          >
                            Inches
                          </button>
                          <button
                            type="button"
                            onClick={() => setSizeUnit('cm')}
                            className={`px-2.5 py-1 transition-colors ${
                              sizeUnit === 'cm' ? 'bg-amber-800 text-white' : 'text-stone-600 hover:bg-stone-50'
                            }`}
                          >
                            CM
                          </button>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px] text-stone-600">
                          <thead>
                            <tr className="border-b border-stone-300 font-bold text-stone-900 bg-stone-100/70">
                              <th className="py-1.5 px-2">Size</th>
                              <th className="py-1.5 px-2">Bust / Chest</th>
                              <th className="py-1.5 px-2">Waist</th>
                              <th className="py-1.5 px-2">Hip</th>
                              <th className="py-1.5 px-2">Length</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-200">
                            {sizeUnit === 'in' ? (
                              <>
                                <tr><td className="py-1.5 px-2 font-bold text-stone-900">XS</td><td className="px-2">32"</td><td className="px-2">26"</td><td className="px-2">36"</td><td className="px-2">45"</td></tr>
                                <tr><td className="py-1.5 px-2 font-bold text-stone-900">S</td><td className="px-2">34"</td><td className="px-2">28"</td><td className="px-2">38"</td><td className="px-2">46"</td></tr>
                                <tr><td className="py-1.5 px-2 font-bold text-stone-900">M</td><td className="px-2">36"</td><td className="px-2">30"</td><td className="px-2">40"</td><td className="px-2">46"</td></tr>
                                <tr><td className="py-1.5 px-2 font-bold text-stone-900">L</td><td className="px-2">38"</td><td className="px-2">32"</td><td className="px-2">42"</td><td className="px-2">47"</td></tr>
                                <tr><td className="py-1.5 px-2 font-bold text-stone-900">XL</td><td className="px-2">40"</td><td className="px-2">34"</td><td className="px-2">44"</td><td className="px-2">47"</td></tr>
                                <tr><td className="py-1.5 px-2 font-bold text-stone-900">XXL</td><td className="px-2">42"</td><td className="px-2">36"</td><td className="px-2">46"</td><td className="px-2">48"</td></tr>
                                <tr><td className="py-1.5 px-2 font-bold text-stone-900">3XL</td><td className="px-2">44"</td><td className="px-2">38"</td><td className="px-2">48"</td><td className="px-2">48"</td></tr>
                                <tr><td className="py-1.5 px-2 font-bold text-stone-900">Free Size</td><td className="px-2">34"-42"</td><td className="px-2">Flexible</td><td className="px-2">Flexible</td><td className="px-2">Standard</td></tr>
                              </>
                            ) : (
                              <>
                                <tr><td className="py-1.5 px-2 font-bold text-stone-900">XS</td><td className="px-2">81 cm</td><td className="px-2">66 cm</td><td className="px-2">91 cm</td><td className="px-2">114 cm</td></tr>
                                <tr><td className="py-1.5 px-2 font-bold text-stone-900">S</td><td className="px-2">86 cm</td><td className="px-2">71 cm</td><td className="px-2">96 cm</td><td className="px-2">117 cm</td></tr>
                                <tr><td className="py-1.5 px-2 font-bold text-stone-900">M</td><td className="px-2">91 cm</td><td className="px-2">76 cm</td><td className="px-2">101 cm</td><td className="px-2">117 cm</td></tr>
                                <tr><td className="py-1.5 px-2 font-bold text-stone-900">L</td><td className="px-2">96 cm</td><td className="px-2">81 cm</td><td className="px-2">106 cm</td><td className="px-2">119 cm</td></tr>
                                <tr><td className="py-1.5 px-2 font-bold text-stone-900">XL</td><td className="px-2">101 cm</td><td className="px-2">86 cm</td><td className="px-2">111 cm</td><td className="px-2">119 cm</td></tr>
                                <tr><td className="py-1.5 px-2 font-bold text-stone-900">XXL</td><td className="px-2">106 cm</td><td className="px-2">91 cm</td><td className="px-2">116 cm</td><td className="px-2">122 cm</td></tr>
                                <tr><td className="py-1.5 px-2 font-bold text-stone-900">3XL</td><td className="px-2">111 cm</td><td className="px-2">96 cm</td><td className="px-2">121 cm</td><td className="px-2">122 cm</td></tr>
                                <tr><td className="py-1.5 px-2 font-bold text-stone-900">Free Size</td><td className="px-2">86-106 cm</td><td className="px-2">Elastic/Drawstring</td><td className="px-2">Flexible</td><td className="px-2">Standard</td></tr>
                              </>
                            )}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-[10px] text-stone-500 italic">
                        Tip: For Kurtis, measure around the fullest part of the chest. For Bottom Wear, measure around natural waistline. Free custom alterations available at our Kovundampalayam store!
                      </p>
                    </div>
                  )}
                </div>

                {/* Quantity */}
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

                {/* Fabric & Care Details */}
                <div className="border-t border-stone-200 pt-3 space-y-1.5 text-xs text-stone-600">
                  <p><strong className="text-stone-900">Fabric Composition:</strong> {activeProduct.fabricDetails || 'Premium cotton fabric'}</p>
                  <p><strong className="text-stone-900">Care:</strong> {activeProduct.careInstructions || 'Dry in shade'}</p>
                </div>

                {/* Mobile Workshop Guarantee (Positioned at bottom on mobile) */}
                <div className="md:hidden p-3 bg-stone-100 rounded-lg text-xs text-stone-600 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-stone-900">Shruthi Fashion Guarantee</p>
                    <p className="mt-0.5 text-stone-500 leading-relaxed">
                      1st Floor in City Cake Shop, Edayarpalayam Road. Premium color-fast fabrics inspected for smooth stitching, durable zippers, and long-lasting comfort.
                    </p>
                  </div>
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

                {/* Desktop Action Buttons (Hidden on mobile) */}
                <div className="hidden md:block pt-4 border-t border-stone-200 space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={isCurrentSizeOutOfStock || isProductOutOfStock}
                      onClick={handleAddToCart}
                      className={`py-3 px-4 text-xs sm:text-sm font-semibold rounded-md shadow-xs flex items-center justify-center gap-2 transition-colors ${
                        isCurrentSizeOutOfStock || isProductOutOfStock
                          ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed opacity-75'
                          : 'bg-white border border-stone-800 hover:bg-stone-50 text-stone-900 cursor-pointer'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>
                        {isProductOutOfStock
                          ? 'Sold Out'
                          : isCurrentSizeOutOfStock
                          ? `Size ${selectedSize} Out of Stock`
                          : addedToast
                          ? 'Added to Bag!'
                          : 'Add to Bag'}
                      </span>
                    </button>
                    <button
                      type="button"
                      disabled={isCurrentSizeOutOfStock || isProductOutOfStock}
                      onClick={handleBuyNow}
                      className={`py-3 px-4 text-xs sm:text-sm font-bold rounded-md shadow-sm flex items-center justify-center gap-2 transition-colors ${
                        isCurrentSizeOutOfStock || isProductOutOfStock
                          ? 'bg-stone-300 text-stone-500 cursor-not-allowed opacity-75'
                          : 'bg-blue-700 hover:bg-blue-800 text-white cursor-pointer'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-white" />
                      <span>
                        {isProductOutOfStock
                          ? 'Currently Sold Out'
                          : isCurrentSizeOutOfStock
                          ? `Size ${selectedSize} Sold Out`
                          : 'Buy Now (Razorpay)'}
                      </span>
                    </button>
                  </div>

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
        </div>

        {/* Truly Fixed Mobile Bottom Action Bar */}
        {/* Rendered at the dialog bottom boundary: CANNOT scroll up or float in the middle! */}
        <div
          className="md:hidden shrink-0 bg-white border-t border-stone-200 px-4 py-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-30 flex items-center justify-between gap-3"
          style={{ paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="flex flex-col">
            <span className="text-[11px] text-stone-500 leading-tight">Total</span>
            <span className="text-base font-sans font-bold text-stone-900 tabular-nums">
              ₹{(price * quantity).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-amber-900 font-semibold truncate max-w-[100px]">
              {selectedColor} · {selectedSize}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-1 justify-end">
            <button
              type="button"
              disabled={isCurrentSizeOutOfStock || isProductOutOfStock}
              onClick={handleAddToCart}
              className={`flex-1 py-2.5 px-3 text-xs font-semibold rounded-lg shadow-2xs flex items-center justify-center gap-1.5 transition-transform ${
                isCurrentSizeOutOfStock || isProductOutOfStock
                  ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
                  : 'bg-white border border-stone-800 text-stone-900 cursor-pointer active:scale-95'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>
                {isProductOutOfStock
                  ? 'Sold Out'
                  : isCurrentSizeOutOfStock
                  ? 'Out of Stock'
                  : addedToast
                  ? 'Added!'
                  : 'Add to Bag'}
              </span>
            </button>

            <button
              type="button"
              disabled={isCurrentSizeOutOfStock || isProductOutOfStock}
              onClick={handleBuyNow}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-transform ${
                isCurrentSizeOutOfStock || isProductOutOfStock
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  : 'bg-blue-700 active:bg-blue-800 text-white cursor-pointer active:scale-95'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-white" />
              <span>
                {isProductOutOfStock
                  ? 'Sold Out'
                  : isCurrentSizeOutOfStock
                  ? 'Sold Out'
                  : 'Buy Now'}
              </span>
            </button>
          </div>
        </div>

      </div>

      {/* High-Definition Fullscreen Lightbox / Photo Inspector Modal */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Top Bar */}
          <div
            className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent text-white z-30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-amber-300 text-sm">Shruthi Fashion</span>
              <span className="text-stone-400 text-xs">· HD Photo Inspector</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLightboxZoom(prev => Math.max(1, prev - 0.5))}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setLightboxZoom(prev => Math.min(3, prev + 0.5))}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setLightboxZoom(1)}
                className="px-2.5 py-1 text-xs rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer font-mono"
              >
                {Math.round(lightboxZoom * 100)}%
              </button>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer ml-2"
                aria-label="Close HD Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Stage with High-Res Image & Pan/Zoom */}
          <div
            className="flex-1 flex items-center justify-center p-4 overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={productImages[selectedImageIdx] || productImages[0]}
              alt={`${activeProduct.title} - angle ${selectedImageIdx + 1}`}
              referrerPolicy="no-referrer"
              style={{ transform: `scale(${lightboxZoom})` }}
              className="max-w-[90vw] max-h-[75vh] object-contain transition-transform duration-200 cursor-zoom-in"
              onClick={() => setLightboxZoom(prev => prev > 1 ? 1 : 2)}
            />

            {/* Left & Right Chevrons */}
            {productImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImageIdx(prev => prev === 0 ? productImages.length - 1 : prev - 1);
                    setLightboxZoom(1);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-xs cursor-pointer active:scale-95 transition-all"
                  aria-label="Previous angle"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImageIdx(prev => prev === productImages.length - 1 ? 0 : prev + 1);
                    setLightboxZoom(1);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-xs cursor-pointer active:scale-95 transition-all"
                  aria-label="Next angle"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Angles Carousel */}
          <div
            className="p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center gap-3 z-30"
            onClick={(e) => e.stopPropagation()}
          >
            {productImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedImageIdx(idx);
                  setLightboxZoom(1);
                }}
                className={`relative w-12 h-16 rounded-md overflow-hidden border-2 transition-all cursor-pointer bg-black/40 ${
                  selectedImageIdx === idx
                    ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105'
                    : 'border-white/30 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`Angle ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain p-0.5"
                />
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
