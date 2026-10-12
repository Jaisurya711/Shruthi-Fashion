export interface SendOtpResponse {
  success: boolean;
  sessionToken?: string;
  maskedPhone?: string;
  message?: string;
  error?: string;
  smsGateway?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function requestMobileOtp(phone: string, name: string): Promise<SendOtpResponse> {
  try {
    const response = await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, name }),
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to send OTP to mobile number.',
      };
    }

    return {
      success: true,
      sessionToken: data.sessionToken,
      maskedPhone: data.maskedPhone,
      message: data.message || 'OTP sent successfully to your mobile number.',
      smsGateway: data.smsGateway,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Unable to connect to SMS service.',
    };
  }
}

export async function verifyMobileOtp(
  phone: string,
  otp: string,
  sessionToken: string
): Promise<VerifyOtpResponse> {
  try {
    const response = await fetch('/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp, sessionToken }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Invalid OTP code. Please check and try again.',
      };
    }

    return {
      success: true,
      message: data.message || 'Mobile number verified successfully.',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Network error while verifying OTP.',
    };
  }
}