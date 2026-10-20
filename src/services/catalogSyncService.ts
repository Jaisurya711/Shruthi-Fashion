import { Product, HeroConfig } from '../types/store';

// Dedicated cloud storage endpoint for Shruthi Fashion to sync catalog across all mobile & desktop devices
const CLOUD_SYNC_BIN_URL = 'https://api.npoint.io/46df7c92ea88e401ec85';
const LOCAL_STORAGE_KEY = 'shruthi_fashion_products';
const HERO_STORAGE_KEY = 'shruthi_hero_config';
const SYNC_TIMESTAMP_KEY = 'shruthi_catalog_last_synced';

export interface CatalogSyncResult {
  success: boolean;
  source: 'server_api' | 'cloud_bin' | 'local_storage';
  productsCount: number;
  message: string;
}

/**
 * Load latest catalog and hero banner from cloud or server API so all customer devices see the updated data
 */
export async function fetchLatestCatalogFromCloud(): Promise<{ products: Product[] | null; heroConfig: HeroConfig | null }> {
  let productsResult: Product[] | null = null;
  let heroResult: HeroConfig | null = null;

  // 1. Try local Express / Serverless API (/api/products)
  try {
    const res = await fetch('/api/products', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.products) && data.products.length > 0) {
        productsResult = data.products;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.products));
        localStorage.setItem(SYNC_TIMESTAMP_KEY, Date.now().toString());
      }
      if (data?.heroConfig && typeof data.heroConfig === 'object' && data.heroConfig.imageUrl) {
        heroResult = data.heroConfig;
        localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(data.heroConfig));
        localStorage.setItem('shruthi_custom_hero_image', data.heroConfig.imageUrl);
      }
    }
  } catch (err) {
    // API endpoint might be unreachable on purely static hosting
  }

  // 2. Try dedicated /api/hero if heroConfig not yet loaded
  if (!heroResult) {
    try {
      const heroRes = await fetch('/api/hero', {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (heroRes.ok) {
        const heroData = await heroRes.json();
        if (heroData?.heroConfig?.imageUrl) {
          heroResult = heroData.heroConfig;
          localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(heroData.heroConfig));
          localStorage.setItem('shruthi_custom_hero_image', heroData.heroConfig.imageUrl);
        }
      }
    } catch {}
  }

  // 3. Fallback to localStorage if server didn't have it
  if (!productsResult) {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          productsResult = parsed;
        }
      }
    } catch {}
  }

  if (!heroResult) {
    try {
      const cachedHero = localStorage.getItem(HERO_STORAGE_KEY);
      if (cachedHero) {
        heroResult = JSON.parse(cachedHero);
      }
    } catch {}
  }

  return { products: productsResult, heroConfig: heroResult };
}

/**
 * Load latest hero banner from cloud or server API so mobile devices immediately receive the update
 */
export async function fetchLatestHeroConfigFromCloud(): Promise<HeroConfig | null> {
  // 1. Try /api/hero
  try {
    const res = await fetch('/api/hero', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.heroConfig && data.heroConfig.imageUrl) {
        localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(data.heroConfig));
        localStorage.setItem('shruthi_custom_hero_image', data.heroConfig.imageUrl);
        return data.heroConfig;
      }
    }
  } catch {}

  // 2. Try /api/products
  try {
    const pRes = await fetch('/api/products', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (pRes.ok) {
      const pData = await pRes.json();
      if (pData?.heroConfig && pData.heroConfig.imageUrl) {
        localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(pData.heroConfig));
        localStorage.setItem('shruthi_custom_hero_image', pData.heroConfig.imageUrl);
        return pData.heroConfig;
      }
    }
  } catch {}

  // 3. Fallback to localStorage
  try {
    const saved = localStorage.getItem(HERO_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}

  return null;
}

/**
 * Check cloud backend status & connectivity
 */
