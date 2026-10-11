import React from 'react';
import { ArrowDown } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Hero: React.FC = () => {
  const { heroConfig } = useStore();

  const handleScrollToProducts = () => {
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-[#FAF9F5] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        
        {/* Main Picture Banner */}
        <div className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-md border border-stone-300 aspect-[16/9] sm:aspect-[21/9] lg:aspect-[24/9] bg-stone-100 group">
          <img
            src={heroConfig.imageUrl}
            alt={heroConfig.title}
            className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-102"
            referrerPolicy="no-referrer"
            loading="eager"
          />

          {/* Measured soft gradient scrim for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 flex flex-col justify-end p-5 sm:p-8 md:p-12" />

          {/* Picture Overlay Content */}
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 md:p-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div className="space-y-1.5 max-w-xl">
              <span className="text-xs sm:text-sm font-semibold tracking-widest text-amber-300 uppercase">
                {heroConfig.badge}
              </span>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-white leading-tight drop-shadow-md">
                {heroConfig.title}
              </h1>
              <p className="text-xs sm:text-base text-stone-200 font-medium">
                {heroConfig.subtitle}
              </p>
            </div>

            {/* Direct scroll affordance */}
            <button
              onClick={handleScrollToProducts}
              className="self-start sm:self-end px-5 py-2.5 sm:px-6 sm:py-3 bg-amber-800 hover:bg-amber-900 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer group"
            >
              <span>Explore Collection</span>
              <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
