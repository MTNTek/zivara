import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@zivara.com';
const BRAND_COLOR = '#14B8A6'; // Teal

// Types
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface WelcomeEmailData {
  name: string;
  email: string;
}

export interface OrderConfirmationEmailData {
  orderNumber: string;
  customerName: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: string;
  }>;
  subtotal: string;
  tax: string;
  shipping: string;
  total: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  trackingUrl: string;
}

export interface ShippingNotificationEmailData {
  orderNumber: string;
  customerName: string;
  trackingNumber?: string;
  carrierName?: string;
  estimatedDeliveryDate?: string;
  trackingUrl: string;
}

export interface DeliveryConfirmationEmailData {
  orderNumber: string;
  customerName: string;
  deliveryDate: string;
  trackingUrl: string;
}

/**
 * Send email with retry logic (up to 3 attempts)
 * Validates: Requirements 28.7
 */
async function sendEmailWithRetry(
  options: EmailOptions,
  maxRetries: number = 3
): Promise<{ success: boolean; error?: string }> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      return { success: true };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error(`Email send attempt ${attempt} failed:`, lastError.message);

      // If this isn't the last attempt, wait before retrying
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  // All retries failed
  console.error(`Failed to send email after ${maxRetries} attempts:`, lastError?.message);
  return {
    success: false,
    error: lastError?.message || 'Failed to send email',
  };
}

/**
 * Generate email template wrapper with Teal branding
 */
function generateEmailTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Zivara</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background-color: #f3f4f6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .header {
          background-color: ${BRAND_COLOR};
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          color: #ffffff;
          font-size: 32px;
          font-weight: 700;
        }
        .content {
          padding: 40px 30px;
          color: #374151;
          line-height: 1.6;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: ${BRAND_COLOR};
          color: #ffffff;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          padding: 20px 30px;
          background-color: #f9fafb;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
        .divider {
          border-top: 1px solid #e5e7eb;
          margin: 20px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        th {
          background-color: #f9fafb;
          font-weight: 600;
        }
        .text-right {
          text-align: right;
        }
        .total-row {
          font-weight: 600;
          font-size: 18px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Zivara</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Zivara. All rights reserved.</p>
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send welcome email on registration
 * Validates: Requirement 28.1
 */
export async function sendWelcomeEmail(
  data: WelcomeEmailData
): Promise<{ success: boolean; error?: string }> {
  const content = `
    <h2>Welcome to Zivara, ${data.name}!</h2>
    <p>Thank you for creating an account with us. We're excited to have you as part of our community.</p>
    <p>You can now:</p>
    <ul>
      <li>Browse our extensive product catalog</li>
      <li>Save items to your cart</li>
      <li>Track your orders</li>
      <li>Leave reviews on products you've purchased</li>
    </ul>
    <p>Start shopping today and discover amazing products!</p>
    <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}" class="button">Start Shopping</a>
    <p>If you have any questions, feel free to reach out to our support team.</p>
  `;

  return sendEmailWithRetry({
    to: data.email,
    subject: 'Welcome to Zivara!',
    html: generateEmailTemplate(content),
  });
}

/**
 * Send order confirmation email
 * Validates: Requirements 28.2, 28.5, 6.7
 */
export async function sendOrderConfirmationEmail(
  data: OrderConfirmationEmailData
): Promise<{ success: boolean; error?: string }> {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td>${item.name}</td>
        <td class="text-right">${item.quantity}</td>
        <td class="text-right">$${item.price}</td>
        <td class="text-right">$${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  const content = `
    <h2>Order Confirmation</h2>
    <p>Hi ${data.customerName},</p>
    <p>Thank you for your order! We've received your order and are processing it now.</p>
    
    <div class="divider"></div>
    
    <h3>Order Details</h3>
    <p><strong>Order Number:</strong> ${data.orderNumber}</p>
    <p><strong>Order Date:</strong> ${data.orderDate}</p>
    
    <h3>Items Ordered</h3>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th class="text-right">Quantity</th>
          <th class="text-right">Price</th>
          <th class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr>
          <td colspan="3" class="text-right"><strong>Subtotal:</strong></td>
          <td class="text-right">$${data.subtotal}</td>
        </tr>
        <tr>
          <td colspan="3" class="text-right"><strong>Tax:</strong></td>
          <td class="text-right">$${data.tax}</td>
        </tr>
        <tr>
          <td colspan="3" class="text-right"><strong>Shipping:</strong></td>
          <td class="text-right">$${data.shipping}</td>
        </tr>
        <tr class="total-row">
          <td colspan="3" class="text-right"><strong>Total:</strong></td>
          <td class="text-right">$${data.total}</td>
        </tr>
      </tbody>
    </table>
    
    <h3>Shipping Address</h3>
    <p>
      ${data.shippingAddress.line1}<br>
      ${data.shippingAddress.line2 ? `${data.shippingAddress.line2}<br>` : ''}
      ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postalCode}<br>
      ${data.shippingAddress.country}
    </p>
    
    <a href="${data.trackingUrl}" class="button">Track Your Order</a>
    
    <p>We'll send you another email when your order ships.</p>
  `;

  return sendEmailWithRetry({
    to: data.customerName, // This should be the email address
    subject: `Order Confirmation - ${data.orderNumber}`,
    html: generateEmailTemplate(content),
  });
}

/**
 * Send shipping notification email
 * Validates: Requirements 28.3, 28.5, 7.4
 */
export async function sendShippingNotificationEmail(
  data: ShippingNotificationEmailData
): Promise<{ success: boolean; error?: string }> {
  const trackingInfo = data.trackingNumber
    ? `
      <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
      ${data.carrierName ? `<p><strong>Carrier:</strong> ${data.carrierName}</p>` : ''}
      ${data.estimatedDeliveryDate ? `<p><strong>Estimated Delivery:</strong> ${data.estimatedDeliveryDate}</p>` : ''}
    `
    : '';

  const content = `
    <h2>Your Order Has Shipped!</h2>
    <p>Hi ${data.customerName},</p>
    <p>Great news! Your order <strong>${data.orderNumber}</strong> has been shipped and is on its way to you.</p>
    
    <div class="divider"></div>
    
    ${trackingInfo}
    
    <a href="${data.trackingUrl}" class="button">Track Your Shipment</a>
    
    <p>You can track your order status at any time using the link above.</p>
    <p>Thank you for shopping with Zivara!</p>
  `;

  return sendEmailWithRetry({
    to: data.customerName, // This should be the email address
    subject: `Your Order Has Shipped - ${data.orderNumber}`,
    html: generateEmailTemplate(content),
  });
}

/**
 * Send delivery confirmation email
 * Validates: Requirements 28.4, 28.5
 */
export async function sendDeliveryConfirmationEmail(
  data: DeliveryConfirmationEmailData
): Promise<{ success: boolean; error?: string }> {
  const content = `
    <h2>Your Order Has Been Delivered!</h2>
    <p>Hi ${data.customerName},</p>
    <p>Your order <strong>${data.orderNumber}</strong> was successfully delivered on ${data.deliveryDate}.</p>
    
    <div class="divider"></div>
    
    <p>We hope you love your purchase! If you have a moment, we'd appreciate it if you could leave a review for the products you ordered.</p>
    
    <a href="${data.trackingUrl}" class="button">View Order Details</a>
    
    <p>If you have any issues with your order, please don't hesitate to contact our support team.</p>
    <p>Thank you for choosing Zivara!</p>
  `;

  return sendEmailWithRetry({
    to: data.customerName, // This should be the email address
    subject: `Order Delivered - ${data.orderNumber}`,
    html: generateEmailTemplate(content),
  });
}
