import express from 'express';
import dotenv from 'dotenv';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const key_id = (process.env.RAZORPAY_KEY_ID || 'rzp_test_Tmzltbt8uaWUPE').trim();
const key_secret = (process.env.RAZORPAY_KEY_SECRET || 'h2OiBJcNsTNUIWh9Uj0073Y0').trim();

// Endpoint: POST /api/create-order
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
      const errCode = razorpayErr?.error?.code || '';
      const statusCode = razorpayErr?.statusCode;

      const isAuthFailure =
        statusCode === 401 ||
        (errCode === 'BAD_REQUEST_ERROR' && (errMsg.toLowerCase().includes('authentication') || !errMsg)) ||
        errMsg.toLowerCase().includes('authentication failed');

      if (isAuthFailure) {
        return res.status(401).json({
          error: 'Authentication failed',
          description: 'Invalid or expired Razorpay Key ID or Secret',
          code: 'BAD_REQUEST_ERROR',
          key_id: activeKeyId,
        });
      }

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

// Endpoint: POST /api/verify-payment
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
    if (!secret) {
      return res.status(500).json({
        success: false,
        error: 'Razorpay secret key not configured on server',
      });
    }

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === razorpay_signature) {
      return res.status(200).json({
        success: true,
        message: 'Payment signature verified successfully',
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        verified_at: new Date().toISOString(),
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed: Signature mismatch',
        code: 'SIGNATURE_VERIFICATION_FAILED',
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'Verification failed',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();