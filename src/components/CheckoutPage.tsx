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
  Sparkles,
  ShoppingBag,
  QrCode,
  Copy,
  Check,
  Banknote,
  Smartphone
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Address } from '../types/store';
import { SHOP_INFO } from '../data/products';

interface CheckoutPageProps {
  onBackToShop?: () => void;
  onBack?: () => void;
}

type PaymentMethodType = 'upi' | 'razorpay' | 'cod';

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
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('upi');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [authWarning, setAuthWarning] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');

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
      if (errs.phone) return 'Please enter a valid 10-digit mobile number for courier tracking.';
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

  // Copy UPI ID
  const handleCopyUpi = () => {
    const upiId = storeBank.upiId || '9894088349@upi';
    navigator.clipboard?.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  // UPI deep link for mobile devices
  const upiPayUrl = `upi://pay?pa=${encodeURIComponent(storeBank.upiId || '9894088349@upi')}&pn=${encodeURIComponent('Shruthi Fashion')}&am=${grandTotal}&cu=INR&tn=${encodeURIComponent(`SF_Order_${Date.now()}`)}`;

  // Handle UPI Direct Payment Confirmation
  const handleConfirmUpiOrder = () => {
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
        paymentMethod: 'UPI',
        paymentDetails: {
          upiId: storeBank.upiId || '9894088349@upi',
          utrNumber: utrNumber.trim() || `UPI_APP_${Date.now()}`
        }
      });
      setIsCheckoutOpen(false);
    } catch (err: any) {
      setPaymentError(err?.message || 'Failed to record order. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Handle Cash on Delivery Confirmation
  const handleConfirmCodOrder = () => {
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
        paymentMethod: 'COD',
        paymentDetails: {
          bankName: 'Cash on Doorstep Delivery'
        }
      });
      setIsCheckoutOpen(false);
    } catch (err: any) {
      setPaymentError(err?.message || 'Failed to place COD order. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
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

  // Handle Online Gateway Checkout (Razorpay)
  const handleRazorpayCheckout = async () => {
    const validationErr = validateAddress();
    if (validationErr) {
      setPaymentError(validationErr);
      return;
    }

    ensureUserSession();
    setPaymentError(null);
    setAuthWarning(null);
    setIsProcessingPayment(true);

    try {
      const isLoaded = await ensureRazorpayLoaded();
      if (!isLoaded || !(window as any).Razorpay) {
        setIsProcessingPayment(false);
        setPaymentError('Payment gateway script failed to load. Please use Direct UPI or COD.');
        return;
      }

      // Backend Call - Create Order
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

        // If backend returned auth warning or fallback
        if (orderData?.authWarning) {
          setAuthWarning(orderData.authWarning);
        }
      } catch (backendErr: any) {
        console.warn('Backend order error, continuing with client fallback:', backendErr);
      }

      // If simulated fallback order
      if (orderData?.isSimulated || !orderData?.order_id) {
        // Complete as test order or offer UPI
        placeOrder({
          address: shippingAddress,
          paymentMethod: 'Razorpay',
          paymentDetails: {
            razorpayPaymentId: `pay_sim_${Date.now()}`,
            razorpayOrderId: orderData?.order_id || `order_sim_${Date.now()}`,
            razorpaySignature: 'simulated_test_signature'
          }
        });
        setIsCheckoutOpen(false);
        return;
      }

      // Live Razorpay popup
      const razorpayKey =
        orderData?.key_id ||
        storeBank.razorpayKeyId ||
        (import.meta as any).env?.VITE_RAZORPAY_KEY_ID ||
        'rzp_test_Tmzltbt8uaWUPE';

      const options: any = {
        key: razorpayKey,
        amount: orderData?.amount || amountInPaise,
        currency: orderData?.currency || 'INR',
        name: 'Shruthi Fashion',
        description: 'Ethnic & Festive Garments · Courier Delivery',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=128&q=80',
        order_id: orderData?.order_id,
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
            setPaymentError('Payment recorded but error updating order: ' + err?.message);
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
          color: '#854d0e'
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
          }
        }
      };

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.on('payment.failed', function (resp: any) {
        setIsProcessingPayment(false);
        const desc = resp.error?.description || 'Payment did not go through.';
        setPaymentError(`${desc} You can complete your purchase instantly with Direct UPI below.`);
        setSelectedMethod('upi');
      });

      rzpInstance.open();
    } catch (err: any) {
      setIsProcessingPayment(false);
      setPaymentError(err?.message || 'Could not initiate Razorpay. Please use Direct UPI or Cash on Delivery.');
      setSelectedMethod('upi');
    }
  };

  const handlePrimaryAction = () => {
    if (selectedMethod === 'upi') {
      handleConfirmUpiOrder();
    } else if (selectedMethod === 'cod') {
      handleConfirmCodOrder();
    } else {
      handleRazorpayCheckout();
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-[#FAF9F5] text-stone-900">
      
      {/* Top Checkout Header - Dedicated Full Page Navbar */}
      <header className="sticky top-0 z-30 bg-white/98 backdrop-blur-md border-b border-stone-200 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Back to store navigation */}
          <button
            type="button"
            onClick={handleBackToStore}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-700 hover:text-stone-950 transition-colors cursor-pointer py-1.5 px-3 rounded-lg hover:bg-stone-100 border border-stone-200/80"
          >
            <ArrowLeft className="w-4 h-4 text-stone-600" />
            <span>Back to Shop</span>
          </button>

          {/* Centered Brand Title */}
          <div className="flex flex-col items-center">
            <span className="font-serif text-xl sm:text-2xl font-black text-amber-900 tracking-tight">
              Shruthi Fashion
            </span>
            <span className="text-[10px] text-stone-500 uppercase tracking-widest hidden sm:block">
              Secure Checkout &amp; Delivery
            </span>
          </div>

          {/* Security & Support Badges */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <Lock className="w-3.5 h-3.5 text-emerald-700" />
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

      {/* Main Checkout Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Progress tracker */}
        <div className="mb-6 flex items-center justify-center gap-2 text-xs font-semibold text-stone-500">
          <span className="text-amber-800 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 1. Shipping Address
          </span>
          <span className="text-stone-300">──</span>
          <span className="text-amber-800 font-bold flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-amber-800 text-white flex items-center justify-center text-[10px]">2</span>
            Payment Selection
          </span>
          <span className="text-stone-300">──</span>
          <span className="text-stone-400">3. Instant Receipt</span>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center max-w-md mx-auto my-12 shadow-xs space-y-4">
            <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
            <h2 className="font-serif text-xl font-bold text-stone-900">Your bag is empty</h2>
            <p className="text-stone-500 text-xs">Add handloom kurtis or grand shawls from our store to continue.</p>
            <button
              onClick={handleBackToStore}
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              Explore Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* Left Column (7 cols): Address Form & Payment Method Selection */}
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
                    <span className="text-[10px] text-stone-400 mt-1 block">Used for delivery updates &amp; courier tracking</span>
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

              {/* Step 2: Payment Method Selection */}
              <div className="bg-white p-5 sm:p-6 rounded-xl border border-stone-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                      2. Choose Payment Option
                    </h2>
                  </div>
                  <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                    Zero Surcharge
                  </span>
                </div>

                {/* 3 Selectable Payment Method Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  
                  {/* Option 1: Direct UPI */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMethod('upi');
                      setPaymentError(null);
                    }}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      selectedMethod === 'upi'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/30 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-emerald-700 font-bold text-xs flex items-center gap-1.5">
                          <Smartphone className="w-4 h-4" />
                          Direct UPI
                        </span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                          Fastest
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 leading-tight">
                        GPay, PhonePe, Paytm, BHIM
                      </p>
                    </div>
                    <span className="text-[10px] text-emerald-800 font-semibold mt-2 block">
                      Direct to Shruthi Fashion
                    </span>
                  </button>

                  {/* Option 2: Cash on Delivery */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMethod('cod');
                      setPaymentError(null);
                    }}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      selectedMethod === 'cod'
                        ? 'border-amber-700 bg-amber-50/60 ring-2 ring-amber-700/30 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-amber-800 font-bold text-xs flex items-center gap-1.5">
                          <Banknote className="w-4 h-4" />
                          Cash on Delivery
                        </span>
                        <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                          COD
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 leading-tight">
                        Pay cash or UPI to courier upon delivery
                      </p>
                    </div>
                    <span className="text-[10px] text-amber-800 font-semibold mt-2 block">
                      Doorstep Courier
                    </span>
                  </button>

                  {/* Option 3: Online Gateway (Cards & Net Banking) */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMethod('razorpay');
                      setPaymentError(null);
                    }}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      selectedMethod === 'razorpay'
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/30 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-blue-700 font-bold text-xs flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4" />
                          Cards / Gateway
                        </span>
                        <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                          Online
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 leading-tight">
                        Credit/Debit Card, Net Banking
                      </p>
                    </div>
                    <span className="text-[10px] text-blue-800 font-semibold mt-2 block">
                      Razorpay Gateway
                    </span>
                  </button>

                </div>

                {/* Method Specific Details Box */}
                {selectedMethod === 'upi' && (
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3.5 text-xs text-stone-800">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-emerald-950 text-sm">Pay directly to Shruthi Fashion Bank UPI</p>
                        <p className="text-stone-600 text-[11px] mt-0.5">
                          Instant payment settlement to official Coimbatore store account with zero gateway fee.
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-white text-emerald-800 font-mono font-bold text-[11px] rounded border border-emerald-200 shrink-0">
                        ₹{grandTotal}
                      </span>
                    </div>

                    {/* Official UPI ID Box with Copy Button */}
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-emerald-300 shadow-2xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                          Official Store UPI ID
                        </span>
                        <span className="font-mono font-bold text-stone-900 text-sm select-all">
                          {storeBank.upiId || '9894088349@upi'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-md font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedUpi ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>

                    {/* Mobile 1-Tap UPI Launch Button */}
                    <div className="pt-1">
                      <a
                        href={upiPayUrl}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-xs transition-colors"
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>Tap to Open GPay / PhonePe / Paytm App (₹{grandTotal})</span>
                      </a>
                      <span className="text-[10px] text-stone-500 text-center block mt-1">
                        Opens your UPI app on mobile phone directly with amount filled in
                      </span>
                    </div>

                    {/* Optional UTR input */}
                    <div className="border-t border-emerald-200/80 pt-2.5">
                      <label className="block text-[11px] font-medium text-stone-700 mb-1">
                        UPI Transaction / UTR Number <span className="text-stone-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 429018449102 (from GPay / PhonePe history)"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 text-xs focus:outline-none focus:border-emerald-700"
                      />
                    </div>
                  </div>
                )}

                {selectedMethod === 'cod' && (
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs text-stone-800">
                    <p className="font-bold text-amber-950 text-sm">Cash on Doorstep Delivery (COD)</p>
                    <p className="text-stone-600 text-xs leading-relaxed">
                      You can pay <strong className="text-stone-900">₹{grandTotal}</strong> in cash or via UPI to the delivery executive when your parcel arrives at your address.
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-amber-900 bg-white p-2.5 rounded-lg border border-amber-200 mt-2">
                      <Truck className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Dispatched from Edayarpalayam Road, Coimbatore via Speed Courier</span>
                    </div>
                  </div>
                )}

                {selectedMethod === 'razorpay' && (
                  <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2 text-xs text-stone-800">
                    <p className="font-bold text-blue-950 text-sm">Online Card &amp; Net Banking Gateway</p>
                    <p className="text-stone-600 text-xs leading-relaxed">
                      Accepts Visa, MasterCard, RuPay, Maestro debit/credit cards and 50+ Indian net banking portals.
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-blue-900 bg-white p-2.5 rounded-lg border border-blue-200 mt-2">
                      <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                      <span>256-Bit SSL Encrypted Razorpay Checkout</span>
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* Right Column (5 cols): Order Summary & Primary Action Button */}
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

                {/* Notice / Error Banner */}
                {paymentError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold">{paymentError}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-rose-200/60">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMethod('upi');
                          setPaymentError(null);
                        }}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-semibold cursor-pointer shadow-xs transition-colors"
                      >
                        Switch to Direct UPI ({storeBank.upiId || '9894088349@upi'})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMethod('cod');
                          setPaymentError(null);
                        }}
                        className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded text-[11px] font-semibold cursor-pointer shadow-xs transition-colors"
                      >
                        Switch to Cash on Delivery
                      </button>
                    </div>
                  </div>
                )}

                {/* Primary CTA Button */}
                <button
                  type="button"
                  onClick={handlePrimaryAction}
                  disabled={isProcessingPayment}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedMethod === 'upi'
                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/20'
                      : selectedMethod === 'cod'
                      ? 'bg-amber-800 hover:bg-amber-900 text-white shadow-amber-800/20'
                      : 'bg-blue-700 hover:bg-blue-800 text-white shadow-blue-700/20'
                  }`}
                >
                  {isProcessingPayment ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : selectedMethod === 'upi' ? (
                    <>
                      <Smartphone className="w-4 h-4" />
                      <span>Confirm &amp; Place Order with UPI (₹{grandTotal})</span>
                    </>
                  ) : selectedMethod === 'cod' ? (
                    <>
                      <Truck className="w-4 h-4" />
                      <span>Confirm Cash on Delivery Order (₹{grandTotal})</span>
                    </>
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
