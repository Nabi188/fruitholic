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

export async function sendCustomerOrderConfirmation(
  order: OrderNotificationPayload,
) {
  if (!order.customerEmail) return;
  const transporter = createTransporter();
  if (!transporter) return;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

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
<head><meta charset="utf-8"><title>Xác nhận đơn hàng</title></head>
<body style="font-family:Arial,sans-serif;background:#f6f6f6;padding:24px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:#006b1b;padding:24px 32px;">
      <h1 style="color:#fff;margin:0;font-size:22px;">✅ Đặt hàng thành công!</h1>
    </div>
    <div style="padding:32px;">
      <p style="font-size:16px;color:#333;margin:0 0 8px;">Xin chào <strong>${order.customerName}</strong>,</p>
      <p style="color:#666;margin:0 0 24px;line-height:1.6;">
        Cảm ơn bạn đã đặt hàng tại <strong>Fruitholic</strong>. Đơn hàng
        <strong style="color:#006b1b;">#${order.code}</strong> đã được tiếp nhận và đang được xử lý.
      </p>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 20px;margin-bottom:24px;text-align:center;">
        <p style="margin:0 0 4px;font-size:13px;color:#666;">Mã đơn hàng</p>
        <p style="margin:0;font-size:28px;font-weight:800;color:#006b1b;letter-spacing:2px;">#${order.code}</p>
      </div>

      <h3 style="margin:0 0 12px;font-size:16px;border-bottom:2px solid #f0f0f0;padding-bottom:8px;">Chi tiết đơn hàng</h3>
      <table style="width:100%;border-collapse:collapse;">
        ${itemsHtml}
        <tr>
          <td style="padding:12px;font-weight:700;font-size:16px;">Tổng cộng</td>
          <td style="padding:12px;font-weight:700;font-size:18px;text-align:right;color:#006b1b;">${formatVND(order.totalAmount)}</td>
        </tr>
      </table>

      <div style="margin-top:24px;text-align:center;">
        <a href="${appUrl}/thank-you?code=${order.code}"
          style="display:inline-block;background:#006b1b;color:#fff;padding:12px 32px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;">
          Xem đơn hàng
        </a>
      </div>
    </div>
    <div style="padding:16px 32px;background:#f9fafb;text-align:center;color:#9ca3af;font-size:12px;">
      Fruitholic · Trái cây hữu cơ tươi ngon<br/>
      Nếu có thắc mắc, vui lòng liên hệ qua hotline hoặc reply email này.
    </div>
  </div>
</body>
</html>`;

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

