import { formatVND } from "@/lib/formatters";
import {
  buildItemsTableHtml,
  DELIVERY_LABELS,
  PAYMENT_LABELS,
  type EmailOrderItem,
} from "./shared";

export type OrderNotificationData = {
  code: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  address: string;
  deliveryType: string;
  paymentMethod: string;
  totalAmount: number;
  items: EmailOrderItem[];
};

export function buildOrderNotificationHtml(
  order: OrderNotificationData,
): string {
  const itemsHtml = buildItemsTableHtml(order.items);

  return `
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
        <tr><td style="padding:6px 0;color:#666;">Giao hàng</td><td style="padding:6px 0;">${DELIVERY_LABELS[order.deliveryType] ?? order.deliveryType}</td></tr>
        <tr><td style="padding:6px 0;color:#666;">Thanh toán</td><td style="padding:6px 0;">${PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</td></tr>
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
}
