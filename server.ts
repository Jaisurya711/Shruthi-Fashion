import express from 'express';
import dotenv from 'dotenv';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Support large image payloads (e.g. photos uploaded from mobile devices)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const key_id = (process.env.RAZORPAY_KEY_ID || 'rzp_live_TpGh87ZFgGUGsI').trim();
const key_secret = (process.env.RAZORPAY_KEY_SECRET || 'NbW6Xt7zLCtJfNcLt4rcm6ld').trim();

// STEP 1: BACKEND - Create Order
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, customKeyId, customKeySecret, simulate } = req.body;

    if (typeof amount !== 'number') {
      return res.status(400).json({ error: 'Valid numeric amount is required in paise.' });
    }

    if (amount < 100) {
      return res.status(400).json({ error: 'Minimum amount must be at least 100 paise (₹1).' });
    }

    const hasValidCustomKeys =
      customKeyId &&
      customKeySecret &&
      customKeyId !== 'rzp_live_shruthifashion' &&
      !customKeyId.includes('placeholder');

    const activeKeyId = (hasValidCustomKeys ? customKeyId : key_id || '').trim();
    const activeKeySecret = (hasValidCustomKeys ? customKeySecret : key_secret || '').trim();

    if (!activeKeyId || !activeKeySecret) {
      return res.status(401).json({ error: 'Razorpay API credentials not configured.' });
    }

    if (simulate) {
      const fallbackOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      return res.status(200).json({
        order_id: fallbackOrderId,
        amount: Math.round(amount),
        currency: currency || 'INR',
        key_id: activeKeyId,
        isSimulated: true,
      });
    }

    try {
      const razorpay = new Razorpay({
        key_id: activeKeyId,
        key_secret: activeKeySecret,
      });

      const options = {
        amount: Math.round(amount),
        currency: currency || 'INR',
        receipt: receipt || `rcpt_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);

      return res.status(200).json({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: activeKeyId,
        isSimulated: false,
      });
    } catch (razorpayErr: any) {
      const errMsg = razorpayErr?.error?.description || razorpayErr?.message || '';
      console.warn('Razorpay API notice:', errMsg || razorpayErr);
      return res.status(500).json({
        error: errMsg || 'Failed to create Razorpay order',
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      error: error?.message || 'Failed to process order request',
    });
  }
});

// STEP 2: Verify Payment
app.post('/api/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, customKeySecret } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: razorpay_order_id, razorpay_payment_id',
      });
    }

    if (razorpay_order_id.startsWith('order_sim_') || razorpay_signature === 'simulated_test_signature') {
      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully in test sandbox mode',
        payment_id: razorpay_payment_id || `pay_sim_${Date.now()}`,
        order_id: razorpay_order_id,
        isSimulated: true,
      });
    }

    if (!razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: razorpay_signature',
      });
    }

    const secret = (customKeySecret || key_secret || '').trim();
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === razorpay_signature) {
      return res.status(200).json({
        success: true,
        message: 'Payment signature verified successfully',
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature',
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'Internal server error verifying payment',
    });
  }
});

// STEP 3: Multi-Device Disk Persistence for Products & Hero Banner
const DATA_DIR = path.join(__dirname, 'data');
const CATALOG_FILE = path.join(DATA_DIR, 'store_catalog.json');
const HERO_FILE = path.join(DATA_DIR, 'hero_config.json');

if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.warn('[Persistence] Could not create data directory:', err);
  }
}

let cachedProducts: any[] | null = null;
let cachedHeroConfig: any = null;
let catalogLastUpdated: number = Date.now();

try {
  if (fs.existsSync(CATALOG_FILE)) {
    const raw = fs.readFileSync(CATALOG_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      cachedProducts = parsed;
    }
  }
} catch (e) {
  console.warn('[Persistence] Error loading catalog from disk:', e);
}

try {
  if (fs.existsSync(HERO_FILE)) {
    const raw = fs.readFileSync(HERO_FILE, 'utf-8');
    cachedHeroConfig = JSON.parse(raw);
  }
} catch (e) {
  console.warn('[Persistence] Error loading heroConfig from disk:', e);
}

app.get('/api/catalog-status', (req, res) => {
  return res.status(200).json({
    online: true,
    totalProducts: cachedProducts ? cachedProducts.length : 0,
    hasHeroConfig: !!cachedHeroConfig,
    heroTitle: cachedHeroConfig?.title || 'Default',
    heroImageUrl: cachedHeroConfig?.imageUrl || null,
    lastUpdated: catalogLastUpdated,
    serverTime: Date.now()
  });
});

app.get('/api/download-zip', (req, res) => {
  try {
    const zipPath = path.join('/tmp', 'shruthi-fashion-source-code.zip');
    const pyScript = [
      'import os, zipfile',
      'exclude = {".git", "node_modules", "dist", ".cache", ".aistudio"}',
      `zf = zipfile.ZipFile("${zipPath}", "w", zipfile.ZIP_DEFLATED)`,
      'for r, dirs, files in os.walk("."):',
      '    dirs[:] = [d for d in dirs if d not in exclude]',
      '    for f in files:',
      '        p = os.path.join(r, f)',
      '        zf.write(p, os.path.relpath(p, "."))',
      'zf.close()',
    ].join('\n');
    fs.writeFileSync('/tmp/make_zip.py', pyScript);
    execSync('python3 /tmp/make_zip.py');
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="shruthi-fashion-complete-code.zip"');
    return res.sendFile(zipPath);
  } catch (err: any) {
    console.error('Failed generating zip:', err);
    return res.status(500).json({ error: 'Failed to generate code zip' });
  }
});

app.get('/api/products', (req, res) => {
  return res.status(200).json({
    success: true,
    products: cachedProducts,
    heroConfig: cachedHeroConfig,
    lastUpdated: catalogLastUpdated,
  });
});

app.post('/api/products', (req, res) => {
  try {
    const { products, heroConfig } = req.body || {};
    let updated = false;

    if (Array.isArray(products) && products.length > 0) {
      cachedProducts = products;
      try {
        fs.writeFileSync(CATALOG_FILE, JSON.stringify(products, null, 2), 'utf-8');
      } catch (fsErr) {
        console.warn('[Persistence] Failed writing catalog to disk:', fsErr);
      }
      updated = true;
    }

    if (heroConfig && typeof heroConfig === 'object') {
      cachedHeroConfig = heroConfig;
      try {
        fs.writeFileSync(HERO_FILE, JSON.stringify(heroConfig, null, 2), 'utf-8');
      } catch (fsErr) {
        console.warn('[Persistence] Failed writing heroConfig to disk:', fsErr);
      }
      updated = true;
    }

    if (updated) {
      catalogLastUpdated = Date.now();
      return res.status(200).json({
        success: true,
        count: cachedProducts?.length || 0,
        hasHeroConfig: !!cachedHeroConfig,
        lastUpdated: catalogLastUpdated,
        message: 'Store catalog and configuration saved to server disk and broadcast to all devices.'
      });
    }

    return res.status(400).json({ success: false, error: 'Products array or heroConfig is required.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Failed to update store data' });
  }
});

app.get('/api/hero', (req, res) => {
  return res.status(200).json({
    success: true,
    heroConfig: cachedHeroConfig,
    lastUpdated: catalogLastUpdated,
  });
});

app.post('/api/hero', (req, res) => {
  try {
    const { heroConfig } = req.body || {};
    if (heroConfig && typeof heroConfig === 'object' && heroConfig.imageUrl) {
      cachedHeroConfig = heroConfig;
      catalogLastUpdated = Date.now();
      try {
        fs.writeFileSync(HERO_FILE, JSON.stringify(heroConfig, null, 2), 'utf-8');
      } catch (fsErr) {
        console.warn('[Persistence] Failed writing heroConfig to disk:', fsErr);
      }
      return res.status(200).json({
        success: true,
        heroConfig: cachedHeroConfig,
        lastUpdated: catalogLastUpdated,
        message: 'Mainframe hero banner saved to server disk and live for all devices.'
      });
    }
    return res.status(400).json({ success: false, error: 'Valid heroConfig with imageUrl is required.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Failed to update hero config' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();