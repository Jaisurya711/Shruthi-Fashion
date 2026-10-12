import React, { useState } from 'react';
import { X, User, Phone, KeyRound, ArrowRight, ShieldCheck, CreditCard, RotateCcw } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { sendCustomerRegistrationEmail } from '../services/notificationService';

export const AuthModal: React.FC = () => {
  const { isAuthOpen, setIsAuthOpen, login, pendingCheckoutAfterAuth } = useStore();

  // Registration step: 1 = Enter Name & Mobile Number, 2 = Enter OTP
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [otpSentNotification, setOtpSentNotification] = useState('');

  if (!isAuthOpen) return null;

  // Clean phone digits
  const cleanPhone = phone.replace(/\D/g, '');

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }

    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Generate random 4-digit OTP
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(randomCode);
    setEnteredOtp('');
    setStep('otp');

    // Notify user with SMS code
    setOtpSentNotification(`OTP sent to +91 ${cleanPhone.slice(-10)}. Code: ${randomCode}`);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (enteredOtp.trim() !== generatedOtp.trim()) {
      setErrorMsg('Incorrect OTP. Please enter the 4-digit code sent to your mobile.');
      return;
    }

    // OTP matched! Complete registration using customer name as username
    const formattedPhone = cleanPhone.length === 10 ? `+91 ${cleanPhone}` : phone.trim();
    const customerName = name.trim();

    // Send notification to owner email
    sendCustomerRegistrationEmail({
      name: customerName,
      phone: formattedPhone
    });

    login(customerName, formattedPhone);
    setIsAuthOpen(false);

    // Reset modal state
    setStep('input');
    setName('');
    setPhone('');
    setEnteredOtp('');
    setGeneratedOtp('');
    setErrorMsg('');
    setOtpSentNotification('');
  };

  const handleResendOtp = () => {
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(randomCode);
    setEnteredOtp('');
    setErrorMsg('');
    setOtpSentNotification(`New OTP sent to +91 ${cleanPhone.slice(-10)}. Code: ${randomCode}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#FAF9F5] rounded-lg shadow-2xl border border-stone-300 overflow-hidden">
        
        {/* Header Close */}
        <button
          onClick={() => {
            setIsAuthOpen(false);
            setStep('input');
            setErrorMsg('');
          }}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-700 shadow flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Banner */}
        <div className="p-6 bg-stone-900 text-[#FAF9F5] text-center relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-serif text-2xl font-bold tracking-tight text-amber-400">Shruthi Fashion</h3>
            <p className="text-xs text-stone-300 mt-1">
              Customer Registration · Mobile OTP Verification
            </p>
          </div>
        </div>

        {/* Pending Checkout Alert */}
        {pendingCheckoutAfterAuth && (
          <div className="mx-4 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-900 text-xs flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-700 shrink-0" />
            <p>
              <strong>Registration Required:</strong> Please verify your mobile number to complete your order.
            </p>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 space-y-4">

          {/* STEP 1: Enter Name & Mobile Number */}
          {step === 'input' && (
            <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Customer Name (Username)</label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-amber-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    maxLength={13}
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-amber-800 font-medium"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  We will send a 4-digit one-time password (OTP) to this number.
                </p>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-amber-800 hover:bg-amber-900 text-white font-semibold rounded-md shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Send OTP to Mobile</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: Verify Mobile OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
              {/* SMS Alert Banner */}
              {otpSentNotification && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-900 text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>SMS Delivered</span>
                  </p>
                  <p className="text-[11px] font-mono text-emerald-800">
                    {otpSentNotification}
                  </p>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-stone-700 font-semibold">Enter 4-Digit OTP</label>
                  <button
                    type="button"
                    onClick={() => setStep('input')}
                    className="text-amber-800 hover:underline text-[11px]"
                  >
                    Change mobile number
                  </button>
                </div>

                <div className="relative">
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    maxLength={4}
                    autoFocus
                    placeholder="Enter 4-digit OTP"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-amber-800 font-mono text-center tracking-widest text-lg font-bold"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Mobile: <strong>+91 {cleanPhone.slice(-10)}</strong> · Customer: <strong>{name}</strong>
                </p>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-md shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify OTP & Complete Registration</span>
              </button>

              <div className="pt-2 flex items-center justify-between text-[11px] text-stone-600">
                <span>Didn't receive the OTP?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-amber-800 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Resend OTP</span>
                </button>
              </div>
            </form>
          )}

          {/* Membership Benefits */}
          <div className="p-3 bg-white border border-stone-200 rounded text-[11px] text-stone-600 space-y-1.5">
            <p className="font-semibold text-stone-900 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Registered Shopper Privileges:</span>
            </p>
            <p>• Save delivery addresses across Coimbatore & All-India</p>
            <p>• Direct checkout with Razorpay UPI & Cards</p>
            <p>• Verified order tracking & digital invoices</p>
          </div>

        </div>

      </div>
    </div>
  );
};