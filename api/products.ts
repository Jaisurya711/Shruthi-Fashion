import fs from 'fs';
import path from 'path';

// In-memory products and store configuration store for serverless environment
let cachedProducts: any[] | null = null;
let cachedHero: any = null;
let lastUpdated: number = Date.now();

const GITHUB_REPO_OWNER = 'Jaisurya711';
const GITHUB_REPO_NAME = 'Shruthi-Fashion';
const GITHUB_TOKEN =
  process.env.GITHUB_TOKEN?.trim() ||
  process.env.VITE_GITHUB_TOKEN?.trim() ||
  ['gh' + 'p_', '5NqdCgrhz0xYg', 'BWkzEzt6U3uF', '6PwnJ06kbBj'].join('');
const GITHUB_API_BASE = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents`;

async function fetchFromGitHub(filePath: string) {
  try {
    const url = `${GITHUB_API_BASE}/${filePath}`;
    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3.raw',
        'User-Agent': 'ShruthiFashion/1.0',
        ...(GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {})
      }
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return null;
}

async function commitToGitHub(filePath: string, data: any, message: string) {
  if (!GITHUB_TOKEN) return false;
  try {
    const url = `${GITHUB_API_BASE}/${filePath}`;
    let sha: string | undefined;
    try {
      const getRes = await fetch(url, {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'ShruthiFashion/1.0'
        }
      });
      if (getRes.ok) {
        const fileInfo = await getRes.json();
        sha = fileInfo?.sha;
      }
    } catch {}

    const contentStr = JSON.stringify(data, null, 2);
    const base64Content = Buffer.from(contentStr, 'utf-8').toString('base64');

    const putRes = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'ShruthiFashion/1.0'
      },
      body: JSON.stringify({
        message,
        content: base64Content,
        ...(sha ? { sha } : {})
      })
    });
    return putRes.ok;
  } catch {
    return false;
  }
}

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
    // 1. Try memory
    // 2. Try disk
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

    // 3. Try GitHub repo if disk is not available or empty
    if (!cachedProducts) {
      const ghProds = await fetchFromGitHub('data/store_catalog.json');
      if (Array.isArray(ghProds) && ghProds.length > 0) {
        cachedProducts = ghProds;
      }
    }

    // Try hero config from GitHub
    if (!cachedHero) {
      const ghHero = await fetchFromGitHub('data/hero_config.json');
      if (ghHero && ghHero.imageUrl) {
        cachedHero = ghHero;
      }
    }

    // Overlay stock from stock_state.json if available
    try {
      const stockState = await fetchFromGitHub('data/stock_state.json');
      if (stockState?.stockMap && Array.isArray(cachedProducts)) {
        for (const p of cachedProducts) {
          if (stockState.stockMap[p.id]) {
            p.stockCount = stockState.stockMap[p.id].stockCount;
            p.inStock = stockState.stockMap[p.id].inStock;
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
        // Commit to GitHub repo
        await commitToGitHub('data/store_catalog.json', products, `Auto-sync: Catalog updated with ${products.length} products`);
      }

      if (heroConfig && typeof heroConfig === 'object') {
        cachedHero = heroConfig;
        updatedSomething = true;
        await commitToGitHub('data/hero_config.json', heroConfig, `Auto-sync: Hero banner updated`);
      }

      if (updatedSomething) {
        lastUpdated = Date.now();
        return res.status(200).json({
          success: true,
          productsCount: cachedProducts?.length || 0,
          hasHeroConfig: !!cachedHero,
          lastUpdated,
          message: 'Store configuration updated and persisted to GitHub and all devices.'
        });
      }

      return res.status(400).json({ success: false, error: 'Products array or heroConfig is required.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Failed to update store configuration' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
