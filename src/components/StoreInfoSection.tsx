import React from 'react';
import { MapPin, Phone, MessageCircle, Clock, Navigation, Instagram, Youtube, Sparkles } from 'lucide-react';
import { SHOP_INFO } from '../data/products';

export const StoreInfoSection: React.FC = () => {
  return (
    <section id="store-info" className="py-14 sm:py-18 bg-white border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header */}
        <div className="max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-amber-950">
            Visit Shruthi Fashion Store
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mt-2">
            Located conveniently on Edayarpalayam Road. Step into our store to try on our trending short kurtis, straight cut styles, festive umbrella kurtis, discrete feeding kurtis, stretch jeans, leggings, and grand shawls.
          </p>
        </div>

        {/* Highlighted Store Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Main Address & Directions Card */}
          <div className="lg:col-span-7 bg-[#FAF9F5] p-6 sm:p-8 rounded-xl border-2 border-amber-800/30 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              
              {/* Highlighted Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-800 text-white text-xs font-bold uppercase tracking-wider rounded">
                <MapPin className="w-3.5 h-3.5" />
                <span>Store Landmark & Address</span>
              </div>

              <div>
                <h3 className="font-serif text-2xl sm:text-3xl font-black text-stone-900">
                  Shruthi Fashion
                </h3>
                <p className="text-sm font-semibold text-amber-900 mt-1">
                  1st Floor in City Cake Shop, Near Balaji Textiles
                </p>
                <p className="text-stone-700 text-sm mt-0.5">
                  Edayarpalayam Road, Tamil Nadu – <strong>641030</strong>
                </p>
              </div>

              {/* Working Hours & Contact details */}
              <div className="space-y-3 pt-4 border-t border-stone-200 text-xs sm:text-sm text-stone-800">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>Store Hours: <strong>{SHOP_INFO.openingHours}</strong></span>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>Call Contacts: <strong>{SHOP_INFO.primaryContact}</strong> / <strong>{SHOP_INFO.secondaryContact}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center gap-3">
              <a
                href={`tel:${SHOP_INFO.primaryContact}`}
                className="px-5 py-2.5 bg-amber-900 hover:bg-amber-950 text-white text-xs sm:text-sm font-semibold rounded-md transition-colors flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Call Store Now</span>
              </a>

              <a
                href="https://maps.google.com/?q=Shruthi+Fashion+Edayarpalayam+Road"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 text-xs sm:text-sm font-medium rounded-md transition-colors flex items-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5 text-amber-800" />
                <span>Open in Google Maps</span>
              </a>
            </div>
          </div>

          {/* Social Channels & Highlights Card */}
          <div className="lg:col-span-5 bg-stone-900 text-[#FAF9F5] p-6 sm:p-8 rounded-xl shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
                Online Community
              </span>
              <h3 className="font-serif text-2xl font-bold text-white">
                Follow Shruthi Fashion
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Watch our latest stock unboxings, try-on hauls, customer styling reviews, and daily offers on Instagram & YouTube!
              </p>

              {/* Social links */}
              <div className="space-y-3 pt-2">
                <a
                  href={SHOP_INFO.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-stone-800/80 hover:bg-stone-800 rounded-lg flex items-center justify-between transition-colors border border-stone-700 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white">
                      <Instagram className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Instagram</p>
                      <p className="text-[11px] text-stone-400">@{SHOP_INFO.instagramHandle}</p>
                    </div>
                  </div>
                  <span className="text-xs text-rose-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                    Follow →
                  </span>
                </a>

                <a
                  href={SHOP_INFO.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-stone-800/80 hover:bg-stone-800 rounded-lg flex items-center justify-between transition-colors border border-stone-700 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white">
                      <Youtube className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">YouTube Channel</p>
                      <p className="text-[11px] text-stone-400">{SHOP_INFO.youtubeHandle}</p>
                    </div>
                  </div>
                  <span className="text-xs text-red-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                    Subscribe →
                  </span>
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
