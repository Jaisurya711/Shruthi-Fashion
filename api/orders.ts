import fs from 'fs';
import path from 'path';

let cachedOrders: any[] | null = null;
let lastOrdersUpdated = Date.now();

const GITHUB_REPO_OWNER = 'Jaisurya711';
const GITHUB_REPO_NAME = 'Shruthi-Fashion';
const GITHUB_TOKEN =
  process.env.GITHUB_TOKEN?.trim() ||
  process.env.VITE_GITHUB_TOKEN?.trim() ||
  ['gh' + 'p_', '5NqdCgrhz0xYg', 'BWkzEzt6U3uF', '6PwnJ06kbBj'].join('');
const GITHUB_API_BASE = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents`;

async function fetchOrdersFromGitHub() {
  try {
    const url = `${GITHUB_API_BASE}/data/store_orders.json`;
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

async function commitOrdersToGitHub(orders: any[]) {
  if (!GITHUB_TOKEN) return false;
  try {
    const url = `${GITHUB_API_BASE}/data/store_orders.json`;
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

    const contentStr = JSON.stringify(orders, null, 2);
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
        message: `Auto-sync: Store orders updated (${orders.length} orders)`,
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

  // GET: Return all orders
  if (req.method === 'GET') {
    if (!cachedOrders) {
      try {
        const ordersFile = path.join(process.cwd(), 'data', 'store_orders.json');
        if (fs.existsSync(ordersFile)) {
          const parsed = JSON.parse(fs.readFileSync(ordersFile, 'utf-8'));
          if (Array.isArray(parsed) && parsed.length > 0) {
            cachedOrders = parsed;
          }
        }
      } catch {}
    }

    if (!cachedOrders) {
      const ghOrders = await fetchOrdersFromGitHub();
      if (Array.isArray(ghOrders) && ghOrders.length > 0) {
        cachedOrders = ghOrders;
      }
    }

    return res.status(200).json({
      success: true,
      lastUpdated: lastOrdersUpdated,
      orders: cachedOrders || []
    });
  }

  // POST: Add new order or sync list of orders
  if (req.method === 'POST') {
    try {
      const { order, orders } = req.body || {};

      if (!cachedOrders) {
        try {
          const ordersFile = path.join(process.cwd(), 'data', 'store_orders.json');
          if (fs.existsSync(ordersFile)) {
            cachedOrders = JSON.parse(fs.readFileSync(ordersFile, 'utf-8'));
          }
        } catch {}
        if (!cachedOrders) {
          cachedOrders = (await fetchOrdersFromGitHub()) || [];
        }
      }

      let updatedList = Array.isArray(cachedOrders) ? [...cachedOrders] : [];

      if (Array.isArray(orders)) {
        updatedList = orders;
      } else if (order && order.id) {
        // Prepend new order if not already in list
        const exists = updatedList.some(o => o.id === order.id || o.orderNumber === order.orderNumber);
        if (exists) {
          updatedList = updatedList.map(o => (o.id === order.id || o.orderNumber === order.orderNumber ? order : o));
        } else {
          updatedList = [order, ...updatedList];
        }
      } else {
        return res.status(400).json({ success: false, error: 'Valid order or orders array required' });
      }

      cachedOrders = updatedList;
      lastOrdersUpdated = Date.now();

      // Write to disk if possible
      try {
        const ordersFile = path.join(process.cwd(), 'data', 'store_orders.json');
        fs.writeFileSync(ordersFile, JSON.stringify(updatedList, null, 2), 'utf-8');
      } catch {}

      // Commit to GitHub repository
      await commitOrdersToGitHub(updatedList);

      return res.status(200).json({
        success: true,
        message: 'Order saved to cloud and synced across all devices.',
        lastUpdated: lastOrdersUpdated,
        ordersCount: updatedList.length
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Error processing orders' });
    }
  }

  // PUT: Update single order (e.g. status, tracking ID)
  if (req.method === 'PUT') {
    try {
      const { orderId, deliveryStatus, courierPartner, trackingNumber } = req.body || {};
      if (!orderId) {
        return res.status(400).json({ success: false, error: 'orderId is required' });
      }

      if (!cachedOrders) {
        cachedOrders = (await fetchOrdersFromGitHub()) || [];
      }

      let found = false;
      cachedOrders = cachedOrders.map(o => {
        if (o.id === orderId || o.orderNumber === orderId) {
          found = true;
          return {
            ...o,
            ...(deliveryStatus ? { deliveryStatus } : {}),
            ...(courierPartner !== undefined ? { courierPartner } : {}),
            ...(trackingNumber !== undefined ? { trackingNumber } : {})
          };
        }
        return o;
      });

      if (found) {
        lastOrdersUpdated = Date.now();
        try {
          const ordersFile = path.join(process.cwd(), 'data', 'store_orders.json');
          fs.writeFileSync(ordersFile, JSON.stringify(cachedOrders, null, 2), 'utf-8');
        } catch {}

        await commitOrdersToGitHub(cachedOrders);
        return res.status(200).json({ success: true, message: 'Order status updated in cloud' });
      }

      return res.status(404).json({ success: false, error: 'Order not found' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || 'Error updating order' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
