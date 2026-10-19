import React from 'react';
import { StoreProvider } from './context/StoreContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategorySection } from './components/CategorySection';
import { ProductGrid } from './components/ProductGrid';
import { StoreInfo } from './components/StoreInfo';
import { Footer } from './components/Footer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { AccountDrawer } from './components/AccountDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { StoreManagerModal } from './components/StoreManagerModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { StandaloneCourierLabelPage } from './components/StandaloneCourierLabelPage';

const MainStoreApp: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-stone-900 pb-16 md:pb-0">
      <Header />
      <main className="flex-1">
        <Hero />
        <CategorySection />
        <ProductGrid />
        <StoreInfo />
      </main>
      <Footer />

      <ProductDetailModal />
      <CartDrawer />
      <AuthModal />
      <AccountDrawer />
      <WishlistDrawer />
      <OrderSuccessModal />
      <StoreManagerModal />
      <MobileBottomNav />
    </div>
  );
};

export default function App() {
  const isPrintLabelAction =
    typeof window !== 'undefined' &&
    (window.location.search.includes('action=print-label') ||
      window.location.hash.includes('action=print-label') ||
      window.location.pathname.includes('/print-label'));

  if (isPrintLabelAction) {
    return <StandaloneCourierLabelPage />;
  }

  return (
    <StoreProvider>
      <MainStoreApp />
    </StoreProvider>
  );
}