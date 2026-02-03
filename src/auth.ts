import { sign, verify, type JwtPayload } from '@tsndr/cloudflare-worker-jwt';

// JWT Secret - In production, this should be an environment variable
const JWT_SECRET = 'toko-mudah-secret-key-change-in-production';
const JWT_EXPIRY_DAYS = 7;
const PBKDF2_ITERATIONS = 100000;

export type UserRole = 'user' | 'admin' | 'superadmin';

export interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  is_demo: number;
  role: UserRole;
  is_active: number;
  created_at?: string;
}

export interface JwtUserPayload {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
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
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (JWT_EXPIRY_DAYS * 24 * 60 * 60);

  const payload: JwtUserPayload & { iat: number; exp: number } = {
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    iat: now,
    exp: exp,
  };

  return await sign(payload, JWT_SECRET, { algorithm: 'HS256' });
}

/**
 * Verify JWT token and return payload
 */
export async function verifyToken(token: string): Promise<JwtUserPayload | null> {
  try {
    const result = await verify(token, JWT_SECRET, { algorithm: 'HS256' });

    if (!result) {
      return null;
    }

    return {
      userId: (result.payload as any).sub || (result.payload as any).userId || '',
      username: (result.payload as any).username || '',
      email: (result.payload as any).email || '',
      role: (result.payload as any).role || 'user',
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
