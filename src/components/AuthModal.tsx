import React, { useState } from 'react';
import { X, Lock, User, Phone, Sparkles, ShieldCheck, CreditCard } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { sendCustomerRegistrationEmail } from '../services/notificationService';

export const AuthModal: React.FC = () => {
  const { isAuthOpen, setIsAuthOpen, login, pendingCheckoutAfterAuth } = useStore();
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [isSending, setIsSending] = useState(false);

  // Form states - Simplified registration with only Full Name, Mobile Phone, and Password
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  if (!isAuthOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || (mode === 'signup' ? 'New Customer' : 'Customer');
    const finalPhone = phone.trim() || '+91 99622 78349';

    if (mode === 'signup') {
      setIsSending(true);
      // Dispatch customer details to store owner email: shruthifashion01@gmail.com
      sendCustomerRegistrationEmail({
        name: finalName,
        phone: finalPhone
      });
      setIsSending(false);
    }

    login(finalName, finalPhone);
  };

  const handleDemoSignIn = () => {
    login('Dr. Revathi Sridhar', '+91 98422 13456');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#FAF9F5] rounded-lg shadow-2xl border border-stone-300 overflow-hidden">
        
        {/* Header Close */}
        <button
          onClick={() => setIsAuthOpen(false)}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-700 shadow flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Banner */}
        <div className="p-6 bg-stone-900 text-[#FAF9F5] text-center relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-serif text-2xl font-bold tracking-tight text-amber-400">Shruthi Fashion</h3>
            <p className="text-xs text-stone-300 mt-1">
              1st Floor in City Cake Shop, Kovundampalayam, Coimbatore (641030)
            </p>
          </div>
        </div>

        {/* Pending Checkout Alert */}
        {pendingCheckoutAfterAuth && (
          <div className="mx-4 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-900 text-xs flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-700 shrink-0" />
            <p>
              <strong>Registration Required:</strong> Please register or sign in to complete your purchase and connect to Razorpay payment.
            </p>
          </div>
        )}

        {/* Tab switch */}
        <div className="grid grid-cols-2 border-b border-stone-200 bg-white text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`py-3 text-center border-b-2 transition-colors cursor-pointer ${
              mode === 'signup'
                ? 'border-amber-800 text-amber-900 bg-amber-50/40'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`py-3 text-center border-b-2 transition-colors cursor-pointer ${
              mode === 'signin'
                ? 'border-amber-800 text-amber-900 bg-amber-50/40'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {mode === 'signup' && (
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Soundarya Raman"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-amber-800"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Mobile Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="+91 98422 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-amber-800 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-amber-800"
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3 text-white font-semibold rounded-md shadow-sm transition-colors cursor-pointer mt-2 flex items-center justify-center gap-2 ${
                pendingCheckoutAfterAuth
                  ? 'bg-blue-700 hover:bg-blue-800'
                  : 'bg-amber-800 hover:bg-amber-900'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>
                {pendingCheckoutAfterAuth
                  ? (mode === 'signup' ? 'Complete Registration & Pay via Razorpay' : 'Sign In & Pay via Razorpay')
                  : (mode === 'signup' ? 'Register Account' : 'Sign In to Profile')}
              </span>
            </button>
          </form>

          {/* Quick 1-Click Demo Sign In */}
          <div className="pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>1-Click Demo Login (Revathi - Coimbatore Patron)</span>
            </button>
          </div>

          {/* Membership Benefits */}
          <div className="p-3 bg-white border border-stone-200 rounded text-[11px] text-stone-600 space-y-1.5">
            <p className="font-semibold text-stone-900 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Registered Shopper Privileges:</span>
            </p>
            <p>• Save delivery addresses across Coimbatore & All-India</p>
            <p>• Digital payment receipts & verified order history</p>
            <p>• Early access to Deepavali & Pongal handloom releases</p>
          </div>
        </div>

      </div>
    </div>
  );
};