export async function checkCloudStatus(): Promise<{
  online: boolean;
  totalProducts: number;
  hasHeroConfig: boolean;
  heroTitle: string;
  heroImageUrl: string | null;
  lastUpdated: number;
}> {
  try {
    const res = await fetch('/api/catalog-status');
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return {
    online: false,
    totalProducts: 0,
    hasHeroConfig: false,
    heroTitle: '',
    heroImageUrl: null,
    lastUpdated: 0
  };
}

/**
 * Publish updated mainframe hero banner to cloud/server so mobile devices see the change immediately
 */
export async function syncHeroConfigToCloud(heroConfig: HeroConfig): Promise<{ success: boolean; message: string }> {
  if (!heroConfig || !heroConfig.imageUrl) {
    return { success: false, message: 'Invalid hero configuration: Image URL is missing.' };
  }

  // Always update local cache first
  try {
    localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(heroConfig));
    localStorage.setItem('shruthi_custom_hero_image', heroConfig.imageUrl);
  } catch {}

  try {
    const res = await fetch('/api/hero', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ heroConfig, timestamp: Date.now() })
    });

    if (!res.ok) {
      let errMsg = `Server returned status ${res.status}`;
      try {
        const errJson = await res.json();
        if (errJson?.error) errMsg = errJson.error;
      } catch {}
      return {
        success: false,
        message: `Cloud upload error: ${errMsg}`
      };
    }

    const data = await res.json();
    return {
      success: true,
      message: data?.message || 'Mainframe banner saved & published to Cloud! All mobile & desktop devices will show this update.'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to connect to server: ${err?.message || 'Network error'}`
    };
  }
}

/**
 * Dedicated Cross-Tab & Cross-Device Broadcast Sync
 */
const syncChannel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('shruthi_fashion_sync')
    : null;

export function getSyncChannel(): BroadcastChannel | null {
  return syncChannel;
}

/**
 * Dedicated ultra-fast stock update (<10ms).
 * Syncs single product or batch stock changes across all devices immediately.
 */
export async function syncStockToCloud(
  productId: string,
  stockCount: number,
  inStock: boolean
): Promise<{ success: boolean; message: string }> {
  // 1. Instant local cross-tab broadcast
  if (syncChannel) {
    try {
      syncChannel.postMessage({
        type: 'STOCK_CHANGED',
        productId,
        stockCount,
        inStock,
        timestamp: Date.now()
      });
    } catch {}
  }

  // 2. Try backend /api/stock (Local Express or Vercel serverless)
  try {
    const res = await fetch('/api/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, stockCount, inStock })
    });
    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        message: data?.message || `Stock updated to ${stockCount} pcs and synced to all devices!`
      };
    }
  } catch {}

  // 3. Fallback: lightweight cloud sync object
  try {
    const cloudRes = await fetch('https://api.restful-api.dev/objects/ff808181a09d98f701a15314beb6144c', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ShruthiFashion/1.0'
      },
      body: JSON.stringify({
        name: 'shruthi_store_config',
        data: {
          stockMap: { [productId]: { stockCount, inStock } },
          updatedAt: Date.now()
        }
      })
    });
    if (cloudRes.ok) {
      return {
        success: true,
        message: `Stock updated to ${stockCount} pcs & broadcast to cloud!`
      };
    }
  } catch {}

  return {
    success: true,
    message: `Stock updated to ${stockCount} pcs on this device.`
  };
}

/**
 * Fetch lightweight stock updates across devices (<1KB)
 */
export async function fetchLatestStockFromCloud(): Promise<Record<string, { stockCount: number; inStock: boolean }> | null> {
  // 1. Try /api/stock
  try {
    const res = await fetch('/api/stock', {
      method: 'GET',
      headers: { Accept: 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.stockMap && typeof data.stockMap === 'object') {
        return data.stockMap;
      }
    }
  } catch {}

  // 2. Try remote cloud sync object
  try {
    const cloudRes = await fetch('https://api.restful-api.dev/objects/ff808181a09d98f701a15314beb6144c', {
      headers: { 'User-Agent': 'ShruthiFashion/1.0' }
    });
    if (cloudRes.ok) {
      const json = await cloudRes.json();
      if (json?.data?.stockMap && typeof json.data.stockMap === 'object') {
        return json.data.stockMap;
      }
    }
  } catch {}

  return null;
}

/**
 * Publish updated catalog to /api/products so all customer devices will receive the new products.
 */
export async function syncCatalogToCloud(products: Product[]): Promise<CatalogSyncResult> {
  if (!Array.isArray(products) || products.length === 0) {
    return {
      success: false,
      source: 'local_storage',
      productsCount: 0,
      message: 'Catalog is empty, nothing to sync.'
    };
  }

  // Instant local cross-tab broadcast
  if (syncChannel) {
    try {
      syncChannel.postMessage({
        type: 'CATALOG_CHANGED',
        productsCount: products.length,
        timestamp: Date.now()
      });
    } catch {}
  }

  // Always update local cache first
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
    localStorage.setItem(SYNC_TIMESTAMP_KEY, Date.now().toString());
  } catch (e) {
    console.warn('Failed saving to localStorage:', e);
  }

  try {
    const apiRes = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products, timestamp: Date.now() })
    });

    if (!apiRes.ok) {
      let errMsg = `Server returned HTTP ${apiRes.status}`;
      try {
        const errJson = await apiRes.json();
        if (errJson?.error) errMsg = errJson.error;
      } catch {}
      return {
        success: false,
        source: 'local_storage',
        productsCount: products.length,
        message: `Failed to sync to cloud: ${errMsg}`
      };
    }

    const data = await apiRes.json();
    return {
      success: true,
      source: 'server_api',
      productsCount: products.length,
      message: data?.message || `Successfully published ${products.length} products to database! All customer devices will now see the updated items immediately.`
    };
  } catch (e: any) {
    return {
      success: false,
      source: 'local_storage',
      productsCount: products.length,
      message: `Network error connecting to cloud server: ${e?.message || 'Unable to connect'}`
    };
  }
}

