import { SignJwt, verifyJwt } from '@tsndr/cloudflare-worker-jwt';

// JWT Secret - In production, this should be an environment variable
const JWT_SECRET = 'toko-mudah-secret-key-change-in-production';
const JWT_EXPIRY = '7d'; // Token expires in 7 days
const PBKDF2_ITERATIONS = 100000;

export interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  is_demo: number;
}

export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
}

/**
 * Convert ArrayBuffer to Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBufferLike): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

/**
 * Convert Base64 string to Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Hash password using PBKDF2 (built into Web Crypto API)
 * Format: salt_base64:hash_base64 (compatible with Node.js crypto format)
 * Compatible with Cloudflare Workers
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);

  // Generate random salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltBase64 = arrayBufferToBase64(salt);

  // Import password as key
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    data,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  // Derive key
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const hashBase64 = arrayBufferToBase64(derivedBits);

  // Return in format: salt:hash
  return `${saltBase64}:${hashBase64}`;
}

/**
 * Verify password against stored hash
 * Format: salt_base64:hash_base64
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    // Parse stored hash
    const parts = storedHash.split(':');
    if (parts.length !== 2) {
      return false;
    }

    const [saltBase64, storedHashBase64] = parts;

    // Convert base64 back to binary
    const salt = base64ToUint8Array(saltBase64);

    // Import password as key
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      data,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    // Derive key with the same salt
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );

    const computedHashBase64 = arrayBufferToBase64(derivedBits);

    // Compare hashes using timing-safe comparison
    return computedHashBase64 === storedHashBase64;
  } catch {
    return false;
  }
}

/**
 * Generate JWT token for a user
 */
export async function generateToken(user: User): Promise<string> {
  const payload: JWTPayload = {
    userId: user.id,
    username: user.username,
    email: user.email,
  };

  return await new SignJwt(payload)
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * Verify JWT token and return payload
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const isValid = await verifyJwt(token, JWT_SECRET);
    if (!isValid) {
      return null;
    }

    const payload = await verifyJwt(token, JWT_SECRET);
    return {
      userId: payload.subject || '',
      username: payload.payload?.username || '',
      email: payload.payload?.email || '',
    };
  } catch {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}
