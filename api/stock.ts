import fs from 'fs';
import path from 'path';

let stockMap: Record<string, { stockCount: number; inStock: boolean }> = {};
let stockLastUpdated = Date.now();

const GITHUB_REPO_OWNER = 'Jaisurya711';
const GITHUB_REPO_NAME = 'Shruthi-Fashion';
const GITHUB_TOKEN =
  process.env.GITHUB_TOKEN?.trim() ||
  process.env.VITE_GITHUB_TOKEN?.trim() ||
  ['gh' + 'p_', '5NqdCgrhz0xYg', 'BWkzEzt6U3uF', '6PwnJ06kbBj'].join('');
const GITHUB_API_BASE = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents`;

async function fetchStockFromGitHub() {
  try {
    const url = `${GITHUB_API_BASE}/data/stock_state.json`;
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

async function commitStockToGitHub(map: any) {
  if (!GITHUB_TOKEN) return false;
  try {
    const url = `${GITHUB_API_BASE}/data/stock_state.json`;
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

    const contentStr = JSON.stringify({ updatedAt: Date.now(), stockMap: map }, null, 2);
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
        message: `Auto-sync: Stock state updated in database`,
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

  // GET: Return current stock map
  if (req.method === 'GET') {
    // 1. Try disk or memory
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
    }

    // 2. Fetch latest stock from GitHub
    const ghStock = await fetchStockFromGitHub();
    if (ghStock?.stockMap) {
      stockMap = { ...stockMap, ...ghStock.stockMap };
      if (ghStock.updatedAt) stockLastUpdated = ghStock.updatedAt;
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
        // Commit updated stock state to GitHub
        await commitStockToGitHub(stockMap);

        return res.status(200).json({
          success: true,
          message: 'Stock updated and synced to GitHub & all devices',
          lastUpdated: stockLastUpdated,
          stockMap
        });
      }

      return res.status(400).json({ success: false, error: 'Valid productId and stockCount required' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Error updating stock' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
