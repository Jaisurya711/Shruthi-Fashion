import { Product, HeroConfig } from '../types/store';

const LOCAL_STORAGE_KEY = 'shruthi_fashion_products';
const HERO_STORAGE_KEY = 'shruthi_hero_config';
const SYNC_TIMESTAMP_KEY = 'shruthi_catalog_last_synced';

export interface CatalogSyncResult {
  success: boolean;
  source: 'server_api' | 'cloud_bin' | 'local_storage';
  productsCount: number;
  message: string;
}

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

export async function fetchLatestCatalogFromCloud(): Promise<{ products: Product[] | null; heroConfig: HeroConfig | null }> {
  let productsResult: Product[] | null = null;
  let heroResult: HeroConfig | null = null;

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
  } catch (err) {}

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

  return { products: productsResult, heroConfig: heroResult };
}

export async function syncHeroConfigToCloud(heroConfig: HeroConfig): Promise<{ success: boolean; message: string }> {
  if (!heroConfig || !heroConfig.imageUrl) {
    return { success: false, message: 'Invalid hero configuration: Image URL is missing.' };
  }

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
      return { success: false, message: `Cloud upload error: ${errMsg}` };
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

export async function syncCatalogToCloud(products: Product[]): Promise<CatalogSyncResult> {
  if (!Array.isArray(products) || products.length === 0) {
    return {
      success: false,
      source: 'local_storage',
      productsCount: 0,
      message: 'Catalog is empty, nothing to sync.'
    };
  }

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
      message: data?.message || `Successfully published ${products.length} products to cloud! All customer devices will now see the new items.`
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