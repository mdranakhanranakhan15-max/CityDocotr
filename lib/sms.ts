/**
 * SMS Delivery Service
 * --------------------
 * Single place for every outgoing SMS in the platform. In development the
 * default provider is a MOCK that only logs the message to the server console
 * (no real SMS is sent). When Greenweb credentials are configured the handler
 * switches to the real Greenweb HTTP API (Bangladesh). A Twilio placeholder is
 * included so the same `sendSms()` signature can be pointed at Twilio later.
 *
 * Greenweb setup (.env):
 *   GREENWEB_USERNAME=your_api_username
 *   GREENWEB_PASSWORD=your_api_password
 *   SMS_SENDER_ID=880961...        (optional, falls back to a default mask)
 *
 * Twilio setup (.env) — future provider:
 *   TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER
 */

export interface SendSmsParams {
  to: string;
  message: string;
  /** Optional template id/name for auditing / analytics. */
  template?: string;
}

export interface SendSmsResult {
  success: boolean;
  provider: 'mock' | 'greenweb' | 'twilio';
  to: string;
  messageId?: string;
  error?: string;
  loggedAt: string;
}

const GREENWEB_USERNAME = (process.env.GREENWEB_USERNAME || '').trim();
const GREENWEB_PASSWORD = (process.env.GREENWEB_PASSWORD || '').trim();
const SMS_SENDER_ID = (process.env.SMS_SENDER_ID || 'CityDoctor').trim();

function isGreenwebConfigured(): boolean {
  return Boolean(GREENWEB_USERNAME && GREENWEB_PASSWORD);
}

/** Convert a 01XXXXXXXXX / 8801XXXXXXXXX phone to the 8801XXXXXXXXX format Greenweb expects. */
export function normalizeBdPhone(phone: string): string {
  let p = String(phone || '').replace(/[^0-9]/g, '');
  if (p.startsWith('880')) return p;
  if (p.startsWith('0')) return `880${p.slice(1)}`;
  return `880${p}`;
}
/**
 * Send an SMS.
 *
 * - If Greenweb credentials are present → real HTTP request to Greenweb.
 * - Otherwise → mock mode: the message is only logged (and returned) so the
 *   whole call/sms flow can be exercised locally without a paid gateway.
 *
 * This call never throws — callers treat SMS as best-effort confirmation and
 * should not fail the main transaction when a gateway is unavailable.
 */
export async function sendSms(params: SendSmsParams): Promise<SendSmsResult> {
  const to = normalizeBdPhone(params.to || '');
  const loggedAt = new Date().toISOString();

  if (!to) {
    const result: SendSmsResult = {
      success: false,
      provider: 'mock',
      to: params.to || '',
      error: 'No recipient phone number supplied; SMS skipped.',
      loggedAt,
    };
    console.warn('[SMS] Skipped — no recipient phone number.', result);
    return result;
  }

  // ---- Real gateway: Greenweb (http://api.greenweb.com.bd/api.php) ----
  if (isGreenwebConfigured()) {
    try {
      const body = new URLSearchParams({
        token: GREENWEB_USERNAME,
        to,
        message: params.message,
        ...(SMS_SENDER_ID ? { senderid: SMS_SENDER_ID } : {}),
      });
      const res = await fetch('http://api.greenweb.com.bd/api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      const text = await res.text();
      // Greenweb returns an SMS ID number on success.
      const ok = res.ok && /^\d+$/.test(text.trim());
      if (!ok) {
        throw new Error(`Greenweb responded: ${text.slice(0, 200)}`);
      }
      const result: SendSmsResult = {
        success: true,
        provider: 'greenweb',
        to,
        messageId: text.trim(),
        loggedAt,
      };
      console.log(`[SMS][Greenweb] delivered to ${to} (id ${result.messageId})`);
      return result;
    } catch (err: any) {
      const result: SendSmsResult = {
        success: false,
        provider: 'greenweb',
        to,
        error: err?.message || 'Greenweb SMS request failed.',
        loggedAt,
      };
      console.error('[SMS][Greenweb] failed:', result.error);
      return result;
    }
  }

  // ---- Twilio placeholder ----
  // if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  //   const client = require('twilio')(sid, authToken);
  //   const msg = await client.messages.create({ to, from, body: message });
  //   return { success: true, provider: 'twilio', to, messageId: msg.sid, loggedAt };
  // }

  // ---- Mock provider (default local/dev behaviour) ----
  const mockId = `MOCK-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  console.log(
    `[SMS][MOCK] ${params.template ? `<${params.template}> ` : ''}→ ${params.to}\n` +
      `           ${params.message}\n` +
      `           (${to}) | ${loggedAt}`
  );
  return { success: true, provider: 'mock', to, messageId: mockId, loggedAt };
}


/**
 * Build the booking-confirmation SMS body:
 *   "Your appointment with [Doctor Name] on [Date] at [Time] is confirmed.
 *    TrxID: [TrxID]"
 */
export function buildAppointmentConfirmationSms(params: {
  doctorName: string;
  scheduledAt?: Date | string | null;
  timeSlot?: string | null;
  trxId: string;
}): string {
  const { doctorName, trxId } = params;
  const raw = params.scheduledAt || params.timeSlot || null;

  let dateStr = '';
  let timeStr = '';
  let when: Date | null = null;
  if (raw) {
    const d = raw instanceof Date ? raw : new Date(raw);
    when = Number.isNaN(d.getTime()) ? null : d;
  }
  if (when) {
    dateStr = when.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    timeStr = when.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  return `Your appointment with ${doctorName || 'the doctor'}${
    dateStr ? ` on ${dateStr}` : ''
  }${timeStr ? ` at ${timeStr}` : ''} is confirmed. TrxID: ${trxId}`;
}

/**
 * Send the payment/booking confirmation SMS to the patient's signup phone.
 * Uses `patient.phone` first, then the phone recorded on the appointment.
 */
export async function sendAppointmentConfirmationSms(
  appointment: any,
  trxId: string
): Promise<SendSmsResult | null> {
  const to = appointment?.patient?.phone || appointment?.patientPhone || '';
  if (!to) {
    console.warn('[SMS] Appointment confirmation skipped: no patient phone on record.');
    return null;
  }
  const message = buildAppointmentConfirmationSms({
    doctorName: appointment?.doctor?.name || 'the doctor',
    scheduledAt: appointment?.scheduledAt,
    timeSlot: appointment?.timeSlot,
    trxId,
  });
  return sendSms({ to, message, template: 'APPOINTMENT_CONFIRMED' });
}

/**
 * Log an SMS alert to a doctor (e.g. a patient tried to call while the doctor
 * was offline). The doctor phone is resolved from the appointment payload or
 * falls back to an env-configured number so admins can capture a real number
 * later without code changes.
 */
export async function sendDoctorSmsAlert(params: {
  to?: string | null;
  message: string;
}): Promise<SendSmsResult | null> {
  const to =
    params.to || process.env.DOCTOR_SMS_ALERT_PHONE || process.env.SMS_ALERT_PHONE || '';
  if (!to) {
    console.warn('[SMS] Doctor alert skipped: no doctor SMS number configured.');
    return null;
  }
  return sendSms({ to, message: params.message, template: 'DOCTOR_ALERT' });
}

