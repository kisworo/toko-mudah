import { SignJwt, verifyJwt } from '@tsndr/cloudflare-worker-jwt';

// JWT Secret - In production, this should be an environment variable
const JWT_SECRET = 'toko-mudah-secret-key-change-in-production';
const JWT_EXPIRY = '7d'; // Token expires in 7 days

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
 * Hash password using PBKDF2 (built into Web Crypto API)
 * Compatible with Cloudflare Workers
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    data,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  // Combine salt and hash for storage
  const combined = new Uint8Array(salt.length + derivedBits.byteLength);
  combined.set(salt);
  combined.set(new Uint8Array(derivedBits), salt.length);

  // Convert to base64 for storage
  return btoa(String.fromCharCode(...combined));
}

/**
 * Verify password against stored hash
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const combined = atob(storedHash);
    const combinedArray = new Uint8Array(combined.length);
    for (let i = 0; i < combined.length; i++) {
      combinedArray[i] = combined.charCodeAt(i);
    }

    const salt = combinedArray.slice(0, 16);
    const storedHashBits = combinedArray.slice(16);

    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      data,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );

    const derivedArray = new Uint8Array(derivedBits);

    // Compare hashes
    if (derivedArray.length !== storedHashBits.length) {
      return false;
    }

    for (let i = 0; i < derivedArray.length; i++) {
      if (derivedArray[i] !== storedHashBits[i]) {
        return false;
      }
    }

    return true;
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
