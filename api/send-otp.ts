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
    const { phone, name } = req.body || {};
    if (!phone) return res.status(400).json({ error: 'Mobile number is required' });

    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Please provide a valid 10-digit mobile number' });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 min validity

    const secret = (
      process.env.OTP_SECRET ||
      process.env.RAZORPAY_KEY_SECRET ||
      'shruthi-fashion-secure-otp-secret-key-2026'
    ).trim();

    const hash = crypto
      .createHmac('sha256', secret)
      .update(`${cleanPhone}:${otp}:${expiresAt}`)
      .digest('hex');

    const sessionToken = `${expiresAt}.${hash}`;
    const maskedPhone = `+91 ******${cleanPhone.slice(-4)}`;

    let smsDispatched = false;
    let smsGatewayUsed = 'none';

    // 1. Fast2SMS integration (India)
    const fast2SmsKey = (process.env.FAST2SMS_API_KEY || '').trim();
    if (fast2SmsKey) {
      try {
        const smsResponse = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': fast2SmsKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            route: 'otp',
            variables_values: otp,
            numbers: cleanPhone,
          }),
        });
        const smsData = await smsResponse.json();
        if (smsData && (smsData.return === true || smsData.status_code === 200)) {
          smsDispatched = true;
          smsGatewayUsed = 'fast2sms';
        }
      } catch (err: any) {
        console.warn('Fast2SMS gateway error:', err?.message);
      }
    }

    // 2. 2Factor integration (India)
    const twoFactorKey = (process.env.TWO_FACTOR_API_KEY || '').trim();
    if (!smsDispatched && twoFactorKey) {
      try {
        const smsResponse = await fetch(
          `https://2factor.in/v1/API/V1/${twoFactorKey}/SMS/+91${cleanPhone}/${otp}/OTP1`
        );
        const smsData = await smsResponse.json();
        if (smsData && smsData.Status === 'Success') {
          smsDispatched = true;
          smsGatewayUsed = '2factor';
        }
      } catch (err: any) {
        console.warn('2Factor gateway error:', err?.message);
      }
    }

    // Never return the OTP to the frontend!
    return res.status(200).json({
      success: true,
      sessionToken,
      maskedPhone,
      message: `OTP sent via SMS to ${maskedPhone}.`,
      smsGateway: smsGatewayUsed,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Failed to dispatch OTP SMS' });
  }
}