import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, UserProfile, UserOrder, Address, FilterState, StoreBankDetails, HeroConfig } from '../types/store';
import {
  INITIAL_PRODUCTS,
  getStoreBankDetails,
  DEFAULT_STORE_CATEGORIES,
  DEFAULT_STORE_SUBCATEGORIES,
  HERO_IMAGE,
  feedingKurtiImg,
  westernWearImg,
  bottomWearImg,
  straightKurtiImg,
  umbrellaKurtiImg,
  grandShawlImg
} from '../data/products';
import { sendOrderNotificationEmail } from '../services/notificationService';
import {
  fetchLatestCatalogFromCloud,
  syncCatalogToCloud,
  fetchLatestHeroConfigFromCloud,
  syncHeroConfigToCloud,
  syncStockToCloud,
  fetchLatestStockFromCloud,
  getSyncChannel,
  fetchOrdersFromCloud,
  syncOrderToCloud,
  syncAllOrdersToCloud
} from '../services/catalogSyncService';

interface StoreContextType {
  products: Product[];
  filteredProducts: Product[];
  cart: CartItem[];
  wishlist: string[];
  user: UserProfile | null;
  filters: FilterState;
  activeProduct: Product | null;
  isCartOpen: boolean;
  isWishlistOpen: boolean;
  isAuthOpen: boolean;
  isAccountOpen: boolean;
  isCheckoutOpen: boolean;
  orderSuccess: UserOrder | null;
  allOrders: UserOrder[];
  updateOrderStatus: (
    orderId: string,
    status: UserOrder['deliveryStatus'],
    courierPartner?: string,
    trackingNumber?: string
  ) => void;
  deleteOrder: (orderId: string) => void;
  cartCount: number;
  cartSubtotal: number;
  freeShippingThreshold: number;
  storeBank: StoreBankDetails;
  updateStoreBank: (details: StoreBankDetails) => void;
  categories: string[];
  subcategories: string[];
  addCategory: (cat: string) => void;
  removeCategory: (cat: string) => void;
  addSubcategory: (subcat: string) => void;
  removeSubcategory: (subcat: string) => void;
  resetCategoriesToDefault: () => void;
  toggleProductBestSeller: (productId: string) => void;
  heroConfig: HeroConfig;
  updateHeroConfig: (cfg: Partial<HeroConfig>) => void;
  setFilters: (newFilters: Partial<FilterState>) => void;
  resetFilters: () => void;
  addToCart: (product: Product, size: string, color: string, qty?: number, notes?: string) => void;
  updateCartQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  login: (name: string, phone: string, email?: string) => void;
  logout: () => void;
  saveAddress: (address: Address) => void;
  deleteAddress: (id: string) => void;
  placeOrder: (orderPayload: {
    address: Address;
    paymentMethod: 'Razorpay' | 'UPI' | 'BankTransfer' | 'Card' | 'COD' | 'StorePickup';
    paymentDetails?: { upiId?: string; cardLast4?: string; bankName?: string; utrNumber?: string; accountNumber?: string; razorpayPaymentId?: string; razorpayOrderId?: string; razorpaySignature?: string };
  }) => UserOrder;
  setActiveProduct: (p: Product | null) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsWishlistOpen: (open: boolean) => void;
  setIsAuthOpen: (open: boolean) => void;
  setIsAccountOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  setOrderSuccess: (order: UserOrder | null) => void;
  pendingCheckoutAfterAuth: boolean;
  setPendingCheckoutAfterAuth: (val: boolean) => void;
  isStoreManagerOpen: boolean;
  setIsStoreManagerOpen: (open: boolean) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  updateProductStock: (productId: string, newStock: number, inStock?: boolean) => Promise<any>;
  updateProductSizeStock: (productId: string, sizeStock: Record<string, number>) => Promise<any>;
  deleteProduct: (id: string) => void;
  resetProductsToDefault: () => void;
  syncCatalog: () => Promise<any>;
  setProductsList: (products: Product[]) => void;
  addManualOrder: (order: UserOrder) => Promise<boolean>;
  refreshOrders: () => Promise<void>;
}

const ASSET_REMAP: Record<string, string> = {
  'feeding': feedingKurtiImg,
  'western': westernWearImg,
  'bottom': bottomWearImg,
  'straight': straightKurtiImg,
  'umbrella': umbrellaKurtiImg,
  'anarkali': umbrellaKurtiImg,
  'shawl': grandShawlImg,
  'saree': grandShawlImg,
  'tussar': straightKurtiImg,
};

