import nodemailer from "nodemailer";
import { formatVND } from "@/lib/formatters";

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

type OrderNotificationPayload = {
  code: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  address: string;
  deliveryType: string;
  paymentMethod: string;
  totalAmount: number;
  items: Array<{
    productName: string;
    variantName: string;
    variantPrice: number;
    quantity: number;
    options?: Array<{ name: string; price: number }>;
  }>;
};

export async function sendOrderNotification(order: OrderNotificationPayload) {
  const transporter = createTransporter();
  if (!transporter || !NOTIFICATION_EMAIL) return;

  const deliveryLabel: Record<string, string> = {
    ASAP: "Giao ngay",
    SCHEDULED: "Hẹn giờ",
    PICKUP: "Nhận tại cửa hàng",
  };

  const paymentLabel: Record<string, string> = {
    COD: "Thanh toán khi nhận hàng (COD)",
    BANK_TRANSFER: "Chuyển khoản",
  };

  const itemsHtml = order.items
    .map((item) => {
      const optionsText =
        item.options && item.options.length > 0
          ? `<br/><small style="color:#666;">${item.options.map((o) => `${o.name} (+${formatVND(o.price)})`).join(", ")}</small>`
          : "";
      const total =
        (item.variantPrice +
          (item.options?.reduce((s, o) => s + o.price, 0) ?? 0)) *
        item.quantity;
      return `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">
            ${item.quantity}x <strong>${item.productName}</strong>
            ${item.variantName !== "Mặc định" ? `<em>(${item.variantName})</em>` : ""}
            ${optionsText}
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;white-space:nowrap;">
            ${formatVND(total)}
          </td>
        </tr>`;
    })
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Đơn hàng mới</title></head>
<body style="font-family:Arial,sans-serif;background:#f6f6f6;padding:24px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:#16a34a;padding:24px 32px;">
      <h1 style="color:#fff;margin:0;font-size:22px;">🛍️ Đơn hàng mới #${order.code}</h1>
    </div>
    <div style="padding:32px;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr><td style="padding:6px 0;color:#666;width:160px;">Khách hàng</td><td style="padding:6px 0;font-weight:600;">${order.customerName}</td></tr>
        <tr><td style="padding:6px 0;color:#666;">Số điện thoại</td><td style="padding:6px 0;">${order.customerPhone}</td></tr>
        ${order.customerEmail ? `<tr><td style="padding:6px 0;color:#666;">Email</td><td style="padding:6px 0;">${order.customerEmail}</td></tr>` : ""}
        <tr><td style="padding:6px 0;color:#666;">Địa chỉ</td><td style="padding:6px 0;">${order.address}</td></tr>
        <tr><td style="padding:6px 0;color:#666;">Giao hàng</td><td style="padding:6px 0;">${deliveryLabel[order.deliveryType] ?? order.deliveryType}</td></tr>
        <tr><td style="padding:6px 0;color:#666;">Thanh toán</td><td style="padding:6px 0;">${paymentLabel[order.paymentMethod] ?? order.paymentMethod}</td></tr>
      </table>

      <h3 style="margin:0 0 12px;font-size:16px;border-bottom:2px solid #f0f0f0;padding-bottom:8px;">Chi tiết đơn hàng</h3>
      <table style="width:100%;border-collapse:collapse;">
        ${itemsHtml}
        <tr>
          <td style="padding:12px;font-weight:700;font-size:16px;">Tổng cộng</td>
          <td style="padding:12px;font-weight:700;font-size:18px;text-align:right;color:#16a34a;">${formatVND(order.totalAmount)}</td>
        </tr>
      </table>
    </div>
    <div style="padding:16px 32px;background:#f9fafb;text-align:center;color:#9ca3af;font-size:12px;">
      Fruitholic · Hệ thống gửi tự động — Vui lòng không reply email này.
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Fruitholic Orders" <${SMTP_FROM}>`,
    to: NOTIFICATION_EMAIL,
    subject: `🛍️ Đơn hàng mới #${order.code} — ${order.customerName}`,
    html,
  });
}
