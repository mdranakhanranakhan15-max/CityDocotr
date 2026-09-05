/**
 * bKash Payment Gateway (PGW Tokenized API v1.2.0)
 * Official endpoints for Grant Token, Create Payment, and Execute Payment.
 */

interface BkashTokenResponse {
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  statusCode: string;
  statusMessage: string;
}

interface BkashCreatePaymentResponse {
  paymentID: string;
  bkashURL: string;
  statusCode: string;
  statusMessage: string;
  amount: string;
  currency: string;
  merchantInvoiceNumber: string;
  intent: string;
  paymentCreateTime: string;
}

interface BkashExecutePaymentResponse {
  paymentID: string;
  trxID: string;
  transactionStatus: string;
  amount: string;
  currency: string;
  intent: string;
  merchantInvoiceNumber: string;
  paymentExecuteTime: string;
  statusCode: string;
  statusMessage: string;
}

// In-memory token cache to prevent redundant grant-token requests
let cachedToken: string | null = null;
let tokenExpiresAt = 0;

const BKASH_BASE_URL =
  process.env.BKASH_BASE_URL || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta';
const BKASH_APP_KEY = process.env.BKASH_APP_KEY || '';
const BKASH_APP_SECRET = process.env.BKASH_APP_SECRET || '';
const BKASH_USERNAME = process.env.BKASH_USERNAME || '';
const BKASH_PASSWORD = process.env.BKASH_PASSWORD || '';

export function isBkashConfigured(): boolean {
  return Boolean(
    BKASH_APP_KEY.trim() &&
      BKASH_APP_SECRET.trim() &&
      BKASH_USERNAME.trim() &&
      BKASH_PASSWORD.trim()
  );
}

/**
 * 1. Grant Token API
 * Fetches or returns cached id_token from bKash server.
 */
export async function getBkashGrantToken(): Promise<string> {
  if (!isBkashConfigured()) {
    return 'mock_bkash_id_token';
  }

  // Use cached token if still valid (with 60s safety buffer)
  if (cachedToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  const endpoint = `${BKASH_BASE_URL}/tokenized/checkout/token/grant`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      username: BKASH_USERNAME,
      password: BKASH_PASSWORD,
    },
    body: JSON.stringify({
      app_key: BKASH_APP_KEY,
      app_secret: BKASH_APP_SECRET,
    }),
  });

  const data: BkashTokenResponse = await response.json();

  if (!response.ok || !data.id_token) {
    console.error('bKash Grant Token Error:', data);
    throw new Error(data.statusMessage || 'Failed to authenticate with bKash API');
  }

  cachedToken = data.id_token;
  // default token validity 3600 seconds
  tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;

  return cachedToken;
}

/**
 * 2. Create Payment API
 * Generates paymentID and redirect bkashURL.
 */
export async function createBkashPayment(params: {
  amount: number | string;
  merchantInvoiceNumber: string;
  payerReference?: string;
  callbackURL: string;
}): Promise<BkashCreatePaymentResponse> {
  const { amount, merchantInvoiceNumber, payerReference, callbackURL } = params;

  // Fallback for local sandbox testing if credentials are blank in .env
  if (!isBkashConfigured()) {
    const mockPaymentID = `BKASH-MOCK-${Date.now()}`;
    const redirectURL = `/payment/mock-bkash?paymentID=${mockPaymentID}&amount=${amount}&invoice=${merchantInvoiceNumber}&payer=${encodeURIComponent(payerReference || '')}&callbackURL=${encodeURIComponent(callbackURL)}`;
    return {
      paymentID: mockPaymentID,
      bkashURL: redirectURL,
      statusCode: '0000',
      statusMessage: 'Sandbox Mode - Simulated bKash Gateway',
      amount: String(amount),
      currency: 'BDT',
      merchantInvoiceNumber,
      intent: 'sale',
      paymentCreateTime: new Date().toISOString(),
    };
  }

  const idToken = await getBkashGrantToken();
  const endpoint = `${BKASH_BASE_URL}/tokenized/checkout/create`;

  const payload = {
    mode: '0011',
    payerReference: payerReference || '01700000000',
    callbackURL,
    amount: String(amount),
    currency: 'BDT',
    intent: 'sale',
    merchantInvoiceNumber,
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: idToken,
      'X-App-Key': BKASH_APP_KEY,
    },
    body: JSON.stringify(payload),
  });

  const data: BkashCreatePaymentResponse = await response.json();

  if (!response.ok || (data.statusCode && data.statusCode !== '0000') || !data.bkashURL) {
    console.error('bKash Create Payment Error:', data);
    throw new Error(data.statusMessage || 'bKash payment initiation failed');
  }

  return data;
}

/**
 * 3. Execute Payment API
 * Verifies paymentID and finalizes transaction after user enters PIN.
 */
export async function executeBkashPayment(
  paymentID: string
): Promise<BkashExecutePaymentResponse> {
  if (!isBkashConfigured()) {
    const mockTrxID = `TRX${Date.now().toString().slice(-8).toUpperCase()}`;
    return {
      paymentID,
      trxID: mockTrxID,
      transactionStatus: 'Completed',
      amount: '349',
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: `INV-${Date.now()}`,
      paymentExecuteTime: new Date().toISOString(),
      statusCode: '0000',
      statusMessage: 'Transaction Successful',
    };
  }

  const idToken = await getBkashGrantToken();
  const endpoint = `${BKASH_BASE_URL}/tokenized/checkout/execute`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: idToken,
      'X-App-Key': BKASH_APP_KEY,
    },
    body: JSON.stringify({ paymentID }),
  });

  const data: BkashExecutePaymentResponse = await response.json();

  if (
    !response.ok ||
    (data.statusCode && data.statusCode !== '0000') ||
    data.transactionStatus !== 'Completed'
  ) {
    console.error('bKash Execute Payment Error:', data);
    throw new Error(data.statusMessage || 'bKash payment execution failed');
  }

  return data;
}