export function resolveProductImage(url: string): string {
  if (!url) return straightKurtiImg;
  if (
    url.startsWith('data:') ||
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('/images/') ||
    url.startsWith('/assets/') ||
    url.startsWith('blob:')
  ) {
    return url;
  }
  const lower = url.toLowerCase();
  for (const [key, assetUrl] of Object.entries(ASSET_REMAP)) {
    if (lower === key || lower.includes(`_${key}_`) || lower.endsWith(`_${key}`)) {
      return assetUrl;
    }
  }
  if (url.includes('images/')) {
    const filename = url.split('/').pop();
    if (filename) return `/images/${filename}`;
  }
  return url || straightKurtiImg;
}

export function normalizeProduct(p: any): Product {
  const rawImages = Array.isArray(p?.images) && p.images.length > 0
    ? p.images
    : (p?.image ? [p.image] : [straightKurtiImg]);
  const images = rawImages.map(resolveProductImage);
  const colors = Array.isArray(p?.colors) && p.colors.length > 0
    ? p.colors
    : [{ name: 'Standard', hex: '#842D2D' }];
  const sizes = Array.isArray(p?.sizes) && p.sizes.length > 0
    ? p.sizes
    : ['Standard', 'Free Size'];
  const reviews = Array.isArray(p?.reviews) ? p.reviews : [];

  // Normalize sizeStock mapping
  let sizeStock: Record<string, number> = {};
  if (p?.sizeStock && typeof p.sizeStock === 'object') {
    sizeStock = { ...p.sizeStock };
    for (const sz of sizes) {
      if (sizeStock[sz] === undefined) {
        sizeStock[sz] = Math.max(0, Math.floor((Number(p?.stockCount) || 1) / sizes.length)) || 1;
      } else {
        sizeStock[sz] = Math.max(0, Number(sizeStock[sz]) || 0);
      }
    }
  } else {
    const total = Number(p?.stockCount) !== undefined ? Number(p?.stockCount) : 10;
    const perSize = sizes.length > 0 ? Math.max(0, Math.floor(total / sizes.length)) : total;
    let rem = sizes.length > 0 ? total % sizes.length : 0;
    for (const sz of sizes) {
      sizeStock[sz] = perSize + (rem > 0 ? 1 : 0);
      if (rem > 0) rem--;
    }
  }

  const computedStock = Object.values(sizeStock).reduce((sum, n) => sum + (Number(n) || 0), 0);
  const finalStock = computedStock;
  const inStock = finalStock > 0 && p?.inStock !== false;

  return {
    ...p,
    id: p?.id || `sf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: p?.title || 'Shruthi Fashion Style',
    subtitle: p?.subtitle || '',
    price: Number(p?.price) || 499,
    originalPrice: Number(p?.originalPrice) || Number(p?.price) || 799,
    category: p?.category || 'Kurtis',
    subcategory: p?.subcategory || 'Straight Cut Kurti',
    fabric: p?.fabric || 'Pure Cotton',
    occasion: p?.occasion || 'Daily Wear',
    colors,
    sizes,
    sizeStock,
    images,
    inStock,
    stockCount: finalStock,
    isBestSeller: Boolean(p?.isBestSeller),
    isNew: Boolean(p?.isNew),
    expressCoimbatore: Boolean(p?.expressCoimbatore),
    rating: Number(p?.rating) || 4.8,
    reviewCount: Number(p?.reviewCount) || 15,
    description: p?.description || '',
    fabricDetails: p?.fabricDetails || 'Premium hand-checked fabric',
    careInstructions: p?.careInstructions || 'Dry in shade',
    specialFeatures: p?.specialFeatures || '',
    reviews,
  };
}

const defaultFilters: FilterState = {
  search: '',
  category: 'All Collections',
  subcategory: 'All Styles',
  fabric: 'All Fabrics',
  occasion: 'All Occasions',
  minPrice: 0,
  maxPrice: 3000,
  size: 'All',
  sortBy: 'featured',
  inStockOnly: false,
  expressOnly: false,
};

const defaultCoimbatoreAddress: Address = {
  id: 'addr-default-1',
  fullName: 'Revathi Sridhar',
  phone: '+91 99622 78349',
  street: 'Near Balaji Textiles, Edayarpalayam Road',
  area: 'Kovundampalayam',
  city: 'Coimbatore',
  pincode: '641030',
  state: 'Tamil Nadu',
  isDefault: true,
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('shruthi_fashion_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizeProduct);
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_PRODUCTS.map(normalizeProduct);
  });

  // Automatically fetch cloud-synced catalog, hero banner, and orders on load
  useEffect(() => {
    fetchLatestCatalogFromCloud().then(({ products: cloudProducts, heroConfig: cloudHero }) => {
      if (Array.isArray(cloudProducts) && cloudProducts.length > 0) {
        setProducts(cloudProducts.map(normalizeProduct));
      }
      if (cloudHero && cloudHero.imageUrl) {
        setHeroConfig(cloudHero);
      }
    });

    fetchOrdersFromCloud().then(cloudOrders => {
      if (Array.isArray(cloudOrders) && cloudOrders.length > 0) {
        setAllOrders(cloudOrders);
      }
    });
  }, []);

  const [filters, setFilterState] = useState<FilterState>(defaultFilters);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isStoreManagerOpen, setIsStoreManagerOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<UserOrder | null>(null);
  const [allOrders, setAllOrders] = useState<UserOrder[]>(() => {
    try {
      const saved = localStorage.getItem('shruthi_fashion_all_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        id: 'ord-demo-1',
        orderNumber: 'SF-2026-8419',
        date: '2026-10-16',
        items: [
          {
            id: 'cart-demo-1',
            product: normalizeProduct({
              title: 'Coimbatore Soft Cotton Saree - Maroon & Zari Border',
              category: 'Daily Wear',
              fabric: 'Pure Cotton',
              price: 1499
            }),
            selectedSize: 'Free Size',
            selectedColor: 'Deep Maroon',
            quantity: 1
          }
        ],
        subtotal: 1499,
        discount: 0,
        shippingFee: 80,
        total: 1579,
        address: {
          id: 'addr-demo-1',
          fullName: 'K. Revathi',
          phone: '9842155678',
          street: 'Door No. 24, Thadagam Main Road',
          area: 'Near DB Road Corner, RS Puram',
          city: 'Coimbatore',
          pincode: '641002',
          state: 'Tamil Nadu'
        },
        paymentMethod: 'Razorpay',
        paymentDetails: { razorpayPaymentId: 'pay_rzp_cbe_8419' },
        deliveryStatus: 'Processing',
        courierPartner: 'ST Courier',
        trackingNumber: 'STC-CBE-641002-8419',
        estimatedDelivery: '2 Business Days'
      },
      {
        id: 'ord-demo-2',
        orderNumber: 'SF-2026-6204',
        date: '2026-10-15',
        items: [
          {
            id: 'cart-demo-2',
            product: normalizeProduct({
              title: 'Tussar Silk Festive Kurti with Zari Neck',
              category: 'Kurtis',
              fabric: 'Tussar Silk',
              price: 899
            }),
            selectedSize: 'L',
            selectedColor: 'Emerald Green',
            quantity: 2
          }
        ],
        subtotal: 1798,
        discount: 0,
        shippingFee: 80,
        total: 1878,
        address: {
          id: 'addr-demo-2',
          fullName: 'Deepa Sundararajan',
          phone: '9443210987',
          street: 'Flat 3B, Green Meadows, Trichy Road',
          area: 'Near Singanallur Signal',
          city: 'Coimbatore',
          pincode: '641005',
          state: 'Tamil Nadu'
        },
        paymentMethod: 'UPI',
        paymentDetails: { upiId: 'deepa@okaxis', utrNumber: 'UPI429018449102' },
        deliveryStatus: 'Dispatched from Coimbatore',
        courierPartner: 'Professional Couriers',
        trackingNumber: 'TPC-CBE-99238411',
        estimatedDelivery: '3 Business Days'
      },
      {
        id: 'ord-demo-3',
        orderNumber: 'SF-2026-3112',
        date: '2026-10-14',
        items: [
          {
            id: 'cart-demo-3',
            product: normalizeProduct({
              title: 'Grand Zari Silk Shawl - Temple Border',
              category: 'Grand Shawls',
              fabric: 'Art Silk',
              price: 899
            }),
            selectedSize: 'Standard',
            selectedColor: 'Temple Gold',
            quantity: 1
          }
        ],
        subtotal: 899,
        discount: 0,
        shippingFee: 80,
        total: 979,
        address: {
          id: 'addr-demo-3',
          fullName: 'Ananya Vijay',
          phone: '9790044521',
          street: '12/4 Annanagar East, Avinashi Road',
          area: 'Opposite PSG Tech, Peelamedu',
          city: 'Coimbatore',
          pincode: '641004',
          state: 'Tamil Nadu'
        },
        paymentMethod: 'Razorpay',
        paymentDetails: { razorpayPaymentId: 'pay_rzp_cbe_3112' },
        deliveryStatus: 'Delivered',
        courierPartner: 'DTDC Express',
        trackingNumber: 'DTDC-CBE-3112',
        estimatedDelivery: 'Delivered'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('shruthi_fashion_all_orders', JSON.stringify(allOrders));
    } catch (e) {
      console.warn('Failed saving orders to localStorage:', e);
    }
  }, [allOrders]);

  const updateOrderStatus = (
    orderId: string,
    status: UserOrder['deliveryStatus'],
    courierPartner?: string,
    trackingNumber?: string
  ) => {
    setAllOrders(prev => {
      const next = prev.map(ord => {
        if (ord.id === orderId || ord.orderNumber === orderId) {
          return {
            ...ord,
            deliveryStatus: status,
            courierPartner: courierPartner !== undefined ? courierPartner : ord.courierPartner,
            trackingNumber: trackingNumber !== undefined ? trackingNumber : ord.trackingNumber
          };
        }
        return ord;
      });
      syncAllOrdersToCloud(next);
      return next;
    });
  };

  const deleteOrder = (orderId: string) => {
    setAllOrders(prev => {
      const next = prev.filter(ord => ord.id !== orderId && ord.orderNumber !== orderId);
      syncAllOrdersToCloud(next);
      return next;
    });
  };

  const addManualOrder = async (order: UserOrder): Promise<boolean> => {
    setAllOrders(prev => {
      const exists = prev.some(o => o.id === order.id || o.orderNumber === order.orderNumber);
      return exists ? prev.map(o => (o.id === order.id || o.orderNumber === order.orderNumber ? order : o)) : [order, ...prev];
    });
    return await syncOrderToCloud(order);
  };

  const refreshOrders = async () => {
    const cloudOrders = await fetchOrdersFromCloud();
    if (Array.isArray(cloudOrders) && cloudOrders.length > 0) {
      setAllOrders(cloudOrders);
    }
  };
  const [pendingCheckoutAfterAuth, setPendingCheckoutAfterAuth] = useState(false);
  const [storeBank, setStoreBank] = useState<StoreBankDetails>(() => getStoreBankDetails());

  // Category and Subcategory Customization
  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('shruthi_custom_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_STORE_CATEGORIES;
  });

  const [subcategories, setSubcategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('shruthi_custom_subcategories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_STORE_SUBCATEGORIES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('shruthi_custom_categories', JSON.stringify(categories));
    } catch {}
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem('shruthi_custom_subcategories', JSON.stringify(subcategories));
    } catch {}
  }, [subcategories]);

  const addCategory = (cat: string) => {
    const trimmed = cat.trim();
    if (!trimmed || categories.includes(trimmed)) return;
    setCategories(prev => [...prev, trimmed]);
  };

  const removeCategory = (cat: string) => {
    setCategories(prev => prev.filter(c => c !== cat));
  };

  const addSubcategory = (subcat: string) => {
    const trimmed = subcat.trim();
    if (!trimmed || subcategories.includes(trimmed)) return;
    setSubcategories(prev => [...prev, trimmed]);
  };

  const removeSubcategory = (subcat: string) => {
    setSubcategories(prev => prev.filter(s => s !== subcat));
  };

  const resetCategoriesToDefault = () => {
    setCategories(DEFAULT_STORE_CATEGORIES);
    setSubcategories(DEFAULT_STORE_SUBCATEGORIES);
    localStorage.removeItem('shruthi_custom_categories');
    localStorage.removeItem('shruthi_custom_subcategories');
  };

  // Best Seller Toggle
  const toggleProductBestSeller = (productId: string) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === productId ? { ...p, isBestSeller: !p.isBestSeller } : p
      )
    );
  };

  // Main Frame Banner Config
  const [heroConfig, setHeroConfig] = useState<HeroConfig>(() => {
    try {
      const saved = localStorage.getItem('shruthi_hero_config');
      if (saved) return JSON.parse(saved);
      const savedImg = localStorage.getItem('shruthi_custom_hero_image');
      return {
        imageUrl: savedImg || HERO_IMAGE,
        title: 'Shruthi Fashion',
        subtitle: 'Exclusive Kurtis · Western Outfits · Stretch Bottom Wear · Grand Shawls',
        badge: 'New Arrivals · Daily & Festive Collections'
      };
    } catch {
      return {
        imageUrl: HERO_IMAGE,
        title: 'Shruthi Fashion',
        subtitle: 'Exclusive Kurtis · Western Outfits · Stretch Bottom Wear · Grand Shawls',
        badge: 'New Arrivals · Daily & Festive Collections'
      };
    }
  });

  const updateHeroConfig = (cfg: Partial<HeroConfig>) => {
    setHeroConfig(prev => {
      const updated = { ...prev, ...cfg };
      try {
        localStorage.setItem('shruthi_hero_config', JSON.stringify(updated));
        if (cfg.imageUrl) {
          localStorage.setItem('shruthi_custom_hero_image', cfg.imageUrl);
        }
        window.dispatchEvent(new Event('shruthi_hero_updated'));
      } catch {}

      // Broadcast to cloud / server API so mobile & other customer devices receive this banner immediately
      syncHeroConfigToCloud(updated);
      return updated;
    });
  };

  // Multi-device sync listener: Automatically fetch latest products, stock & hero banner from server
  useEffect(() => {
    let isMounted = true;

    // Fast check for lightweight stock changes (<1KB)
    const checkStockUpdates = async () => {
      try {
        const stockMap = await fetchLatestStockFromCloud();
        if (!isMounted || !stockMap) return;

        setProducts(prev => {
          let hasDiff = false;
          const next = prev.map(p => {
            const remote = stockMap[p.id];
            if (remote) {
              const countDiff = remote.stockCount !== p.stockCount;
              const inStockDiff = remote.inStock !== p.inStock;
              const sizeStockDiff = remote.sizeStock && JSON.stringify(remote.sizeStock) !== JSON.stringify(p.sizeStock);
              if (countDiff || inStockDiff || sizeStockDiff) {
                hasDiff = true;
                return {
                  ...p,
                  stockCount: remote.stockCount,
                  inStock: remote.inStock,
                  sizeStock: remote.sizeStock || p.sizeStock
                };
              }
            }
            return p;
          });

          if (hasDiff) {
            try {
              localStorage.setItem('shruthi_fashion_products', JSON.stringify(next));
            } catch {}
            return next;
          }
          return prev;
        });
      } catch {}
    };

    // Full catalog sync check
    const checkCloudUpdates = async () => {
      try {
        const { products: cloudProducts, heroConfig: cloudHero } = await fetchLatestCatalogFromCloud();
        if (!isMounted) return;

        if (Array.isArray(cloudProducts) && cloudProducts.length > 0) {
          setProducts(prev => {
            // Check if server catalog differs in count, stockCount, inStock, price, title, or sizeStock
            const hasChanged =
              prev.length !== cloudProducts.length ||
              JSON.stringify(
                prev.map(p => ({
                  id: p.id,
                  stockCount: p.stockCount,
                  inStock: p.inStock,
                  price: p.price,
                  title: p.title,
                  sizeStock: p.sizeStock,
                }))
              ) !==
              JSON.stringify(
                cloudProducts.map(p => ({
                  id: p.id,
                  stockCount: p.stockCount,
                  inStock: p.inStock,
                  price: p.price,
                  title: p.title,
                  sizeStock: p.sizeStock,
                }))
              );

            if (hasChanged) {
              return cloudProducts.map(normalizeProduct);
            }
            return prev;
          });
        }

        if (cloudHero && cloudHero.imageUrl) {
          setHeroConfig(prev => {
            if (prev.imageUrl !== cloudHero.imageUrl || prev.title !== cloudHero.title) {
              return cloudHero;
            }
            return prev;
          });
        }
      } catch (err) {
        // network fallback
      }
    };

    // Orders sync check
    const checkOrdersUpdates = async () => {
      try {
        const cloudOrders = await fetchOrdersFromCloud();
        if (!isMounted || !cloudOrders) return;
        setAllOrders(prev => {
          if (cloudOrders.length !== prev.length) {
            return cloudOrders;
          }
          const prevIds = new Set(prev.map(o => o.id || o.orderNumber));
          const hasNew = cloudOrders.some(o => !prevIds.has(o.id || o.orderNumber));
          if (hasNew) return cloudOrders;
          return prev;
        });
      } catch {}
    };

    // 1. Initial check
    checkCloudUpdates();
    checkStockUpdates();
    checkOrdersUpdates();

    // 2. Cross-tab instant message listener (0ms reflection between tabs/windows)
    const channel = getSyncChannel();
    if (channel) {
      channel.onmessage = (event) => {
        const data = event?.data;
        if (data?.type === 'STOCK_CHANGED' && data.productId) {
          setProducts(prev =>
            prev.map(p =>
              p.id === data.productId
                ? {
                    ...p,
                    stockCount: data.stockCount,
                    inStock: data.inStock,
                    ...(data.sizeStock ? { sizeStock: data.sizeStock } : {})
                  }
                : p
            )
          );
        } else if (data?.type === 'CATALOG_CHANGED') {
          checkCloudUpdates();
        } else if (data?.type === 'NEW_ORDER' && data.order) {
          setAllOrders(prev => {
            const exists = prev.some(o => o.id === data.order.id || o.orderNumber === data.order.orderNumber);
            return exists ? prev : [data.order, ...prev];
          });
        } else if (data?.type === 'ORDERS_UPDATED') {
          checkOrdersUpdates();
        }
      };
    }

    // 3. Re-check when mobile browser tab is focused / reopened / unlocked
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkStockUpdates();
        checkCloudUpdates();
        checkOrdersUpdates();
      }
    };

    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    // 4. Periodic background poll for instant multi-device stock & orders reflection
    const stockIntervalId = setInterval(checkStockUpdates, 2500);
    const catalogIntervalId = setInterval(checkCloudUpdates, 5000);
    const ordersIntervalId = setInterval(checkOrdersUpdates, 3500);

    return () => {
      isMounted = false;
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
      clearInterval(stockIntervalId);
      clearInterval(catalogIntervalId);
      clearInterval(ordersIntervalId);
    };
  }, []);

  const updateStoreBank = (details: StoreBankDetails) => {
    setStoreBank(details);
    try {
      localStorage.setItem('shruthi_custom_bank_details', JSON.stringify(details));
      window.dispatchEvent(new Event('shruthi_bank_updated'));
    } catch (e) {
      console.warn('LocalStorage bank details save failed:', e);
    }
  };

  // Cache products to local storage only (never automatically post backwards from client reader)
  useEffect(() => {
    try {
      localStorage.setItem('shruthi_fashion_products', JSON.stringify(products));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [products]);

  // Local storage backed state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('shruthi_fashion_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('shruthi_fashion_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('shruthi_fashion_user');
      if (saved) {
        const parsed: UserProfile = JSON.parse(saved);
        // Remove legacy sample dummy addresses (e.g. Cross Cut Road / Gandhipuram)
        if (parsed.addresses && Array.isArray(parsed.addresses)) {
          parsed.addresses = parsed.addresses.filter(a => {
            const streetLower = (a.street || '').toLowerCase();
            const areaLower = (a.area || '').toLowerCase();
            const isDummy =
              streetLower.includes('cross cut') ||
              areaLower.includes('gandhipuram') ||
              streetLower.includes('balaji textiles') ||
              areaLower.includes('r.s. puram') ||
              a.pincode === '641012';
            return !isDummy;
          });
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem('shruthi_fashion_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('shruthi_fashion_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('shruthi_fashion_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('shruthi_fashion_user');
      }
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [user]);

  const setFilters = (newFilters: Partial<FilterState>) => {
    setFilterState(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilterState(defaultFilters);
  };

  // Cart operations
  const addToCart = (
    product: Product,
    size: string,
    color: string,
    qty = 1,
    notes?: string
  ) => {
    const itemId = `${product.id}-${size}-${color}`;
    setCart(prev => {
      const existing = prev.find(item => item.id === itemId);
      if (existing) {
        return prev.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          product,
          selectedSize: size,
          selectedColor: color,
          quantity: qty,
          customTailoringNotes: notes
        }
      ];
    });
    setIsCartOpen(true);
  };

  const updateCartQty = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: qty } : item));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist operations
  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const next = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      if (user) {
        setUser({ ...user, wishlistIds: next });
      }
      return next;
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  // Catalog Management
  const addProduct = (newProduct: Product) => {
    const normalized = normalizeProduct(newProduct);
    setProducts(prev => {
      const updated = [normalized, ...prev];
      syncCatalogToCloud(updated);
      return updated;
    });
  };

  const updateProduct = (updated: Product) => {
    const normalized = normalizeProduct(updated);
    setProducts(prev => {
      const updatedList = prev.map(p => p.id === normalized.id ? normalized : p);
      syncCatalogToCloud(updatedList);
      return updatedList;
    });
  };

  const updateProductStock = async (productId: string, newStock: number, inStock?: boolean) => {
    const finalInStock = inStock !== undefined ? inStock : newStock > 0;
    let targetUpdated: Product | null = null;
    let updatedList: Product[] = [];

    setProducts(prev => {
      updatedList = prev.map(p => {
        if (p.id === productId) {
          const currentSizeStock = p.sizeStock ? { ...p.sizeStock } : {};
          const sizes = p.sizes || ['Standard'];
          if (newStock === 0) {
            for (const sz of sizes) currentSizeStock[sz] = 0;
          }
          targetUpdated = {
            ...p,
            stockCount: Math.max(0, newStock),
            inStock: finalInStock,
            sizeStock: currentSizeStock
          };
          return targetUpdated;
        }
        return p;
      });
      try {
        localStorage.setItem('shruthi_fashion_products', JSON.stringify(updatedList));
      } catch {}
      return updatedList;
    });

    const res = await syncStockToCloud(productId, Math.max(0, newStock), finalInStock, targetUpdated?.sizeStock);
    if (updatedList.length > 0) {
      syncCatalogToCloud(updatedList).catch(() => {});
    }
    return res;
  };

  const updateProductSizeStock = async (productId: string, newSizeStock: Record<string, number>) => {
    const computedTotal = Object.values(newSizeStock).reduce((sum, n) => sum + Math.max(0, Number(n) || 0), 0);
    const finalInStock = computedTotal > 0;
    let updatedList: Product[] = [];

    setProducts(prev => {
      updatedList = prev.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            stockCount: computedTotal,
            inStock: finalInStock,
            sizeStock: newSizeStock
          };
        }
        return p;
      });
      try {
        localStorage.setItem('shruthi_fashion_products', JSON.stringify(updatedList));
      } catch {}
      return updatedList;
    });

    const res = await syncStockToCloud(productId, computedTotal, finalInStock, newSizeStock);
    if (updatedList.length > 0) {
      syncCatalogToCloud(updatedList).catch(() => {});
    }
    return res;
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => {
      const updatedList = prev.filter(p => p.id !== id);
      syncCatalogToCloud(updatedList);
      return updatedList;
    });
  };

  const resetProductsToDefault = () => {
    const defaults = INITIAL_PRODUCTS.map(normalizeProduct);
    setProducts(defaults);
    try {
      localStorage.removeItem('shruthi_fashion_products');
    } catch (e) {
      console.warn(e);
    }
    syncCatalogToCloud(defaults);
  };

  const syncCatalog = async () => {
    return await syncCatalogToCloud(products);
  };

  const setProductsList = (newProds: Product[]) => {
    const normalized = newProds.map(normalizeProduct);
    setProducts(normalized);
    syncCatalogToCloud(normalized);
  };

  // User auth operations
  const login = (name: string, phone: string, email?: string) => {
    const finalName = name.trim() || 'Customer';
    const finalPhone = phone.trim() || '';
    const finalEmail = email?.trim() || '';

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: finalName,
      email: finalEmail,
      phone: finalPhone,
      addresses: [],
      orderHistory: [],
      wishlistIds: wishlist
    };
    setUser(newUser);
    setIsAuthOpen(false);

    // If customer initiated Buy Now / checkout prior to registration, connect directly to payment
    if (pendingCheckoutAfterAuth) {
      setIsCheckoutOpen(true);
      setPendingCheckoutAfterAuth(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAccountOpen(false);
  };

  const saveAddress = (address: Address) => {
    if (!user) return;
    const exists = user.addresses.some(a => a.id === address.id);
    const updated = exists
      ? user.addresses.map(a => a.id === address.id ? address : a)
      : [...user.addresses, address];
    setUser({ ...user, addresses: updated });
  };

  const deleteAddress = (id: string) => {
    if (!user) return;
    setUser({ ...user, addresses: user.addresses.filter(a => a.id !== id) });
  };

  // Place Order
  const placeOrder = (orderPayload: {
    address: Address;
    paymentMethod: 'Razorpay' | 'UPI' | 'BankTransfer' | 'Card' | 'COD' | 'StorePickup';
    paymentDetails?: { upiId?: string; cardLast4?: string; bankName?: string; utrNumber?: string; accountNumber?: string; razorpayPaymentId?: string; razorpayOrderId?: string; razorpaySignature?: string };
  }): UserOrder => {
    const orderNum = `SF-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    // Shipping cost: Flat 80 rupees (per user request: "in order summary edit shipping cost as 80 rupees")
    const shipping = 80;
    const total = subtotal + shipping;

    const newOrder: UserOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      date: new Date().toISOString().split('T')[0],
      items: [...cart],
      subtotal,
      discount: 0,
      shippingFee: shipping,
      total,
      address: orderPayload.address,
      paymentMethod: orderPayload.paymentMethod,
      paymentDetails: orderPayload.paymentDetails,
      deliveryStatus: 'Dispatched from Coimbatore',
      trackingNumber: `SF-TRK-${orderPayload.address.pincode || '641030'}-${Math.floor(100 + Math.random() * 900)}`,
      estimatedDelivery: '2 - 4 Business Days'
    };

    if (user) {
      setUser({
        ...user,
        orderHistory: [newOrder, ...user.orderHistory]
      });
    }

    setAllOrders(prev => [newOrder, ...prev]);

    // Automatically decrement stock for purchased items and their particular sizes
    setProducts(prevProducts => {
      let changed = false;
      const nextProducts = prevProducts.map(p => {
        const matchingCartItems = cart.filter(ci => ci.product.id === p.id);
        if (matchingCartItems.length === 0) return p;

        changed = true;
        const currentSizeStock = p.sizeStock ? { ...p.sizeStock } : {};
        matchingCartItems.forEach(item => {
          const sz = item.selectedSize;
          if (currentSizeStock[sz] !== undefined) {
            currentSizeStock[sz] = Math.max(0, currentSizeStock[sz] - item.quantity);
          }
        });

        const newStockCount = Object.keys(currentSizeStock).length > 0
          ? Object.values(currentSizeStock).reduce((sum, n) => sum + (Number(n) || 0), 0)
          : Math.max(0, (p.stockCount ?? 1) - matchingCartItems.reduce((s, it) => s + it.quantity, 0));

        const updatedProd: Product = {
          ...p,
          stockCount: newStockCount,
          inStock: newStockCount > 0,
          sizeStock: currentSizeStock
        };

        syncStockToCloud(p.id, newStockCount, newStockCount > 0, currentSizeStock);
        return updatedProd;
      });

      if (changed) {
        try {
          localStorage.setItem('shruthi_fashion_products', JSON.stringify(nextProducts));
        } catch {}
        syncCatalogToCloud(nextProducts).catch(() => {});
      }
      return nextProducts;
    });

    setAllOrders(prev => [newOrder, ...prev]);

    clearCart();
    setIsCheckoutOpen(false);
    setOrderSuccess(newOrder);

    // Send order notification email to shruthifashion01@gmail.com
    sendOrderNotificationEmail(newOrder);

    // Automatically sync order to Cloud database and GitHub repository so Owner Portal reflects it immediately
    syncOrderToCloud(newOrder);

    return newOrder;
  };

  // Filter computation
  const filteredProducts = products.filter(product => {
    // Search
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      const match =
        product.title.toLowerCase().includes(q) ||
        product.subtitle.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        product.fabric.toLowerCase().includes(q) ||
        product.occasion.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Category
    if (filters.category !== 'All Collections' && product.category !== filters.category) {
      return false;
    }

    // Subcategory
    if (filters.subcategory && filters.subcategory !== 'All Styles' && product.subcategory !== filters.subcategory) {
      return false;
    }

    // Fabric
    if (filters.fabric !== 'All Fabrics' && product.fabric !== filters.fabric) {
      return false;
    }

    // Occasion
    if (filters.occasion !== 'All Occasions' && product.occasion !== filters.occasion) {
      return false;
    }

    // Size
    if (filters.size !== 'All') {
      const hasSize = product.sizes.some(s => s.toLowerCase().includes(filters.size.toLowerCase()));
      if (!hasSize) return false;
    }

    // Price
    if (product.price < filters.minPrice || product.price > filters.maxPrice) {
      return false;
    }

    // In stock
    if (filters.inStockOnly && !product.inStock) {
      return false;
    }

    // Express Coimbatore
    if (filters.expressOnly && !product.expressCoimbatore) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      case 'featured':
      default:
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    }
  });

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 799;

  return (
    <StoreContext.Provider
      value={{
        products,
        filteredProducts,
        cart,
        wishlist,
        user,
        filters,
        activeProduct,
        isCartOpen,
        isWishlistOpen,
        isAuthOpen,
        isAccountOpen,
        isCheckoutOpen,
        orderSuccess,
        cartCount,
        cartSubtotal,
        freeShippingThreshold,
        storeBank,
        updateStoreBank,
        categories,
        subcategories,
        addCategory,
        removeCategory,
        addSubcategory,
        removeSubcategory,
        resetCategoriesToDefault,
        toggleProductBestSeller,
        heroConfig,
        updateHeroConfig,
        setFilters,
        resetFilters,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isWishlisted,
        login,
        logout,
        saveAddress,
        deleteAddress,
        placeOrder,
        setActiveProduct,
        setIsCartOpen,
        setIsWishlistOpen,
        setIsAuthOpen,
        setIsAccountOpen,
        setIsCheckoutOpen,
        setOrderSuccess,
        allOrders,
        updateOrderStatus,
        deleteOrder,
        pendingCheckoutAfterAuth,
        setPendingCheckoutAfterAuth,
        isStoreManagerOpen,
        setIsStoreManagerOpen,
        addProduct,
        updateProduct,
        updateProductStock,
        updateProductSizeStock,
        deleteProduct,
        resetProductsToDefault,
        syncCatalog,
        setProductsList,
        addManualOrder,
        refreshOrders,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
