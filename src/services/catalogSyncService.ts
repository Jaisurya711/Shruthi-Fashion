import { Product } from '../types/store';

// Dedicated cloud storage endpoint for Shruthi Fashion to sync catalog across all mobile & desktop devices
const CLOUD_SYNC_BIN_URL = 'https://api.npoint.io/46df7c92ea88e401ec85';
const LOCAL_STORAGE_KEY = 'shruthi_fashion_products';
const SYNC_TIMESTAMP_KEY = 'shruthi_catalog_last_synced';

export interface CatalogSyncResult {
  success: boolean;
  source: 'server_api' | 'cloud_bin' | 'local_storage';
  productsCount: number;
  message: string;
}

/**
 * Load latest catalog from cloud or server API so all customer devices see the updated products
 */
export async function fetchLatestCatalogFromCloud(): Promise<Product[] | null> {
  // 1. Try local Express / Serverless API (/api/products)
  try {
    const res = await fetch('/api/products', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.products) && data.products.length > 0) {
        console.log(`[CatalogSync] Loaded ${data.products.length} products from /api/products`);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.products));
        localStorage.setItem(SYNC_TIMESTAMP_KEY, Date.now().toString());
        return data.products;
      }
    }
  } catch (err) {
    // API endpoint might be unreachable on purely static hosting, continue to cloud storage
  }

  // 2. Try global cloud storage sync endpoint (works universally on Netlify, Vercel, mobile & desktop)
  try {
    const res = await fetch(CLOUD_SYNC_BIN_URL, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.products) && data.products.length > 0) {
        console.log(`[CatalogSync] Loaded ${data.products.length} products from Global Cloud Sync`);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.products));
        localStorage.setItem(SYNC_TIMESTAMP_KEY, Date.now().toString());
        return data.products;
      }
    }
  } catch (err) {
    console.warn('[CatalogSync] Cloud bin unavailable, using local cache:', err);
  }

  // 3. Fallback to localStorage
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignore JSON errors
  }

  return null;
}

/**
 * Publish updated catalog to both /api/products and Global Cloud Storage
 * so any device visiting shruthifashion.com will immediately receive the new products.
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
  let cloudSuccess = false;

  // 1. Send to local backend /api/products
  try {
    const apiRes = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products, timestamp: Date.now() })
    });
    if (apiRes.ok) {
      serverSuccess = true;
    }
  } catch (e) {
    // Non-fatal if on static hosting
  }

  // 2. Send to global cloud storage bin for instant multi-device reflection
  try {
    const cloudRes = await fetch(CLOUD_SYNC_BIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products, updatedAt: new Date().toISOString(), timestamp: Date.now() })
    });
    if (cloudRes.ok) {
      cloudSuccess = true;
    }
  } catch (e) {
    console.warn('[CatalogSync] Cloud bin push warning:', e);
  }

  if (serverSuccess || cloudSuccess) {
    return {
      success: true,
      source: serverSuccess ? 'server_api' : 'cloud_bin',
      productsCount: products.length,
      message: `Successfully published ${products.length} products to cloud! All customer devices will now see the new items.`
    };
  }

  return {
    success: true,
    source: 'local_storage',
    productsCount: products.length,
    message: `Saved ${products.length} products locally on this device.`
  };
}
