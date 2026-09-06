import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import bcrypt from 'bcryptjs';

const SESSION_SECRET = process.env.DOCTOR_SESSION_SECRET || 'citydoctor-session-secret';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

/**
 * Hash a plaintext password using scrypt (salt:hash format).
 * No external dependencies — Node's built-in crypto.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/** Verify a plaintext password against a stored "salt:hash" string. */
export function verifyPassword(password: string, stored: string): boolean {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

const BCRYPT_ROUNDS = 10;

/**
 * Hash a plaintext password using bcrypt. New credentials (admin-created
 * doctor accounts, self-service password changes) are stored with bcrypt so
 * they match the platform requirement while remaining readable by
 * passwordMatches() below.
 */
export function hashPasswordBcrypt(password: string): string {
  return bcrypt.hashSync(password, BCRYPT_ROUNDS);
}

/**
 * Verify a password against ANY stored credential format used by the app:
 *  1. scrypt  "salt:hash"  (legacy hashPassword()),
 *  2. bcrypt  "$2a$/$2b$/$2y$..."  (new accounts & password changes),
 *  3. plain text (legacy/seed rows that predate hashing).
 */
export function passwordMatches(password: string, stored: string): boolean {
  if (!password || !stored) return false;

  if (stored.includes(':')) {
    try {
      if (verifyPassword(password, stored)) return true;
    } catch {
      /* fall through to next scheme */
    }
  }

  if (/^\$2[aby]\$\d{2}\$/.test(stored)) {
    try {
      if (bcrypt.compareSync(password, stored)) return true;
    } catch {
      /* fall through */
    }
  }

  // Legacy un-hashed rows (kept for backward compatibility).
  return password === stored;
}

/**
 * Create an HMAC-signed session token for a doctor.
 * Format: base64(doctorId.timestamp).hmac
 */
export function createSessionToken(doctorId: string): string {
  const payload = `${doctorId}.${Date.now()}`;
  const encoded = Buffer.from(payload).toString('base64url');
  const sig = createHmac('sha256', SESSION_SECRET).update(encoded).digest('hex');
  return `${encoded}.${sig}`;
}

/**
 * Verify a session token and return the doctor id, or null if invalid/expired.
 */
export function verifySessionToken(token: string | undefined | null): string | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encoded, sig] = parts;
  const expectedSig = createHmac('sha256', SESSION_SECRET).update(encoded).digest('hex');
  if (sig !== expectedSig) return null;

  try {
    const decoded = Buffer.from(encoded, 'base64url').toString('utf8');
    const [doctorId, timestampStr] = decoded.split('.');
    const timestamp = Number(timestampStr);
    if (Date.now() - timestamp > SESSION_TTL_MS) return null;
    return doctorId;
  } catch {
    return null;
  }
}

const PATIENT_SESSION_SECRET = process.env.PATIENT_SESSION_SECRET || 'citydoctor-patient-session-secret';
const PATIENT_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

/**
 * Create an HMAC-signed session token for a patient.
 * Format: base64(patientId.timestamp).hmac
 */
export function createPatientSessionToken(patientId: string): string {
  const payload = `${patientId}.${Date.now()}`;
  const encoded = Buffer.from(payload).toString('base64url');
  const sig = createHmac('sha256', PATIENT_SESSION_SECRET).update(encoded).digest('hex');
  return `${encoded}.${sig}`;
}

/**
 * Verify a patient session token and return the patient id, or null if invalid/expired.
 */
export function verifyPatientSessionToken(token: string | undefined | null): string | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encoded, sig] = parts;
  const expectedSig = createHmac('sha256', PATIENT_SESSION_SECRET).update(encoded).digest('hex');
  if (sig !== expectedSig) return null;

  try {
    const decoded = Buffer.from(encoded, 'base64url').toString('utf8');
    const [patientId, timestampStr] = decoded.split('.');
    const timestamp = Number(timestampStr);
    if (!patientId || !timestamp || Number.isNaN(timestamp)) return null;
    if (Date.now() - timestamp > PATIENT_SESSION_TTL_MS) return null;
    return patientId;
  } catch {
    return null;
  }
}

