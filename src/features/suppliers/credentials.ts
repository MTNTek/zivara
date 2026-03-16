import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { supplierCredentials, suppliers } from '@/db/schema';

export interface DecryptedCredential {
  type: 'api_key' | 'oauth_token' | 'affiliate_id';
  value: string;
}

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Encrypt a plaintext credential using AES-256-GCM.
 * Returns a base64-encoded string in the format: iv:authTag:ciphertext
 */
export function encryptCredential(plaintext: string, encryptionKey: string): string {
  const key = Buffer.from(encryptionKey, 'hex');
  if (key.length !== 32) {
    throw new Error('Encryption key must be 32 bytes (64 hex characters)');
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Combine iv:authTag:ciphertext and base64 encode
  const combined = Buffer.concat([iv, authTag, encrypted]);
  return combined.toString('base64');
}

/**
 * Decrypt a credential encrypted with encryptCredential.
 * Expects a base64-encoded string containing iv:authTag:ciphertext.
 */
export function decryptCredential(ciphertext: string, encryptionKey: string): string {
  const key = Buffer.from(encryptionKey, 'hex');
  if (key.length !== 32) {
    throw new Error('Encryption key must be 32 bytes (64 hex characters)');
  }

  const combined = Buffer.from(ciphertext, 'base64');

  if (combined.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error('Invalid ciphertext: too short');
  }

  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

/**
 * Mask a credential value, showing only the last 4 characters.
 * For strings shorter than 4 characters, mask entirely.
 */
export function maskCredential(value: string): string {
  if (value.length <= 4) {
    return '*'.repeat(value.length);
  }
  return '*'.repeat(value.length - 4) + value.slice(-4);
}

/**
 * Fetch all credentials for a supplier, decrypt each one, and return as DecryptedCredential[].
 * On decryption failure, marks the supplier as 'credential_error' and logs the error.
 */
export async function getDecryptedCredentials(
  supplierId: string
): Promise<DecryptedCredential[]> {
  const encryptionKey = process.env.SUPPLIER_ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('SUPPLIER_ENCRYPTION_KEY environment variable is not set');
  }

  const credentials = await db
    .select()
    .from(supplierCredentials)
    .where(eq(supplierCredentials.supplierId, supplierId));

  try {
    return credentials.map((cred) => ({
      type: cred.credentialType as DecryptedCredential['type'],
      value: decryptCredential(cred.encryptedValue, encryptionKey),
    }));
  } catch (error) {
    console.error(
      `Failed to decrypt credentials for supplier ${supplierId}:`,
      error instanceof Error ? error.message : 'Unknown error'
    );

    await db
      .update(suppliers)
      .set({
        status: 'credential_error',
        lastError: `Credential decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        updatedAt: new Date(),
      })
      .where(eq(suppliers.id, supplierId));

    throw error;
  }
}
