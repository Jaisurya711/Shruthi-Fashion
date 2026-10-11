import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, UserProfile, UserOrder, Address, FilterState, StoreBankDetails, HeroConfig } from '../types/store';
import { INITIAL_PRODUCTS, getStoreBankDetails, DEFAULT_STORE_CATEGORIES, DEFAULT_STORE_SUBCATEGORIES, HERO_IMAGE } from '../data/products';
import { sendOrderNotificationEmail } from '../services/notificationService';

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
  deleteProduct: (id: string) => void;
  resetProductsToDefault: () => void;
}

export function normalizeProduct(p: any): Product {
  const images = Array.isArray(p?.images) && p.images.length > 0
    ? p.images
    : (p?.image ? [p.image] : [INITIAL_PRODUCTS[0]?.images[0] || '']);
  const colors = Array.isArray(p?.colors) && p.colors.length > 0
    ? p.colors
    : [{ name: 'Standard', hex: '#842D2D' }];
  const sizes = Array.isArray(p?.sizes) && p.sizes.length > 0
    ? p.sizes
    : ['Standard', 'Free Size'];
  const reviews = Array.isArray(p?.reviews) ? p.reviews : [];

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
    images,
    inStock: p?.inStock !== false,
    stockCount: Number(p?.stockCount) || 10,
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
      return updated;
    });
  };

  const updateStoreBank = (details: StoreBankDetails) => {
    setStoreBank(details);
    try {
      localStorage.setItem('shruthi_custom_bank_details', JSON.stringify(details));
      window.dispatchEvent(new Event('shruthi_bank_updated'));
    } catch (e) {
      console.warn('LocalStorage bank details save failed:', e);
    }
  };

  // Sync products to local storage
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
      if (saved) return JSON.parse(saved);
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
    setProducts(prev => [normalized, ...prev]);
  };

  const updateProduct = (updated: Product) => {
    const normalized = normalizeProduct(updated);
    setProducts(prev => prev.map(p => p.id === normalized.id ? normalized : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const resetProductsToDefault = () => {
    setProducts(INITIAL_PRODUCTS.map(normalizeProduct));
    try {
      localStorage.removeItem('shruthi_fashion_products');
    } catch (e) {
      console.warn(e);
    }
  };

  // User auth operations
  const login = (name: string, phone: string, email?: string) => {
    const finalName = name.trim() || 'Customer';
    const finalPhone = phone.trim() || '+91 99622 78349';
    const finalEmail = email?.trim() || '';

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: finalName,
      email: finalEmail,
      phone: finalPhone,
      addresses: [
        {
          id: `addr-${Date.now()}`,
          fullName: finalName,
          phone: finalPhone,
          street: 'Cross Cut Road',
          area: 'Gandhipuram',
          city: 'Coimbatore',
          pincode: '641012',
          state: 'Tamil Nadu',
          isDefault: true
        }
      ],
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

    clearCart();
    setIsCheckoutOpen(false);
    setOrderSuccess(newOrder);

    // Send order notification email to shruthifashion01@gmail.com
    sendOrderNotificationEmail(newOrder);

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
        pendingCheckoutAfterAuth,
        setPendingCheckoutAfterAuth,
        isStoreManagerOpen,
        setIsStoreManagerOpen,
        addProduct,
        updateProduct,
        deleteProduct,
        resetProductsToDefault,
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
