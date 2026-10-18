// In-memory products and store configuration store for serverless environment
let cachedProducts: any[] | null = null;
let cachedHero: any = null;
let lastUpdated: number = Date.now();

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
        return res.status(200).json({
          success: true,
          productsCount: cachedProducts?.length || 0,
          hasHeroConfig: !!cachedHero,
          lastUpdated,
          message: 'Store configuration updated successfully and will be served to all devices.'
        });
      }

      return res.status(400).json({ success: false, error: 'Products array or heroConfig is required.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Failed to update store configuration' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
