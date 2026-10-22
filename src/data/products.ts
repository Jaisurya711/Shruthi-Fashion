import { Product } from '../types/store';
import rawStoreCatalog from '../../data/store_catalog.json';

// Image assets
import feedingKurtiImg from '../assets/images/shruthi_feeding_kurti_1791448275230.jpg';
import westernWearImg from '../assets/images/shruthi_western_wear_1791448297281.jpg';
import bottomWearImg from '../assets/images/shruthi_bottom_wear_1791448315562.jpg';
import straightKurtiImg from '../assets/images/product_tussar_silk_kurti_1791446947466.jpg';
import umbrellaKurtiImg from '../assets/images/product_festive_anarkali_suit_1791446931244.jpg';
import grandShawlImg from '../assets/images/product_coimbatore_cotton_saree_1791446904439.jpg';
import heroImg from '../assets/images/hero_coimbatore_boutique_1791446890433.jpg';

export const HERO_IMAGE = heroImg;
export {
  feedingKurtiImg,
  westernWearImg,
  bottomWearImg,
  straightKurtiImg,
  umbrellaKurtiImg,
  grandShawlImg,
  heroImg,
};

export const STORE_BANK_DETAILS = {
  accountHolderName: 'Shruthi Fashion',
  bankName: 'State Bank of India',
  accountNumber: '41982736452',
  ifscCode: 'SBIN0012784',
  branch: 'Kovundampalayam Branch, Coimbatore - 641030',
  accountType: 'Current Account',
  upiId: '9894088349@upi',
  gpayNumber: '9894088349',
  phonePeNumber: '9894088349',
  razorpayKeyId: 'rzp_live_TpGh87ZFgGUGsI',
  razorpayKeySecret: 'NbW6Xt7zLCtJfNcLt4rcm6ld',
  razorpayPaymentPageUrl: 'https://pages.razorpay.com/shruthifashion',
  useRazorpay: true
};

export function getStoreBankDetails() {
  try {
    const saved = localStorage.getItem('shruthi_custom_bank_details');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate or update if previously saved with old test keys or placeholders
      if (
        !parsed.razorpayKeyId ||
        parsed.razorpayKeyId === 'rzp_test_TmbjwATi5Eejog' ||
        parsed.razorpayKeyId === 'rzp_test_Tmzltbt8uaWUPE' ||
        parsed.razorpayKeyId === 'rzp_live_shruthifashion' ||
        parsed.razorpayKeyId === 'rzp_live_TmcCNE03TUNIYQ' ||
        !parsed.razorpayKeySecret ||
        parsed.razorpayKeySecret === 'h2OiBJcNsTNUIWh9Uj0073Y0' ||
        parsed.razorpayKeySecret === 'cB6xF8f2HnkIu7wSt9EWBGHP' ||
        parsed.razorpayKeySecret === 'aPcQhngZB5nJ9Khu7nbUzyCL'
      ) {
        parsed.razorpayKeyId = 'rzp_live_TpGh87ZFgGUGsI';
        parsed.razorpayKeySecret = 'NbW6Xt7zLCtJfNcLt4rcm6ld';
      }
      return { ...STORE_BANK_DETAILS, ...parsed };
    }
  } catch (e) {}
  return STORE_BANK_DETAILS;
}

export const SHOP_INFO = {
  name: 'Shruthi Fashion',
  tagline: "Exclusive Women's Kurtis, Western & Bottom Wear",
  floorLocation: '1st Floor in City Cake Shop',
  landmark: 'Near Balaji Textiles',
  road: 'Edayarpalayam Road',
  locality: 'Kovundampalayam',
  city: 'Coimbatore',
  pincode: '641030',
  fullAddress: '1st Floor in City Cake Shop, Near Balaji Textiles, Edayarpalayam Road, Kovundampalayam, Coimbatore - 641030',
  primaryContact: '9962278349',
  secondaryContact: '9842968349',
  whatsapp: '9894088349',
  whatsappUrl: 'https://wa.me/919894088349?text=Hello%20Shruthi%20Fashion,%20I%20am%20interested%20in%20your%20women%20clothing%20collection',
  instagramHandle: '_shruthifashion_',
  instagramUrl: 'https://instagram.com/_shruthifashion_',
  youtubeHandle: '@shruthifashion01',
  youtubeUrl: 'https://youtube.com/@shruthifashion01',
  openingHours: '10:00 AM – 9:30 PM (All 7 Days)',
};

