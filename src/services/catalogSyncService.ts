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
 * Publish updated mainframe hero banner to cloud/server so mobile devices see the change immediately
 */
export async function syncHeroConfigToCloud(heroConfig: HeroConfig): Promise<{ success: boolean; message: string }> {
  if (!heroConfig || !heroConfig.imageUrl) {
    return { success: false, message: 'Invalid hero configuration' };
  }

  // Always update local cache first
  try {
    localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(heroConfig));
    localStorage.setItem('shruthi_custom_hero_image', heroConfig.imageUrl);
  } catch {}

  let synced = false;

  // 1. Send to /api/hero
  try {
    const res = await fetch('/api/hero', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ heroConfig, timestamp: Date.now() })
    });
    if (res.ok) synced = true;
  } catch {}

  // 2. Also send to /api/products
  try {
    const res2 = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ heroConfig, timestamp: Date.now() })
    });
    if (res2.ok) synced = true;
  } catch {}

  return {
    success: true,
    message: synced
      ? 'Mainframe banner published to Cloud! All mobile & desktop devices will now see this banner.'
      : 'Mainframe banner saved locally on this device.'
  };
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

  // Always update local cache first
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
    localStorage.setItem(SYNC_TIMESTAMP_KEY, Date.now().toString());
  } catch (e) {
    console.warn('Failed saving to localStorage:', e);
  }

  let serverSuccess = false;

  // 1. Send to backend /api/products
  try {
    const apiRes = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products, timestamp: Date.now() })
    });
    if (apiRes.ok) {
      serverSuccess = true;
    }
  } catch (e) {}

  return {
    success: true,
    source: serverSuccess ? 'server_api' : 'local_storage',
    productsCount: products.length,
    message: serverSuccess
      ? `Successfully published ${products.length} products to cloud! All customer devices will now see the new items.`
      : `Saved ${products.length} products locally on this device.`
  };
}
