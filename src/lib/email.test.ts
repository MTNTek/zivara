import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock logger to avoid side effects
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Shared mock — vi.hoisted ensures it's available when vi.mock factory runs
const mockSend = vi.hoisted(() => vi.fn());

vi.mock('resend', () => ({
  Resend: class MockResend {
    emails = { send: mockSend };
  },
}));

// Set RESEND_API_KEY so sendWithRetry doesn't short-circuit
vi.stubEnv('RESEND_API_KEY', 're_test_key');

import {
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendShippingNotificationEmail,
  sendDeliveryConfirmationEmail,
  sendPasswordResetEmail,
  sendEmailVerification,
} from './email';

describe('Email Notification System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email successfully', async () => {
      mockSend.mockResolvedValueOnce({ id: 'email-123' });
      const result = await sendWelcomeEmail({ name: 'John Doe', email: 'john@example.com' });
      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure then succeed', async () => {
      mockSend
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ id: 'email-123' });
      const result = await sendWelcomeEmail({ name: 'John Doe', email: 'john@example.com' });
      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledTimes(2);
    });

    it('should fail after 3 retries', async () => {
      mockSend
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'))
        .mockRejectedValueOnce(new Error('Error 3'));
      const result = await sendWelcomeEmail({ name: 'John Doe', email: 'john@example.com' });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(mockSend).toHaveBeenCalledTimes(3);
    });
  });

  describe('sendOrderConfirmationEmail', () => {
    it('should send order confirmation email', async () => {
      mockSend.mockResolvedValueOnce({ id: 'email-123' });
      const result = await sendOrderConfirmationEmail({
        orderNumber: 'ORD-12345',
        customerName: 'customer@example.com',
        orderDate: 'January 15, 2024',
        items: [{ name: 'Product 1', quantity: 1, price: '29.99' }],
        subtotal: '29.99',
        tax: '2.99',
        shipping: '10.00',
        total: '42.98',
        shippingAddress: { line1: '123 Main St', city: 'New York', state: 'NY', postalCode: '10001', country: 'USA' },
        trackingUrl: 'http://localhost:3000/track/ORD-12345',
      });
      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledTimes(1);
    });
  });

  describe('sendShippingNotificationEmail', () => {
    it('should send shipping notification', async () => {
      mockSend.mockResolvedValueOnce({ id: 'email-123' });
      const result = await sendShippingNotificationEmail({
        orderNumber: 'ORD-12345',
        customerName: 'customer@example.com',
        trackingUrl: 'http://localhost:3000/track/ORD-12345',
      });
      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledTimes(1);
    });
  });

  describe('sendDeliveryConfirmationEmail', () => {
    it('should send delivery confirmation', async () => {
      mockSend.mockResolvedValueOnce({ id: 'email-123' });
      const result = await sendDeliveryConfirmationEmail({
        orderNumber: 'ORD-12345',
        customerName: 'customer@example.com',
        deliveryDate: 'January 20, 2024',
        trackingUrl: 'http://localhost:3000/track/ORD-12345',
      });
      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledTimes(1);
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email', async () => {
      mockSend.mockResolvedValueOnce({ id: 'email-123' });
      const result = await sendPasswordResetEmail('user@example.com', 'reset-token-abc');
      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledTimes(1);
    });
  });

  describe('sendEmailVerification', () => {
    it('should send email verification', async () => {
      mockSend.mockResolvedValueOnce({ id: 'email-123' });
      const result = await sendEmailVerification('user@example.com', 'verify-token-xyz');
      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledTimes(1);
    });
  });
});
