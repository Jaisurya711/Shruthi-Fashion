import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SearchFilterBar } from './components/SearchFilterBar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { AccountDrawer } from './components/AccountDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { StoreManagerModal } from './components/StoreManagerModal';
import { StoreInfoSection } from './components/StoreInfoSection';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { RotateCcw, Sparkles } from 'lucide-react';

const ProductGridContent: React.FC = () => {
  const { filteredProducts, resetFilters } = useStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {filteredProducts.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-lg border border-stone-200 p-8 max-w-lg mx-auto shadow-2xs">
          <Sparkles className="w-10 h-10 mx-auto text-amber-700/60 mb-3" />
          <h3 className="font-serif text-xl font-bold text-stone-900">
            No Styles Match Your Search
          </h3>
          <p className="text-xs text-stone-500 mt-1.5 max-w-sm mx-auto">
            Try adjusting your category, size, or price filters, or search for feeding kurti, umbrella, jeans, or shawls.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded flex items-center gap-1.5 mx-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

import { CheckoutPage } from './components/CheckoutPage';

const MainStoreApp: React.FC = () => {
  const { isCheckoutOpen, setIsCheckoutOpen } = useStore();

  if (isCheckoutOpen) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex flex-col bg-[#FAF9F5] text-stone-900 font-sans">
        <CheckoutPage onBack={() => setIsCheckoutOpen(false)} />
        <AuthModal />
        <OrderSuccessModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-[#FAF9F5] text-stone-900 font-sans">
      {/* Top Navbar */}
      <Navbar />

      {/* Hero Campaign */}
      <Hero />

      {/* Catalog Search & Multi-Facet Filters */}
      <SearchFilterBar />

      {/* Responsive Product Gallery Grid */}
      <ProductGridContent />

      {/* Coimbatore Local Boutique & Visiting Info */}
      <StoreInfoSection />

      {/* Footer */}
      <Footer />

      {/* Floating Modals & Drawers */}
      <ProductDetailModal />
      <CartDrawer />
      <AuthModal />
      <AccountDrawer />
      <WishlistDrawer />
      <OrderSuccessModal />
      <StoreManagerModal />

      {/* Mobile Sticky Thumb Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
};

import { StandaloneCourierLabelPage } from './components/StandaloneCourierLabelPage';

export default function App() {
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const isPrintLabelAction =
    searchParams?.get('action') === 'print-label' ||
    (typeof window !== 'undefined' && window.location.pathname === '/print-label');

  if (isPrintLabelAction) {
    return <StandaloneCourierLabelPage />;
  }

  return (
    <StoreProvider>
      <MainStoreApp />
    </StoreProvider>
  );
}
