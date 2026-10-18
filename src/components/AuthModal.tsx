import React, { useState, useEffect, useRef } from 'react';
import { X, User, Phone, ShieldCheck, ArrowRight, RotateCcw, CreditCard, Sparkles, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { sendCustomerRegistrationEmail } from '../services/notificationService';

// Characters excluding ambiguous 0, O, 1, I for optimal readability
const CAPTCHA_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function generateRandomCaptcha(length: number = 5): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CAPTCHA_CHARS.charAt(Math.floor(Math.random() * CAPTCHA_CHARS.length));
  }
  return result;
}

export const AuthModal: React.FC = () => {
  const { isAuthOpen, setIsAuthOpen, login, pendingCheckoutAfterAuth, setIsCheckoutOpen } = useStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [enteredCaptcha, setEnteredCaptcha] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate and draw captcha code on canvas
  const refreshCaptcha = () => {
    const newCode = generateRandomCaptcha(5);
    setCaptchaCode(newCode);
    setEnteredCaptcha('');
    setErrorMsg('');
  };

  // Draw captcha whenever captchaCode or canvas changes
  useEffect(() => {
    if (!captchaCode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#F5F2EB');
    bgGradient.addColorStop(1, '#EAE5D9');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle background noise lines
    const lineColors = ['#D1C7B7', '#C4B59D', '#DDD4C4', '#D8CBB5'];
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.strokeStyle = lineColors[i % lineColors.length];
      ctx.lineWidth = 1 + Math.random() * 1.5;
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }

    // Subtle noise dots
    for (let i = 0; i < 25; i++) {
      ctx.beginPath();
      ctx.fillStyle = '#C4B59D';
      ctx.arc(Math.random() * width, Math.random() * height, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Character drawing with varying tilt, colors, and font styles
    const colors = ['#78350F', '#854D0E', '#92400E', '#1C1917', '#9A3412'];
    const charSpacing = width / (captchaCode.length + 1);

    for (let i = 0; i < captchaCode.length; i++) {
      const char = captchaCode[i];
      ctx.save();

      const x = charSpacing * (i + 1);
      const y = height / 2 + 6;

      ctx.translate(x, y);

      // Random slight tilt (-18 to +18 deg)
      const angle = (Math.random() * 36 - 18) * (Math.PI / 180);
      ctx.rotate(angle);

      ctx.fillStyle = colors[i % colors.length];
      ctx.font = 'bold 24px "Plus Jakarta Sans", ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Slight shadow
      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.shadowBlur = 1;

      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  }, [captchaCode]);

  // Initialize captcha whenever modal opens
  useEffect(() => {
    if (isAuthOpen) {
      refreshCaptcha();
      setErrorMsg('');
      setIsSuccess(false);
      setIsSubmitting(false);
    }
  }, [isAuthOpen]);

  if (!isAuthOpen) return null;

  const cleanPhone = phone.replace(/\D/g, '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Name validation
    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    // Mobile validation
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Captcha validation (case-insensitive for smooth customer experience)
    const normalizedEntered = enteredCaptcha.trim().toUpperCase();
    const normalizedTarget = captchaCode.trim().toUpperCase();

    if (!normalizedEntered) {
      setErrorMsg('Please enter the captcha code shown in the image.');
      return;
    }

    if (normalizedEntered !== normalizedTarget) {
      setErrorMsg('Incorrect captcha code. A new code has been generated. Please try again.');
      refreshCaptcha();
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedPhone = cleanPhone.length === 10 ? `+91 ${cleanPhone}` : phone.trim();
      const customerName = name.trim();

      // Dispatch store owner email notification
      sendCustomerRegistrationEmail({
        name: customerName,
        phone: formattedPhone,
      });

      // Complete login directly
      login(customerName, formattedPhone);
      setIsSuccess(true);

      setTimeout(() => {
        setIsAuthOpen(false);
        setIsSuccess(false);
        setName('');
        setPhone('');
        setEnteredCaptcha('');
        setErrorMsg('');

        // If user was prompted to login during checkout, open checkout modal
        if (pendingCheckoutAfterAuth) {
          setIsCheckoutOpen(true);
        }
      }, 700);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error completing login. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#FAF9F5] rounded-xl shadow-2xl border border-stone-300 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={() => {
            setIsAuthOpen(false);
            setErrorMsg('');
          }}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-stone-950 shadow flex items-center justify-center cursor-pointer transition-colors"
          title="Close"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="p-6 bg-stone-900 text-[#FAF9F5] text-center relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-serif text-2xl font-bold tracking-tight text-amber-400">
              Shruthi Fashion
            </h3>
            <p className="text-xs text-stone-300 mt-1">
              Customer Registration & Fast Captcha Login
            </p>
          </div>
        </div>

        {/* Pending Checkout Alert */}
        {pendingCheckoutAfterAuth && (
          <div className="mx-4 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-xs flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-700 shrink-0" />
            <p>
              <strong>Quick Registration:</strong> Enter your details below to proceed to instant checkout.
            </p>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 space-y-4">
          
          {isSuccess ? (
            <div className="py-8 text-center space-y-3 animate-in fade-in">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
              <h4 className="font-serif text-xl font-bold text-stone-900">Welcome, {name}!</h4>
              <p className="text-xs text-stone-600">
                You are now registered and logged in to Shruthi Fashion.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Customer Name */}
              <div>
                <label className="block text-stone-800 font-semibold mb-1">
                  Customer Name (User Name)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-stone-300 rounded-md text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-stone-800 font-semibold mb-1">
                  Mobile Number
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none text-stone-500 font-medium">
                    <Phone className="w-4 h-4 text-stone-400" />
                    <span className="text-xs border-r border-stone-300 pr-1.5">+91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={cleanPhone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full pl-18 pr-3 py-2.5 bg-white border border-stone-300 rounded-md text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800 font-medium tracking-wide"
                  />
                </div>
              </div>

              {/* Captcha Security Verification */}
              <div className="p-3.5 bg-stone-100/90 rounded-lg border border-stone-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-stone-800 font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-800" />
                    <span>Security Verification</span>
                  </label>
                  <span className="text-[11px] text-stone-500">Case-insensitive</span>
                </div>

                {/* Captcha Canvas & Refresh Button */}
                <div className="flex items-center gap-2.5">
                  <div className="border border-stone-300 rounded-md overflow-hidden shadow-2xs bg-white">
                    <canvas
                      ref={canvasRef}
                      width={160}
                      height={46}
                      className="block select-none"
                      title="Captcha security image"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="p-2.5 bg-white hover:bg-stone-50 border border-stone-300 rounded-md text-stone-700 hover:text-amber-900 transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                    title="Generate new captcha code"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="text-[11px] font-medium hidden sm:inline">Refresh</span>
                  </button>
                </div>

                {/* Captcha Input */}
                <div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoComplete="off"
                    placeholder="Enter the 5 characters above"
                    value={enteredCaptcha}
                    onChange={(e) => setEnteredCaptcha(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-md text-stone-900 uppercase font-mono tracking-widest text-sm font-bold placeholder:normal-case placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-stone-400 focus:outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800"
                  />
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-2.5 bg-rose-50 border border-rose-300 text-rose-800 rounded-md text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-amber-800 hover:bg-amber-900 disabled:bg-stone-400 text-white font-semibold rounded-md shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Complete Registration & Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Shopper Benefits */}
          <div className="p-3 bg-white border border-stone-200 rounded-lg text-[11px] text-stone-600 space-y-1.5 shadow-2xs">
            <p className="font-semibold text-stone-900 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Registered Customer Privileges:</span>
            </p>
            <p>• Save delivery addresses across India</p>
            <p>• Seamless online checkout with Razorpay UPI & Cards</p>
            <p>• Digital order invoices & real-time WhatsApp updates</p>
          </div>

        </div>

      </div>
    </div>
  );
};
