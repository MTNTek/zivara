/**
 * Email notification service using Resend.
 * Provides retry logic and graceful degradation when API key is missing.
 */

import { Resend } from 'resend';
import { logger } from '@/lib/logger';
import {
  welcomeHtml,
  orderConfirmationHtml,
  shippingNotificationHtml,
  deliveryConfirmationHtml,
  passwordResetHtml,
  emailVerificationHtml,
} from '@/lib/email-templates';

const resend = new Resend(process.env.RESEND_API_KEY || '');
const FROM = process.env.RESEND_FROM_EMAIL || 'Zivara <noreply@zivara.com>';
const MAX_RETRIES = 3;

type EmailResult = { success: boolean; error?: string };

async function sendWithRetry(
  to: string,
  subject: string,
  html: string,
  retries = MAX_RETRIES
): Promise<EmailResult> {
  if (!process.env.RESEND_API_KEY) {
    logger.warn('RESEND_API_KEY not configured — email not sent', { to, subject });
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n📧 Email (dev)\n  To: ${to}\n  Subject: ${subject}\n`);
    }
    return { success: true };
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await resend.emails.send({ from: FROM, to, subject, html });
      logger.info('Email sent', { to, subject });
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (attempt === retries) {
        logger.error('Email send failed after retries', {
          to, subject, error: msg, attempts: retries,
        });
        return { success: false, error: msg };
      }
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
  return { success: false, error: 'Max retries exceeded' };
}

// ── Templated email functions ────────────────────────────────────────

export async function sendWelcomeEmail(data: {
  name: string;
  email: string;
}): Promise<EmailResult> {
  return sendWithRetry(data.email, 'Welcome to Zivara!', welcomeHtml(data.name));
}

export async function sendOrderConfirmationEmail(data: {
  orderNumber: string;
  customerEmail: string;
  customerName?: string;
  orderDate: string;
  items: Array<{ name: string; quantity: number; price: string }>;
  subtotal: string;
  tax: string;
  shipping: string;
  total: string;
  shippingAddress: { line1: string; line2?: string; city: string; state: string; postalCode: string; country: string };
  trackingUrl: string;
}): Promise<EmailResult> {
  return sendWithRetry(
    data.customerEmail,
    `Order Confirmed — #${data.orderNumber}`,
    orderConfirmationHtml(data)
  );
}

export async function sendShippingNotificationEmail(data: {
  orderNumber: string;
  customerEmail: string;
  customerName?: string;
  trackingNumber?: string;
  carrierName?: string;
  estimatedDeliveryDate?: string;
  trackingUrl: string;
}): Promise<EmailResult> {
  return sendWithRetry(
    data.customerEmail,
    `Your order #${data.orderNumber} has shipped!`,
    shippingNotificationHtml(data)
  );
}

export async function sendDeliveryConfirmationEmail(data: {
  orderNumber: string;
  customerEmail: string;
  customerName?: string;
  deliveryDate: string;
  trackingUrl: string;
}): Promise<EmailResult> {
  return sendWithRetry(
    data.customerEmail,
    `Order #${data.orderNumber} delivered!`,
    deliveryConfirmationHtml(data)
  );
}

export async function sendPasswordResetEmail(
  to: string,
  resetToken: string
): Promise<EmailResult> {
  return sendWithRetry(to, 'Reset your Zivara password', passwordResetHtml(resetToken));
}

export async function sendEmailVerification(
  to: string,
  verificationToken: string
): Promise<EmailResult> {
  return sendWithRetry(to, 'Verify your email — Zivara', emailVerificationHtml(verificationToken));
}
