import Razorpay from 'razorpay';

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Uses your live credentials directly or from Vercel environment variables
  const key_id = (process.env.RAZORPAY_KEY_ID || 'rzp_live_TmcCNE03TUNIYQ').trim();
  const key_secret = (process.env.RAZORPAY_KEY_SECRET || 'aPcQhngZB5nJ9Khu7nbUzyCL').trim();

  try {
    const { amount, currency = 'INR', receipt, customKeyId, customKeySecret, simulate } = req.body || {};

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
      return res.status(500).json({
        error: errMsg || 'Failed to create Razorpay order',
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      error: error?.message || 'Failed to process order request',
    });
  }
}