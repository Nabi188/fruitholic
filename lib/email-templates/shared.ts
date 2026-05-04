import { formatVND } from "@/lib/formatters";

export type EmailOrderItem = {
  productName: string;
  variantName: string;
  variantPrice: number;
  quantity: number;
  options?: Array<{ name: string; price: number }>;
};

/**
 * Build HTML table rows for order items.
 * Shared between notification and confirmation emails.
 */
export function buildItemsTableHtml(items: EmailOrderItem[]): string {
  return items
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
}

/**
 * Delivery type labels (Vietnamese).
 */
export const DELIVERY_LABELS: Record<string, string> = {
  ASAP: "Giao ngay",
  SCHEDULED: "Hẹn giờ",
  PICKUP: "Nhận tại cửa hàng",
};

/**
 * Payment method labels (Vietnamese).
 */
export const PAYMENT_LABELS: Record<string, string> = {
  COD: "Thanh toán khi nhận hàng (COD)",
  BANK_TRANSFER: "Chuyển khoản",
};
