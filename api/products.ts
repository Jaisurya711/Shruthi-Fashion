import fs from 'fs';
import path from 'path';

// In-memory products and store configuration store for serverless environment
let cachedProducts: any[] | null = null;
let cachedHero: any = null;
let lastUpdated: number = Date.now();

const CLOUD_SYNC_ENDPOINT = 'https://api.restful-api.dev/objects/ff808181a09d98f701a15314beb6144c';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Return cached products and hero mainframe config
  if (req.method === 'GET') {
    // 1. If memory cache is cold, load from disk store_catalog.json
    if (!cachedProducts) {
      try {
        const diskCatalog = path.join(process.cwd(), 'data', 'store_catalog.json');
        if (fs.existsSync(diskCatalog)) {
          const parsed = JSON.parse(fs.readFileSync(diskCatalog, 'utf-8'));
          if (Array.isArray(parsed) && parsed.length > 0) {
            cachedProducts = parsed;
          }
        }
      } catch {}
    }

    // 2. Also check if cloud sync endpoint has newer stock or config
    try {
      const cloudRes = await fetch(CLOUD_SYNC_ENDPOINT, {
        headers: { 'User-Agent': 'ShruthiFashion/1.0' }
      });
      if (cloudRes.ok) {
        const json = await cloudRes.json();
        const cloudData = json?.data;
        if (Array.isArray(cloudData?.products) && cloudData.products.length > 0) {
          cachedProducts = cloudData.products;
        }
        if (cloudData?.heroConfig && typeof cloudData.heroConfig === 'object') {
          cachedHero = cloudData.heroConfig;
        }
        // Merge stock map if available
        if (cloudData?.stockMap && Array.isArray(cachedProducts)) {
          for (const p of cachedProducts) {
            if (cloudData.stockMap[p.id]) {
              p.stockCount = cloudData.stockMap[p.id].stockCount;
              p.inStock = cloudData.stockMap[p.id].inStock;
            }
          }
        }
      }
    } catch {}

    return res.status(200).json({
      success: true,
      products: cachedProducts,
      heroConfig: cachedHero,
      lastUpdated,
    });
  }

  // POST: Update products catalog and optional hero banner
  if (req.method === 'POST') {
    try {
      const { products, heroConfig } = req.body || {};
      let updatedSomething = false;

      if (Array.isArray(products) && products.length > 0) {
        cachedProducts = products;
        updatedSomething = true;
      }

      if (heroConfig && typeof heroConfig === 'object') {
        cachedHero = heroConfig;
        updatedSomething = true;
      }

      if (updatedSomething) {
        lastUpdated = Date.now();

        // Also persist to cloud storage
        try {
          await fetch(CLOUD_SYNC_ENDPOINT, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'shruthi_store_config',
              data: {
                products: cachedProducts,
                heroConfig: cachedHero,
                updatedAt: lastUpdated
              }
            })
          });
        } catch {}

        return res.status(200).json({
          success: true,
          productsCount: cachedProducts?.length || 0,
          hasHeroConfig: !!cachedHero,
          lastUpdated,
          message: 'Store configuration updated and persisted across all devices.'
        });
      }

      return res.status(400).json({ success: false, error: 'Products array or heroConfig is required.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Failed to update store configuration' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
