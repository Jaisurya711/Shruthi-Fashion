// Dedicated Hero / Mainframe Image Multi-Device Sync API for Vercel
let cachedHeroConfig: any = null;
let heroLastUpdated: number = Date.now();

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
        return res.status(200).json({
          success: true,
          heroConfig: cachedHeroConfig,
          lastUpdated: heroLastUpdated,
          message: 'Mainframe hero banner updated successfully and will be served to all devices (desktop & mobile).'
        });
      }
      return res.status(400).json({ success: false, error: 'Valid heroConfig object is required.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Failed to update hero config' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
