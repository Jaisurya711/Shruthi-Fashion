import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Image,
  Package,
  RotateCcw,
  Download,
  Building,
  QrCode,
  CheckCircle2,
  Save,
  HelpCircle,
  Layers,
  Check,
  Upload,
  Camera,
  Edit2,
  CreditCard,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, StoreBankDetails } from '../types/store';
import { FABRICS, OCCASIONS, HERO_IMAGE, STORE_BANK_DETAILS } from '../data/products';

export const StoreManagerModal: React.FC = () => {
  const {
    isStoreManagerOpen,
    setIsStoreManagerOpen,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    resetProductsToDefault,
    storeBank,
    updateStoreBank,
    categories,
    subcategories,
    addCategory,
    removeCategory,
    addSubcategory,
    removeSubcategory,
    resetCategoriesToDefault,
    heroConfig,
    updateHeroConfig
  } = useStore();

  const [activeTab, setActiveTab] = useState<'bank' | 'hero' | 'categories' | 'add' | 'list'>('bank');
  const [successToast, setSuccessToast] = useState('');
  const [ownerPin, setOwnerPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);

  // Bank & UPI Form states
  const [bankForm, setBankForm] = useState<StoreBankDetails>(() => storeBank);

  useEffect(() => {
    setBankForm(storeBank);
  }, [storeBank]);

  // Main Frame Banner Form states
  const [heroForm, setHeroForm] = useState({
    imageUrl: heroConfig.imageUrl || HERO_IMAGE,
    title: heroConfig.title || 'Shruthi Fashion',
    subtitle: heroConfig.subtitle || "Exclusive Kurtis · Western Outfits · Stretch Bottom Wear · Grand Shawls",
    badge: heroConfig.badge || 'New Arrivals · Daily & Festive Collections'
  });

  useEffect(() => {
    setHeroForm({
      imageUrl: heroConfig.imageUrl || HERO_IMAGE,
      title: heroConfig.title || 'Shruthi Fashion',
      subtitle: heroConfig.subtitle || "Exclusive Kurtis · Western Outfits · Stretch Bottom Wear · Grand Shawls",
      badge: heroConfig.badge || 'New Arrivals · Daily & Festive Collections'
    });
  }, [heroConfig]);

  // Curated boutique photo presets for hero
  const heroPresets = [
    {
      title: 'Coimbatore Silk & Festive Boutique',
      url: HERO_IMAGE
    },
    {
      title: 'Modern Indian Ethnic Studio',
      url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80'
    },
    {
      title: 'Handloom & Rich Pastel Kurtis',
      url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1600&q=80'
    },
    {
      title: 'South Indian Saree & Dupattas',
      url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1600&q=80'
    }
  ];

  // Category & Subcategory new inputs
  const [newCatInput, setNewCatInput] = useState('');
  const [newSubcatInput, setNewSubcatInput] = useState('');

  // Form states for new product
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Kurtis');
  const [subcategory, setSubcategory] = useState(subcategories[0] || 'Straight Cut Kurti');
  const [fabric, setFabric] = useState('100% Breathable Combed Cotton');
  const [occasion, setOccasion] = useState('Daily & Office Wear');
  const [imageUrl, setImageUrl] = useState('');
  const [colorName, setColorName] = useState('Navy Blue');
  const [colorHex, setColorHex] = useState('#1E3A8A');
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['M', 'L', 'XL', 'XXL']);
  const [stockCount, setStockCount] = useState('15');
  const [specialFeatures, setSpecialFeatures] = useState('');

  // Editing Product states (for updating existing products & photos from gallery)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editOriginalPrice, setEditOriginalPrice] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editSubcategory, setEditSubcategory] = useState('');
  const [editFabric, setEditFabric] = useState('');
  const [editStockCount, setEditStockCount] = useState('');
  const [editImage, setEditImage] = useState('');

  // File Input Refs for direct Device / Phone Gallery Upload
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const heroFileInputRef = useRef<HTMLInputElement>(null);

  const handleDeviceImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onLoaded: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WEBP, etc.) from your device gallery.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onLoaded(result);
        showToast('Photo uploaded successfully from device gallery! ✓');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleStartEdit = (p: Product) => {
    setEditingProduct(p);
    setEditTitle(p.title);
    setEditSubtitle(p.subtitle);
    setEditPrice(p.price.toString());
    setEditOriginalPrice(p.originalPrice.toString());
    setEditCategory(p.category);
    setEditSubcategory(p.subcategory);
    setEditFabric(p.fabric);
    setEditStockCount(p.stockCount.toString());
    setEditImage(p.images[0] || '');
  };

  const handleSaveProductEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const updated: Product = {
      ...editingProduct,
      title: editTitle.trim() || editingProduct.title,
      subtitle: editSubtitle.trim() || editingProduct.subtitle,
      price: Number(editPrice) || editingProduct.price,
      originalPrice: Number(editOriginalPrice) || editingProduct.originalPrice,
      category: editCategory || editingProduct.category,
      subcategory: editSubcategory || editingProduct.subcategory,
      fabric: editFabric || editingProduct.fabric,
      stockCount: Number(editStockCount) || editingProduct.stockCount,
      images: editImage ? [editImage, editImage] : editingProduct.images,
    };
    updateProduct(updated);
    setEditingProduct(null);
    showToast(`"${updated.title}" updated successfully with your gallery photo! ✓`);
  };

  if (!isStoreManagerOpen) return null;

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleSaveBankDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankForm.upiId.trim()) {
      alert('Please enter a valid UPI ID (e.g. 9894088349@upi).');
      return;
    }
    updateStoreBank(bankForm);
    showToast('Bank Account & UPI QR updated! Checkout QR now directs payments to your bank.');
  };

  const handleResetBankDetails = () => {
    if (window.confirm('Reset bank details to Shruthi Fashion default SBI account?')) {
      updateStoreBank(STORE_BANK_DETAILS);
      setBankForm(STORE_BANK_DETAILS);
      showToast('Reset to default bank details.');
    }
  };

  const handleSaveHeroConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroForm.imageUrl.trim()) return;
    updateHeroConfig(heroForm);
    showToast('Main frame banner updated! Check your homepage.');
  };

  const handleResetHeroConfig = () => {
    const defaultHero = {
      imageUrl: HERO_IMAGE,
      title: 'Shruthi Fashion',
      subtitle: 'Exclusive Kurtis · Western Outfits · Stretch Bottom Wear · Grand Shawls',
      badge: 'New Arrivals · Daily & Festive Collections'
    };
    updateHeroConfig(defaultHero);
    setHeroForm(defaultHero);
    showToast('Main frame image restored to default.');
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newCatInput.trim();
    if (!val) return;
    if (categories.includes(val)) {
      alert('This category already exists.');
      return;
    }
    addCategory(val);
    setNewCatInput('');
    showToast(`Added category: "${val}"`);
  };

  const handleAddSubcategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newSubcatInput.trim();
    if (!val) return;
    if (subcategories.includes(val)) {
      alert('This style already exists.');
      return;
    }
    addSubcategory(val);
    setNewSubcatInput('');
    showToast(`Added style: "${val}"`);
  };

  const handleSizeToggle = (sz: string) => {
    if (selectedSizes.includes(sz)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== sz));
    } else {
      setSelectedSizes([...selectedSizes, sz]);
    }
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) return;

    const finalImage = imageUrl.trim() || products[0]?.images[0] || '';

    const newProduct: Product = {
      id: `sf-custom-${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim() || `${subcategory} in ${fabric}`,
      price: Number(price),
      originalPrice: Number(originalPrice) || Math.round(Number(price) * 1.4),
      category: category || 'Kurtis',
      subcategory: subcategory || 'Straight Cut Kurti',
      fabric,
      occasion,
      colors: [{ name: colorName, hex: colorHex }],
      sizes: selectedSizes.length > 0 ? selectedSizes : ['Free Size'],
      inStock: true,
      stockCount: Number(stockCount) || 10,
      isBestSeller: false,
      isNew: true,
      expressCoimbatore: true,
      rating: 4.9,
      reviewCount: 1,
      images: [finalImage, finalImage],
      description: `New arrival at Shruthi Fashion Kovundampalayam! Premium quality ${subcategory} made with ${fabric}. Designed for comfort and lasting elegance.`,
      fabricDetails: `${fabric} with durable stitching and color fastness.`,
      careInstructions: 'Machine wash delicate or cold hand wash. Dry in shade.',
      specialFeatures: specialFeatures || (subcategory === 'Feeding Kurti' ? 'Dual Concealed Vertical Nursing Zippers' : 'Comfort Fit'),
      reviews: [
        {
          id: `rev-${Date.now()}`,
          userName: 'Shruthi Fashion Team',
          rating: 5,
          date: 'Just now',
          city: 'Kovundampalayam, Coimbatore',
          comment: 'New collection piece inspected and verified in store.',
          verifiedBuyer: true
        }
      ]
    };

    addProduct(newProduct);
    showToast(`"${newProduct.title}" added to your live store!`);

    setTitle('');
    setSubtitle('');
    setPrice('');
    setOriginalPrice('');
    setImageUrl('');
    setSpecialFeatures('');

    setTimeout(() => {
      setActiveTab('list');
    }, 1500);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'shruthi_fashion_catalog.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Preview UPI payment URI and test QR
  const previewCleanUpi = bankForm.upiId.trim() || '9894088349@upi';
  const previewPaymentUri = `upi://pay?pa=${previewCleanUpi}&pn=${encodeURIComponent(bankForm.accountHolderName.trim() || 'Shruthi Fashion')}&cu=INR&tn=${encodeURIComponent('Shruthi Fashion Test Order')}`;
  const previewQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(previewPaymentUri)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-[#FAF9F5] rounded-xl shadow-2xl border border-stone-300 overflow-hidden my-4 flex flex-col max-h-[94vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-serif font-bold text-lg text-white">Shruthi Fashion · Store Owner Portal</h3>
              <p className="text-xs text-stone-300">Razorpay & Bank UPI · Main Frame Banner · Categories · Catalog & Gallery Photos</p>
            </div>
          </div>
          <button
            onClick={() => setIsStoreManagerOpen(false)}
            className="p-1.5 text-stone-400 hover:text-white rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isUnlocked ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-2xl shadow-inner">
              🔒
            </div>
            <div>
              <h4 className="font-serif text-2xl font-bold text-stone-900">Store Owner Verification</h4>
              <p className="text-xs text-stone-500 mt-1.5 max-w-sm">
                This portal is private to Shruthi Fashion management. Enter your 4-digit security PIN to configure Razorpay, bank accounts, main banner, categories, and manage products.
              </p>
            </div>

            <div className="w-full max-w-xs space-y-3 pt-2">
              <input
                type="password"
                maxLength={6}
                placeholder="Enter PIN (e.g. 9894)"
                value={ownerPin}
                onChange={(e) => {
                  setOwnerPin(e.target.value);
                  setPinError(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (['9894', '641030', '1234', '2026', '0000'].includes(ownerPin)) {
                      setIsUnlocked(true);
                    } else {
                      setPinError(true);
                    }
                  }
                }}
                className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded text-center text-xl font-mono font-bold tracking-widest focus:outline-none focus:border-amber-800"
              />

              {pinError && (
                <p className="text-xs text-rose-600 font-semibold">Incorrect PIN code. Try default: 9894 or 1234.</p>
              )}

              <button
                type="button"
                onClick={() => {
                  if (['9894', '641030', '1234', '2026', '0000'].includes(ownerPin)) {
                    setIsUnlocked(true);
                  } else {
                    setPinError(true);
                  }
                }}
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded transition-colors cursor-pointer"
              >
                Unlock Management Portal
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 5-Tab Switcher */}
            <div className="grid grid-cols-2 sm:grid-cols-5 bg-stone-100 border-b border-stone-200 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('bank')}
                className={`py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'bank'
                    ? 'border-amber-800 text-amber-900 bg-white font-bold'
                    : 'border-transparent text-stone-600 hover:text-stone-900'
                }`}
              >
                <CreditCard className="w-4 h-4 text-blue-700" />
                <span>Razorpay & Bank UPI</span>
              </button>

              <button
                onClick={() => setActiveTab('hero')}
                className={`py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'hero'
                    ? 'border-amber-800 text-amber-900 bg-white font-bold'
                    : 'border-transparent text-stone-600 hover:text-stone-900'
                }`}
              >
                <Image className="w-4 h-4 text-amber-800" />
                <span>Main Frame Banner</span>
              </button>

              <button
                onClick={() => setActiveTab('categories')}
                className={`py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'categories'
                    ? 'border-amber-800 text-amber-900 bg-white font-bold'
                    : 'border-transparent text-stone-600 hover:text-stone-900'
                }`}
              >
                <Layers className="w-4 h-4 text-amber-800" />
                <span>Categories & Styles</span>
              </button>

              <button
                onClick={() => setActiveTab('add')}
                className={`py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'add'
                    ? 'border-amber-800 text-amber-900 bg-white font-bold'
                    : 'border-transparent text-stone-600 hover:text-stone-900'
                }`}
              >
                <Plus className="w-4 h-4 text-amber-800" />
                <span>Add Product</span>
              </button>

              <button
                onClick={() => setActiveTab('list')}
                className={`py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'list'
                    ? 'border-amber-800 text-amber-900 bg-white font-bold'
                    : 'border-transparent text-stone-600 hover:text-stone-900'
                }`}
              >
                <Package className="w-4 h-4 text-amber-800" />
                <span>Catalog & Products ({products.length})</span>
              </button>
            </div>

            {/* Toast Alert */}
            {successToast && (
              <div className="bg-emerald-800 text-white px-5 py-2.5 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span className="font-medium">{successToast}</span>
              </div>
            )}

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
              
              {/* TAB 1: Bank & UPI QR Linking */}
              {activeTab === 'bank' && (
                <div className="space-y-6">
                  {/* How it works info card */}
                  <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                      <HelpCircle className="w-4 h-4 text-amber-800" />
                      <span>How Bank Account Linking to UPI QR Works</span>
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed">
                      In the Indian banking and NPCI UPI system, you do not need to expose your raw bank account inside the QR code. Instead, 
                      your <strong>Bank Account is linked to your UPI ID (VPA)</strong> inside Google Pay, PhonePe, Paytm, or BHIM.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px] text-stone-800">
                      <div className="p-2.5 bg-white rounded border border-amber-200">
                        <strong className="block text-amber-950 mb-0.5">Step 1: Check Your UPI ID</strong>
                        Open Google Pay, PhonePe, or BHIM linked to your bank account. Go to Profile & find your UPI ID (e.g. <code>9894088349@upi</code> or <code>shruthifashion@oksbi</code>).
                      </div>
                      <div className="p-2.5 bg-white rounded border border-amber-200">
                        <strong className="block text-amber-950 mb-0.5">Step 2: Enter & Save Details</strong>
                        Paste your UPI ID and enter your Bank Account Number & IFSC code below. Click <strong>"Save & Update UPI QR"</strong>.
                      </div>
                      <div className="p-2.5 bg-white rounded border border-amber-200">
                        <strong className="block text-amber-950 mb-0.5">Step 3: Instant Bank Credit</strong>
                        When customers scan the QR at checkout, the payment lands <strong>100% directly and instantly into your linked bank account</strong> with zero commission!
                      </div>
                    </div>
                  </div>

                  {/* Form & Live QR Preview Side by Side */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Form: Razorpay, Bank & UPI Inputs */}
                    <form onSubmit={handleSaveBankDetails} className="lg:col-span-7 space-y-4 text-xs">

                      {/* Razorpay Website Account Section */}
                      <div className="space-y-3 bg-white p-4 sm:p-5 rounded-lg border-2 border-blue-200">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-blue-700" />
                            <span>1. Razorpay Official Website Account & Payment Page</span>
                          </h4>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">
                            Active Gateway
                          </span>
                        </div>

                        <p className="text-stone-600 text-xs leading-relaxed">
                          Enter your verified Razorpay website account payment page or link. When customers click <strong>"Pay via Razorpay"</strong> on checkout, payment will be settled directly to your Razorpay account!
                        </p>

                        <div>
                          <label className="block text-stone-700 font-semibold mb-1">
                            Razorpay Payment Page URL / Link
                          </label>
                          <input
                            type="url"
                            placeholder="e.g. https://pages.razorpay.com/pl_... or https://rzp.io/l/... or your custom page"
                            value={bankForm.razorpayPaymentPageUrl || ''}
                            onChange={(e) => setBankForm({ ...bankForm, razorpayPaymentPageUrl: e.target.value.trim() })}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded font-mono text-xs text-stone-900 focus:outline-none focus:border-blue-700"
                          />
                          <p className="text-[11px] text-stone-500 mt-1">
                            Customers will open this official Razorpay page to pay securely via UPI, Cards, Net Banking & Wallets.
                          </p>
                        </div>

                        <div>
                          <label className="block text-stone-700 font-semibold mb-1">
                            Razorpay Key ID (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="rzp_live_... or rzp_test_..."
                            value={bankForm.razorpayKeyId || ''}
                            onChange={(e) => setBankForm({ ...bankForm, razorpayKeyId: e.target.value.trim() })}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded font-mono text-xs text-stone-900 focus:outline-none focus:border-blue-700"
                          />
                        </div>
                      </div>

                      <div className="space-y-3 bg-white p-4 sm:p-5 rounded-lg border border-stone-200">
                        <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-amber-800" />
                          <span>2. UPI QR Configuration</span>
                        </h4>

                        <div>
                          <label className="block text-stone-700 font-semibold mb-1">
                            Store UPI ID (Virtual Payment Address / VPA) *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 9894088349@upi, shruthifashion@oksbi, yourname@okaxis"
                            value={bankForm.upiId}
                            onChange={(e) => setBankForm({ ...bankForm, upiId: e.target.value.trim() })}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded font-mono text-xs text-stone-900 focus:outline-none focus:border-amber-800"
                          />
                          <p className="text-[11px] text-stone-500 mt-1">
                            This UPI ID generates the scannable QR code on your website checkout.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-stone-700 font-semibold mb-1">
                              Google Pay Number
                            </label>
                            <input
                              type="text"
                              placeholder="9894088349"
                              value={bankForm.gpayNumber}
                              onChange={(e) => setBankForm({ ...bankForm, gpayNumber: e.target.value.trim() })}
                              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded font-mono text-xs text-stone-900 focus:outline-none focus:border-amber-800"
                            />
                          </div>

                          <div>
                            <label className="block text-stone-700 font-semibold mb-1">
                              PhonePe Number
                            </label>
                            <input
                              type="text"
                              placeholder="9894088349"
                              value={bankForm.phonePeNumber}
                              onChange={(e) => setBankForm({ ...bankForm, phonePeNumber: e.target.value.trim() })}
                              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded font-mono text-xs text-stone-900 focus:outline-none focus:border-amber-800"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Bank Account Direct Transfer Info */}
                      <div className="space-y-3 bg-white p-4 sm:p-5 rounded-lg border border-stone-200">
                        <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                          <Building className="w-4 h-4 text-amber-800" />
                          <span>2. Bank Account Details (for Direct Transfer / IMPS / NEFT)</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block text-stone-700 font-semibold mb-1">
                              Account Holder Name *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Shruthi Fashion"
                              value={bankForm.accountHolderName}
                              onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-xs text-stone-900 focus:outline-none focus:border-amber-800"
                            />
                          </div>

                          <div>
                            <label className="block text-stone-700 font-semibold mb-1">
                              Bank Name *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="State Bank of India"
                              value={bankForm.bankName}
                              onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-xs text-stone-900 focus:outline-none focus:border-amber-800"
                            />
                          </div>

                          <div>
                            <label className="block text-stone-700 font-semibold mb-1">
                              Account Type
                            </label>
                            <select
                              value={bankForm.accountType}
                              onChange={(e) => setBankForm({ ...bankForm, accountType: e.target.value })}
                              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-xs text-stone-900 focus:outline-none focus:border-amber-800"
                            >
                              <option value="Current Account">Current Account</option>
                              <option value="Savings Account">Savings Account</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-stone-700 font-semibold mb-1">
                              Bank Account Number *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="41982736452"
                              value={bankForm.accountNumber}
                              onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value.trim() })}
                              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded font-mono text-xs text-stone-900 focus:outline-none focus:border-amber-800"
                            />
                          </div>

                          <div>
                            <label className="block text-stone-700 font-semibold mb-1">
                              IFSC Code *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="SBIN0012784"
                              value={bankForm.ifscCode}
                              onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.trim().toUpperCase() })}
                              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded font-mono text-xs text-stone-900 focus:outline-none focus:border-amber-800 uppercase"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-stone-700 font-semibold mb-1">
                              Branch Location
                            </label>
                            <input
                              type="text"
                              placeholder="Kovundampalayam Branch, Coimbatore - 641030"
                              value={bankForm.branch}
                              onChange={(e) => setBankForm({ ...bankForm, branch: e.target.value })}
                              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-xs text-stone-900 focus:outline-none focus:border-amber-800"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save & Update UPI QR</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleResetBankDetails}
                          className="px-4 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 font-medium rounded cursor-pointer transition-colors"
                        >
                          Reset Defaults
                        </button>
                      </div>
                    </form>

                    {/* Right Column: Live Dynamic UPI QR Tester */}
                    <div className="lg:col-span-5 bg-white p-5 rounded-lg border border-stone-200 shadow-xs space-y-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Live Test UPI QR Code</span>
                      </div>

                      <div>
                        <h4 className="font-serif text-lg font-bold text-stone-900">
                          Scan to Test Bank Connection
                        </h4>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          Open Google Pay, PhonePe, or BHIM on your phone and scan this code to confirm your bank account name appears.
                        </p>
                      </div>

                      {/* Scannable Dynamic QR Box */}
                      <div className="inline-block p-3 bg-white border-2 border-stone-300 rounded-xl shadow-xs">
                        <img
                          src={previewQrUrl}
                          alt="Test UPI QR Code"
                          className="w-44 h-44 object-contain mx-auto"
                        />
                        <div className="mt-2 text-[11px] font-mono text-stone-600 font-bold bg-stone-100 py-1 px-2 rounded truncate max-w-[200px] mx-auto">
                          {previewCleanUpi}
                        </div>
                      </div>

                      {/* Verification badge */}
                      <div className="p-3 bg-stone-50 border border-stone-200 rounded text-left space-y-1.5 text-xs text-stone-700">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-stone-500">Payee Name:</span>
                          <strong className="text-stone-900">{bankForm.accountHolderName || 'Shruthi Fashion'}</strong>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-stone-500">Linked UPI ID:</span>
                          <strong className="font-mono text-stone-900">{previewCleanUpi}</strong>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-stone-500">Bank:</span>
                          <strong className="text-stone-900">{bankForm.bankName}</strong>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-stone-500">Account No:</span>
                          <strong className="font-mono text-stone-900">{bankForm.accountNumber}</strong>
                        </div>
                      </div>

                      <p className="text-[11px] text-emerald-700 font-medium">
                        ✓ Any changes saved above immediately reflect on customer checkout.
                      </p>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 2: Main Frame Picture Banner Customizer */}
              {activeTab === 'hero' && (
                <div className="space-y-6">
                  <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-lg text-xs space-y-1.5">
                    <h4 className="font-bold text-amber-950 flex items-center gap-1.5">
                      <Image className="w-4 h-4 text-amber-800" />
                      <span>Main Frame Banner Customizer (Top Picture of Website)</span>
                    </h4>
                    <p className="text-stone-700">
                      As requested, you can now fully customize the main picture and text shown at the very top of the Shruthi Fashion website. Update the image URL, title, subtitle, or select from curated boutique presets below!
                    </p>
                  </div>

                  {/* Current Live Preview */}
                  <div>
                    <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                      Live Banner Preview (Top of Website)
                    </label>
                    <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden shadow-md border border-stone-300 bg-stone-200">
                      <img
                        src={heroForm.imageUrl}
                        alt="Shruthi Fashion Main Frame"
                        className="w-full h-full object-cover object-center"
                        onError={() => alert('Image URL could not be loaded. Please check the link.')}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 flex flex-col justify-end p-5 sm:p-7 text-white">
                        <span className="text-xs font-semibold tracking-widest text-amber-300 uppercase">
                          {heroForm.badge}
                        </span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black">
                          {heroForm.title}
                        </h2>
                        <p className="text-xs sm:text-sm text-stone-200">
                          {heroForm.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Form to update Banner Details */}
                  <form onSubmit={handleSaveHeroConfig} className="space-y-4 bg-white p-4 sm:p-5 rounded-lg border border-stone-200 text-xs">
                    
                    {/* Device Upload for Main Banner */}
                    <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-stone-900 block text-xs">Upload Banner Picture from Device / Gallery</span>
                        <span className="text-[11px] text-stone-500">Pick any boutique photo from your phone or device to set as top banner</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        ref={heroFileInputRef}
                        className="hidden"
                        onChange={(e) => handleDeviceImageUpload(e, (dataUrl) => setHeroForm({ ...heroForm, imageUrl: dataUrl }))}
                      />
                      <button
                        type="button"
                        onClick={() => heroFileInputRef.current?.click()}
                        className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded font-semibold text-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0"
                      >
                        <Upload className="w-3.5 h-3.5 text-amber-300" />
                        <span>Choose Photo from Device</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">
                        Or Enter Main Banner Image URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/... or your boutique image link"
                        value={heroForm.imageUrl}
                        onChange={(e) => setHeroForm({ ...heroForm, imageUrl: e.target.value.trim() })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-amber-800"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-stone-700 font-semibold mb-1">
                          Banner Heading Title
                        </label>
                        <input
                          type="text"
                          value={heroForm.title}
                          onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-amber-800 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-stone-700 font-semibold mb-1">
                          Top Tagline / Badge
                        </label>
                        <input
                          type="text"
                          value={heroForm.badge}
                          onChange={(e) => setHeroForm({ ...heroForm, badge: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-amber-800"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-stone-700 font-semibold mb-1">
                          Subtitle Description
                        </label>
                        <input
                          type="text"
                          value={heroForm.subtitle}
                          onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-amber-800"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save & Apply Main Frame Banner</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResetHeroConfig}
                        className="px-4 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 font-medium rounded cursor-pointer transition-colors"
                      >
                        Reset to Default
                      </button>
                    </div>
                  </form>

                  {/* Curated Presets */}
                  <div>
                    <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                      Or Pick From Curated High-Definition Boutique Photography
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {heroPresets.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setHeroForm({ ...heroForm, imageUrl: preset.url })}
                          className={`relative aspect-[16/9] rounded-lg overflow-hidden border-2 text-left transition-all group cursor-pointer ${
                            heroForm.imageUrl === preset.url ? 'border-amber-800 ring-2 ring-amber-800' : 'border-stone-300 hover:border-stone-400'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/50 p-2 flex items-end">
                            <span className="text-[10px] text-white font-semibold leading-tight line-clamp-2">
                              {preset.title}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Category & Style Customizer (Owner can customize their category add or remove) */}
              {activeTab === 'categories' && (
                <div className="space-y-6">
                  <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-lg text-xs space-y-1.5">
                    <h4 className="font-bold text-amber-950 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-amber-800" />
                      <span>Category & Style Management</span>
                    </h4>
                    <p className="text-stone-700">
                      Customize which categories and styles appear across your entire storefront (Navbar, Filter strip, and Product entry forms). You can add new collections (e.g., Nightwear, Maternity, Lehengas) or remove ones you don't carry.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Main Categories Panel */}
                    <div className="bg-white p-5 rounded-lg border border-stone-200 space-y-4 text-xs">
                      <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
                        <h4 className="font-bold text-stone-900 text-sm">
                          1. Main Categories ({categories.length})
                        </h4>
                        <span className="text-stone-400 text-[11px]">Shown on top nav & filter bar</span>
                      </div>

                      {/* Add new category form */}
                      <form onSubmit={handleAddCategorySubmit} className="flex gap-2">
                        <input
                          type="text"
                          required
                          placeholder="e.g. Nightwear & Loungewear"
                          value={newCatInput}
                          onChange={(e) => setNewCatInput(e.target.value)}
                          className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-amber-800 text-xs"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white font-semibold rounded cursor-pointer transition-colors shrink-0"
                        >
                          + Add
                        </button>
                      </form>

                      {/* Category List */}
                      <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                        {categories.map((cat) => (
                          <div
                            key={cat}
                            className="flex items-center justify-between p-2.5 bg-stone-50 rounded border border-stone-200"
                          >
                            <span className="font-semibold text-stone-900">{cat}</span>
                            <button
                              type="button"
                              onClick={() => {
                                if (categories.length <= 1) {
                                  alert('You must have at least one active category.');
                                  return;
                                }
                                if (window.confirm(`Remove category "${cat}"?`)) {
                                  removeCategory(cat);
                                  showToast(`Removed category "${cat}"`);
                                }
                              }}
                              className="p-1 text-stone-400 hover:text-rose-600 rounded cursor-pointer"
                              title="Delete category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Subcategories / Styles Panel */}
                    <div className="bg-white p-5 rounded-lg border border-stone-200 space-y-4 text-xs">
                      <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
                        <h4 className="font-bold text-stone-900 text-sm">
                          2. Styles & Subcategories ({subcategories.length})
                        </h4>
                        <span className="text-stone-400 text-[11px]">Shown on style filter strip</span>
                      </div>

                      {/* Add new subcategory form */}
                      <form onSubmit={handleAddSubcategorySubmit} className="flex gap-2">
                        <input
                          type="text"
                          required
                          placeholder="e.g. Anarkali Flared Kurti"
                          value={newSubcatInput}
                          onChange={(e) => setNewSubcatInput(e.target.value)}
                          className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-amber-800 text-xs"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white font-semibold rounded cursor-pointer transition-colors shrink-0"
                        >
                          + Add
                        </button>
                      </form>

                      {/* Subcategory List */}
                      <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                        {subcategories.map((subcat) => (
                          <div
                            key={subcat}
                            className="flex items-center justify-between p-2.5 bg-stone-50 rounded border border-stone-200"
                          >
                            <span className="font-medium text-stone-900">{subcat}</span>
                            <button
                              type="button"
                              onClick={() => {
                                if (subcategories.length <= 1) {
                                  alert('You must have at least one active style.');
                                  return;
                                }
                                if (window.confirm(`Remove style "${subcat}"?`)) {
                                  removeSubcategory(subcat);
                                  showToast(`Removed style "${subcat}"`);
                                }
                              }}
                              className="p-1 text-stone-400 hover:text-rose-600 rounded cursor-pointer"
                              title="Delete style"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Reset all categories and styles to Shruthi Fashion original defaults?')) {
                          resetCategoriesToDefault();
                          showToast('Categories restored to defaults.');
                        }
                      }}
                      className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-medium text-xs rounded cursor-pointer transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset to Original Store Categories</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: Add New Product Form */}
              {activeTab === 'add' && (
                <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Title */}
                    <div className="sm:col-span-2">
                      <label className="block text-stone-700 font-bold mb-1">
                        Product Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Pure Cotton Feeding Kurti with Dual Invisible Zippers"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-amber-800 font-medium"
                      />
                    </div>

                    {/* Category (from dynamic categories) */}
                    <div>
                      <label className="block text-stone-700 font-bold mb-1">
                        Main Category *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-amber-800"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Subcategory (from dynamic subcategories) */}
                    <div>
                      <label className="block text-stone-700 font-bold mb-1">
                        Style / Subcategory *
                      </label>
                      <select
                        value={subcategory}
                        onChange={(e) => setSubcategory(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-amber-800"
                      >
                        {subcategories.map((sc) => (
                          <option key={sc} value={sc}>{sc}</option>
                        ))}
                      </select>
                    </div>

                    {/* Selling Price */}
                    <div>
                      <label className="block text-stone-700 font-bold mb-1">
                        Offer Price (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="549"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-amber-800 font-bold"
                      />
                    </div>

                    {/* Original Price */}
                    <div>
                      <label className="block text-stone-700 font-bold mb-1">
                        Original Price / MRP (₹)
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="899"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-amber-800"
                      />
                    </div>

                    {/* Fabric */}
                    <div>
                      <label className="block text-stone-700 font-bold mb-1">
                        Fabric Material *
                      </label>
                      <select
                        value={fabric}
                        onChange={(e) => setFabric(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-amber-800"
                      >
                        {FABRICS.filter((f) => f !== 'All Fabrics').map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>

                    {/* Occasion */}
                    <div>
                      <label className="block text-stone-700 font-bold mb-1">
                        Occasion *
                      </label>
                      <select
                        value={occasion}
                        onChange={(e) => setOccasion(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-amber-800"
                      >
                        {OCCASIONS.filter((o) => o !== 'All Occasions').map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>

                    {/* Product Photo Upload from Device / Gallery (User request: upload photos from device option enable) */}
                    <div className="sm:col-span-2 space-y-2">
                      <label className="block text-stone-700 font-bold mb-1">
                        Product Photo * (Upload from Device / Gallery)
                      </label>

                      <input
                        type="file"
                        accept="image/*"
                        ref={addFileInputRef}
                        className="hidden"
                        onChange={(e) => handleDeviceImageUpload(e, (dataUrl) => setImageUrl(dataUrl))}
                      />

                      {imageUrl ? (
                        <div className="flex items-center gap-4 p-3 bg-stone-50 border-2 border-dashed border-amber-300 rounded-lg">
                          <img
                            src={imageUrl}
                            alt="Uploaded preview"
                            className="w-20 h-24 object-cover rounded border border-stone-300 shadow-xs shrink-0"
                          />
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Photo ready from device gallery</span>
                            </span>
                            <div className="flex items-center gap-2 pt-1 flex-wrap">
                              <button
                                type="button"
                                onClick={() => addFileInputRef.current?.click()}
                                className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                <span>Change Photo from Gallery</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setImageUrl('')}
                                className="px-3 py-1.5 bg-stone-200 hover:bg-rose-100 hover:text-rose-700 text-stone-700 rounded text-xs font-semibold cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => addFileInputRef.current?.click()}
                          className="p-6 border-2 border-dashed border-stone-300 hover:border-amber-800 bg-stone-50 hover:bg-amber-50/50 rounded-lg text-center cursor-pointer transition-colors"
                        >
                          <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
                            <Upload className="w-6 h-6" />
                          </div>
                          <p className="font-bold text-stone-900 text-xs">
                            Tap to Choose Photo from Device Gallery
                          </p>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            Upload directly from your phone gallery or computer files
                          </p>
                        </div>
                      )}

                      {/* Optional fallback link */}
                      <div className="pt-1">
                        <input
                          type="url"
                          placeholder="Or paste an image link (Optional if not uploading from gallery)"
                          value={imageUrl.startsWith('data:') ? '' : imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded text-[11px] text-stone-700 focus:outline-none focus:border-amber-800"
                        />
                      </div>
                    </div>

                    {/* Special Feature */}
                    <div className="sm:col-span-2">
                      <label className="block text-stone-700 font-bold mb-1">
                        Special Feature Badge (e.g. Dual Invisible Nursing Zips, 4-Way Lycra Stretch)
                      </label>
                      <input
                        type="text"
                        placeholder="Dual Invisible Nursing Zips / Comfort Fit / Pure Cotton"
                        value={specialFeatures}
                        onChange={(e) => setSpecialFeatures(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-amber-800"
                      />
                    </div>

                    {/* Color name and hex */}
                    <div>
                      <label className="block text-stone-700 font-bold mb-1">
                        Primary Shade Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Royal Maroon"
                        value={colorName}
                        onChange={(e) => setColorName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-amber-800"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-700 font-bold mb-1">
                        Color Hex Code
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={colorHex}
                          onChange={(e) => setColorHex(e.target.value)}
                          className="w-10 h-8 rounded border border-stone-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={colorHex}
                          onChange={(e) => setColorHex(e.target.value)}
                          className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded text-stone-900 font-mono"
                        />
                      </div>
                    </div>

                    {/* Stock Pieces */}
                    <div>
                      <label className="block text-stone-700 font-bold mb-1">
                        Available Stock Count (Private to Owner)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={stockCount}
                        onChange={(e) => setStockCount(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-amber-800"
                      />
                    </div>

                    {/* Sizes Selection */}
                    <div className="sm:col-span-2">
                      <label className="block text-stone-700 font-bold mb-1.5">
                        Available Sizes in Store
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size', '28', '30', '32', '34'].map((sz) => {
                          const isSelected = selectedSizes.includes(sz);
                          return (
                            <button
                              type="button"
                              key={sz}
                              onClick={() => handleSizeToggle(sz)}
                              className={`px-3 py-1.5 rounded border text-xs font-semibold cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-amber-900 text-white border-amber-900'
                                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                              }`}
                            >
                              {sz} {isSelected && '✓'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Publish New Arrival</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 5: Manage Catalog & Update Products (Device Photo Upload & Edits) */}
              {activeTab === 'list' && (
                <div className="space-y-4 text-xs">
                  
                  {/* Active Product Edit Form */}
                  {editingProduct ? (
                    <div className="p-4 sm:p-5 bg-white border-2 border-amber-800 rounded-lg shadow-sm space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingProduct(null)}
                            className="p-1 text-stone-500 hover:text-stone-900 rounded cursor-pointer"
                          >
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                          <div>
                            <h4 className="font-serif text-sm font-bold text-stone-900">
                              Update Product & Photo from Gallery
                            </h4>
                            <p className="text-[11px] text-stone-500">
                              Editing: <strong>{editingProduct.title}</strong>
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setEditingProduct(null)}
                          className="px-2.5 py-1 text-stone-600 hover:bg-stone-100 rounded text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      <form onSubmit={handleSaveProductEdit} className="space-y-4">
                        
                        {/* Device Photo Upload for Product Update */}
                        <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg space-y-2">
                          <label className="block text-stone-800 font-bold text-xs">
                            Product Photo (Upload / Replace from Device Gallery)
                          </label>

                          <input
                            type="file"
                            accept="image/*"
                            ref={editFileInputRef}
                            className="hidden"
                            onChange={(e) => handleDeviceImageUpload(e, (dataUrl) => setEditImage(dataUrl))}
                          />

                          <div className="flex items-center gap-4">
                            <img
                              src={editImage || editingProduct.images[0]}
                              alt={editTitle}
                              className="w-16 h-20 object-cover rounded border border-stone-300 shadow-xs shrink-0"
                            />
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <p className="text-[11px] text-stone-600">
                                Replace this item's picture with a photo directly from your device gallery.
                              </p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => editFileInputRef.current?.click()}
                                  className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Camera className="w-3.5 h-3.5 text-amber-300" />
                                  <span>Choose Photo from Device Gallery</span>
                                </button>
                                {editImage && editImage !== editingProduct.images[0] && (
                                  <button
                                    type="button"
                                    onClick={() => setEditImage(editingProduct.images[0])}
                                    className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-xs cursor-pointer"
                                  >
                                    Reset Photo
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Product Fields Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block text-stone-700 font-semibold mb-1">Product Title *</label>
                            <input
                              type="text"
                              required
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-amber-800"
                            />
                          </div>

                          <div>
                            <label className="block text-stone-700 font-semibold mb-1">Selling Price (₹) *</label>
                            <input
                              type="number"
                              required
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 font-bold focus:outline-none focus:border-amber-800"
                            />
                          </div>

                          <div>
                            <label className="block text-stone-700 font-semibold mb-1">Original Price / MRP (₹)</label>
                            <input
                              type="number"
                              value={editOriginalPrice}
                              onChange={(e) => setEditOriginalPrice(e.target.value)}
                              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-amber-800"
                            />
                          </div>

                          <div>
                            <label className="block text-stone-700 font-semibold mb-1">Category</label>
                            <select
                              value={editCategory}
                              onChange={(e) => setEditCategory(e.target.value)}
                              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-amber-800"
                            >
                              {categories.map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-stone-700 font-semibold mb-1">Style / Subcategory</label>
                            <select
                              value={editSubcategory}
                              onChange={(e) => setEditSubcategory(e.target.value)}
                              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-amber-800"
                            >
                              {subcategories.map((sc) => (
                                <option key={sc} value={sc}>{sc}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-stone-700 font-semibold mb-1">Fabric</label>
                            <input
                              type="text"
                              value={editFabric}
                              onChange={(e) => setEditFabric(e.target.value)}
                              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-amber-800"
                            />
                          </div>

                          <div>
                            <label className="block text-stone-700 font-semibold mb-1">Available Stock Count</label>
                            <input
                              type="number"
                              min="0"
                              value={editStockCount}
                              onChange={(e) => setEditStockCount(e.target.value)}
                              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-amber-800"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-stone-700 font-semibold mb-1">Subtitle / Details</label>
                            <input
                              type="text"
                              value={editSubtitle}
                              onChange={(e) => setEditSubtitle(e.target.value)}
                              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 focus:outline-none focus:border-amber-800"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                          <button
                            type="submit"
                            className="px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Save className="w-4 h-4" />
                            <span>Save Product & Photo Changes</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingProduct(null)}
                            className="px-4 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded font-medium cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : null}

                  {/* Top Bar for Catalog */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-100 p-3 rounded border border-stone-200">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-stone-800">Total Live Catalog:</span>
                      <span className="px-2 py-0.5 bg-amber-900 text-white font-bold rounded-full">
                        {products.length} Items
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExportJSON}
                        className="px-3 py-1.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 rounded flex items-center gap-1.5 font-medium cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-800" />
                        <span>Export Catalog JSON</span>
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm('Reset catalog back to Shruthi Fashion Kovundampalayam default collection items?')) {
                            resetProductsToDefault();
                            showToast('Catalog reset to default.');
                          }
                        }}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded flex items-center gap-1.5 font-medium cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Defaults</span>
                      </button>
                    </div>
                  </div>

                  {/* List of products with Edit & Delete Actions */}
                  <div className="divide-y divide-stone-200 border border-stone-200 rounded-md bg-white overflow-hidden max-h-[50vh] overflow-y-auto">
                    {products.map((p) => (
                      <div key={p.id} className="p-3 sm:p-4 flex items-center justify-between gap-4 hover:bg-stone-50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            className="w-12 h-14 object-cover rounded border border-stone-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                                {p.subcategory || p.category}
                              </span>
                              {p.specialFeatures && (
                                <span className="text-[9px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded">
                                  {p.specialFeatures}
                                </span>
                              )}
                            </div>
                            <h5 className="font-semibold text-stone-900 truncate text-xs">{p.title}</h5>
                            <div className="text-[11px] text-stone-500 truncate">
                              Sizes: {p.sizes.join(', ')} · Stock: {p.stockCount} pcs
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <div className="text-right mr-2 hidden sm:block">
                            <p className="font-bold text-stone-900 text-sm tabular-nums">₹{p.price.toLocaleString('en-IN')}</p>
                            <p className="text-[11px] text-stone-400 line-through tabular-nums">₹{p.originalPrice.toLocaleString('en-IN')}</p>
                          </div>

                          {/* Edit Product & Update Photo from Gallery */}
                          <button
                            type="button"
                            onClick={() => handleStartEdit(p)}
                            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                            title="Edit product details & photo from gallery"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-amber-800" />
                            <span>Edit & Photo</span>
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`Delete product "${p.title}"?`)) {
                                deleteProduct(p.id);
                                showToast(`Deleted product: ${p.title}`);
                              }
                            }}
                            title="Remove product"
                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
              <span>All changes to Razorpay, bank, banner, categories, and products are saved immediately.</span>
              <button
                onClick={() => {
                  setIsStoreManagerOpen(false);
                  setIsUnlocked(false);
                  setOwnerPin('');
                }}
                className="px-4 py-1.5 bg-stone-900 text-white rounded font-medium cursor-pointer"
              >
                Lock & Close
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