export const INITIAL_PRODUCTS: Product[] = (Array.isArray(rawStoreCatalog) && rawStoreCatalog.length > 0)
  ? (rawStoreCatalog as any[])
  : [
  // 1. Straight Cut Kurti
  {
    id: 'sf-straight-01',
    title: 'Floral Gold Foil Print Straight Cut Kurti',
    subtitle: 'Classic everyday office & college straight silhouette with side slits',
    price: 549,
    originalPrice: 899,
    category: 'Kurtis',
    subcategory: 'Straight Cut Kurti',
    fabric: 'Pure Viscose Rayon',
    occasion: 'Daily & Office Wear',
    colors: [
      { name: 'Teal Blue', hex: '#0E7490' },
      { name: 'Mustard Yellow', hex: '#D97706' },
      { name: 'Ruby Maroon', hex: '#991B1B' }
    ],
    sizes: ['M', 'L', 'XL', 'XXL', '3XL'],
    inStock: true,
    stockCount: 18,
    isBestSeller: false,
    isNew: false,
    expressCoimbatore: true,
    rating: 4.9,
    reviewCount: 34,
    images: [straightKurtiImg, feedingKurtiImg, straightKurtiImg],
    description: 'Crafted with soft breathable rayon that drapes gracefully without clinging. Features delicate gold-foil geometric borders on the placket and 3/4th sleeves. Pairs effortlessly with ankle fit pants or leggings.',
    fabricDetails: '140 GSM Heavy Rayon with color-fast gold foil printing.',
    careInstructions: 'Gentle machine wash inside out. Do not iron directly on gold foil prints.',
    specialFeatures: 'Side slits with reinforced bar-tack stitching for all-day comfort.',
    reviews: [
      {
        id: 'rev-sf-1',
        userName: 'Pavithra M.',
        rating: 5,
        date: '2 days ago',
        city: 'Kovundampalayam, Coimbatore',
        comment: 'Directly bought this from their 1st floor shop above City Cake shop! The fit is perfect and fabric is so soft.',
        verifiedBuyer: true
      }
    ]
  },

  // 2. Short Kurtis
  {
    id: 'sf-short-02',
    title: 'Cotton Peplum Short Kurti / Tunic',
    subtitle: 'Trendy hip-length short kurti designed to pair with jeans & cigarette pants',
    price: 449,
    originalPrice: 699,
    category: 'Kurtis',
    subcategory: 'Short Kurtis',
    fabric: '100% Breathable Combed Cotton',
    occasion: 'College & Casual Outings',
    colors: [
      { name: 'Blush Pink', hex: '#F472B6' },
      { name: 'Indigo White', hex: '#1E3A8A' },
      { name: 'Olive Green', hex: '#65A30D' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    inStock: true,
    stockCount: 15,
    isBestSeller: false,
    isNew: true,
    expressCoimbatore: true,
    rating: 4.8,
    reviewCount: 28,
    images: [straightKurtiImg, westernWearImg, straightKurtiImg],
    description: 'A contemporary college and daily-wear essential. Hip-length peplum silhouette with gentle gathered waist and mandarin V-notch neckline. Looks super chic over blue denim jeans or ankle pants.',
    fabricDetails: '100% Pure Pre-shrunk Coimbatore mill cotton.',
    careInstructions: 'Normal hand or machine wash. Line dry in shade.',
    specialFeatures: 'Gathered waist flare, stylish wooden buttons on front yoke.',
    reviews: [
      {
        id: 'rev-sf-2',
        userName: 'Harini Sundar',
        rating: 5,
        date: '1 week ago',
        city: 'Edayarpalayam, Coimbatore',
        comment: 'My go-to short kurti for daily college wear! Shrink-proof and comfortable even in hot sun.',
        verifiedBuyer: true
      }
    ]
  },

  // 3. Umbrella Kurti
  {
    id: 'sf-umbrella-03',
    title: 'Flared Tiered Umbrella Kurti with Dori Tassels',
    subtitle: 'Full 3.5-meter umbrella ghera flare with gold gotta lace detailing',
    price: 799,
    originalPrice: 1299,
    category: 'Kurtis',
    subcategory: 'Umbrella Kurti',
    fabric: 'Soft Flowy Georgette & Crepe',
    occasion: 'Festive & Family Functions',
    colors: [
      { name: 'Emerald Green', hex: '#047857' },
      { name: 'Wine Plum', hex: '#701A75' },
      { name: 'Royal Navy', hex: '#1E3A8A' }
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    inStock: true,
    stockCount: 12,
    isBestSeller: false,
    isNew: true,
    expressCoimbatore: true,
    rating: 4.9,
    reviewCount: 41,
    images: [umbrellaKurtiImg, feedingKurtiImg, umbrellaKurtiImg],
    description: 'Turn heads with a grand twirl! Our bestselling umbrella kurti features a voluminous 3-tier circular flare with gold gota border, sweetheart neck, and adjustable side tie-up dori with handcrafted latkan tassels.',
    fabricDetails: 'Flowing micro-georgette with full inner crepe lining up to hem.',
    careInstructions: 'Gentle wash in cold water. Low heat iron.',
    specialFeatures: 'Wide 3.5-meter circular umbrella flare with adjustable waist dori.',
    reviews: [
      {
        id: 'rev-sf-3',
        userName: 'Sangeetha R.',
        rating: 5,
        date: '4 days ago',
        city: 'Kovundampalayam, Coimbatore',
        comment: 'The flare on this umbrella kurti is enormous! Wore it for a temple function and got so many inquiries.',
        verifiedBuyer: true
      }
    ]
  },

  // 4. Feeding Kurti (Maternity / Nursing)
  {
    id: 'sf-feeding-04',
    title: 'Maternity Feeding Kurti with Dual Concealed Zippers',
    subtitle: 'Ultra-soft cotton maternity kurti with 2 invisible vertical nursing zippers',
    price: 649,
    originalPrice: 999,
    category: 'Kurtis',
    subcategory: 'Feeding Kurti',
    fabric: 'Super-Soft Breathable Bio-Washed Cotton',
    occasion: 'Maternity, Nursing & Daily Comfort',
    colors: [
      { name: 'Pastel Peach', hex: '#FDBA74' },
      { name: 'Mint Sage', hex: '#86EFAC' },
      { name: 'Sky Blue', hex: '#7DD3FC' }
    ],
    sizes: ['M', 'L', 'XL', 'XXL', '3XL'],
    inStock: true,
    stockCount: 22,
    isBestSeller: false,
    isNew: true,
    expressCoimbatore: true,
    rating: 5.0,
    reviewCount: 52,
    images: [feedingKurtiImg, straightKurtiImg, feedingKurtiImg],
    description: 'Thoughtfully designed for new and expecting mothers in Coimbatore. Features two concealed smooth vertical zippers cleverly camouflaged under the front pleats. Allows discrete, easy feeding while looking completely like a stylish kurti.',
    fabricDetails: '100% Bio-washed baby-safe cotton, anti-allergic and irritation-free.',
    careInstructions: 'Machine washable, gentle spin. Zippers are rust-proof and concealed.',
    specialFeatures: 'Dual 11-inch invisible nursing zippers + adjustable back tie-up for pre/post-pregnancy fit.',
    reviews: [
      {
        id: 'rev-sf-4',
        userName: 'Dr. Keerthana Mohan',
        rating: 5,
        date: 'Yesterday',
        city: 'Thudiyalur / Kovundampalayam, Coimbatore',
        comment: 'Absolute lifesaver for nursing mothers! Nobody can even tell there are zippers. Softest cotton ever.',
        verifiedBuyer: true
      }
    ]
  },

  // 5. Western Wear
  {
    id: 'sf-western-05',
    title: 'Floral Tiered Western A-Line Dress / Tunic',
    subtitle: 'Chic modern western wear with smocked cuffs and waist belt',
    price: 749,
    originalPrice: 1199,
    category: 'Western Wear',
    subcategory: 'Western Wear',
    fabric: 'Korean Chiffon / Rayon Blend',
    occasion: 'Brunch, Travel & Weekend Outings',
    colors: [
      { name: 'Dusty Rose', hex: '#E11D48' },
      { name: 'Lavender Floral', hex: '#A855F7' },
      { name: 'Classic Black', hex: '#18181B' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    stockCount: 14,
    isBestSeller: false,
    isNew: true,
    expressCoimbatore: true,
    rating: 4.8,
    reviewCount: 19,
    images: [westernWearImg, umbrellaKurtiImg, westernWearImg],
    description: 'Elevate your wardrobe with modern silhouettes. This floral western dress comes with soft puff sleeves, elasticated smocked detailing, and an attached matching fabric belt for an hourglass outline.',
    fabricDetails: 'Breathable imported chiffon with skin-friendly cotton lining.',
    careInstructions: 'Hand wash or gentle cycle. Do not wring.',
    specialFeatures: 'Smocked waist elasticity, modest midi length suitable for all occasions.',
    reviews: [
      {
        id: 'rev-sf-5',
        userName: 'Ananya S.',
        rating: 5,
        date: '5 days ago',
        city: 'RS Puram, Coimbatore',
        comment: 'Very trendy! The western collection at Shruthi Fashion is unexpectedly great and pocket-friendly.',
        verifiedBuyer: true
      }
    ]
  },

  // 6. Bottom Wear - Jeans
  {
    id: 'sf-jeans-06',
    title: 'High-Waist 4-Way Stretch Denim Jeans',
    subtitle: 'Comfort-fit ankle length stretch jeans for kurtis & western tops',
    price: 899,
    originalPrice: 1499,
    category: 'Bottom Wear',
    subcategory: 'Jeans',
    fabric: 'Premium Stretch Cotton Denim (98% Cotton, 2% Spandex)',
    occasion: 'Everyday Wear',
    colors: [
      { name: 'Deep Indigo Blue', hex: '#1E3A8A' },
      { name: 'Washed Ice Blue', hex: '#60A5FA' },
      { name: 'Midnight Black', hex: '#171717' }
    ],
    sizes: ['28', '30', '32', '34', '36', '38'],
    inStock: true,
    stockCount: 20,
    isBestSeller: false,
    isNew: false,
    expressCoimbatore: true,
    rating: 4.9,
    reviewCount: 38,
    images: [bottomWearImg, westernWearImg, bottomWearImg],
    description: 'The holy grail of stretch jeans! Designed with a high-rise comfort waistband that doesn’t gap at the back. Pairs perfectly with short kurtis, tunics, and t-shirts for college and work.',
    fabricDetails: '11.5 Oz Stretch Denim with shape-recovery memory fabric.',
    careInstructions: 'Wash inside out with similar dark shades. Avoid bleach.',
    specialFeatures: 'High-rise tummy smoothing waistband with 5 functional deep pockets.',
    reviews: [
      {
        id: 'rev-sf-6',
        userName: 'Lavanya Krishnan',
        rating: 5,
        date: '1 week ago',
        city: 'Kovundampalayam, Coimbatore',
        comment: 'So stretchy and easy to bend or sit all day at work. Perfect fit around the ankle.',
        verifiedBuyer: true
      }
    ]
  },

  // 7. Bottom Wear - Leggings
  {
    id: 'sf-leggings-07',
    title: '4-Way Cotton Lycra Churidar / Ankle Leggings',
    subtitle: 'Ultra-stretch super combed cotton leggings with anti-pilling bio-wash',
    price: 299,
    originalPrice: 499,
    category: 'Bottom Wear',
    subcategory: 'Leggings',
    fabric: '95% Combed Cotton, 5% Spandex (4-Way Lycra)',
    occasion: 'Daily Ethnic Matching',
    colors: [
      { name: 'Jet Black', hex: '#0A0A0A' },
      { name: 'Pure White', hex: '#F5F5F5' },
      { name: 'Royal Maroon', hex: '#881337' },
      { name: 'Mustard Gold', hex: '#CA8A04' }
    ],
    sizes: ['Free Size (Fits 28-36)', 'Plus Size (Fits 36-44)'],
    inStock: true,
    stockCount: 45,
    isBestSeller: false,
    isNew: false,
    expressCoimbatore: true,
    rating: 4.8,
    reviewCount: 62,
    images: [bottomWearImg, straightKurtiImg, bottomWearImg],
    description: 'Our top-rated everyday basic. Soft seamless waistband that leaves no marks on the skin. Guaranteed non-see-through opacity and zero lint/bobbling even after 50 washes.',
    fabricDetails: '190 GSM 4-Way stretch combed cotton lycra with Bio-Polish.',
    careInstructions: 'Machine washable. No fading or shrinking.',
    specialFeatures: 'Ultra-soft 4-way stretch that moves with you; broad elastic waist band.',
    reviews: [
      {
        id: 'rev-sf-7',
        userName: 'Gowri Balaji',
        rating: 5,
        date: '3 days ago',
        city: 'Near Balaji Textiles, Kovundampalayam',
        comment: 'Bought 3 colors together from the shop! Excellent quality cloth, completely opaque and stretchable.',
        verifiedBuyer: true
      }
    ]
  },

  // 8. Bottom Wear - Ankle Fit Pants
  {
    id: 'sf-anklefit-08',
    title: 'Cotton Flex Ankle-Fit Cigarette Trousers',
    subtitle: 'Formal and smart casual tailored pants with side pocket & ankle slit',
    price: 399,
    originalPrice: 650,
    category: 'Bottom Wear',
    subcategory: 'Ankle Fit',
    fabric: 'Cotton Flex with Mild Stretch',
    occasion: 'Office, College & Casual Ethnic',
    colors: [
      { name: 'Off-White Ivory', hex: '#F7F7F7' },
      { name: 'Beige Camel', hex: '#D4B996' },
      { name: 'Charcoal Grey', hex: '#374151' }
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    inStock: true,
    stockCount: 25,
    isBestSeller: false,
    isNew: true,
    expressCoimbatore: true,
    rating: 4.9,
    reviewCount: 29,
    images: [bottomWearImg, straightKurtiImg, bottomWearImg],
    description: 'A stylish upgrade over regular leggings. These cigarette pants feature a clean flat front, elasticated back for snug ease, side pocket for your phone, and a chic mini slit at the ankle hem.',
    fabricDetails: 'Cotton Flex fabric with breathable weave and mild stretch.',
    careInstructions: 'Normal wash. Warm iron for sharp crease.',
    specialFeatures: 'One side deep mobile pocket + ankle hem side notch.',
    reviews: [
      {
        id: 'rev-sf-8',
        userName: 'Swathi N.',
        rating: 5,
        date: '2 weeks ago',
        city: 'Kovundampalayam, Coimbatore',
        comment: 'So smart for office with straight kurtis. The side pocket fits a large phone easily!',
        verifiedBuyer: true
      }
    ]
  },

  // 9. Bottom Wear - Shimmer Pants
  {
    id: 'sf-shimmer-09',
    title: 'Festive Shimmer Lycra Ankle Pants',
    subtitle: 'Glamorous golden & metallic shimmer stretch pants for grand celebrations',
    price: 499,
    originalPrice: 799,
    category: 'Bottom Wear',
    subcategory: 'Shimmer',
    fabric: 'Metallic Lurex Poly-Spandex Blend',
    occasion: 'Festivals, Weddings & Parties',
    colors: [
      { name: 'Antique Gold', hex: '#D4AF37' },
      { name: 'Silver Shimmer', hex: '#E5E7EB' },
      { name: 'Rose Gold', hex: '#FB7185' }
    ],
    sizes: ['Free Size (Fits 28-36)', 'Plus Size (Fits 38-44)'],
    inStock: true,
    stockCount: 16,
    isBestSeller: false,
    isNew: true,
    expressCoimbatore: true,
    rating: 4.8,
    reviewCount: 17,
    images: [bottomWearImg, umbrellaKurtiImg, bottomWearImg],
    description: 'Add instant festive sparkle to any kurti or anarkali. Woven with fine micro-shimmer yarns that will not peel or drop glitter. Smooth inner lining ensures it is 100% itch-free and soft against sensitive skin.',
    fabricDetails: 'Poly-lycra with woven micro-lurex metallic sheen, soft brushed interior.',
    careInstructions: 'Hand wash gentle in cold water. Do not scrub or bleach.',
    specialFeatures: 'Non-shedding woven shimmer with ultra-soft inner lining.',
    reviews: [
      {
        id: 'rev-sf-9',
        userName: 'Divya Ramesh',
        rating: 5,
        date: '1 week ago',
        city: 'Saibaba Colony, Coimbatore',
        comment: 'Doesn’t itch at all! The antique gold shade matches almost all my festive kurtis.',
        verifiedBuyer: true
      }
    ]
  },

  // 10. Bottom Wear - Palazzo
  {
    id: 'sf-palazzo-10',
    title: 'Wide Flare Rayon Printed Palazzo Pants',
    subtitle: 'Breezy wide-leg palazzo with ethnic gold foil boota motifs',
    price: 449,
    originalPrice: 699,
    category: 'Bottom Wear',
    subcategory: 'Palazzo',
    fabric: 'Heavy 140 GSM Rayon',
    occasion: 'Daily & Festive Comfort',
    colors: [
      { name: 'Cream Gold Print', hex: '#FEF3C7' },
      { name: 'Black Golden Print', hex: '#1C1917' },
      { name: 'Maroon Gold', hex: '#7F1D1D' }
    ],
    sizes: ['Free Size (Waist 28-38)', 'XXL (Waist 38-44)'],
    inStock: true,
    stockCount: 19,
    isBestSeller: false,
    isNew: false,
    expressCoimbatore: true,
    rating: 4.9,
    reviewCount: 32,
    images: [bottomWearImg, straightKurtiImg, bottomWearImg],
    description: 'Enjoy unbeatable flow and airy breathability in Coimbatore weather. Wide bell flare with elasticated drawstring waist. Complements straight cut kurtis to create an instant kurti-palazzo set.',
    fabricDetails: 'Heavy viscose rayon with fluid fall and durable prints.',
    careInstructions: 'Gentle wash. Avoid direct sunlight drying.',
    specialFeatures: 'Full elastic waistband with drawstring tie-up and flared 28-inch leg opening.',
    reviews: [
      {
        id: 'rev-sf-10',
        userName: 'Meena K.',
        rating: 5,
        date: '3 weeks ago',
        city: 'Kovundampalayam, Coimbatore',
        comment: 'So airy and comfortable for daily wear. Quality is superb for ₹449!',
        verifiedBuyer: true
      }
    ]
  },

  // 11. Shawl - Regular Shawl
  {
    id: 'sf-shawl-reg-11',
    title: 'Soft Cotton Mulmul Daily Shawl / Dupatta (2.25m)',
    subtitle: 'Lightweight floral block print daily dupatta with tassel borders',
    price: 299,
    originalPrice: 499,
    category: 'Shawls & Dupattas',
    subcategory: 'Regular Shawl',
    fabric: '100% Superfine Cotton Mulmul',
    occasion: 'Daily Wear & Office',
    colors: [
      { name: 'Indigo Multi', hex: '#1E40AF' },
      { name: 'Dusty Rose Peach', hex: '#FB7185' },
      { name: 'Turmeric Yellow', hex: '#EAB308' }
    ],
    sizes: ['Standard 2.25 Meters (Length) x 36" (Width)'],
    inStock: true,
    stockCount: 30,
    isBestSeller: false,
    isNew: false,
    expressCoimbatore: true,
    rating: 4.7,
    reviewCount: 23,
    images: [grandShawlImg, straightKurtiImg, grandShawlImg],
    description: 'Cloud-soft mulmul cotton dupatta designed for everyday comfort in Coimbatore. Breathable, sweat-absorbent, and light enough to wear all day without feeling bulky.',
    fabricDetails: '100% Combed Mulmul Cotton with hand block floral prints.',
    careInstructions: 'Hand wash with mild detergent.',
    specialFeatures: 'Finished with pom-pom and thread tassels on both ends.',
    reviews: [
      {
        id: 'rev-sf-11',
        userName: 'Sujatha P.',
        rating: 5,
        date: '4 days ago',
        city: 'Edayarpalayam Road, Coimbatore',
        comment: 'Very soft mulmul cotton shawl. Holds pleats easily on shoulder.',
        verifiedBuyer: true
      }
    ]
  },

  // 12. Shawl - Grand Shawl
  {
    id: 'sf-shawl-grand-12',
    title: 'Banarasi Brocade Jacquard Grand Silk Shawl',
    subtitle: 'Heavy bridal & festive dupatta with antique golden zari jaal weave',
    price: 699,
    originalPrice: 1199,
    category: 'Shawls & Dupattas',
    subcategory: 'Grand Shawls',
    fabric: 'Art Silk Brocade with Zari',
    occasion: 'Weddings, Engagements & Grand Festivities',
    colors: [
      { name: 'Deep Crimson Red', hex: '#991B1B' },
      { name: 'Royal Peacock Green', hex: '#065F46' },
      { name: 'Golden Champagne', hex: '#CA8A04' }
    ],
    sizes: ['Standard 2.35 Meters (Length) x 40" (Width)'],
    inStock: true,
    stockCount: 12,
    isBestSeller: false,
    isNew: true,
    expressCoimbatore: true,
    rating: 5.0,
    reviewCount: 37,
    images: [grandShawlImg, umbrellaKurtiImg, grandShawlImg],
    description: 'Transform any simple kurti or anarkali into a wedding statement piece! Woven with all-over intricate floral zari jaal and broad border with handcrafted latkan hangings. Rich luster and luxurious weight.',
    fabricDetails: 'Banarasi jacquard woven art silk with tested gold zari threads.',
    careInstructions: 'Dry clean recommended to preserve zari luster.',
    specialFeatures: 'Four-sided heavy zari border with braided golden latkan tassels.',
    reviews: [
      {
        id: 'rev-sf-12',
        userName: 'Karpagam Senthil',
        rating: 5,
        date: '1 week ago',
        city: 'Kovundampalayam, Coimbatore',
        comment: 'Looks like a ₹2,000 dupatta from big shops! Shruthi Fashion offers such genuine prices.',
        verifiedBuyer: true
      }
    ]
  }
];

export const DEFAULT_STORE_CATEGORIES = [
  'Kurtis',
  'Western Wear',
  'Bottom Wear',
  'Shawls & Dupattas'
];

export const DEFAULT_STORE_SUBCATEGORIES = [
  'Short Kurtis',
  'Straight Cut Kurti',
  'Umbrella Kurti',
  'Feeding Kurti',
  'Western Wear',
  'Jeans',
  'Leggings',
  'Ankle Fit',
  'Shimmer',
  'Palazzo',
  'Regular Shawl',
  'Grand Shawls'
];

export const CATEGORIES = [
  'All Collections',
  'Kurtis',
  'Western Wear',
  'Bottom Wear',
  'Shawls & Dupattas'
] as const;

export const SUBCATEGORIES = [
  'All Styles',
  'Short Kurtis',
  'Straight Cut Kurti',
  'Umbrella Kurti',
  'Feeding Kurti',
  'Western Wear',
  'Jeans',
  'Leggings',
  'Ankle Fit',
  'Shimmer',
  'Palazzo',
  'Regular Shawl',
  'Grand Shawls'
] as const;

export const FABRICS = [
  'All Fabrics',
  'Pure Viscose Rayon',
  '100% Breathable Combed Cotton',
  'Soft Flowy Georgette & Crepe',
  'Bio-Washed Cotton',
  'Premium Stretch Cotton Denim',
  '4-Way Lycra',
  'Cotton Flex',
  'Metallic Lurex',
  'Art Silk Brocade'
] as const;

export const OCCASIONS = [
  'All Occasions',
  'Daily & Office Wear',
  'College & Casual Outings',
  'Festive & Family Functions',
  'Maternity, Nursing & Daily Comfort',
  'Weddings, Engagements & Grand Festivities'
] as const;
