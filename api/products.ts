// In-memory products store for serverless environment
let cachedProducts: any[] | null = null;
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

  // GET: Return cached products
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      products: cachedProducts,
      lastUpdated,
    });
  }

  // POST: Update products catalog
  if (req.method === 'POST') {
    try {
      const { products } = req.body || {};
      if (Array.isArray(products) && products.length > 0) {
        cachedProducts = products;
        lastUpdated = Date.now();
        return res.status(200).json({
          success: true,
          count: products.length,
          lastUpdated,
          message: 'Catalog updated successfully and will be served to all devices.'
        });
      }
      return res.status(400).json({ success: false, error: 'Products array is required.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Failed to update products' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
