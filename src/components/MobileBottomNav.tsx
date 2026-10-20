import React from 'react';
import { Home, Search, Heart, ShoppingBag, User } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const MobileBottomNav: React.FC = () => {
  const {
    cartCount,
    wishlist,
    user,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsAuthOpen,
    setIsAccountOpen,
    setFilters,
    activeProduct,
    isCheckoutOpen,
    orderSuccess
  } = useStore();

  // Do not show sticky bottom nav during full-page checkout, product detail view, or order success
  if (isCheckoutOpen || activeProduct || orderSuccess) {
    return null;
  }

  const handleHomeClick = () => {
    setFilters({ category: 'All Collections', search: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchClick = () => {
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      // Focus on the search input
      const input = el.querySelector('input');
      input?.focus();
    }
  };

  return (
    <div
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 py-1.5 px-3 select-none touch-manipulation shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
      style={{ paddingBottom: 'calc(0.375rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        
        {/* Home */}
        <button
          onClick={handleHomeClick}
          className="flex flex-col items-center justify-center p-1 text-stone-700 hover:text-amber-900 transition-colors cursor-pointer"
        >
          <Home className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] mt-0.5 font-medium">Explore</span>
        </button>

        {/* Search */}
        <button
          onClick={handleSearchClick}
          className="flex flex-col items-center justify-center p-1 text-stone-700 hover:text-amber-900 transition-colors cursor-pointer"
        >
          <Search className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] mt-0.5 font-medium">Search</span>
        </button>

        {/* Wishlist */}
        <button
          onClick={() => setIsWishlistOpen(true)}
          className="relative flex flex-col items-center justify-center p-1 text-stone-700 hover:text-amber-900 transition-colors cursor-pointer"
        >
          <Heart className="w-5 h-5 stroke-[1.8]" />
          {wishlist.length > 0 && (
            <span className="absolute 0 top-0.5 right-1 w-3.5 h-3.5 bg-amber-800 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {wishlist.length}
            </span>
          )}
          <span className="text-[10px] mt-0.5 font-medium">Wishlist</span>
        </button>

        {/* Bag */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center p-1 text-stone-900 hover:text-amber-900 transition-colors cursor-pointer"
        >
          <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
          {cartCount > 0 && (
            <span className="absolute 0 top-0.5 right-1 w-3.5 h-3.5 bg-stone-900 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
          <span className="text-[10px] mt-0.5 font-medium">Bag</span>
        </button>

        {/* Account */}
        <button
          onClick={() => user ? setIsAccountOpen(true) : setIsAuthOpen(true)}
          className="flex flex-col items-center justify-center p-1 text-stone-700 hover:text-amber-900 transition-colors cursor-pointer"
        >
          <User className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] mt-0.5 font-medium truncate max-w-14">
            {user ? 'Account' : 'Sign In'}
          </span>
        </button>

      </div>
    </div>
  );
};
