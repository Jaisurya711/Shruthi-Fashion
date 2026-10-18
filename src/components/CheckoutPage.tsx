import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Truck,
  Lock,
  AlertCircle,
  MapPin,
  CheckCircle2,
  PackageCheck,
  Phone,
  RotateCcw,
  ShoppingBag,
  KeyRound,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Address } from '../types/store';
import { SHOP_INFO } from '../data/products';

interface CheckoutPageProps {
  onBackToShop?: () => void;
  onBack?: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBackToShop, onBack }) => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    user,
    login,
    placeOrder,
    storeBank,
    updateStoreBank,
    saveAddress
  } = useStore();

  const isDummyAddress = (addr?: Address | null): boolean => {
    if (!addr) return true;
    const txt = `${addr.street || ''} ${addr.area || ''} ${addr.city || ''} ${addr.pincode || ''}`.toLowerCase();
    return (
      txt.includes('cross cut') ||
      txt.includes('gandhipuram') ||
      txt.includes('balaji textiles') ||
      txt.includes('r.s. puram') ||
      txt.includes('641012') ||
      txt.includes('641030') ||
      (!addr.street?.trim() && !addr.area?.trim())
    );
  };

  const getCleanInitialAddress = (): Address => {
    const validSaved = user?.addresses?.find((a: Address) => !isDummyAddress(a));
    if (validSaved) return validSaved;
    return {
      id: `addr-${Date.now()}`,
      fullName: user?.name && user.name !== 'Customer' ? user.name.replace(/[^a-zA-Z\s]/g, '') : '',
      phone: user?.phone && !user.phone.includes('99622 78349') ? user.phone.replace(/\D/g, '').slice(0, 10) : '',
      street: '',
      area: '',
      city: '',
      pincode: '',
      state: 'Tamil Nadu',
      isDefault: true
    };
  };

  const [shippingAddress, setShippingAddress] = useState<Address>(getCleanInitialAddress);
  const [addressErrors, setAddressErrors] = useState<Record<string, boolean>>({});
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [customKeyId, setCustomKeyId] = useState(storeBank.razorpayKeyId || 'rzp_live_TpGh87ZFgGUGsI');
  const [customKeySecret, setCustomKeySecret] = useState(storeBank.razorpayKeySecret || 'NbW6Xt7zLCtJfNcLt4rcm6ld');
  const [savedKeySuccess, setSavedKeySuccess] = useState(false);

  // Sync address when user changes
  useEffect(() => {
    const validSaved = user?.addresses?.find((a: Address) => !isDummyAddress(a));
    if (validSaved) {
      setShippingAddress(validSaved);
    } else if (user) {
      setShippingAddress((prev: Address) => ({
        ...prev,
        fullName: prev.fullName || (user.name !== 'Customer' ? user.name.replace(/[^a-zA-Z\s]/g, '') : ''),
        phone: prev.phone || (!user.phone.includes('99622 78349') ? user.phone.replace(/\D/g, '').slice(0, 10) : '')
      }));
    }
  }, [user]);

  // Scroll to top when checkout page is opened
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleBackToStore = () => {
    if (onBackToShop) {
      onBackToShop();
    } else if (onBack) {
      onBack();
    } else {
      setIsCheckoutOpen(false);
    }
  };

  // Shipping cost: Flat 80 rupees
  const shippingFee = 80;
  const grandTotal = cartSubtotal + shippingFee;

  const handleAddressChange = (field: keyof Address, value: string) => {
    setShippingAddress((prev: Address) => ({ ...prev, [field]: value }));
    if (addressErrors[field]) {
      setAddressErrors((prev: Record<string, boolean>) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (paymentError) setPaymentError(null);
  };

  const validateAddress = (): string | null => {
    const errs: Record<string, boolean> = {};

    if (!shippingAddress.fullName.trim()) errs.fullName = true;

    const cleanPhone = shippingAddress.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) errs.phone = true;

    if (!shippingAddress.street.trim()) errs.street = true;
    if (!shippingAddress.area.trim()) errs.area = true;

    const cleanPin = shippingAddress.pincode.replace(/\D/g, '');
    if (cleanPin.length !== 6) errs.pincode = true;

    if (!shippingAddress.city.trim()) errs.city = true;
    if (!shippingAddress.state.trim()) errs.state = true;

    setAddressErrors(errs);

    if (Object.keys(errs).length > 0) {
      if (errs.fullName) return 'Please enter recipient Full Name.';
      if (errs.phone) return 'Please enter a valid 10-digit mobile number for courier dispatch.';
      if (errs.street) return 'Please enter Door / Flat No. & Street name.';
      if (errs.area) return 'Please enter Area / Locality / Landmark.';
      if (errs.pincode) return 'Please enter a valid 6-digit postal PIN code.';
      if (errs.city) return 'Please enter City / District.';
      if (errs.state) return 'Please enter State.';
      return 'Please complete all required delivery address fields.';
    }
    return null;
  };

  const ensureUserSession = () => {
    if (!user && shippingAddress.fullName.trim() && shippingAddress.phone.trim()) {
      try {
        login(shippingAddress.fullName.trim(), shippingAddress.phone.trim());
      } catch (e) {
        console.warn('Auto login session notice:', e);
      }
    }
    if (user) {
      saveAddress(shippingAddress);
    }
  };

  const handleSaveCustomKeys = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreBank({
      ...storeBank,
      razorpayKeyId: customKeyId.trim(),
      razorpayKeySecret: customKeySecret.trim()
    });
    setSavedKeySuccess(true);
    setTimeout(() => {
      setSavedKeySuccess(false);
      setShowKeyConfig(false);
    }, 1500);
  };

  // Ensure Razorpay SDK is loaded
  const ensureRazorpayLoaded = async (): Promise<boolean> => {
    if ((window as any).Razorpay) return true;
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Complete Sandbox Test Order helper
  const handleCompleteTestOrder = () => {
    const validationErr = validateAddress();
    if (validationErr) {
      setPaymentError(validationErr);
      return;
    }

    ensureUserSession();
    setIsProcessingPayment(true);

    try {
      placeOrder({
        address: shippingAddress,
        paymentMethod: 'Razorpay',
        paymentDetails: {
          razorpayPaymentId: `pay_sim_${Date.now()}`,
          razorpayOrderId: `order_sim_${Date.now()}`,
          razorpaySignature: 'simulated_test_signature'
        }
      });
      setIsCheckoutOpen(false);
    } catch (err: any) {
      setPaymentError(err?.message || 'Failed to complete order. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Handle Online Payment via Razorpay
  const handleRazorpayPayment = async () => {
    const validationErr = validateAddress();
    if (validationErr) {
      setPaymentError(validationErr);
      return;
    }

    ensureUserSession();
    setPaymentError(null);
    setIsProcessingPayment(true);

    try {
      const isLoaded = await ensureRazorpayLoaded();
      if (!isLoaded || !(window as any).Razorpay) {
        setIsProcessingPayment(false);
        setPaymentError('Razorpay payment gateway script could not be loaded. Please check your internet connection.');
        return;
      }

      const amountInPaise = Math.round(grandTotal * 100);
      let orderData: any = null;

      try {
        const createRes = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`,
            customKeyId: storeBank.razorpayKeyId,
            customKeySecret: storeBank.razorpayKeySecret
          })
        });

        const rawText = await createRes.text();
        try {
          orderData = JSON.parse(rawText);
        } catch {
          orderData = null;
        }
      } catch (backendErr: any) {
        console.warn('Backend order call notice:', backendErr);
      }

      // Resolve Razorpay Key ID
      const razorpayKey =
        (customKeyId && customKeyId.trim()) ||
        storeBank.razorpayKeyId ||
        orderData?.key_id ||
        (import.meta as any).env?.VITE_RAZORPAY_KEY_ID ||
        'rzp_live_TpGh87ZFgGUGsI';

      const options: any = {
        key: razorpayKey,
        amount: orderData?.amount || amountInPaise,
        currency: orderData?.currency || 'INR',
        name: 'Shruthi Fashion',
        description: 'Online Payment · Shruthi Fashion Coimbatore',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=128&q=80',
        ...(orderData?.order_id && !orderData.order_id.startsWith('order_sim_') && !orderData.order_id.startsWith('order_test_') ? { order_id: orderData.order_id } : {}),
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id?: string;
          razorpay_signature?: string;
        }) {
          try {
            setIsProcessingPayment(true);
            placeOrder({
              address: shippingAddress,
              paymentMethod: 'Razorpay',
              paymentDetails: {
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id || orderData?.order_id,
                razorpaySignature: response.razorpay_signature
              }
            });
            setIsCheckoutOpen(false);
          } catch (err: any) {
            setPaymentError('Payment completed but order recording error: ' + err?.message);
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: shippingAddress.fullName || user?.name || '',
          contact: shippingAddress.phone || user?.phone || '',
          email: user?.email || ''
        },
        theme: {
          color: '#1d4ed8'
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
          }
        }
      };

      try {
        const rzpInstance = new (window as any).Razorpay(options);
        rzpInstance.on('payment.failed', function (resp: any) {
          setIsProcessingPayment(false);
          const desc = resp.error?.description || 'Payment could not be completed.';
          setPaymentError(desc);
        });
        rzpInstance.open();
      } catch (rzpOpenErr: any) {
        setIsProcessingPayment(false);
        setPaymentError(rzpOpenErr?.message || 'Razorpay initialization failed.');
      }
    } catch (err: any) {
      setIsProcessingPayment(false);
      setPaymentError(err?.message || 'Could not initiate Razorpay payment.');
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-[#FAF9F5] text-stone-900">
      
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/98 backdrop-blur-md border-b border-stone-200 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          <button
            type="button"
            onClick={handleBackToStore}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-700 hover:text-stone-950 transition-colors cursor-pointer py-1.5 px-3 rounded-lg hover:bg-stone-100 border border-stone-200/80"
          >
            <ArrowLeft className="w-4 h-4 text-stone-600" />
            <span>Back to Shop</span>
          </button>

          <div className="flex flex-col items-center">
            <span className="font-serif text-xl sm:text-2xl font-black text-amber-900 tracking-tight">
              Shruthi Fashion
            </span>
            <span className="text-[10px] text-stone-500 uppercase tracking-widest hidden sm:block">
              Secure Online Checkout
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-blue-800 font-semibold bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              <Lock className="w-3.5 h-3.5 text-blue-700" />
              <span>256-Bit SSL</span>
            </div>
            <a
              href={`tel:${SHOP_INFO.primaryContact}`}
              className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1"
              title="Call support"
            >
              <Phone className="w-3.5 h-3.5 text-amber-800" />
              <span className="hidden md:inline">{SHOP_INFO.primaryContact}</span>
            </a>
          </div>

        </div>
      </header>

      {/* Main Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Progress bar */}
        <div className="mb-6 flex items-center justify-center gap-2 text-xs font-semibold text-stone-500">
          <span className="text-amber-800 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 1. Shipping Address
          </span>
          <span className="text-stone-300">──</span>
          <span className="text-blue-800 font-bold flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-blue-800 text-white flex items-center justify-center text-[10px]">2</span>
            Online Payment
          </span>
          <span className="text-stone-300">──</span>
          <span className="text-stone-400">3. Confirmation</span>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center max-w-md mx-auto my-12 shadow-xs space-y-4">
            <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
            <h2 className="font-serif text-xl font-bold text-stone-900">Your shopping bag is empty</h2>
            <p className="text-stone-500 text-xs">Add items from the catalog to proceed to payment.</p>
            <button
              onClick={handleBackToStore}
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              Explore Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* Left Column (7 cols): Delivery Address & Razorpay Section */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Step 1: Delivery Address */}
              <div className="bg-white p-5 sm:p-6 rounded-xl border border-stone-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-800" />
                    <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                      1. Delivery Address (Courier Dispatch)
                    </h2>
                  </div>
                  <span className="text-[11px] text-stone-500 font-medium">All India Delivery</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block text-stone-700 font-medium mb-1">
                      Recipient Full Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. S. Meenakshi"
                      value={shippingAddress.fullName}
                      onChange={(e) => handleAddressChange('fullName', e.target.value)}
                      className={`w-full px-3 py-2.5 bg-white border rounded-lg text-stone-900 focus:outline-none transition-colors ${
                        addressErrors.fullName ? 'border-rose-400 ring-1 ring-rose-400 bg-rose-50/30' : 'border-stone-300 focus:border-amber-800 focus:ring-1 focus:ring-amber-800'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-medium mb-1">
                      Mobile Number <span className="text-rose-600">*</span>
                    </label>
                    <div className="flex rounded-lg shadow-2xs">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-stone-300 bg-stone-100 text-stone-600 text-xs font-semibold">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        value={shippingAddress.phone}
                        onChange={(e) => handleAddressChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className={`w-full px-3 py-2.5 bg-white border rounded-r-lg text-stone-900 focus:outline-none transition-colors ${
                          addressErrors.phone ? 'border-rose-400 ring-1 ring-rose-400 bg-rose-50/30' : 'border-stone-300 focus:border-amber-800 focus:ring-1 focus:ring-amber-800'
                        }`}
                      />
                    </div>
                    <span className="text-[10px] text-stone-400 mt-1 block">For delivery updates &amp; courier tracking</span>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-medium mb-1">
                      Door / Flat No. &amp; Street <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 14/B, Gokulam Street"
                      value={shippingAddress.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                      className={`w-full px-3 py-2.5 bg-white border rounded-lg text-stone-900 focus:outline-none transition-colors ${
                        addressErrors.street ? 'border-rose-400 ring-1 ring-rose-400 bg-rose-50/30' : 'border-stone-300 focus:border-amber-800 focus:ring-1 focus:ring-amber-800'
                      }`}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-stone-700 font-medium mb-1">
                      Area / Landmark / Locality <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Near Balaji Textiles, Edayarpalayam"
                      value={shippingAddress.area}
                      onChange={(e) => handleAddressChange('area', e.target.value)}
                      className={`w-full px-3 py-2.5 bg-white border rounded-lg text-stone-900 focus:outline-none transition-colors ${
                        addressErrors.area ? 'border-rose-400 ring-1 ring-rose-400 bg-rose-50/30' : 'border-stone-300 focus:border-amber-800 focus:ring-1 focus:ring-amber-800'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-medium mb-1">
                      PIN Code <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 641030"
                      value={shippingAddress.pincode}
                      onChange={(e) => handleAddressChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className={`w-full px-3 py-2.5 bg-white border rounded-lg text-stone-900 focus:outline-none transition-colors ${
                        addressErrors.pincode ? 'border-rose-400 ring-1 ring-rose-400 bg-rose-50/30' : 'border-stone-300 focus:border-amber-800 focus:ring-1 focus:ring-amber-800'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-medium mb-1">
                      City / District <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Coimbatore, Chennai, Salem"
                      value={shippingAddress.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      className={`w-full px-3 py-2.5 bg-white border rounded-lg text-stone-900 focus:outline-none transition-colors ${
                        addressErrors.city ? 'border-rose-400 ring-1 ring-rose-400 bg-rose-50/30' : 'border-stone-300 focus:border-amber-800 focus:ring-1 focus:ring-amber-800'
                      }`}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-stone-700 font-medium mb-1">
                      State <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tamil Nadu, Kerala, Karnataka"
                      value={shippingAddress.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      className={`w-full px-3 py-2.5 bg-white border rounded-lg text-stone-900 focus:outline-none transition-colors ${
                        addressErrors.state ? 'border-rose-400 ring-1 ring-rose-400 bg-rose-50/30' : 'border-stone-300 focus:border-amber-800 focus:ring-1 focus:ring-amber-800'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Online Payment via Razorpay ONLY */}
              <div className="bg-white p-5 sm:p-6 rounded-xl border border-stone-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-700" />
                    <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                      2. Payment Method
                    </h2>
                  </div>
                  <span className="bg-blue-50 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200">
                    Online Payment Only
                  </span>
                </div>

                {/* Razorpay Banner & Supported Methods */}
                <div className="p-4 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border border-blue-200 rounded-xl space-y-3.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 bg-blue-700 text-white font-bold text-xs rounded tracking-wider flex items-center gap-1.5 shadow-xs">
                        <CreditCard className="w-3.5 h-3.5" />
                        Razorpay
                      </span>
                      <div>
                        <span className="font-bold text-stone-900 text-xs block">Official Payment Gateway</span>
                        <span className="text-[10px] text-stone-500">256-Bit SSL Encrypted Settlement</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Zero Surcharge
                    </span>
                  </div>

                  {/* Payment Methods Pill Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px]">
                    <div className="p-2.5 bg-white rounded-lg border border-blue-100 shadow-2xs">
                      <span className="text-amber-800 font-bold block">UPI</span>
                      <span className="text-stone-500 text-[9px]">GPay, PhonePe, Paytm</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-blue-100 shadow-2xs">
                      <span className="text-blue-800 font-bold block">Cards</span>
                      <span className="text-stone-500 text-[9px]">Visa, Master, RuPay</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-blue-100 shadow-2xs">
                      <span className="text-emerald-800 font-bold block">Net Banking</span>
                      <span className="text-stone-500 text-[9px]">50+ Indian Banks</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-blue-100 shadow-2xs">
                      <span className="text-purple-800 font-bold block">Wallets</span>
                      <span className="text-stone-500 text-[9px]">Amazon, Mobikwik</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-blue-900 bg-white p-2.5 rounded-lg border border-blue-200">
                    <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                    <span>Instant payment confirmation with automated order tracking receipt</span>
                  </div>
                </div>

                {/* Optional Razorpay Key Configuration Accordion for Store Admin */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowKeyConfig(!showKeyConfig)}
                    className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-stone-400" />
                    <span>{showKeyConfig ? 'Hide Razorpay API Key Settings' : 'Configure / Update Razorpay Key ID (Store Admin)'}</span>
                  </button>

                  {showKeyConfig && (
                    <form onSubmit={handleSaveCustomKeys} className="mt-3 p-3.5 bg-stone-50 border border-stone-200 rounded-lg text-xs space-y-3">
                      <div>
                        <label className="block text-stone-700 font-medium mb-1">
                          Razorpay Key ID (rzp_live_... or rzp_test_...)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. rzp_live_xxxxxxxx or rzp_test_xxxxxxxx"
                          value={customKeyId}
                          onChange={(e) => setCustomKeyId(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded text-stone-900 font-mono text-xs focus:outline-none focus:border-blue-700"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-700 font-medium mb-1">
                          Razorpay Key Secret
                        </label>
                        <input
                          type="password"
                          placeholder="Razorpay Key Secret"
                          value={customKeySecret}
                          onChange={(e) => setCustomKeySecret(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded text-stone-900 font-mono text-xs focus:outline-none focus:border-blue-700"
                        />
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                          {savedKeySuccess ? 'Saved Successfully!' : 'Save Razorpay Credentials'}
                        </button>
                        <span className="text-[10px] text-stone-400">Stored securely in your store configuration</span>
                      </div>
                    </form>
                  )}
                </div>

              </div>

            </div>

            {/* Right Column (5 cols): Order Summary & Razorpay Primary Pay Button */}
            <div className="lg:col-span-5 space-y-5">
              
              <div className="bg-white p-5 sm:p-6 rounded-xl border border-stone-200 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <h3 className="font-serif font-bold text-lg text-stone-900">
                    Order Summary
                  </h3>
                  <span className="text-xs font-sans font-medium text-stone-500">
                    {cart.reduce((s, i) => s + i.quantity, 0)} {cart.reduce((s, i) => s + i.quantity, 0) === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Items list */}
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1 divide-y divide-stone-100">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-3 pt-3 first:pt-0 text-xs">
                      <img
                        src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80'}
                        alt={item.product.title}
                        referrerPolicy="no-referrer"
                        className="w-14 h-16 object-cover object-top rounded-md border border-stone-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-stone-900 truncate">{item.product.title}</p>
                        <p className="text-stone-500 text-[11px] mt-0.5">
                          {item.selectedColor} · {item.selectedSize} · Qty {item.quantity}
                        </p>
                        <p className="text-stone-900 font-bold tabular-nums mt-1">
                          ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Calculations */}
                <div className="border-t border-stone-200 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Items Subtotal</span>
                    <span className="tabular-nums font-medium">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-stone-500" />
                      <span>Doorstep Courier (Tamil Nadu &amp; India)</span>
                    </span>
                    <span className="tabular-nums font-semibold text-stone-900">
                      ₹{shippingFee}
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-900 font-bold text-base pt-3 border-t border-stone-200">
                    <span>Total Amount Payable</span>
                    <span className="tabular-nums text-amber-900 text-lg">
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Error Banner & Sandbox Helper */}
                {paymentError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold">{paymentError}</p>
                        <p className="text-[11px] text-rose-600 mt-1">
                          If testing or your Razorpay key is undergoing activation, you can complete this test order below:
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-rose-200/60 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleCompleteTestOrder}
                        className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-[11px] font-semibold cursor-pointer shadow-xs transition-colors"
                      >
                        Complete Sandbox Test Order
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowKeyConfig(true)}
                        className="px-3 py-1.5 bg-stone-700 hover:bg-stone-800 text-white rounded text-[11px] font-semibold cursor-pointer shadow-xs transition-colors"
                      >
                        Enter Active Razorpay Key
                      </button>
                    </div>
                  </div>
                )}

                {/* Single Primary Action Button: Razorpay Only */}
                <button
                  type="button"
                  onClick={handleRazorpayPayment}
                  disabled={isProcessingPayment}
                  className="w-full py-3.5 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessingPayment ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Pay ₹{grandTotal} via Razorpay</span>
                    </>
                  )}
                </button>

                {/* Trust assurances */}
                <div className="space-y-2 pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                  <div className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>Dispatched from Edayarpalayam Road via Speed Courier</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>7-Day Hassle-free Exchange for Size &amp; Fit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PackageCheck className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>100% Quality Checked Prior to Packing</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

    </div>
  );
};

export default CheckoutPage;
