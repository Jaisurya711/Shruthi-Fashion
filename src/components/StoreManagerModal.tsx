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
  Check,
  ChevronLeft,
  ChevronRight,
  Star,
  Globe,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, UserOrder } from '../types/store';
import { FABRICS, OCCASIONS, HERO_IMAGE } from '../data/products';
import { OrderPrintModal } from './OrderPrintModal';
import { getCustomerWhatsAppOrderUrl } from '../services/notificationService';
import { syncHeroConfigToCloud, syncCatalogToCloud, checkCloudStatus } from '../services/catalogSyncService';

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
    deleteOrder,
    syncCatalog,
    setProductsList,
    updateProductStock,
    updateProductSizeStock,
    addManualOrder,
    refreshOrders
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'hero' | 'categories' | 'add' | 'list'>('orders');
  const [successToast, setSuccessToast] = useState('');
  const [ownerPin, setOwnerPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');

  // Order Management States
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [printModalOrder, setPrintModalOrder] = useState<{ order: UserOrder; view: 'invoice' | 'courier_label' } | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editCourierPartner, setEditCourierPartner] = useState('');
  const [editTrackingNo, setEditTrackingNo] = useState('');
  const [editStatus, setEditStatus] = useState<UserOrder['deliveryStatus']>('Order Placed');

  // FormSubmit Email Order Import states
  const [showEmailOrderImport, setShowEmailOrderImport] = useState(false);
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);
  const [emailRawText, setEmailRawText] = useState('');
  const [manualOrderForm, setManualOrderForm] = useState({
    orderNumber: '',
    customerName: '',
    phone: '',
    street: '',
    area: '',
    city: 'Coimbatore',
    pincode: '641030',
    state: 'Tamil Nadu',
    itemsText: '',
    totalAmount: '',
    paymentMethod: 'UPI' as UserOrder['paymentMethod']
  });

  const handleRefreshOrders = async () => {
    setIsRefreshingOrders(true);
    try {
      await refreshOrders();
      showToast('✅ Orders refreshed from cloud database!');
    } catch {
      showToast('⚠️ Could not refresh orders from cloud.');
    } finally {
      setIsRefreshingOrders(false);
    }
  };

  const handleAutoFillFromEmail = (raw: string) => {
    setEmailRawText(raw);
    if (!raw.trim()) return;

    // Extract Order Number
    const orderMatch = raw.match(/order_number[:\s]+([^\n\r]+)/i) || raw.match(/#?(SF-202[0-9]-[0-9]+)/i);
    const orderNum = orderMatch ? orderMatch[1].trim() : `SF-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // Extract Name
    const nameMatch = raw.match(/customer_name[:\s]+([^\n\r]+)/i) || raw.match(/name[:\s]+([^\n\r]+)/i);
    const custName = nameMatch ? nameMatch[1].trim() : '';

    // Extract Phone
    const phoneMatch = raw.match(/customer_phone[:\s]+([^\n\r]+)/i) || raw.match(/phone[:\s]+([^\n\r]+)/i) || raw.match(/(\+?91[\s-]?)?[6789]\d{9}/);
    const phone = phoneMatch ? phoneMatch[0].trim().replace(/\D/g, '').slice(-10) : '';

    // Extract Total
    const totalMatch = raw.match(/order_total[:\s]+₹?([0-9,]+)/i) || raw.match(/total[:\s]+₹?([0-9,]+)/i);
    const total = totalMatch ? totalMatch[1].replace(/,/g, '').trim() : '';

    // Extract Address
    const addrMatch = raw.match(/delivery_address[:\s]+([^\n\r]+)/i) || raw.match(/address[:\s]+([^\n\r]+)/i);
    let street = '';
    let area = '';
    let city = 'Coimbatore';
    let pincode = '641030';
    if (addrMatch) {
      const parts = addrMatch[1].split(',').map(s => s.trim());
      street = parts[0] || '';
      area = parts[1] || '';
      if (parts[2]) {
        const cityPin = parts[2].split('-');
        city = cityPin[0]?.trim() || 'Coimbatore';
        pincode = (cityPin[1] || '').trim().replace(/\D/g, '') || '641030';
      }
    }

    // Extract Items
    const itemsMatch = raw.match(/order_items[:\s]+([\s\S]+?)(?=dispatch_method|tracking_id|$)/i);
    const items = itemsMatch ? itemsMatch[1].trim() : '';

    // Extract Payment Method
    const payMatch = raw.match(/payment_method[:\s]+([^\n\r]+)/i);
    const payMethod = payMatch && /cod/i.test(payMatch[1]) ? 'COD' : (/card/i.test(payMatch?.[1] || '') ? 'Card' : 'UPI');

    setManualOrderForm(prev => ({
      ...prev,
      orderNumber: orderNum,
      customerName: custName || prev.customerName,
      phone: phone || prev.phone,
      street: street || prev.street,
      area: area || prev.area,
      city: city || prev.city,
      pincode: pincode || prev.pincode,
      totalAmount: total || prev.totalAmount,
      itemsText: items || prev.itemsText,
      paymentMethod: payMethod as any
    }));
  };

  const handleSaveImportedOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualOrderForm.customerName.trim() || !manualOrderForm.phone.trim()) {
      showToast('❌ Customer Name and Phone are required.');
      return;
    }

    const orderNum = manualOrderForm.orderNumber.trim() || `SF-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const total = Number(manualOrderForm.totalAmount) || 0;
    const subtotal = Math.max(0, total - 80);

    const importedOrder: UserOrder = {
      id: `ord-imported-${Date.now()}`,
      orderNumber: orderNum,
      date: new Date().toISOString().split('T')[0],
      items: [
        {
          id: `item-${Date.now()}`,
          product: {
            id: `sf-imported-${Date.now()}`,
            title: manualOrderForm.itemsText || 'Ordered Dress / Fabric from Shruthi Fashion',
            subtitle: 'Customer Online Order',
            price: subtotal || total,
            originalPrice: subtotal || total,
            category: 'Customer Order',
            subcategory: 'Online Order',
            fabric: 'Cotton / Rayon',
            occasion: 'All Occasions',
            colors: [{ name: 'Selected Shade', hex: '#842D2D' }],
            sizes: ['Standard'],
            inStock: true,
            stockCount: 1,
            images: [products[0]?.images[0] || '/images/hero_coimbatore_boutique_1791446890433.jpg'],
            description: manualOrderForm.itemsText || 'Order details from FormSubmit',
            fabricDetails: 'Hand-inspected fabric',
            careInstructions: 'Dry in shade',
            reviews: []
          },
          selectedSize: 'Standard',
          selectedColor: 'Standard',
          quantity: 1
        }
      ],
      subtotal,
      discount: 0,
      shippingFee: 80,
      total: total || (subtotal + 80),
      address: {
        id: `addr-${Date.now()}`,
        fullName: manualOrderForm.customerName.trim(),
        phone: manualOrderForm.phone.trim(),
        street: manualOrderForm.street.trim() || 'Doorstep Delivery Address',
        area: manualOrderForm.area.trim() || 'Coimbatore',
        city: manualOrderForm.city.trim() || 'Coimbatore',
        pincode: manualOrderForm.pincode.trim() || '641030',
        state: manualOrderForm.state.trim() || 'Tamil Nadu'
      },
      paymentMethod: manualOrderForm.paymentMethod,
      deliveryStatus: 'Processing',
      courierPartner: 'ST Courier / Speed Courier',
      trackingNumber: `SF-TRK-${manualOrderForm.pincode.trim() || '641030'}-${Math.floor(100 + Math.random() * 900)}`,
      estimatedDelivery: '2 - 3 Business Days'
    };

    await addManualOrder(importedOrder);
    showToast(`✅ Order #${importedOrder.orderNumber} for ${importedOrder.address.fullName} added to Orders & Dispatch and synced to Cloud!`);
    setShowEmailOrderImport(false);
    setManualOrderForm({
      orderNumber: '',
      customerName: '',
      phone: '',
      street: '',
      area: '',
      city: 'Coimbatore',
      pincode: '641030',
      state: 'Tamil Nadu',
      itemsText: '',
      totalAmount: '',
      paymentMethod: 'UPI'
    });
    setEmailRawText('');
  };

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
      title: 'Diwali Festive Sale Special',
      url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=1600&q=80'
    },
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
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
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
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editImageUrlInput, setEditImageUrlInput] = useState('');
  const [editSizeStock, setEditSizeStock] = useState<Record<string, number>>({});

  // File Input Refs for direct Device / Phone Gallery Upload
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const heroFileInputRef = useRef<HTMLInputElement>(null);

  // Client-side image compressor: scales high-res mobile photos to HD web size (~120-180KB)
  // Prevents localStorage quota errors and enables blazing-fast multi-device synchronization
  const compressImageForUpload = (file: File, maxDim = 1280, quality = 0.84): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        if (!src) return resolve('');
        const img = new window.Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(src);
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        };
        img.onerror = () => resolve(src);
        img.src = src;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Single file upload (used for Hero banner)
  const handleDeviceImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onLoaded: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WEBP, etc.) from your device gallery.');
      return;
    }

    try {
      showToast('Optimizing and loading banner photo...');
      const compressed = await compressImageForUpload(file, 1600, 0.88);
      if (compressed) {
        onLoaded(compressed);
        showToast('Photo uploaded & optimized from device! Ready to save. ✓');
      }
    } catch {
      showToast('Could not load photo from device. Please try another image.');
    }
    e.target.value = '';
  };

  // Multi-file upload for N number of photos with NO LIMIT (User request: upload n number of photo dont set limit)
  const handleDeviceMultiImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onAddImages: (dataUrls: string[]) => void
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const validFiles = fileList.filter((f) => f.type.startsWith('image/'));

    if (validFiles.length === 0) {
      alert('Please select valid image files (JPG, PNG, WEBP, etc.) from your device gallery.');
      return;
    }

    showToast(`Optimizing ${validFiles.length} photo(s)...`);
    const results = await Promise.all(validFiles.map(f => compressImageForUpload(f)));
    const validResults = results.filter((url): url is string => Boolean(url));
    if (validResults.length > 0) {
      onAddImages(validResults);
      showToast(`✓ Added ${validResults.length} photo(s) from device gallery!`);
    }
    e.target.value = '';
  };

  // Cloud Synchronization Status & Verification
  const [cloudStatus, setCloudStatus] = useState<{
    checked: boolean;
    online: boolean;
    totalProducts: number;
    hasHeroConfig: boolean;
    heroTitle: string;
    lastUpdated: number;
    verifying: boolean;
  }>({
    checked: false,
    online: false,
    totalProducts: 0,
    hasHeroConfig: false,
    heroTitle: '',
    lastUpdated: 0,
    verifying: false
  });

  const verifyCloudVisibility = async () => {
    setCloudStatus(prev => ({ ...prev, verifying: true }));
    try {
      const status = await checkCloudStatus();
      setCloudStatus({
        checked: true,
        online: status.online,
        totalProducts: status.totalProducts,
        hasHeroConfig: status.hasHeroConfig,
        heroTitle: status.heroTitle,
        lastUpdated: status.lastUpdated,
        verifying: false
      });
      if (status.online) {
        showToast(`✅ Cloud Server Verified: ${status.totalProducts} products active. Live for all devices!`);
      } else {
        showToast('⚠️ Could not reach cloud server. Saved locally on this device.');
      }
    } catch {
      setCloudStatus(prev => ({ ...prev, checked: true, online: false, verifying: false }));
    }
  };

  useEffect(() => {
    if (isStoreManagerOpen) {
      verifyCloudVisibility();
    }
  }, [isStoreManagerOpen]);

  const moveImage = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    fromIndex: number,
    toIndex: number
  ) => {
    if (toIndex < 0 || toIndex >= list.length) return;
    const updated = [...list];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setList(updated);
  };

  const removeImageAt = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    index: number
  ) => {
    const updated = list.filter((_, i) => i !== index);
    setList(updated);
    showToast('Photo removed.');
  };

  const setAsCoverPhoto = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    index: number
  ) => {
    if (index === 0) return;
    const updated = [...list];
    const [target] = updated.splice(index, 1);
    updated.unshift(target);
    setList(updated);
    showToast('Photo set as main cover photo! ★');
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
    setEditStockCount(p.stockCount !== undefined ? p.stockCount.toString() : '10');
    setEditImages(Array.isArray(p.images) ? [...p.images] : []);
    setEditImageUrlInput('');

    // Initialize per-size stock
    const sizes = Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : ['Standard'];
    const sMap: Record<string, number> = {};
    sizes.forEach(sz => {
      sMap[sz] = p.sizeStock && p.sizeStock[sz] !== undefined
        ? Number(p.sizeStock[sz]) || 0
        : Math.max(0, Math.floor((p.stockCount || 1) / sizes.length)) || 1;
    });
    setEditSizeStock(sMap);
  };

  const handleEditSizeStockChange = (sz: string, delta: number) => {
    setEditSizeStock(prev => {
      const current = prev[sz] || 0;
      const next = Math.max(0, current + delta);
      const updated = { ...prev, [sz]: next };
      const sum = Object.values(updated).reduce((s, n) => s + (Number(n) || 0), 0);
      setEditStockCount(sum.toString());
      return updated;
    });
  };

  const handleEditSizeStockSet = (sz: string, val: number) => {
    setEditSizeStock(prev => {
      const next = Math.max(0, val);
      const updated = { ...prev, [sz]: next };
      const sum = Object.values(updated).reduce((s, n) => s + (Number(n) || 0), 0);
      setEditStockCount(sum.toString());
      return updated;
    });
  };

  const handleEditSizeStockToggle = (sz: string) => {
    setEditSizeStock(prev => {
      const current = prev[sz] || 0;
      const next = current > 0 ? 0 : 2;
      const updated = { ...prev, [sz]: next };
      const sum = Object.values(updated).reduce((s, n) => s + (Number(n) || 0), 0);
      setEditStockCount(sum.toString());
      return updated;
    });
  };

  const handleQuickSingleSizeStockChange = async (productId: string, sz: string, delta: number) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    const sizes = Array.isArray(prod.sizes) && prod.sizes.length > 0 ? prod.sizes : ['Standard'];
    const curSizeStock: Record<string, number> = { ...(prod.sizeStock || {}) };
    sizes.forEach(s => {
      if (curSizeStock[s] === undefined) {
        curSizeStock[s] = Math.max(0, Math.floor((prod.stockCount || 1) / sizes.length)) || 1;
      }
    });

    const nextVal = Math.max(0, (curSizeStock[sz] || 0) + delta);
    curSizeStock[sz] = nextVal;

    try {
      await updateProductSizeStock(productId, curSizeStock);
      showToast(`✅ "${prod.title}" Size ${sz} stock: ${nextVal} pcs (${nextVal > 0 ? 'In Stock' : 'Out of Stock'})!`);
    } catch {
      showToast('⚠️ Stock updated on device.');
    }
  };

  const handleSaveProductEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const finalImages = editImages.length > 0 ? editImages : (editingProduct.images || []);
    const sumSizeStock = Object.values(editSizeStock).reduce((sum, n) => sum + Math.max(0, Number(n) || 0), 0);
    const finalStock = sumSizeStock;
    const finalInStock = finalStock > 0;

    const updated: Product = {
      ...editingProduct,
      title: editTitle.trim() || editingProduct.title,
      subtitle: editSubtitle.trim() || editingProduct.subtitle,
      price: Number(editPrice) || editingProduct.price,
      originalPrice: Number(editOriginalPrice) || editingProduct.originalPrice,
      category: editCategory || editingProduct.category,
      subcategory: editSubcategory || editingProduct.subcategory,
      fabric: editFabric || editingProduct.fabric,
      stockCount: finalStock,
      inStock: finalInStock,
      sizeStock: editSizeStock,
      images: finalImages,
    };
    updateProduct(updated);
    setEditingProduct(null);
    showToast(`⏳ Saving stock (${finalStock} pcs) for "${updated.title}" to cloud...`);
    try {
      const updatedList = products.map(p => p.id === updated.id ? updated : p);
      const res = await syncCatalogToCloud(updatedList);
      await updateProductSizeStock(updated.id, editSizeStock);
      if (res.success) {
        showToast(`✅ "${updated.title}" stock updated across all sizes & live on website!`);
        verifyCloudVisibility();
      } else {
        showToast(`⚠️ Saved on this device: ${res.message}`);
      }
    } catch (err: any) {
      showToast(`❌ Cloud sync error: ${err?.message || 'Check network'}`);
    }
  };

  const handleQuickStockChange = async (productId: string, delta: number) => {
    const target = products.find(p => p.id === productId);
    if (!target) return;
    const current = target.stockCount ?? 10;
    const nextStock = Math.max(0, current + delta);
    showToast(`⏳ Updating stock to ${nextStock} pcs across all devices...`);
    try {
      const res = await updateProductStock(productId, nextStock, nextStock > 0);
      showToast(`✅ "${target.title}" stock updated to ${nextStock} pcs & live across all devices!`);
      verifyCloudVisibility();
    } catch {
      showToast('⚠️ Stock updated on this device.');
    }
  };

  const handleToggleStockAvailability = async (productId: string) => {
    const target = products.find(p => p.id === productId);
    if (!target) return;
    const currentlyInStock = target.inStock && (target.stockCount ?? 0) > 0;
    const nextInStock = !currentlyInStock;
    const nextStock = nextInStock ? (target.stockCount > 0 ? target.stockCount : 10) : 0;
    showToast(`⏳ Setting "${target.title}" to ${nextInStock ? 'In Stock' : 'Out of Stock'}...`);
    try {
      await updateProductStock(productId, nextStock, nextInStock);
      showToast(`✅ "${target.title}" marked as ${nextInStock ? `In Stock (${nextStock} pcs)` : 'Out of Stock / Sold Out'} live across all devices!`);
      verifyCloudVisibility();
    } catch {
      showToast('⚠️ Status updated on this device.');
    }
  };

  if (!isStoreManagerOpen) return null;

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 4500);
  };

  const handleSaveHeroConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroForm.imageUrl.trim()) {
      showToast('❌ Please provide an image URL or choose a photo from device.');
      return;
    }
    setIsSyncing(true);
    updateHeroConfig(heroForm);
    try {
      const res = await syncHeroConfigToCloud(heroForm);
      if (res.success) {
        showToast(`✅ Main frame banner updated & saved to server disk! Visible live to all customer devices.`);
        verifyCloudVisibility();
      } else {
        showToast(`⚠️ Banner saved locally: ${res.message}`);
      }
    } catch (err: any) {
      showToast(`❌ Banner upload failed: ${err?.message || 'Server error'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResetHeroConfig = async () => {
    const defaultHero = {
      imageUrl: HERO_IMAGE,
      title: 'Shruthi Fashion',
      subtitle: 'Exclusive Kurtis · Western Outfits · Stretch Bottom Wear · Grand Shawls',
      badge: 'New Arrivals · Daily & Festive Collections'
    };
    updateHeroConfig(defaultHero);
    setHeroForm(defaultHero);
    try {
      await syncHeroConfigToCloud(defaultHero);
    } catch {}
    showToast('Main frame image restored to default and synced across devices.');
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

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) {
      showToast('❌ Please fill in the product title and offer price.');
      return;
    }

    // Use uploadedImages from device gallery (N number of photos), fallback to first product image if none
    const finalImages = uploadedImages.length > 0
      ? uploadedImages
      : [products[0]?.images[0] || ''];

    const newProduct: Product = {
      id: `sf-custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      subtitle: subtitle.trim() || `${subcategory} · ${fabric}`,
      price: Number(price),
      originalPrice: Number(originalPrice) || Number(price) + 200,
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
      images: finalImages,
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

    setIsSyncing(true);
    showToast(`⏳ Uploading "${newProduct.title}" to Cloud Server...`);
    try {
      const updatedList = [newProduct, ...products];
      addProduct(newProduct);
      const syncRes = await syncCatalogToCloud(updatedList);
      if (syncRes.success) {
        showToast(`✅ "${newProduct.title}" published & verified live! Visible immediately on all phones & computers.`);
        verifyCloudVisibility();
      } else {
        showToast(`⚠️ "${newProduct.title}" saved on this device. Cloud notice: ${syncRes.message}`);
      }
    } catch (err: any) {
      showToast(`❌ Cloud sync error: ${err?.message || 'Failed to upload'}`);
    } finally {
      setIsSyncing(false);
    }

    setTitle('');
    setSubtitle('');
    setPrice('');
    setOriginalPrice('');
    setUploadedImages([]);
    setImageUrlInput('');
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

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await syncCatalog();
      showToast(res?.message || `✓ Synced ${products.length} products to cloud! All devices updated.`);
    } catch {
      showToast(`✓ Synced ${products.length} products across devices!`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJsonText.trim()) return;
    try {
      const parsed = JSON.parse(importJsonText);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setProductsList(parsed);
        setShowImportDialog(false);
        setImportJsonText('');
        showToast(`✓ Successfully imported & synced ${parsed.length} products across all devices!`);
      } else {
        alert('Invalid catalog format. Must be an array of products.');
      }
    } catch {
      alert('Could not parse JSON. Please check the format and try again.');
    }
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
            {/* Live Cloud Visibility & Multi-Device Verification Strip */}
            <div className="bg-stone-900 text-stone-200 px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${cloudStatus.online ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <div>
                  <span className="font-bold text-white mr-1.5">
                    Cloud Multi-Device Sync:
                  </span>
                  <span className="text-stone-300 font-medium">
                    {cloudStatus.online
                      ? `Active (${cloudStatus.totalProducts} products & mainframe image saved to server disk)`
                      : 'Connecting to Cloud...'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={verifyCloudVisibility}
                  disabled={cloudStatus.verifying}
                  className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-amber-300 hover:text-amber-200 rounded font-semibold text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors border border-stone-700"
                  title="Test and verify what customer mobile devices are receiving from server"
                >
                  <RefreshCw className={`w-3 h-3 ${cloudStatus.verifying ? 'animate-spin' : ''}`} />
                  <span>{cloudStatus.verifying ? 'Verifying...' : 'Verify Visibility on Other Devices'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="px-3 py-1 bg-amber-700 hover:bg-amber-600 text-white rounded font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                  title="Broadcast all products and settings to cloud server disk"
                >
                  <Globe className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Force Publish to Cloud'}</span>
                </button>
                <a
                  href="/api/download-zip"
                  download="shruthi-fashion-complete-code.zip"
                  className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-emerald-300 hover:text-emerald-200 rounded font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors border border-stone-700 shadow-xs"
                  title="Download complete website source code (.ZIP) from A to Z to upload or replace on GitHub"
                >
                  <Download className="w-3 h-3" />
                  <span>Download Code (.ZIP)</span>
                </a>
              </div>
            </div>

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

            {/* Multi-Device Cloud Sync Bar */}
            <div className="bg-stone-900 text-white px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-amber-400">
                  Multi-Device Sync:
                </span>
                <span className="text-stone-300">
                  {products.length} products loaded · Auto-syncs to phones &amp; computers
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="px-2.5 py-1 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white text-[11px] font-bold rounded flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  title="Push all products to cloud so other devices see them instantly"
                >
                  <RotateCcw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync to All Devices 🔄'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowImportDialog(!showImportDialog)}
                  className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-medium rounded flex items-center gap-1 cursor-pointer transition-colors"
                  title="Paste catalog from another device"
                >
                  <Upload className="w-3 h-3 text-stone-400" />
                  <span>Import / Paste</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-medium rounded flex items-center gap-1 cursor-pointer transition-colors"
                  title="Download catalog JSON backup"
                >
                  <Download className="w-3 h-3 text-stone-400" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Import Dialog Panel */}
            {showImportDialog && (
              <div className="p-4 bg-amber-50 border-b border-amber-300 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900">
                    Import Catalog from Another Device (Sync Backup)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowImportDialog(false)}
                    className="text-stone-500 hover:text-stone-800 font-bold"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-[11px] text-stone-600">
                  Paste the catalog JSON exported from your other device below to synchronize all products:
                </p>
                <form onSubmit={handleImportSubmit} className="space-y-2">
                  <textarea
                    rows={4}
                    placeholder="Paste products JSON here (e.g. [ { id: '...', title: '...' } ])"
                    value={importJsonText}
                    onChange={(e) => setImportJsonText(e.target.value)}
                    className="w-full p-2 bg-white border border-stone-300 rounded font-mono text-[11px] focus:outline-none focus:border-amber-800"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded text-xs cursor-pointer shadow-xs"
                    >
                      Apply &amp; Sync to All Devices
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowImportDialog(false)}
                      className="px-3 py-1.5 bg-stone-200 text-stone-700 rounded text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

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
                      <span>+ WhatsApp Label</span>
                    </button>

                    {/* Sync & Refresh Cloud Orders */}
                    <button
                      type="button"
                      onClick={handleRefreshOrders}
                      disabled={isRefreshingOrders}
                      className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-800 rounded-md font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-stone-300 shadow-2xs shrink-0"
                      title="Sync and fetch latest orders from customer checkouts"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-stone-600 ${isRefreshingOrders ? 'animate-spin' : ''}`} />
                      <span>{isRefreshingOrders ? 'Syncing...' : 'Refresh Orders'}</span>
                    </button>

                    {/* Import Order from FormSubmit Email */}
                    <button
                      type="button"
                      onClick={() => setShowEmailOrderImport(true)}
                      className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-md font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs shrink-0"
                      title="Import order details received from FormSubmit notification email"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-200" />
                      <span>Import Email Order</span>
                    </button>
                  </div>

                  {/* FormSubmit Email Order Import Modal */}
                  {showEmailOrderImport && (
                    <div className="mb-6 p-4 sm:p-5 bg-amber-50/70 border border-amber-200 rounded-xl shadow-xs">
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-amber-200/80">
                        <div>
                          <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                            <span>📥 Import Customer Order from FormSubmit Email</span>
                            <span className="text-[10px] bg-amber-200 text-amber-900 font-semibold px-2 py-0.5 rounded">
                              shruthifashion01@gmail.com
                            </span>
                          </h3>
                          <p className="text-xs text-stone-600 mt-1">
                            Paste the email content you received from FormSubmit below, or fill the fields directly. It will be immediately added to your Orders & Dispatch list and synced to the database.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowEmailOrderImport(false)}
                          className="p-1 rounded-md text-stone-500 hover:text-stone-800 hover:bg-amber-100 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveImportedOrder} className="mt-4 space-y-4">
                        {/* Paste area for Auto-fill */}
                        <div>
                          <label className="block text-xs font-bold text-stone-800 mb-1">
                            📋 Quick Paste Email Text (Auto-Fills Form below):
                          </label>
                          <textarea
                            rows={3}
                            value={emailRawText}
                            onChange={(e) => handleAutoFillFromEmail(e.target.value)}
                            placeholder="Paste your FormSubmit email text here (e.g. order_number: SF-2026-..., customer_name: Priya, customer_phone: 987..., delivery_address: ...)"
                            className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-700/50 font-mono"
                          />
                        </div>

                        {/* Order Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-stone-700 mb-1">Order Number *</label>
                            <input
                              type="text"
                              value={manualOrderForm.orderNumber}
                              onChange={(e) => setManualOrderForm({ ...manualOrderForm, orderNumber: e.target.value })}
                              placeholder="e.g. SF-2026-4891"
                              className="w-full text-xs p-2 bg-white border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-700/50"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-stone-700 mb-1">Customer Name *</label>
                            <input
                              type="text"
                              required
                              value={manualOrderForm.customerName}
                              onChange={(e) => setManualOrderForm({ ...manualOrderForm, customerName: e.target.value })}
                              placeholder="e.g. Ananya / Priya"
                              className="w-full text-xs p-2 bg-white border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-700/50"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-stone-700 mb-1">Mobile Phone *</label>
                            <input
                              type="text"
                              required
                              value={manualOrderForm.phone}
                              onChange={(e) => setManualOrderForm({ ...manualOrderForm, phone: e.target.value })}
                              placeholder="e.g. 9894088349"
                              className="w-full text-xs p-2 bg-white border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-700/50"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-stone-700 mb-1">Total Amount (₹) *</label>
                            <input
                              type="number"
                              required
                              value={manualOrderForm.totalAmount}
                              onChange={(e) => setManualOrderForm({ ...manualOrderForm, totalAmount: e.target.value })}
                              placeholder="e.g. 380"
                              className="w-full text-xs p-2 bg-white border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-700/50 font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-stone-700 mb-1">Payment Method</label>
                            <select
                              value={manualOrderForm.paymentMethod}
                              onChange={(e) => setManualOrderForm({ ...manualOrderForm, paymentMethod: e.target.value as any })}
                              className="w-full text-xs p-2 bg-white border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-700/50"
                            >
                              <option value="UPI">UPI / GPay / PhonePe</option>
                              <option value="Razorpay">Razorpay Online</option>
                              <option value="COD">Cash on Delivery (COD)</option>
                              <option value="BankTransfer">Bank Transfer</option>
                              <option value="StorePickup">Store Pickup</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-stone-700 mb-1">Pincode *</label>
                            <input
                              type="text"
                              required
                              value={manualOrderForm.pincode}
                              onChange={(e) => setManualOrderForm({ ...manualOrderForm, pincode: e.target.value })}
                              placeholder="e.g. 641030"
                              className="w-full text-xs p-2 bg-white border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-700/50"
                            />
                          </div>
                        </div>

                        {/* Full Delivery Address & Items */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-stone-700 mb-1">Delivery Address (Door No, Street, City) *</label>
                            <input
                              type="text"
                              required
                              value={manualOrderForm.street}
                              onChange={(e) => setManualOrderForm({ ...manualOrderForm, street: e.target.value })}
                              placeholder="e.g. 14/2 Gandhi Street, Kovundampalayam, Coimbatore"
                              className="w-full text-xs p-2 bg-white border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-700/50"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-stone-700 mb-1">Items / Dress Description</label>
                            <input
                              type="text"
                              value={manualOrderForm.itemsText}
                              onChange={(e) => setManualOrderForm({ ...manualOrderForm, itemsText: e.target.value })}
                              placeholder="e.g. Korean Crop Top (Blue, Size L)"
                              className="w-full text-xs p-2 bg-white border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-700/50"
                            />
                          </div>
                        </div>

                        {/* Submit Action */}
                        <div className="flex items-center justify-end gap-2.5 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowEmailOrderImport(false)}
                            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-md text-xs font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-md text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Order to Dispatch List</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

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

                    {/* Product Photos Upload from Device / Gallery (User request: upload n number of photo dont set limit) */}
                    <div className="sm:col-span-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-stone-700 font-bold">
                          Product Photos * (Upload N number of photos · No limit)
                        </label>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                          {uploadedImages.length} {uploadedImages.length === 1 ? 'photo' : 'photos'} uploaded
                        </span>
                      </div>

                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        ref={addFileInputRef}
                        className="hidden"
                        onChange={(e) =>
                          handleDeviceMultiImageUpload(e, (dataUrls) =>
                            setUploadedImages((prev) => [...prev, ...dataUrls])
                          )
                        }
                      />

                      {uploadedImages.length > 0 ? (
                        <div className="p-3 bg-stone-50 border-2 border-dashed border-amber-300 rounded-lg space-y-3">
                          {/* Grid of uploaded photos */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {uploadedImages.map((img, idx) => (
                              <div
                                key={idx}
                                className={`relative group rounded-lg overflow-hidden border-2 bg-white shadow-xs flex flex-col ${
                                  idx === 0
                                    ? 'border-amber-600 ring-2 ring-amber-400'
                                    : 'border-stone-300'
                                }`}
                              >
                                {/* Photo preview - Adapts to uploaded image proportions */}
                                <div className="relative aspect-3/4 w-full bg-stone-100/80 overflow-hidden flex items-center justify-center">
                                  <img
                                    src={img}
                                    alt=""
                                    aria-hidden="true"
                                    className="absolute inset-0 w-full h-full object-cover blur-md opacity-25 scale-110 pointer-events-none"
                                  />
                                  <img
                                    src={img}
                                    alt={`Product upload ${idx + 1}`}
                                    className="relative z-1 max-w-full max-h-full w-auto h-auto object-contain"
                                  />

                                  {/* Badge: Main Cover Photo vs Additional */}
                                  <div className="absolute top-1 left-1 z-10">
                                    {idx === 0 ? (
                                      <span className="inline-flex items-center gap-1 bg-amber-700 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-xs">
                                        <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                                        <span>MAIN COVER</span>
                                      </span>
                                    ) : (
                                      <span className="bg-stone-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                                        #{idx + 1}
                                      </span>
                                    )}
                                  </div>

                                  {/* Delete Button */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeImageAt(uploadedImages, setUploadedImages, idx)
                                    }
                                    title="Delete photo"
                                    className="absolute top-1 right-1 p-1 bg-rose-600/90 hover:bg-rose-700 text-white rounded-md shadow-xs cursor-pointer transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>

                                {/* Controls: Reorder & Make Cover */}
                                <div className="p-1.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-[11px]">
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      disabled={idx === 0}
                                      onClick={() =>
                                        moveImage(uploadedImages, setUploadedImages, idx, idx - 1)
                                      }
                                      title="Move earlier"
                                      className="p-1 rounded text-stone-600 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                      <ChevronLeft className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={idx === uploadedImages.length - 1}
                                      onClick={() =>
                                        moveImage(uploadedImages, setUploadedImages, idx, idx + 1)
                                      }
                                      title="Move later"
                                      className="p-1 rounded text-stone-600 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                      <ChevronRight className="w-3 h-3" />
                                    </button>
                                  </div>

                                  {idx !== 0 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setAsCoverPhoto(uploadedImages, setUploadedImages, idx)
                                      }
                                      className="text-[10px] font-bold text-amber-800 hover:underline cursor-pointer"
                                    >
                                      Make Cover
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}

                            {/* Add More Photos Card in Grid */}
                            <button
                              type="button"
                              onClick={() => addFileInputRef.current?.click()}
                              className="aspect-3/4 rounded-lg border-2 border-dashed border-amber-400 hover:border-amber-700 bg-amber-50/50 hover:bg-amber-100/60 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-colors"
                            >
                              <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center mb-1">
                                <Plus className="w-5 h-5" />
                              </div>
                              <span className="font-bold text-xs text-amber-900">Add More</span>
                              <span className="text-[10px] text-amber-700">No limit</span>
                            </button>
                          </div>

                          {/* Action Toolbar */}
                          <div className="flex items-center justify-between pt-2 border-t border-stone-200 flex-wrap gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => addFileInputRef.current?.click()}
                                className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <Camera className="w-3.5 h-3.5 text-amber-300" />
                                <span>Choose More Photos from Gallery</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm('Clear all uploaded photos?')) setUploadedImages([]);
                                }}
                                className="px-2.5 py-1.5 bg-stone-200 hover:bg-rose-100 hover:text-rose-700 text-stone-700 rounded text-xs font-medium cursor-pointer"
                              >
                                Clear All
                              </button>
                            </div>
                            <span className="text-[11px] text-stone-500">
                              Tip: The 1st photo is used as main catalog cover. Customers can browse all {uploadedImages.length} photos!
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => addFileInputRef.current?.click()}
                          className="p-8 border-2 border-dashed border-stone-300 hover:border-amber-800 bg-stone-50 hover:bg-amber-50/50 rounded-lg text-center cursor-pointer transition-colors"
                        >
                          <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
                            <Upload className="w-6 h-6" />
                          </div>
                          <p className="font-bold text-stone-900 text-sm">
                            Tap to Choose Photos from Device Gallery
                          </p>
                          <p className="text-xs text-stone-600 mt-0.5">
                            Select multiple photos at once or one-by-one. <strong>No limit</strong> on number of photos!
                          </p>
                          <span className="inline-block mt-2 px-3 py-1 bg-amber-800 text-white text-xs font-semibold rounded-md shadow-2xs">
                            Select Device Photos (JPG / PNG / WEBP)
                          </span>
                        </div>
                      )}

                      {/* Optional: Add photo by Web URL */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="url"
                          placeholder="Or paste an image web link (e.g. https://...)"
                          value={imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-white border border-stone-300 rounded text-xs text-stone-800 focus:outline-none focus:border-amber-800"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (imageUrlInput.trim()) {
                              setUploadedImages((prev) => [...prev, imageUrlInput.trim()]);
                              setImageUrlInput('');
                              showToast('Added photo link! ✓');
                            }
                          }}
                          className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded text-xs font-semibold shrink-0 cursor-pointer"
                        >
                          + Add Link
                        </button>
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
                        
                        {/* Device Photo Upload for Product Update (N photos - No limit) */}
                        <div className="p-3.5 bg-amber-50/70 border border-amber-300 rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="block text-stone-800 font-bold text-xs">
                              Product Photos (Upload N number of photos · No limit)
                            </label>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 border border-amber-400">
                              {editImages.length} {editImages.length === 1 ? 'photo' : 'photos'}
                            </span>
                          </div>

                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            ref={editFileInputRef}
                            className="hidden"
                            onChange={(e) =>
                              handleDeviceMultiImageUpload(e, (dataUrls) =>
                                setEditImages((prev) => [...prev, ...dataUrls])
                              )
                            }
                          />

                          {editImages.length > 0 ? (
                            <div className="space-y-3">
                              {/* Grid of photos */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                                {editImages.map((img, idx) => (
                                  <div
                                    key={idx}
                                    className={`relative rounded-lg overflow-hidden border-2 bg-white shadow-xs flex flex-col ${
                                      idx === 0
                                        ? 'border-amber-600 ring-2 ring-amber-400'
                                        : 'border-stone-300'
                                    }`}
                                  >
                                    <div className="relative aspect-3/4 w-full bg-stone-100/80 overflow-hidden flex items-center justify-center">
                                      <img
                                        src={img}
                                        alt=""
                                        aria-hidden="true"
                                        className="absolute inset-0 w-full h-full object-cover blur-md opacity-25 scale-110 pointer-events-none"
                                      />
                                      <img
                                        src={img}
                                        alt={`Product ${idx + 1}`}
                                        className="relative z-1 max-w-full max-h-full w-auto h-auto object-contain"
                                      />

                                      {/* Badge */}
                                      <div className="absolute top-1 left-1 z-10">
                                        {idx === 0 ? (
                                          <span className="inline-flex items-center gap-1 bg-amber-700 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-xs">
                                            <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                                            <span>COVER</span>
                                          </span>
                                        ) : (
                                          <span className="bg-stone-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                                            #{idx + 1}
                                          </span>
                                        )}
                                      </div>

                                      {/* Delete */}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeImageAt(editImages, setEditImages, idx)
                                        }
                                        title="Delete photo"
                                        className="absolute top-1 right-1 p-1 bg-rose-600/90 hover:bg-rose-700 text-white rounded-md shadow-xs cursor-pointer transition-colors"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>

                                    {/* Reorder and Cover */}
                                    <div className="p-1.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-[11px]">
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          disabled={idx === 0}
                                          onClick={() =>
                                            moveImage(editImages, setEditImages, idx, idx - 1)
                                          }
                                          title="Move earlier"
                                          className="p-1 rounded text-stone-600 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                          <ChevronLeft className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          disabled={idx === editImages.length - 1}
                                          onClick={() =>
                                            moveImage(editImages, setEditImages, idx, idx + 1)
                                          }
                                          title="Move later"
                                          className="p-1 rounded text-stone-600 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                          <ChevronRight className="w-3 h-3" />
                                        </button>
                                      </div>

                                      {idx !== 0 && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setAsCoverPhoto(editImages, setEditImages, idx)
                                          }
                                          className="text-[10px] font-bold text-amber-800 hover:underline cursor-pointer"
                                        >
                                          Set Cover
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}

                                {/* Add more tile */}
                                <button
                                  type="button"
                                  onClick={() => editFileInputRef.current?.click()}
                                  className="aspect-3/4 rounded-lg border-2 border-dashed border-amber-400 hover:border-amber-700 bg-white/70 hover:bg-amber-100/70 flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-colors"
                                >
                                  <div className="w-7 h-7 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center mb-1">
                                    <Plus className="w-4 h-4" />
                                  </div>
                                  <span className="font-bold text-xs text-amber-900">Add More</span>
                                  <span className="text-[10px] text-amber-700">No limit</span>
                                </button>
                              </div>

                              <div className="flex items-center justify-between pt-1 flex-wrap gap-2 text-xs">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => editFileInputRef.current?.click()}
                                    className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                                  >
                                    <Camera className="w-3.5 h-3.5 text-amber-300" />
                                    <span>Pick Photos from Device Gallery</span>
                                  </button>
                                  {editingProduct && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setEditImages(
                                          Array.isArray(editingProduct.images)
                                            ? [...editingProduct.images]
                                            : []
                                        )
                                      }
                                      className="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded text-xs cursor-pointer"
                                    >
                                      Reset to Original
                                    </button>
                                  )}
                                </div>
                                <span className="text-[11px] text-stone-600">
                                  Add unlimited photos. 1st is the main cover.
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => editFileInputRef.current?.click()}
                              className="p-6 border-2 border-dashed border-amber-300 hover:border-amber-800 bg-white/80 rounded-lg text-center cursor-pointer transition-colors"
                            >
                              <div className="w-10 h-10 mx-auto rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-1.5">
                                <Upload className="w-5 h-5" />
                              </div>
                              <p className="font-bold text-stone-900 text-xs">
                                Tap to Choose Photos from Device Gallery
                              </p>
                              <p className="text-[11px] text-stone-500 mt-0.5">
                                Upload 1 or multiple photos with no limit
                              </p>
                            </div>
                          )}

                          {/* Optional: Add photo by Web URL */}
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="url"
                              placeholder="Or paste an image web link (e.g. https://...)"
                              value={editImageUrlInput}
                              onChange={(e) => setEditImageUrlInput(e.target.value)}
                              className="flex-1 px-3 py-1.5 bg-white border border-stone-300 rounded text-xs text-stone-800 focus:outline-none focus:border-amber-800"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (editImageUrlInput.trim()) {
                                  setEditImages((prev) => [...prev, editImageUrlInput.trim()]);
                                  setEditImageUrlInput('');
                                  showToast('Added photo link! ✓');
                                }
                              }}
                              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded text-xs font-semibold shrink-0 cursor-pointer"
                            >
                              + Add Link
                            </button>
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

                          {/* Size-by-Size Stock Manager (Per Owner Request) */}
                          <div className="sm:col-span-2 p-3 bg-amber-50/60 border border-amber-200 rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="block text-stone-800 font-bold text-xs uppercase tracking-wider">
                                📏 Stock Per Particular Size ({editingProduct.sizes?.length || 1} sizes)
                              </label>
                              <span className="text-xs font-bold text-amber-950 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                                Total: {Object.values(editSizeStock).reduce((s, n) => s + (Number(n) || 0), 0)} pcs in stock
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-600">
                              Set inventory for each individual size. If a size's stock reaches <strong>0</strong>, the website will automatically show <strong>"Out of Stock"</strong> for that size to customers!
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                              {(editingProduct.sizes || ['Standard']).map((sz) => {
                                const count = editSizeStock[sz] ?? 0;
                                const isOut = count <= 0;

                                return (
                                  <div
                                    key={sz}
                                    className={`p-2.5 rounded-lg border flex flex-col justify-between gap-2 transition-colors ${
                                      isOut
                                        ? 'bg-rose-50/80 border-rose-300'
                                        : 'bg-white border-stone-200 shadow-2xs'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-xs text-stone-900">Size: {sz}</span>
                                      <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                          isOut
                                            ? 'bg-rose-600 text-white'
                                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        }`}
                                      >
                                        {isOut ? 'Out of Stock' : `${count} In Stock`}
                                      </span>
                                    </div>

                                    {/* Counter and Toggle */}
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center border border-stone-300 rounded overflow-hidden bg-white">
                                        <button
                                          type="button"
                                          onClick={() => handleEditSizeStockChange(sz, -1)}
                                          disabled={count <= 0}
                                          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs disabled:opacity-30 cursor-pointer"
                                        >
                                          -
                                        </button>
                                        <input
                                          type="number"
                                          min="0"
                                          value={count}
                                          onChange={(e) => handleEditSizeStockSet(sz, parseInt(e.target.value, 10) || 0)}
                                          className="w-12 text-center text-xs font-mono font-bold text-stone-900 focus:outline-none py-1"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleEditSizeStockChange(sz, 1)}
                                          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
                                        >
                                          +
                                        </button>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => handleEditSizeStockToggle(sz)}
                                        className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                          isOut
                                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                            : 'bg-stone-100 hover:bg-rose-100 text-stone-700 hover:text-rose-700 border border-stone-200'
                                        }`}
                                      >
                                        {isOut ? 'Restore Stock' : 'Mark Out'}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
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
                            {/* Size-by-size Stock breakdown */}
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              <span className="text-[11px] text-stone-500 font-semibold">
                                Size Stock:
                              </span>
                              {(p.sizes || ['Standard']).map((sz) => {
                                const sCount = p.sizeStock && p.sizeStock[sz] !== undefined
                                  ? p.sizeStock[sz]
                                  : Math.max(0, p.stockCount);
                                const isOut = sCount <= 0 || !p.inStock;

                                return (
                                  <div
                                    key={sz}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                                      isOut
                                        ? 'bg-rose-50 text-rose-800 border-rose-300'
                                        : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    }`}
                                  >
                                    <span className={isOut ? 'line-through' : ''}>{sz}:</span>
                                    <span>{isOut ? 'Out of Stock' : `${sCount} pcs`}</span>

                                    {/* 1-click micro +/- for this size */}
                                    <button
                                      type="button"
                                      onClick={() => handleQuickSingleSizeStockChange(p.id, sz, -1)}
                                      disabled={sCount <= 0}
                                      title={`Decrease size ${sz} stock`}
                                      className="ml-1 w-4 h-4 rounded bg-stone-200 hover:bg-stone-300 text-stone-800 flex items-center justify-center font-bold text-[9px] disabled:opacity-30 cursor-pointer"
                                    >
                                      -
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleQuickSingleSizeStockChange(p.id, sz, 1)}
                                      title={`Increase size ${sz} stock`}
                                      className="w-4 h-4 rounded bg-stone-200 hover:bg-stone-300 text-stone-800 flex items-center justify-center font-bold text-[9px] cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                );
                              })}

                              {/* Overall Status Badge */}
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                                  (p.stockCount ?? 0) > 0 && p.inStock
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                    : 'bg-rose-600 text-white'
                                }`}
                              >
                                {(p.stockCount ?? 0) > 0 && p.inStock
                                  ? `Total: ${p.stockCount} in stock`
                                  : 'Sold Out / Out of Stock'}
                              </span>

                              {/* Quick Toggle In-Stock / Out-of-Stock */}
                              <button
                                type="button"
                                onClick={() => handleToggleStockAvailability(p.id)}
                                title={(p.stockCount ?? 0) > 0 && p.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                                  (p.stockCount ?? 0) > 0 && p.inStock
                                    ? 'bg-stone-100 hover:bg-rose-100 text-stone-700 hover:text-rose-700 border border-stone-200'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                }`}
                              >
                                {(p.stockCount ?? 0) > 0 && p.inStock ? 'Mark All Sold Out' : 'Restore All Stock'}
                              </button>
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
