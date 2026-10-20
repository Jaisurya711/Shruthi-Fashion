import fs from 'fs';
import path from 'path';

// Shared stock cache for serverless runtime
let stockMap: Record<string, { stockCount: number; inStock: boolean }> = {};
let stockLastUpdated = Date.now();

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

  // GET: Return current stock map
  if (req.method === 'GET') {
    // If empty, seed from disk catalog or remote cloud object
    if (Object.keys(stockMap).length === 0) {
      try {
        const catalogPath = path.join(process.cwd(), 'data', 'store_catalog.json');
        if (fs.existsSync(catalogPath)) {
          const prods = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
          if (Array.isArray(prods)) {
            for (const p of prods) {
              if (p?.id) {
                stockMap[p.id] = {
                  stockCount: p.stockCount !== undefined ? p.stockCount : 10,
                  inStock: p.inStock !== undefined ? p.inStock : (p.stockCount > 0)
                };
              }
            }
          }
        }
      } catch {}

      // Also try fetching lightweight stock map from cloud sync endpoint
      try {
        const cloudRes = await fetch(CLOUD_SYNC_ENDPOINT, {
          headers: { 'User-Agent': 'ShruthiFashion/1.0' }
        });
        if (cloudRes.ok) {
          const json = await cloudRes.json();
          if (json?.data?.stockMap) {
            stockMap = { ...stockMap, ...json.data.stockMap };
            if (json.data.updatedAt) stockLastUpdated = json.data.updatedAt;
          }
        }
      } catch {}
    }

    return res.status(200).json({
      success: true,
      lastUpdated: stockLastUpdated,
      stockMap
    });
  }

  // POST: Update stock in real-time
  if (req.method === 'POST') {
    try {
      const { productId, stockCount, inStock, updates } = req.body || {};
      let modified = false;

      if (productId && typeof stockCount === 'number') {
        stockMap[productId] = {
          stockCount: Math.max(0, stockCount),
          inStock: inStock !== undefined ? !!inStock : stockCount > 0
        };
        modified = true;
      }

      if (Array.isArray(updates)) {
        for (const item of updates) {
          if (item?.productId && typeof item.stockCount === 'number') {
            stockMap[item.productId] = {
              stockCount: Math.max(0, item.stockCount),
              inStock: item.inStock !== undefined ? !!item.inStock : item.stockCount > 0
            };
            modified = true;
          }
        }
      }

      if (modified) {
        stockLastUpdated = Date.now();

        // Also persist lightweight stock map (300 bytes) to cloud sync endpoint
        try {
          await fetch(CLOUD_SYNC_ENDPOINT, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'ShruthiFashion/1.0'
            },
            body: JSON.stringify({
              name: 'shruthi_store_config',
              data: {
                stockMap,
                updatedAt: stockLastUpdated
              }
            })
          });
        } catch (e) {
          console.warn('Failed cloud put stock:', e);
        }

        return res.status(200).json({
          success: true,
          lastUpdated: stockLastUpdated,
          message: 'Stock updated and broadcast across all devices.'
        });
      }

      return res.status(400).json({ success: false, error: 'Invalid stock parameters' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Server stock update error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
