import crypto from 'node:crypto';

export interface PayHerePaymentParams {
  sandbox: boolean;
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  amount: string; // e.g. "4500.00"
  currency: string;
  hash: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  delivery_address: string;
  delivery_city: string;
  delivery_country: string;
}

export function getPayHereConfig() {
  const merchantId = process.env.PAYHERE_MERCHANT_ID || '263511';
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || 'MzEwNDA5NDY0MDExNzgzMDk5MTgzMzQ2NjAwMzA2MTgxOTMyNjc1NQ==';
  const isSandbox = (process.env.PAYHERE_MODE || 'live').toLowerCase() === 'sandbox';

  return {
    merchantId,
    merchantSecret,
    isSandbox,
  };
}

/**
 * Generates MD5 security hash for PayHere Checkout
 * hash = strtoupper(md5(merchant_id + order_id + amountFormatted + currency + strtoupper(md5(merchant_secret))))
 */
export function generatePayHereHash(orderId: string, amountInCents: number, currency = 'LKR'): string {
  const { merchantId, merchantSecret } = getPayHereConfig();
  const formattedAmount = (amountInCents / 100).toFixed(2);
  const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();

  return crypto
    .createHash('md5')
    .update(merchantId + orderId + formattedAmount + currency + hashedSecret)
    .digest('hex')
    .toUpperCase();
}

/**
 * Verifies PayHere IPN notification callback signature
 * local_md5sig = strtoupper(md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + strtoupper(md5(merchant_secret))))
 */
export function verifyPayHereNotification(data: {
  merchant_id: string;
  order_id: string;
  payhere_amount: string;
  payhere_currency: string;
  status_code: string;
  md5sig: string;
}): boolean {
  const { merchantId, merchantSecret } = getPayHereConfig();

  if (data.merchant_id !== merchantId) {
    return false;
  }

  const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
  const localSig = crypto
    .createHash('md5')
    .update(
      data.merchant_id +
      data.order_id +
      data.payhere_amount +
      data.payhere_currency +
      data.status_code +
      hashedSecret
    )
    .digest('hex')
    .toUpperCase();

  return localSig === (data.md5sig || '').toUpperCase();
}
