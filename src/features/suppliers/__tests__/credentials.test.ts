import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import {
  encryptCredential,
  decryptCredential,
  maskCredential,
} from '../credentials';

// Generate a valid 32-byte hex key for testing
const TEST_KEY = crypto.randomBytes(32).toString('hex');

describe('encryptCredential / decryptCredential', () => {
  it('should round-trip encrypt and decrypt a credential', () => {
    const plaintext = 'my-secret-api-key-12345';
    const encrypted = encryptCredential(plaintext, TEST_KEY);
    const decrypted = decryptCredential(encrypted, TEST_KEY);
    expect(decrypted).toBe(plaintext);
  });

  it('should produce different ciphertexts for the same plaintext (random IV)', () => {
    const plaintext = 'same-value';
    const a = encryptCredential(plaintext, TEST_KEY);
    const b = encryptCredential(plaintext, TEST_KEY);
    expect(a).not.toBe(b);
  });

  it('should handle empty string', () => {
    const encrypted = encryptCredential('', TEST_KEY);
    const decrypted = decryptCredential(encrypted, TEST_KEY);
    expect(decrypted).toBe('');
  });

  it('should handle unicode characters', () => {
    const plaintext = '密码🔑тест';
    const encrypted = encryptCredential(plaintext, TEST_KEY);
    const decrypted = decryptCredential(encrypted, TEST_KEY);
    expect(decrypted).toBe(plaintext);
  });

  it('should throw on invalid key length', () => {
    expect(() => encryptCredential('test', 'short')).toThrow('Encryption key must be 32 bytes');
    expect(() => decryptCredential('dGVzdA==', 'short')).toThrow('Encryption key must be 32 bytes');
  });

  it('should throw on tampered ciphertext', () => {
    const encrypted = encryptCredential('secret', TEST_KEY);
    const buf = Buffer.from(encrypted, 'base64');
    buf[buf.length - 1] ^= 0xff; // flip last byte
    const tampered = buf.toString('base64');
    expect(() => decryptCredential(tampered, TEST_KEY)).toThrow();
  });

  it('should throw on wrong key', () => {
    const otherKey = crypto.randomBytes(32).toString('hex');
    const encrypted = encryptCredential('secret', TEST_KEY);
    expect(() => decryptCredential(encrypted, otherKey)).toThrow();
  });

  it('should throw on ciphertext that is too short', () => {
    const short = Buffer.from('abc').toString('base64');
    expect(() => decryptCredential(short, TEST_KEY)).toThrow('Invalid ciphertext: too short');
  });
});

describe('maskCredential', () => {
  it('should show last 4 characters for strings >= 5 chars', () => {
    expect(maskCredential('abcdefgh')).toBe('****efgh');
  });

  it('should show last 4 characters for exactly 5 chars', () => {
    expect(maskCredential('12345')).toBe('*2345');
  });

  it('should mask entirely for 4-char string', () => {
    expect(maskCredential('abcd')).toBe('****');
  });

  it('should mask entirely for 3-char string', () => {
    expect(maskCredential('abc')).toBe('***');
  });

  it('should mask entirely for 1-char string', () => {
    expect(maskCredential('x')).toBe('*');
  });

  it('should return empty string for empty input', () => {
    expect(maskCredential('')).toBe('');
  });

  it('should handle long strings', () => {
    const long = 'a'.repeat(100);
    const masked = maskCredential(long);
    expect(masked).toBe('*'.repeat(96) + 'aaaa');
    expect(masked.length).toBe(100);
  });
});
