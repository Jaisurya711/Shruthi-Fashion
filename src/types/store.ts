export interface ProductReview {
  id: string;
  userName: string;
  rating: number;
  date: string;
  city: string;
  comment: string;
  verifiedBuyer: boolean;
}

export interface Product {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  originalPrice: number;
  category: string;
  subcategory: string;
  fabric: string;
  occasion: string;
  colors: { name: string; hex: string }[];
  sizes: string[];
  inStock: boolean;
  stockCount: number;
  isBestSeller?: boolean;
  isNew?: boolean;
  expressCoimbatore: boolean; // Fast delivery in Kovundampalayam & Coimbatore 641xxx
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
  fabricDetails: string;
  careInstructions: string;
  specialFeatures?: string; // e.g. "Concealed Dual Feeding Zips", "4-Way High-Stretch Lycra", etc.
  reviews: ProductReview[];
}

export interface HeroConfig {
  imageUrl: string;
  title: string;
  subtitle: string;
  badge: string;
}

export interface CartItem {
  id: string; // unique item id (product.id + size + color)
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  customTailoringNotes?: string;
  includeFallPico?: boolean;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  area: string;
  city: string;
  pincode: string;
  state: string;
  isDefault?: boolean;
}

export interface UserOrder {
  id: string;
  orderNumber: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  address: Address;
  paymentMethod: 'Razorpay' | 'UPI' | 'BankTransfer' | 'Card' | 'COD' | 'StorePickup';
  paymentDetails?: {
    upiId?: string;
    cardLast4?: string;
    bankName?: string;
    utrNumber?: string;
    accountNumber?: string;
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
    razorpaySignature?: string;
  };
  deliveryStatus: 'Order Placed' | 'Weaving & Tailoring' | 'Dispatched from Coimbatore' | 'Out for Delivery' | 'Delivered';
  trackingNumber: string;
  estimatedDelivery: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
  orderHistory: UserOrder[];
  wishlistIds: string[];
}

export interface FilterState {
  search: string;
  category: string;
  subcategory: string;
  fabric: string;
  occasion: string;
  minPrice: number;
  maxPrice: number;
  size: string;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
  inStockOnly: boolean;
  expressOnly: boolean;
}

export interface StoreBankDetails {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  accountType: string;
  upiId: string;
  gpayNumber: string;
  phonePeNumber: string;
  razorpayKeyId?: string;
  razorpayPaymentPageUrl?: string;
  useRazorpay?: boolean;
}
