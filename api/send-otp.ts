import crypto from 'crypto';

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

  try {
    const { phone, name } = req.body || {};

    if (!phone) {
      return res.status(400).json({ error: 'Mobile number is required' });
    }

    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Please provide a valid 10-digit mobile number' });
    }

    // Generate secure 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    const secret = (
      process.env.OTP_SECRET ||
      process.env.RAZORPAY_KEY_SECRET ||
      'shruthi-fashion-secure-otp-secret-key-2026'
    ).trim();

    // Create cryptographic HMAC verification signature
    const hash = crypto
      .createHmac('sha256', secret)
      .update(`${cleanPhone}:${otp}:${expiresAt}`)
      .digest('hex');

    const sessionToken = `${expiresAt}.${hash}`;
    const maskedPhone = `+91 ******${cleanPhone.slice(-4)}`;

    let smsDispatched = false;
    let smsGatewayUsed = 'none';
    let gatewayNotice = '';

    // 1. Try Fast2SMS (popular Indian SMS gateway)
    const fast2SmsKey = (
      process.env.FAST2SMS_API_KEY ||
      'ch6swTZbfxd2D3LvE1Rj7VC9KUHkzlm0XM4qFYnBo5yISpONG8Z7sDrk5JV9nFEjebzGqa4O1NymCL6w'
    ).trim();
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
          console.log(`[Fast2SMS] Successfully sent OTP to +91 ${cleanPhone}`);
        } else {
          console.warn('[Fast2SMS] Response:', smsData);
          if (smsData?.status_code === 996 || String(smsData?.message || '').includes('verification')) {
            gatewayNotice =
              'Fast2SMS Account Notice: Website verification required before OTP SMS can be sent. Please log in to fast2sms.com -> Dev API -> OTP Message and submit your website URL.';
          } else if (smsData?.message) {
            gatewayNotice = Array.isArray(smsData.message)
              ? smsData.message.join(', ')
              : String(smsData.message);
          }
        }
      } catch (err: any) {
        console.warn('[Fast2SMS] Gateway error:', err?.message);
        gatewayNotice = err?.message || 'Fast2SMS connection error';
      }
    }

    // 2. Try 2Factor.in (popular Indian SMS gateway)
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
          console.log(`[2Factor] Successfully sent OTP to +91 ${cleanPhone}`);
        } else {
          console.warn('[2Factor] Response:', smsData);
          gatewayNotice = smsData?.Details || gatewayNotice;
        }
      } catch (err: any) {
        console.warn('[2Factor] Gateway error:', err?.message);
      }
    }

    // Support instant developer testing with test number 9999999999 (code: 1234)
    if (cleanPhone === '9999999999') {
      smsDispatched = true;
      smsGatewayUsed = 'test-sandbox';
    }

    // If SMS was not delivered by the gateway, return honest error
    if (!smsDispatched) {
      console.log(
        `\n==================================================\n` +
        `[MOBILE SMS DISPATCH FAILED]\n` +
        `Recipient: +91 ${cleanPhone} (${name || 'Customer'})\n` +
        `Reason: ${gatewayNotice || 'SMS Gateway did not deliver message'}\n` +
        `==================================================\n`
      );
      return res.status(400).json({
        success: false,
        error:
          gatewayNotice ||
          'Failed to send SMS OTP. Please check Fast2SMS account or website verification in fast2sms.com.',
        gatewayNotice,
      });
    }

    // NEVER return the actual OTP code to the client!
    return res.status(200).json({
      success: true,
      sessionToken,
      maskedPhone,
      message: `OTP sent via SMS to ${maskedPhone}. Please enter the 4-digit code.`,
      smsGateway: smsGatewayUsed,
    });
  } catch (error: any) {
    console.error('Error in send-otp handler:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to dispatch OTP SMS',
    });
  }
}
