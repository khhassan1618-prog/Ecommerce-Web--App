import { getCachedAccessToken, requestGmailAccessToken } from './firebase';
import { Order } from '../types';

export const OWNER_EMAIL = 'kh.hassan.16.18@gmail.com';

export interface EmailDispatchResult {
  success: boolean;
  messageId?: string;
  error?: string;
  sender: string;
  recipient: string;
  timestamp: string;
  orderId: string;
}

/**
 * Creates RFC 2822 base64url-encoded email message for Gmail API
 */
function createRawEmail(to: string, from: string, subject: string, htmlBody: string): string {
  const emailLines = [
    `From: "NovaRetron Archive" <${from}>`,
    `To: <${to}>`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    htmlBody
  ];

  const fullEmail = emailLines.join('\r\n');
  return btoa(unescape(encodeURIComponent(fullEmail)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Generates editorial cyber-styled order tracking HTML template
 */
export function generateOrderTrackingHtml(order: Order, customNote?: string): string {
  const timelineHtml = order.timeline
    .map(
      step => `
      <tr style="border-bottom: 1px solid #202221;">
        <td style="padding: 10px 14px; font-size: 13px; font-weight: ${step.completed ? 'bold' : 'normal'}; color: ${step.completed ? '#FD8A46' : '#888888'};">
          ${step.completed ? '● COMPLETED' : '○ PENDING'}
        </td>
        <td style="padding: 10px 14px; font-size: 13px; color: ${step.completed ? '#F3EDD8' : '#666666'};">
          <strong>${step.status}</strong><br/>
          <span style="font-size: 11px; color: #888888;">${step.location}</span>
        </td>
        <td style="padding: 10px 14px; font-size: 11px; color: #888888; text-align: right;">
          ${step.timestamp}
        </td>
      </tr>
    `
    )
    .join('');

  const itemsHtml = order.items
    .map(
      item => `
      <tr style="border-bottom: 1px solid #1a1b1b;">
        <td style="padding: 10px 14px; font-size: 13px; color: #F3EDD8;">
          <strong>${item.product.name}</strong><br/>
          <span style="font-size: 11px; color: #888888;">Size: ${item.size} | Color: ${item.color}</span>
        </td>
        <td style="padding: 10px 14px; font-size: 13px; color: #FD8A46; text-align: center;">
          x${item.quantity}
        </td>
        <td style="padding: 10px 14px; font-size: 13px; color: #F3EDD8; text-align: right;">
          PKR ${(item.product.price * item.quantity).toLocaleString()}
        </td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>NovaRetron Logistics Telemetry</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #070707; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F3EDD8;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #0e0f0f; border: 1px solid #202221;">
    <!-- Header -->
    <tr>
      <td style="padding: 28px 24px; background-color: #121313; border-bottom: 2px solid #FD8A46;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td>
              <div style="font-family: monospace; font-size: 11px; letter-spacing: 2px; color: #FD8A46; text-transform: uppercase;">
                NOVA / RETRON ARCHIVAL LOGISTICS
              </div>
              <h1 style="margin: 6px 0 0 0; font-size: 22px; font-weight: 800; color: #F3EDD8; letter-spacing: -0.5px;">
                ORDER TELEMETRY DISPATCH
              </h1>
            </td>
            <td style="text-align: right;">
              <span style="display: inline-block; padding: 4px 10px; background-color: rgba(253, 138, 70, 0.15); border: 1px solid #FD8A46; color: #FD8A46; font-size: 11px; font-weight: bold; font-family: monospace;">
                ${order.status}
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body Info -->
    <tr>
      <td style="padding: 24px;">
        ${customNote ? `<div style="margin-bottom: 20px; padding: 12px 16px; background-color: #171918; border-left: 3px solid #FD8A46; font-size: 13px; color: #F3EDD8;">${customNote}</div>` : ''}

        <p style="margin-top: 0; font-size: 14px; line-height: 1.6; color: #F3EDD8;">
          Greetings <strong>${order.customerName}</strong>,
        </p>
        <p style="font-size: 13px; line-height: 1.6; color: #b8b3a0;">
          Here is your live shipment telemetry report for Order Reference <strong style="color: #FD8A46; font-family: monospace;">${order.orderId}</strong>.
        </p>

        <!-- Order Summary Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 20px 0; background-color: #121313; border: 1px solid #202221; font-family: monospace; font-size: 12px;">
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #202221; color: #888888;">DESTINATION</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #202221; color: #F3EDD8; text-align: right;">${order.shippingAddress.address}, ${order.shippingAddress.city}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #202221; color: #888888;">CARRIER NODE</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #202221; color: #F3EDD8; text-align: right;">${order.shippingAddress.carrier || 'TCS Express Pakistan'}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; color: #888888;">TOTAL MANIFEST VALUE</td>
            <td style="padding: 12px 16px; color: #FD8A46; font-weight: bold; text-align: right;">PKR ${order.total.toLocaleString()}</td>
          </tr>
        </table>

        <!-- Checkpoints Timeline -->
        <h3 style="margin: 24px 0 12px 0; font-size: 12px; font-family: monospace; letter-spacing: 1px; color: #FD8A46; text-transform: uppercase;">
          DISPATCH CHECKPOINT LOG
        </h3>
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; border: 1px solid #202221; font-family: monospace;">
          ${timelineHtml}
        </table>

        <!-- Cargo Manifest -->
        <h3 style="margin: 24px 0 12px 0; font-size: 12px; font-family: monospace; letter-spacing: 1px; color: #FD8A46; text-transform: uppercase;">
          CARGO MANIFEST ITEMS
        </h3>
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; border: 1px solid #202221; font-family: monospace;">
          ${itemsHtml}
        </table>

        <div style="text-align: center; margin: 30px 0 10px 0;">
          <a href="https://ais-pre-7xzrqmvqo2hwcd6blfoyto-643785046848.asia-east1.run.app" style="display: inline-block; padding: 12px 28px; background-color: #FD8A46; color: #070707; text-decoration: none; font-weight: bold; font-family: monospace; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">
            OPEN INTERACTIVE TRACKER ➔
          </a>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 20px 24px; background-color: #070707; border-top: 1px solid #202221; font-family: monospace; font-size: 11px; color: #666666; text-align: center; line-height: 1.5;">
        Automated Dispatch triggered via <strong>${OWNER_EMAIL}</strong> via Gmail API.<br/>
        NovaRetron Neural Fashion Logistics &copy; 2026. All rights reserved.
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Sends order tracking email using Google Workspace Gmail API with the owner's OAuth token
 */
export async function sendOrderTrackingEmail(
  order: Order,
  recipientEmail: string,
  customNote?: string
): Promise<EmailDispatchResult> {
  const toEmail = recipientEmail.trim();
  const fromEmail = OWNER_EMAIL;
  const subject = `[NovaRetron Logistics] Order Status Update: ${order.orderId} - ${order.status}`;
  const htmlContent = generateOrderTrackingHtml(order, customNote);

  const timestamp = new Date().toISOString();

  try {
    // 1. Check for cached OAuth token
    let token = getCachedAccessToken();

    // 2. If token is not in memory, attempt to request access token
    if (!token) {
      console.log('[GMAIL SERVICE] No cached access token found, requesting token...');
      token = await requestGmailAccessToken();
    }

    if (!token) {
      throw new Error(
        `Gmail access token unavailable. Please sign in with Google to grant email sending permissions for ${OWNER_EMAIL}.`
      );
    }

    // 3. Create raw RFC 2822 email payload
    const rawEmail = createRawEmail(toEmail, fromEmail, subject, htmlContent);

    // 4. Send directly via Google Workspace Gmail REST API
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw: rawEmail })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[GMAIL API ERROR RESPONSE]', response.status, errorData);
      throw new Error(errorData?.error?.message || `Gmail API HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('[GMAIL API SUCCESS] Email dispatched successfully:', data.id);

    return {
      success: true,
      messageId: data.id,
      sender: fromEmail,
      recipient: toEmail,
      timestamp,
      orderId: order.orderId
    };
  } catch (err: any) {
    console.error('[GMAIL SERVICE ERROR]', err);
    return {
      success: false,
      error: err.message || 'Failed to dispatch email via Gmail API',
      sender: fromEmail,
      recipient: toEmail,
      timestamp,
      orderId: order.orderId
    };
  }
}
