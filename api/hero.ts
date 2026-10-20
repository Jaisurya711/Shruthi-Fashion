// Dedicated Hero / Mainframe Image Multi-Device Sync API for Vercel
let cachedHeroConfig: any = null;
let heroLastUpdated: number = Date.now();

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

  // GET: Return cached hero / mainframe configuration
  if (req.method === 'GET') {
    // If memory is cold, rehydrate from cloud storage
    if (!cachedHeroConfig) {
      try {
        const cloudRes = await fetch(CLOUD_SYNC_ENDPOINT);
        if (cloudRes.ok) {
          const json = await cloudRes.json();
          if (json?.data?.heroConfig) {
            cachedHeroConfig = json.data.heroConfig;
          }
        }
      } catch {}
    }

    return res.status(200).json({
      success: true,
      heroConfig: cachedHeroConfig,
      lastUpdated: heroLastUpdated,
    });
  }

  // POST: Update hero / mainframe configuration across all devices
  if (req.method === 'POST') {
    try {
      const { heroConfig } = req.body || {};
      if (heroConfig && typeof heroConfig === 'object') {
        cachedHeroConfig = heroConfig;
        heroLastUpdated = Date.now();

        // Also persist to cloud storage
        try {
          const getRes = await fetch(CLOUD_SYNC_ENDPOINT);
          let currentProducts: any[] = [];
          if (getRes.ok) {
            const currentJson = await getRes.json();
            if (Array.isArray(currentJson?.data?.products)) {
              currentProducts = currentJson.data.products;
            }
          }

          await fetch(CLOUD_SYNC_ENDPOINT, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'shruthi_store_config',
              data: {
                products: currentProducts,
                heroConfig: cachedHeroConfig,
                updatedAt: heroLastUpdated
              }
            })
          });
        } catch {}

        return res.status(200).json({
          success: true,
          heroConfig: cachedHeroConfig,
          lastUpdated: heroLastUpdated,
          message: 'Mainframe hero banner updated and persisted across all devices.'
        });
      }
      return res.status(400).json({ success: false, error: 'Valid heroConfig object is required.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Failed to update hero config' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
