import React, { useState } from 'react';
import { Phone, MessageCircle, MapPin, Instagram, Youtube, Sparkles, Settings } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { SHOP_INFO } from '../data/products';

export const Footer: React.FC = () => {
  const { setFilters, setIsStoreManagerOpen } = useStore();
  const [ownerClickCount, setOwnerClickCount] = useState(0);

  const handleNav = (cat: string, subcat?: string) => {
    setFilters({ category: cat, subcategory: subcat || 'All Styles' });
    const el = document.getElementById('catalog-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOwnerClick = () => {
    const nextCount = ownerClickCount + 1;
    if (nextCount >= 5) {
      setOwnerClickCount(0);
      setIsStoreManagerOpen(true);
    } else {
      setOwnerClickCount(nextCount);
      setTimeout(() => {
        setOwnerClickCount(0);
      }, 4000);
    }
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
                <span>YouTube Channel</span>
              </a>
            </div>
          </div>

          {/* Col 2: Kurti Collections */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Kurtis Collection
            </p>
            <ul className="text-xs space-y-2 text-stone-400">
              <li>
                <button
                  onClick={() => handleNav('Kurtis', 'Straight Cut Kurti')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Daily & Office Straight Cut
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('Kurtis', 'Anarkali Kurti')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Flared Anarkali & Festive
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('Kurtis', 'Feeding Kurti')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left text-amber-300 font-medium"
                >
                  Maternity Feeding Zippers
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('Kurtis', 'A-Line Kurti')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  A-Line Flared Kurtis
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('Kurtis', 'Kurti Pant Set')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Complete 2-Piece & 3-Piece Sets
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Western & Bottom Wear */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Western & Bottom Wear
            </p>
            <ul className="text-xs space-y-2 text-stone-400">
              <li>
                <button
                  onClick={() => handleNav('Western Wear', 'Crop Tops & Casual Shirts')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Western Crop Tops & Shirts
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('Western Wear', 'One Piece Dresses')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  One-Piece Long Frocks
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('Bottom Wear', 'Cotton Lycra Stretch Leggings')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  4-Way Stretch Leggings (Ankle & Churidar)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('Bottom Wear', 'Stretch Denim Jeans')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  High-Waist Comfort Jeans
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('Bottom Wear', 'Palazzo & Cigarette Pants')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Cotton Flex Palazzos
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Shawls & Store Info */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Shawls & Store Info
            </p>
            <ul className="text-xs space-y-2 text-stone-400">
              <li>
                <button
                  onClick={() => handleNav('Shawls & Dupattas', 'Daily Shawls')}
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
            </ul>
          </div>

        </div>

        {/* Quiet Sub-footer */}
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