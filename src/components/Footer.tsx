import React from 'react';
import { Phone, MessageCircle, MapPin, Instagram, Youtube, Sparkles, Settings } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { SHOP_INFO } from '../data/products';

export const Footer: React.FC = () => {
  const { setFilters, setIsStoreManagerOpen } = useStore();

  const handleNav = (cat: string, subcat?: string) => {
    setFilters({ category: cat, subcategory: subcat || 'All Styles' });
    const el = document.getElementById('catalog-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-stone-950 text-stone-300 pt-14 pb-24 md:pb-14 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-serif text-3xl font-black text-amber-400 tracking-tight">
                Shruthi Fashion
              </span>
              <span className="bg-amber-900 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded">
                Kovundampalayam
              </span>
            </div>
            
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              Your neighborhood fashion destination in Kovundampalayam, Coimbatore. Specializing in daily & festive kurtis, maternity feeding kurtis, western wear, comfort stretch jeans, leggings, and grand bridal shawls.
            </p>

            <div className="text-xs text-stone-400 space-y-1.5 pt-1">
              <p className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>1st Floor in City Cake Shop</strong>, Near Balaji Textiles, Edayarpalayam Road, Kovundampalayam, Coimbatore - <strong>641030</strong>
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

          {/* Kurtis Collection */}
          <div className="space-y-3 text-xs">
            <p className="font-bold text-white uppercase tracking-wider text-[11px]">
              Kurtis Collection
            </p>
            <ul className="space-y-2 text-stone-400">
              <li>
                <button
                  onClick={() => handleNav('Kurtis', 'Straight Cut Kurti')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Straight Cut Kurti
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('Kurtis', 'Short Kurtis')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Short Kurtis & Tunics
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('Kurtis', 'Umbrella Kurti')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Umbrella & Flared Kurti
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('Kurtis', 'Feeding Kurti')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left font-semibold text-amber-300"
                >
                  Feeding Kurti (Maternity)
                </button>
              </li>
            </ul>
          </div>

          {/* Bottom Wear & Western */}
          <div className="space-y-3 text-xs">
            <p className="font-bold text-white uppercase tracking-wider text-[11px]">
              Bottom & Western
            </p>
            <ul className="space-y-2 text-stone-400">
              <li>
                <button
                  onClick={() => handleNav('Bottom Wear', 'Jeans')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Stretch Denim Jeans
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('Bottom Wear', 'Leggings')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  4-Way Cotton Leggings
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('Bottom Wear', 'Ankle Fit')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Ankle Fit Cigarette Pants
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('Bottom Wear', 'Shimmer')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Festive Shimmer Pants
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('Bottom Wear', 'Palazzo')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Flared Rayon Palazzo
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('Western Wear', 'Western Wear')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Western Tops & Dresses
                </button>
              </li>
            </ul>
          </div>

          {/* Shawls & Store Hours */}
          <div className="space-y-3 text-xs">
            <p className="font-bold text-white uppercase tracking-wider text-[11px]">
              Shawls & Store Info
            </p>
            <ul className="space-y-2 text-stone-400">
              <li>
                <button
                  onClick={() => handleNav('Shawls & Dupattas', 'Regular Shawl')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Regular Daily Shawls
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('Shawls & Dupattas', 'Grand Shawls')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Grand Festive & Brocade Shawls
                </button>
              </li>
              <li className="pt-2 text-stone-500">
                <span>Timings: 10:00 AM – 9:30 PM (All 7 Days)</span>
              </li>
              <li className="text-emerald-400 font-medium">
                <span>✓ Walk-in Trials & All-India Courier Dispatch</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Quiet Sub-footer */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span>© 2026</span>
            <button
              onClick={() => setIsStoreManagerOpen(true)}
              className="text-stone-400 hover:text-amber-400 transition-colors font-medium cursor-pointer underline-offset-2 hover:underline"
              title="Store Management"
            >
              @shruthi fashion
            </button>
            <span>· All rights reserved. Edayarpalayam Road, Kovundampalayam, Coimbatore - 641030.</span>
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
