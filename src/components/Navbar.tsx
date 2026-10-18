import React, { useState } from 'react';
import { ShoppingBag, Heart, User, Search, MapPin, X, Phone, MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { SHOP_INFO } from '../data/products';

export const Navbar: React.FC = () => {
  const {
    cartCount,
    wishlist,
    user,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsAuthOpen,
    setIsAccountOpen,
    setFilters,
    filters,
    categories
  } = useStore();

  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search: searchInput });
    setIsSearchActive(false);
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (cat: string, subcat?: string) => {
    setFilters({ category: cat, subcategory: subcat || 'All Styles' });
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Top Bar: Minimal contact info */}
      <div className="bg-[#1C1917] text-[#FAF9F5] text-xs py-1.5 px-3 sm:px-4 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-stone-400 text-[11px] sm:text-xs">
            <span>10:00 AM - 9:30 PM Daily</span>
          </div>

          <div className="flex items-center gap-3 text-stone-300 text-[11px] sm:text-xs">
            <a
              href={`tel:${SHOP_INFO.primaryContact}`}
              className="flex items-center gap-1 hover:text-amber-300 transition-colors"
            >
              <Phone className="w-3 h-3 text-amber-400" />
              <span>Call: {SHOP_INFO.primaryContact}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header adhering to Section 2 Top Bar Contract with highlighted shop name */}
      <header className="sticky top-0 z-40 bg-[#FAF9F5]/98 backdrop-blur-md border-b border-stone-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Zone 1: Highlighted Brand Name */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setFilters({ category: 'All Collections', subcategory: 'All Styles', search: '' });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group flex flex-col items-start shrink-0 cursor-pointer"
          >
            {/* Prominently Highlighted Brand Title */}
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl md:text-4xl font-serif font-black tracking-tight text-amber-900 group-hover:text-amber-950 transition-colors drop-shadow-2xs">
                Shruthi Fashion
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-stone-600 tracking-wider uppercase -mt-0.5">
              Kurtis · Western Wear · Bottom Wear · Shawls
            </span>
          </a>

          {/* Zone 2: Clean text navigation links from dynamic categories */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-stone-800 uppercase tracking-wider">
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`hover:text-amber-800 transition-colors cursor-pointer py-1 ${
                  filters.category === cat ? 'text-amber-900 border-b-2 border-amber-900 font-bold' : ''
                }`}
              >
                {cat}
              </button>
            ))}
            <a
              href="#store-info"
              className="hover:text-amber-800 transition-colors py-1"
            >
              Store Location
            </a>
          </nav>

          {/* Zone 3: Primary Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Search Affordance */}
            <button
              onClick={() => setIsSearchActive(!isSearchActive)}
              aria-label="Search catalog"
              className="p-2 text-stone-700 hover:text-amber-900 transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              aria-label="View Wishlist"
              className="relative p-2 text-stone-700 hover:text-amber-900 transition-colors cursor-pointer"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-amber-800 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* User Account */}
            <button
              onClick={() => user ? setIsAccountOpen(true) : setIsAuthOpen(true)}
              aria-label={user ? 'User Profile' : 'Sign In'}
              className="p-2 text-stone-700 hover:text-amber-900 transition-colors cursor-pointer flex items-center gap-1"
            >
              <User className="w-5 h-5" />
              <span className="hidden md:inline text-xs font-semibold text-stone-800 max-w-20 truncate">
                {user ? user.name.split(' ')[0] : 'Login'}
              </span>
            </button>

            {/* Shopping Bag */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="Shopping Bag"
              className="relative p-2.5 bg-amber-900 hover:bg-amber-950 text-white rounded-md shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-bold tabular-nums">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Live Search Drawer */}
        {isSearchActive && (
          <div className="border-t border-stone-200 bg-white px-4 py-3 shadow-md animate-in fade-in duration-150">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className="w-5 h-5 text-stone-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search short kurtis, straight cut, umbrella, feeding kurti, jeans, shimmer pants, grand shawls..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-24 py-2.5 bg-stone-50 border border-stone-300 rounded-md text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700"
                />
                <div className="absolute right-2 flex items-center gap-1">
                  <button
                    type="submit"
                    className="px-3 py-1 bg-amber-800 hover:bg-amber-900 text-white text-xs font-medium rounded cursor-pointer"
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSearchActive(false)}
                    className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Quick Suggestions for Shruthi Fashion */}
              <div className="mt-2 flex items-center gap-3 text-xs text-stone-500 overflow-x-auto whitespace-nowrap py-1">
                <span className="font-semibold text-stone-700">Quick Filters:</span>
                {[
                  'Feeding Kurti',
                  'Umbrella Kurti',
                  'Straight Cut Kurti',
                  'Short Kurtis',
                  'Stretch Jeans',
                  'Cotton Leggings',
                  'Shimmer Pants',
                  'Grand Shawls'
                ].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setSearchInput(term);
                      setFilters({ search: term });
                      setIsSearchActive(false);
                      const el = document.getElementById('catalog-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-amber-800 underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
