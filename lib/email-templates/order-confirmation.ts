import { formatVND } from "@/lib/formatters";
import { buildItemsTableHtml, type EmailOrderItem } from "./shared";

export type OrderConfirmationData = {
  code: string;
  customerName: string;
  totalAmount: number;
  items: EmailOrderItem[];
};

export function buildOrderConfirmationHtml(
  order: OrderConfirmationData,
  appUrl: string,
): string {
  const itemsHtml = buildItemsTableHtml(order.items);

  return `
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
        <a href="${appUrl}/orders/track?code=${order.code}"
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
}
