import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Resend before importing email module
vi.mock('resend', () => {
  const mockSend = vi.fn();
  return {
    Resend: class MockResend {
      emails = { send: mockSend };
    },
    mockSend,
  };
});

import {
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendShippingNotificationEmail,
  sendDeliveryConfirmationEmail,
} from './email';

// Get the mock send function
const { Resend } = await import('resend');
const mockSend = new (Resend as unknown as new () => { emails: { send: ReturnType<typeof vi.fn> } })().emails.send;

describe('Email Notification System', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email successfully', async () => {
      mockSend.mockResolvedValueOnce({ id: 'email-123' });
      
      const result = await sendWelcomeEmail({
        name: 'John Doe',
        email: 'john@example.com',
      });

      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
      mockSend
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ id: 'email-123' });
      
      const result = await sendWelcomeEmail({
        name: 'John Doe',
        email: 'john@example.com',
      });

      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledTimes(2);
    });

    it('should fail after 3 retries', async () => {
      mockSend
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'))
        .mockRejectedValueOnce(new Error('Error 3'));
      
      const result = await sendWelcomeEmail({
        name: 'John Doe',
        email: 'john@example.com',
      });

      expect(result.success).toBe(false);
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
        shippingAddress: {
          line1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'USA',
        },
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
});
