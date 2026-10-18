import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Image,
  Package,
  RotateCcw,
  Download,
  CheckCircle2,
  Save,
  Layers,
  Upload,
  Camera,
  Edit2,
  ArrowLeft,
  Truck,
  Printer,
  FileText,
  Tag,
  MessageCircle,
  Search,
  ExternalLink,
  Phone,
  MapPin,
  Clock,
  Filter,
  Check
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, UserOrder } from '../types/store';
import { FABRICS, OCCASIONS, HERO_IMAGE } from '../data/products';
import { OrderPrintModal } from './OrderPrintModal';
import { getCustomerWhatsAppOrderUrl } from '../services/notificationService';

export const StoreManagerModal: React.FC = () => {
  const {
    isStoreManagerOpen,
    setIsStoreManagerOpen,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    resetProductsToDefault,
    categories,
    subcategories,
    addCategory,
    removeCategory,
    addSubcategory,
    removeSubcategory,
    resetCategoriesToDefault,
    heroConfig,
    updateHeroConfig,
    allOrders,
    updateOrderStatus,
    deleteOrder
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'hero' | 'categories' | 'add' | 'list'>('orders');
  const [successToast, setSuccessToast] = useState('');
  const [ownerPin, setOwnerPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);

  // Order Management States
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [printModalOrder, setPrintModalOrder] = useState<{ order: UserOrder; view: 'invoice' | 'courier_label' } | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editCourierPartner, setEditCourierPartner] = useState('');
  const [editTrackingNo, setEditTrackingNo] = useState('');
  const [editStatus, setEditStatus] = useState<UserOrder['deliveryStatus']>('Order Placed');

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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-[#FAF9F5] rounded-xl shadow-2xl border border-stone-300 overflow-hidden my-4 flex flex-col max-h-[94vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-serif font-bold text-lg text-white">Shruthi Fashion · Store Owner Portal</h3>
              <p className="text-xs text-stone-300">Main Frame Banner · Categories & Styles · Catalog & Product Management</p>
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
                This portal is private to Shruthi Fashion management. Enter your security passcode to proceed.
              </p>
            </div>

            <div className="w-full max-w-xs space-y-3 pt-2">
              <input
                type="password"
                maxLength={6}
                placeholder="****"
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
                <p className="text-xs text-rose-600 font-semibold">Incorrect passcode. Please try again.</p>
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
            {/* Tab Switcher */}
            <div className="grid grid-cols-2 sm:grid-cols-5 bg-stone-100 border-b border-stone-200 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'orders'
                    ? 'border-amber-800 text-amber-900 bg-white font-bold'
                    : 'border-transparent text-stone-600 hover:text-stone-900'
                }`}
              >
                <Truck className="w-4 h-4 text-amber-800" />
                <span className="flex items-center gap-1">
                  <span>Orders &amp; Dispatch</span>
                  <span className="px-1.5 py-0.2 bg-amber-800 text-white text-[10px] rounded-full font-mono">
                    {allOrders.length}
                  </span>
                </span>
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
                <span>Categories &amp; Styles</span>
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
                <span>Catalog ({products.length})</span>
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
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

              {/* TAB 0: ORDER MANAGEMENT & COURIER DISPATCH */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  {/* Top Intro & Statistics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3.5 bg-white border border-stone-200 rounded-lg shadow-2xs">
                      <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                        Total Placed Orders
                      </p>
                      <p className="text-xl font-black text-stone-900 font-mono mt-1">
                        {allOrders.length}
                      </p>
                      <span className="text-[10px] text-stone-400">All customer orders</span>
                    </div>

                    <div className="p-3.5 bg-white border border-stone-200 rounded-lg shadow-2xs">
                      <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                        Total Revenue
                      </p>
                      <p className="text-xl font-black text-amber-900 font-mono mt-1">
                        ₹{allOrders.reduce((sum, o) => sum + o.total, 0).toLocaleString('en-IN')}
                      </p>
                      <span className="text-[10px] text-stone-400">Including shipping fee</span>
                    </div>

                    <div className="p-3.5 bg-white border border-stone-200 rounded-lg shadow-2xs">
                      <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                        Processing / Weaving
                      </p>
                      <p className="text-xl font-black text-blue-700 font-mono mt-1">
                        {allOrders.filter(o => o.deliveryStatus === 'Processing' || o.deliveryStatus === 'Order Placed' || o.deliveryStatus === 'Weaving & Tailoring').length}
                      </p>
                      <span className="text-[10px] text-stone-400">Packing &amp; QC stage</span>
                    </div>

                    <div className="p-3.5 bg-white border border-stone-200 rounded-lg shadow-2xs">
                      <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                        Dispatched / Delivered
                      </p>
                      <p className="text-xl font-black text-emerald-700 font-mono mt-1">
                        {allOrders.filter(o => o.deliveryStatus === 'Dispatched from Coimbatore' || o.deliveryStatus === 'Out for Delivery' || o.deliveryStatus === 'Delivered').length}
                      </p>
                      <span className="text-[10px] text-stone-400">Couriers in transit</span>
                    </div>
                  </div>

                  {/* Search and Filters Bar */}
                  <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                    {/* Search Input */}
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search by Order #, Customer Name, Phone, PIN code, or City..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-stone-50 border border-stone-300 rounded-md text-stone-900 focus:outline-none focus:border-amber-800 text-xs"
                      />
                      {orderSearch && (
                        <button
                          type="button"
                          onClick={() => setOrderSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1 sm:pb-0">
                      <span className="text-stone-500 font-medium text-[11px] shrink-0">Status:</span>
                      {[
                        { label: 'All', value: 'all' },
                        { label: 'Processing', value: 'Processing' },
                        { label: 'Dispatched', value: 'Dispatched from Coimbatore' },
                        { label: 'Out for Delivery', value: 'Out for Delivery' },
                        { label: 'Delivered', value: 'Delivered' }
                      ].map((tab) => (
                        <button
                          key={tab.value}
                          type="button"
                          onClick={() => setOrderStatusFilter(tab.value)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer shrink-0 ${
                            orderStatusFilter === tab.value
                              ? 'bg-amber-800 text-white'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* New WhatsApp Courier Label Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const newWaOrder: UserOrder = {
                          id: `ord-wa-${Date.now()}`,
                          orderNumber: `WA-${Math.floor(1000 + Math.random() * 9000)}`,
                          date: new Date().toISOString().split('T')[0],
                          items: [
                            {
                              id: `item-wa-${Date.now()}`,
                              product: products[0] || ({} as any),
                              selectedSize: 'Free Size',
                              selectedColor: 'Standard',
                              quantity: 1
                            }
                          ],
                          subtotal: 0,
                          discount: 0,
                          shippingFee: 80,
                          total: 0,
                          address: {
                            id: `addr-wa-${Date.now()}`,
                            fullName: '',
                            phone: '',
                            street: '',
                            area: '',
                            city: 'Coimbatore',
                            pincode: '',
                            state: 'Tamil Nadu'
                          },
                          paymentMethod: 'UPI',
                          courierPartner: 'ST Courier / Speed Courier',
                          trackingNumber: `SF-WA-${Math.floor(100000 + Math.random() * 900000)}`,
                          deliveryStatus: 'Processing',
                          estimatedDelivery: '2 - 3 Business Days'
                        };
                        setPrintModalOrder({ order: newWaOrder, view: 'courier_label' });
                      }}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs shrink-0"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>+ Print WhatsApp Label</span>
                    </button>
                  </div>

                  {/* Orders Listing */}
                  {allOrders.filter(order => {
                    if (orderStatusFilter !== 'all' && order.deliveryStatus !== orderStatusFilter) {
                      return false;
                    }
                    if (orderSearch.trim()) {
                      const q = orderSearch.toLowerCase().trim();
                      const matchName = order.address?.fullName?.toLowerCase().includes(q);
                      const matchPhone = order.address?.phone?.includes(q);
                      const matchNum = order.orderNumber?.toLowerCase().includes(q);
                      const matchCity = order.address?.city?.toLowerCase().includes(q);
                      const matchArea = order.address?.area?.toLowerCase().includes(q);
                      const matchPin = order.address?.pincode?.includes(q);
                      const matchTracking = order.trackingNumber?.toLowerCase().includes(q);
                      return matchName || matchPhone || matchNum || matchCity || matchArea || matchPin || matchTracking;
                    }
                    return true;
                  }).length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-stone-200 text-stone-500 space-y-2">
                      <Truck className="w-10 h-10 text-stone-300 mx-auto stroke-[1.5]" />
                      <p className="font-semibold text-stone-700 text-sm">No Orders Found</p>
                      <p className="text-xs text-stone-400">
                        {orderSearch ? 'Try a different search keyword.' : 'Customer orders will appear here automatically when placed.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {allOrders
                        .filter(order => {
                          if (orderStatusFilter !== 'all' && order.deliveryStatus !== orderStatusFilter) {
                            return false;
                          }
                          if (orderSearch.trim()) {
                            const q = orderSearch.toLowerCase().trim();
                            const matchName = order.address?.fullName?.toLowerCase().includes(q);
                            const matchPhone = order.address?.phone?.includes(q);
                            const matchNum = order.orderNumber?.toLowerCase().includes(q);
                            const matchCity = order.address?.city?.toLowerCase().includes(q);
                            const matchArea = order.address?.area?.toLowerCase().includes(q);
                            const matchPin = order.address?.pincode?.includes(q);
                            const matchTracking = order.trackingNumber?.toLowerCase().includes(q);
                            return matchName || matchPhone || matchNum || matchCity || matchArea || matchPin || matchTracking;
                          }
                          return true;
                        })
                        .map((order) => {
                          const isEditingThisOrder = editingOrderId === order.id;

                          return (
                            <div
                              key={order.id}
                              className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-2xs hover:shadow-sm transition-shadow text-xs"
                            >
                              {/* Order Card Header */}
                              <div className="p-4 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-3">
                                  <span className="font-mono font-bold text-sm text-stone-900 bg-white px-2.5 py-1 rounded border border-stone-300">
                                    #{order.orderNumber}
                                  </span>
                                  <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{order.date}</span>
                                  </div>
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    {order.paymentMethod} (PAID)
                                  </span>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Total Bill</span>
                                    <span className="font-bold text-base text-amber-900 font-mono">
                                      ₹{order.total.toLocaleString('en-IN')}
                                    </span>
                                  </div>

                                  {/* Delivery Status Badge */}
                                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                    order.deliveryStatus === 'Delivered'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : order.deliveryStatus === 'Dispatched from Coimbatore' || order.deliveryStatus === 'Out for Delivery'
                                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                                  }`}>
                                    {order.deliveryStatus || 'Processing'}
                                  </span>
                                </div>
                              </div>

                              {/* Order Card Body */}
                              <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-5">
                                {/* Col 1: Customer & Courier Destination (5 cols) */}
                                <div className="md:col-span-5 space-y-3 border-b md:border-b-0 md:border-r border-stone-200 pb-4 md:pb-0 md:pr-4">
                                  <div>
                                    <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1">
                                      Customer &amp; Recipient
                                    </span>
                                    <p className="font-bold text-sm text-stone-900">{order.address?.fullName || 'Customer'}</p>
                                    <div className="flex items-center gap-1.5 text-stone-600 mt-1">
                                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                                      <span className="font-mono font-semibold">{order.address?.phone}</span>
                                    </div>
                                  </div>

                                  <div>
                                    <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1 flex items-center gap-1">
                                      <MapPin className="w-3.5 h-3.5 text-amber-800" />
                                      <span>Courier Delivery Address</span>
                                    </span>
                                    <div className="bg-stone-50 p-2.5 rounded border border-stone-200 text-stone-700 leading-snug">
                                      <p>{order.address?.street}</p>
                                      <p>{order.address?.area}</p>
                                      <p className="font-bold text-stone-900 mt-0.5">
                                        {order.address?.city} - <span className="font-mono text-amber-900">{order.address?.pincode}</span>
                                      </p>
                                      <p className="text-[11px] text-stone-500">{order.address?.state || 'Tamil Nadu'}</p>
                                    </div>
                                  </div>

                                  {/* Courier Partner & Tracking Status */}
                                  <div className="pt-1">
                                    {!isEditingThisOrder ? (
                                      <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded flex items-center justify-between gap-2">
                                        <div>
                                          <p className="font-semibold text-blue-950 text-xs">
                                            {order.courierPartner || 'ST Courier / Direct Courier'}
                                          </p>
                                          <p className="text-[11px] text-blue-800 font-mono">
                                            AWB / Track: <strong>{order.trackingNumber || 'Pending Assignment'}</strong>
                                          </p>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingOrderId(order.id);
                                            setEditCourierPartner(order.courierPartner || 'ST Courier');
                                            setEditTrackingNo(order.trackingNumber || '');
                                            setEditStatus(order.deliveryStatus || 'Processing');
                                          }}
                                          className="text-[11px] text-blue-700 hover:text-blue-900 underline font-semibold cursor-pointer shrink-0"
                                        >
                                          Edit Tracking
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="p-3 bg-amber-50 border border-amber-300 rounded space-y-2">
                                        <p className="font-bold text-stone-900 text-xs">Update Courier &amp; Tracking</p>
                                        <div>
                                          <label className="text-[10px] text-stone-500 uppercase block">Courier Partner</label>
                                          <select
                                            value={editCourierPartner}
                                            onChange={(e) => setEditCourierPartner(e.target.value)}
                                            className="w-full mt-0.5 p-1.5 bg-white border border-stone-300 rounded text-xs"
                                          >
                                            <option value="ST Courier">ST Courier</option>
                                            <option value="Professional Couriers">The Professional Couriers</option>
                                            <option value="DTDC Express">DTDC Express</option>
                                            <option value="India Post (Speed Post)">India Post (Speed Post)</option>
                                            <option value="Delhivery">Delhivery</option>
                                            <option value="Porter / Local CBE">Porter / Local Coimbatore</option>
                                          </select>
                                        </div>

                                        <div>
                                          <label className="text-[10px] text-stone-500 uppercase block">Tracking / AWB Number</label>
                                          <input
                                            type="text"
                                            value={editTrackingNo}
                                            onChange={(e) => setEditTrackingNo(e.target.value)}
                                            placeholder="e.g. STC-641002-8419"
                                            className="w-full mt-0.5 p-1.5 bg-white border border-stone-300 rounded text-xs font-mono"
                                          />
                                        </div>

                                        <div>
                                          <label className="text-[10px] text-stone-500 uppercase block">Delivery Status</label>
                                          <select
                                            value={editStatus}
                                            onChange={(e) => setEditStatus(e.target.value as any)}
                                            className="w-full mt-0.5 p-1.5 bg-white border border-stone-300 rounded text-xs"
                                          >
                                            <option value="Processing">Processing / Tailoring</option>
                                            <option value="Dispatched from Coimbatore">Dispatched from Coimbatore</option>
                                            <option value="Out for Delivery">Out for Delivery</option>
                                            <option value="Delivered">Delivered</option>
                                          </select>
                                        </div>

                                        <div className="flex items-center gap-2 pt-1">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              updateOrderStatus(order.id, editStatus, editCourierPartner, editTrackingNo);
                                              setEditingOrderId(null);
                                              setSuccessToast(`Order #${order.orderNumber} updated successfully!`);
                                              setTimeout(() => setSuccessToast(''), 3000);
                                            }}
                                            className="px-3 py-1 bg-emerald-700 text-white rounded font-bold text-xs cursor-pointer hover:bg-emerald-800"
                                          >
                                            Save Changes
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setEditingOrderId(null)}
                                            className="px-2.5 py-1 bg-stone-200 text-stone-700 rounded text-xs cursor-pointer hover:bg-stone-300"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Col 2: Ordered Items & Total Calculation (7 cols) */}
                                <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                                  <div>
                                    <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-2">
                                      Ordered Garments ({order.items.reduce((s, i) => s + i.quantity, 0)} Items)
                                    </span>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                      {order.items.map((item, idx) => (
                                        <div
                                          key={idx}
                                          className="p-2 bg-stone-50 border border-stone-200 rounded flex items-center justify-between gap-3"
                                        >
                                          <div className="flex items-center gap-2.5">
                                            <img
                                              src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=128&q=80'}
                                              alt={item.product.title}
                                              className="w-10 h-12 object-cover object-top rounded border border-stone-300 shrink-0"
                                            />
                                            <div>
                                              <p className="font-semibold text-stone-900 line-clamp-1">{item.product.title}</p>
                                              <p className="text-[11px] text-stone-500">
                                                Size: <strong>{item.selectedSize}</strong> · Color: {item.selectedColor} · Qty: <strong>{item.quantity}</strong>
                                              </p>
                                            </div>
                                          </div>
                                          <span className="font-semibold tabular-nums text-stone-900 shrink-0">
                                            ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Action Buttons Row */}
                                  <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      {/* WhatsApp to Customer */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const url = getCustomerWhatsAppOrderUrl(order);
                                          window.open(url, '_blank', 'noopener,noreferrer');
                                        }}
                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                                        title="Send Order Summary to Customer WhatsApp"
                                      >
                                        <MessageCircle className="w-3.5 h-3.5" />
                                        <span>WhatsApp Customer</span>
                                      </button>

                                      {/* Print Bill / Invoice */}
                                      <button
                                        type="button"
                                        onClick={() => setPrintModalOrder({ order, view: 'invoice' })}
                                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-semibold text-xs flex items-center gap-1.5 cursor-pointer border border-stone-300 transition-colors"
                                        title="Print Tax Invoice / Bill"
                                      >
                                        <FileText className="w-3.5 h-3.5 text-stone-600" />
                                        <span>Print Bill</span>
                                      </button>

                                      {/* Print Courier Label */}
                                      <button
                                        type="button"
                                        onClick={() => setPrintModalOrder({ order, view: 'courier_label' })}
                                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-semibold text-xs flex items-center gap-1.5 cursor-pointer border border-stone-300 transition-colors"
                                        title="Print Courier Shipping Address Label"
                                      >
                                        <Tag className="w-3.5 h-3.5 text-amber-800" />
                                        <span>Courier Label</span>
                                      </button>
                                    </div>

                                    {/* Delete Button */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`Are you sure you want to delete Order #${order.orderNumber}?`)) {
                                          deleteOrder(order.id);
                                          setSuccessToast(`Order #${order.orderNumber} deleted.`);
                                          setTimeout(() => setSuccessToast(''), 3000);
                                        }
                                      }}
                                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded cursor-pointer"
                                      title="Delete order"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 1: Main Frame Picture Banner Customizer */}
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
              <span>All changes to orders, dispatch tracking, banner, categories, and products are saved immediately.</span>
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

      {/* Printable Tax Invoice & Courier Shipping Label Modal */}
      {printModalOrder && (
        <OrderPrintModal
          order={printModalOrder.order}
          initialView={printModalOrder.view}
          onClose={() => setPrintModalOrder(null)}
        />
      )}
    </div>
  );
};
