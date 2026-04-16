import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatVND } from "@/lib/formatters";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Đơn hàng | Fruitholic Admin",
};

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  PENDING: {
    label: "Chờ xử lý",
    bg: "bg-surface-container-high",
    text: "text-on-surface-variant",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    bg: "bg-primary/10",
    text: "text-primary",
  },
  DELIVERING: {
    label: "Đang giao",
    bg: "bg-secondary/10",
    text: "text-secondary",
  },
  COMPLETED: {
    label: "Hoàn thành",
    bg: "bg-tertiary-container/30",
    text: "text-tertiary",
  },
  CANCELLED: { label: "Đã hủy", bg: "bg-error/10", text: "text-error" },
};

const paymentConfig: Record<string, { label: string; color: string }> = {
  paid: { label: "Đã thanh toán", color: "text-primary" },
  unpaid: { label: "Chưa thanh toán", color: "text-secondary" },
  refunded: { label: "Hoàn tiền", color: "text-outline" },
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createSupabaseServerClient();

  let query = (supabase as any)
    .from("orders")
    .select(
      "id, code, customer_name, customer_phone, total_amount, status, payment_status, payment_method, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (status && status !== "ALL") {
    query = query.eq("status", status);
  }

  const { data: orders } = await query;
  const allOrders = (orders as any[]) ?? [];

  const tabs = [
    { key: "ALL", label: "Tất cả" },
    { key: "PENDING", label: "Chờ xử lý" },
    { key: "CONFIRMED", label: "Xác nhận" },
    { key: "DELIVERING", label: "Đang giao" },
    { key: "COMPLETED", label: "Hoàn thành" },
    { key: "CANCELLED", label: "Đã hủy" },
  ];

  return (
    <div className="container mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">
          Quản lý đơn hàng
        </h2>
        <p className="text-on-surface-variant font-body mt-1">
          Xem và xử lý đơn hàng theo thời gian thực.
        </p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/orders${tab.key !== "ALL" ? `?status=${tab.key}` : ""}`}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              (status ?? "ALL") === tab.key
                ? "bg-primary text-on-primary shadow-md shadow-primary/20"
                : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-[0px_20px_40px_rgba(43,48,45,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low/50 text-on-surface-variant text-[11px] uppercase tracking-widest font-bold">
              <tr>
                <th className="py-4 px-6">Mã đơn</th>
                <th className="py-4 px-4">Ngày đặt</th>
                <th className="py-4 px-4">Khách hàng</th>
                <th className="py-4 px-4">Tổng tiền</th>
                <th className="py-4 px-4">Thanh toán</th>
                <th className="py-4 px-4">Trạng thái</th>
                <th className="py-4 px-6 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium divide-y divide-outline-variant/10">
              {allOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-8 py-12 text-center text-on-surface-variant"
                  >
                    Không có đơn hàng nào.
                  </td>
                </tr>
              )}
              {allOrders.map((order: any) => {
                const statusCfg =
                  statusConfig[order.status?.toUpperCase()] ??
                  statusConfig.PENDING;
                const paymentCfg =
                  paymentConfig[order.payment_status?.toLowerCase()] ??
                  paymentConfig.unpaid;
                const date = new Date(order.created_at);
                const dateStr = date.toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                });
                const timeStr = date.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const initials = order.customer_name
                  ?.split(" ")
                  .slice(-2)
                  .map((w: string) => w[0])
                  .join("")
                  .toUpperCase();

                return (
                  <tr
                    key={order.id}
                    className="border-b border-outline-variant/10 hover:bg-surface/30 transition-colors group"
                  >
                    <td className="py-3 px-6 font-bold text-primary">
                      #{order.code}
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant text-xs">
                      {dateStr}, {timeStr}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-[10px] font-bold text-on-secondary-container">
                          {initials}
                        </div>
                        <div>
                          <div>{order.customer_name}</div>
                          <div className="text-xs text-on-surface-variant">
                            {order.customer_phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold">
                      {formatVND(order.total_amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold ${paymentCfg.color}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${order.payment_status?.toLowerCase() === "paid" ? "bg-primary" : "bg-secondary"}`}
                        />
                        {paymentCfg.label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold ${statusCfg.bg} ${statusCfg.text}`}
                      >
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-primary text-sm font-semibold hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Xem
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
