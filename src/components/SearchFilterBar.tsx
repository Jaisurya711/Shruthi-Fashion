import React, { useState } from 'react';
import { Search, SlidersHorizontal, X, ArrowUpDown, Zap, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CATEGORIES, SUBCATEGORIES, FABRICS, OCCASIONS } from '../data/products';

export const SearchFilterBar: React.FC = () => {
  const { filters, setFilters, resetFilters, filteredProducts, categories, subcategories } = useStore();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const displayCategories = ['All Collections', ...categories];
  const displaySubcategories = ['All Styles', ...subcategories];

  const activeFilterCount = [
    filters.category !== 'All Collections',
    filters.subcategory !== 'All Styles',
    filters.fabric !== 'All Fabrics',
    filters.occasion !== 'All Occasions',
    filters.size !== 'All',
    filters.minPrice > 0 || filters.maxPrice < 3000,
    Boolean(filters.search.trim())
  ].filter(Boolean).length;

  return (
    <div id="catalog-section" className="bg-[#FAF9F5] pt-6 pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800">
              <span>Shruthi Fashion Store Catalog</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{filteredProducts.length} items in collection</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
              {filters.subcategory !== 'All Styles'
                ? filters.subcategory
                : filters.category === 'All Collections'
                ? "Kurtis, Western & Bottom Wear"
                : filters.category}
            </h2>
          </div>

          {/* Quick Search & Sort Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Live Search Input */}
            <div className="relative min-w-[220px] sm:min-w-[270px] flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search feeding kurti, umbrella, jeans, palazzo..."
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                className="w-full pl-9 pr-8 py-2 bg-white border border-stone-300 rounded-md text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700"
              />
              {filters.search && (
                <button
                  onClick={() => setFilters({ search: '' })}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex items-center">
              <select
                value={filters.sortBy}
                aria-label="Sort products by"
                onChange={(e) => setFilters({ sortBy: e.target.value as any })}
                className="appearance-none bg-white border border-stone-300 rounded-md pl-3 pr-8 py-2 text-xs sm:text-sm text-stone-800 focus:outline-none focus:border-amber-700 cursor-pointer"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Customer Rated</option>
                <option value="newest">New Arrivals</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 pointer-events-none" />
            </div>

            {/* Filter Drawer Toggle Button */}
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md border text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeFilterCount > 0
                  ? 'bg-amber-800 text-white border-amber-800'
                  : 'bg-white text-stone-800 border-stone-300 hover:bg-stone-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="ml-1 w-5 h-5 rounded-full bg-white text-amber-900 text-xs font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Primary Categories (Single-line interactive buttons) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs sm:text-sm">
          {displayCategories.map((cat) => {
            const isActive = filters.category === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilters({ category: cat, subcategory: 'All Styles' })}
                className={`px-4 py-2 font-semibold rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-amber-900 text-white shadow-sm'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Subcategories Strip tailored for Shruthi Fashion */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
          {displaySubcategories.map((subcat) => {
            const isActive = filters.subcategory === subcat;
            return (
              <button
                key={subcat}
                onClick={() => setFilters({ subcategory: subcat })}
                className={`px-3 py-1 rounded border whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-stone-900 text-white border-stone-900 font-medium'
                    : 'bg-white text-stone-600 border-stone-300 hover:border-stone-400'
                }`}
              >
                {subcat}
              </button>
            );
          })}
        </div>

        {/* Quick Filter Badges */}
        <div className="flex items-center justify-between gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Subcategory Indicator */}
            {filters.subcategory !== 'All Styles' && (
              <span className="flex items-center gap-1 bg-stone-200 text-stone-800 px-2.5 py-1 rounded font-medium">
                <span>Style: {filters.subcategory}</span>
                <button onClick={() => setFilters({ subcategory: 'All Styles' })} className="cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-stone-500 hover:text-stone-900 underline underline-offset-2 cursor-pointer font-medium"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Filter Drawer Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/40 backdrop-blur-xs flex justify-end animate-in fade-in">
          <div className="bg-[#FAF9F5] w-full max-w-md h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-amber-800" />
                <h3 className="font-serif font-bold text-lg text-stone-900">Filter Shruthi Fashion Items</h3>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="p-1 text-stone-500 hover:text-stone-900 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Item Subcategory */}
              <div>
                <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-2.5">
                  Item Category / Style
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {displaySubcategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setFilters({ subcategory: sub })}
                      className={`px-3 py-2 text-left rounded border transition-colors cursor-pointer truncate ${
                        filters.subcategory === sub
                          ? 'bg-amber-900 text-white border-amber-900 font-semibold'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Price Range
                  </label>
                  <span className="text-xs font-semibold text-stone-800 tabular-nums">
                    Up to ₹{filters.maxPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min="299"
                  max="3000"
                  step="50"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ maxPrice: Number(e.target.value) })}
                  className="w-full accent-amber-800 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-stone-400 mt-1 tabular-nums">
                  <span>₹299</span>
                  <span>₹1,500</span>
                  <span>₹3,000</span>
                </div>
              </div>

              {/* Size Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-2.5">
                  Size Availability
                </label>
                <div className="flex flex-wrap gap-2 text-xs">
                  {['All', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size', '28', '30', '32', '34'].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setFilters({ size: sz })}
                      className={`px-3 py-2 rounded border font-medium transition-colors cursor-pointer ${
                        filters.size === sz
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fabric */}
              <div>
                <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-2.5">
                  Fabric Material
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {FABRICS.map((fab) => (
                    <button
                      key={fab}
                      onClick={() => setFilters({ fabric: fab })}
                      className={`px-3 py-2 text-left rounded border transition-colors cursor-pointer truncate ${
                        filters.fabric === fab
                          ? 'bg-amber-900 text-white border-amber-900'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {fab}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-200 bg-white flex items-center gap-3">
              <button
                onClick={resetFilters}
                className="w-1/3 py-2.5 border border-stone-300 text-stone-700 text-xs font-medium rounded hover:bg-stone-50 cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="w-2/3 py-2.5 bg-amber-900 hover:bg-amber-950 text-white text-xs font-semibold rounded shadow-sm cursor-pointer"
              >
                Show Results ({filteredProducts.length})
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
