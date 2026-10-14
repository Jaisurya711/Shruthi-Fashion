import React, { useState } from 'react';
import { Phone, MapPin, Instagram, Youtube, Sparkles, ShieldCheck, Heart } from 'lucide-react';
import { SHOP_INFO } from '../data/products';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const { setFilters, setIsStoreManagerOpen } = useStore();
  const [clickCount, setClickCount] = useState(0);

  const handleCategoryClick = (cat: string, subcat?: string) => {
    setFilters({ category: cat, subcategory: subcat || 'All Styles' });
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOwnerClick = () => {
    const next = clickCount + 1;
    if (next >= 5) {
      setClickCount(0);
      setIsStoreManagerOpen(true);
    } else {
      setClickCount(next);
      setTimeout(() => {
        setClickCount(0);
      }, 4000);
    }
  };

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-serif text-3xl font-black text-amber-400 tracking-tight">
                Shruthi Fashion
              </span>
            </div>
            
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              Your neighborhood fashion destination. Specializing in daily & festive kurtis, maternity feeding kurtis, western wear, comfort stretch jeans, leggings, and grand bridal shawls.
            </p>

            <div className="text-xs text-stone-400 space-y-1.5 pt-1">
              <p className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>1st Floor in City Cake Shop</strong>, Near Balaji Textiles, Edayarpalayam Road - <strong>641030</strong>
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Call: <strong>{SHOP_INFO.primaryContact}</strong> / <strong>{SHOP_INFO.secondaryContact}</strong></span>
              </p>
            </div>

            {/* Social channels */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={SHOP_INFO.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded text-xs text-stone-300 hover:text-white transition-colors"
              >
                <Instagram className="w-3.5 h-3.5 text-rose-400" />
                <span>@{SHOP_INFO.instagramHandle}</span>
              </a>
              <a
                href={SHOP_INFO.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded text-xs text-stone-300 hover:text-white transition-colors"
              >
                <Youtube className="w-3.5 h-3.5 text-red-500" />
                <span>{SHOP_INFO.youtubeHandle}</span>
              </a>
            </div>
          </div>

          {/* Kurtis Categories */}
          <div className="space-y-3 text-xs">
            <p className="font-bold text-white uppercase tracking-wider text-[11px]">
              Kurtis Collection
            </p>
            <ul className="space-y-2 text-stone-400">
              <li>
                <button
                  onClick={() => handleCategoryClick('Kurtis', 'Straight Cut Kurti')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Straight Cut Kurti
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('Kurtis', 'Short Kurtis')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Short Kurtis & Tunics
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('Kurtis', 'Umbrella Kurti')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Umbrella & Flared Kurti
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('Kurtis', 'Feeding Kurti')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left font-semibold text-amber-300"
                >
                  Feeding Kurti (Maternity)
                </button>
              </li>
            </ul>
          </div>

          {/* Bottom & Western */}
          <div className="space-y-3 text-xs">
            <p className="font-bold text-white uppercase tracking-wider text-[11px]">
              Bottom & Western
            </p>
            <ul className="space-y-2 text-stone-400">
              <li>
                <button
                  onClick={() => handleCategoryClick('Bottom Wear', 'Jeans')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Stretch Denim Jeans
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('Bottom Wear', 'Leggings')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  4-Way Cotton Leggings
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('Bottom Wear', 'Ankle Fit')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Ankle Fit Cigarette Pants
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('Bottom Wear', 'Shimmer')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Festive Shimmer Pants
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('Bottom Wear', 'Palazzo')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Flared Rayon Palazzo
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('Western Wear', 'Western Wear')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Western Tops & Dresses
                </button>
              </li>
            </ul>
          </div>

          {/* Shawls & Timings */}
          <div className="space-y-3 text-xs">
            <p className="font-bold text-white uppercase tracking-wider text-[11px]">
              Shawls & Store Info
            </p>
            <ul className="space-y-2 text-stone-400">
              <li>
                <button
                  onClick={() => handleCategoryClick('Shawls & Dupattas', 'Regular Shawl')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Regular Daily Shawls
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('Shawls & Dupattas', 'Grand Shawls')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Grand Festive & Brocade Shawls
                </button>
              </li>
              <li className="pt-2 text-stone-500">
                <span>Timings: 10:00 AM – 9:30 PM (All 7 Days)</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar with owner secret unlock */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span>© 2026</span>
            <button
              type="button"
              onClick={handleOwnerClick}
              className="text-stone-400 hover:text-stone-300 font-normal cursor-pointer select-none"
              title="Shruthi Fashion"
            >
              @shruthi fashion
            </button>
            <span>· All rights reserved. Edayarpalayam Road - 641030.</span>
          </div>

          <div className="flex items-center gap-4">
            <a href={`tel:${SHOP_INFO.primaryContact}`} className="hover:text-stone-300">
              {SHOP_INFO.primaryContact}
            </a>
            <span>|</span>
            <a href={`tel:${SHOP_INFO.secondaryContact}`} className="hover:text-stone-300">
              {SHOP_INFO.secondaryContact}
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};