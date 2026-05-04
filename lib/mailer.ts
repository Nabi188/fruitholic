import nodemailer from "nodemailer";
import {
  buildOrderNotificationHtml,
  type OrderNotificationData,
} from "@/lib/email-templates/order-notification";
import {
  buildOrderConfirmationHtml,
  type OrderConfirmationData,
} from "@/lib/email-templates/order-confirmation";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT ?? "587");
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM ?? SMTP_USER;
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL;

function createTransporter() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

// Re-export types for backward compatibility
export type { OrderNotificationData };

export async function sendOrderNotification(order: OrderNotificationData) {
  const transporter = createTransporter();
  if (!transporter || !NOTIFICATION_EMAIL) return;

  const html = buildOrderNotificationHtml(order);

  await transporter.sendMail({
    from: `"Fruitholic Orders" <${SMTP_FROM}>`,
    to: NOTIFICATION_EMAIL,
    subject: `🛍️ Đơn hàng mới #${order.code} — ${order.customerName}`,
    html,
  });
}

export async function sendCustomerOrderConfirmation(
  order: OrderNotificationData,
) {
  if (!order.customerEmail) return;
  const transporter = createTransporter();
  if (!transporter) return;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const confirmationData: OrderConfirmationData = {
    code: order.code,
    customerName: order.customerName,
    totalAmount: order.totalAmount,
    items: order.items,
  };

  const html = buildOrderConfirmationHtml(confirmationData, appUrl);

  try {
    await transporter.sendMail({
      from: `"Fruitholic" <${SMTP_FROM}>`,
      to: order.customerEmail,
      subject: `✅ Xác nhận đơn hàng #${order.code} — Fruitholic`,
      html,
    });
  } catch (err) {
    console.error("Failed to send customer confirmation email:", err);
  }
}
