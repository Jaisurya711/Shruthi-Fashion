import crypto from 'crypto';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { phone, otp, sessionToken } = req.body || {};
    if (!phone || !otp || !sessionToken) {
      return res.status(400).json({ success: false, error: 'Missing parameters' });
    }

    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
    const cleanOtp = String(otp).trim();

    if (cleanOtp.length !== 4) {
      return res.status(400).json({ success: false, error: 'Please enter a valid 4-digit OTP' });
    }

    const tokenParts = String(sessionToken).split('.');
    if (tokenParts.length !== 2) {
      return res.status(400).json({ success: false, error: 'Invalid token' });
    }

    const [expiresAtStr, signature] = tokenParts;
    const expiresAt = parseInt(expiresAtStr, 10);

    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return res.status(400).json({ success: false, error: 'OTP has expired. Request a new one.' });
    }

    const secret = (
      process.env.OTP_SECRET ||
      process.env.RAZORPAY_KEY_SECRET ||
      'shruthi-fashion-secure-otp-secret-key-2026'
    ).trim();

    const expectedHash = crypto
      .createHmac('sha256', secret)
      .update(`${cleanPhone}:${cleanOtp}:${expiresAt}`)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedHash, 'hex');
    const signatureBuffer = Buffer.from(signature, 'hex');

    if (
      expectedBuffer.length === signatureBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
    ) {
      return res.status(200).json({ success: true, message: 'Verified successfully!' });
    } else {
      return res.status(400).json({ success: false, error: 'Incorrect OTP. Please enter the code sent to your mobile.' });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Internal server error verifying OTP' });
  }
}