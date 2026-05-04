import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatVND } from "@/lib/formatters";


export const metadata = {
  title: "Orders | Fruitholic Admin",
};

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  PENDING: {
    label: "Pending",
    bg: "bg-surface-container-high",
    text: "text-on-surface-variant",
  },
  CONFIRMED: {
    label: "Confirmed",
    bg: "bg-primary/10",
    text: "text-primary",
  },
  DELIVERING: {
    label: "Delivering",
    bg: "bg-secondary/10",
    text: "text-secondary",
  },
  COMPLETED: {
    label: "Completed",
    bg: "bg-tertiary-container/30",
    text: "text-tertiary",
  },
  CANCELLED: { label: "Cancelled", bg: "bg-error/10", text: "text-error" },
};

const paymentConfig: Record<string, { label: string; color: string }> = {
  paid: { label: "Paid", color: "text-primary" },
  unpaid: { label: "Unpaid", color: "text-secondary" },
  refunded: { label: "Refunded", color: "text-outline" },
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
    { key: "ALL", label: "All" },
    { key: "PENDING", label: "Pending" },
    { key: "CONFIRMED", label: "Confirmed" },
    { key: "DELIVERING", label: "Delivering" },
    { key: "COMPLETED", label: "Completed" },
    { key: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <div className="container mx-auto space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold font-headline tracking-tight text-on-surface">
          Order Management
        </h2>
        <p className="text-on-surface-variant font-body mt-1 text-sm sm:text-base">
          View and process orders in real-time.
        </p>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none -mx-2 px-2">
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
            <thead className="bg-surface-container-low/50 text-on-surface-variant text-[10px] sm:text-[11px] uppercase tracking-widest font-bold">
              <tr>
                <th className="py-3 sm:py-4 px-3 sm:px-6">Order ID</th>
                <th className="py-3 sm:py-4 px-3 sm:px-4 hidden sm:table-cell">
                  Date
                </th>
                <th className="py-3 sm:py-4 px-3 sm:px-4">Customer</th>
                <th className="py-3 sm:py-4 px-3 sm:px-4">Total</th>
                <th className="py-3 sm:py-4 px-3 sm:px-4 hidden md:table-cell">
                  Payment
                </th>
                <th className="py-3 sm:py-4 px-3 sm:px-6">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium divide-y divide-outline-variant/10">
              {allOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-8 py-12 text-center text-on-surface-variant"
                  >
                    No orders found.
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
                // Đổi định dạng ngày sang quốc tế (hoặc giữ en-US)
                const dateStr = date.toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                });
                const timeStr = date.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
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
                    className="border-b border-outline-variant/10 hover:bg-primary/5 transition-colors group relative cursor-pointer"
                  >
                    <td className="py-3 px-3 sm:px-6 font-bold text-primary">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="absolute inset-0 z-10"
                        aria-label={`View order #${order.code}`}
                      />
                      #{order.code}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-on-surface-variant text-xs hidden sm:table-cell">
                      {dateStr}, {timeStr}
                    </td>
                    <td className="py-3 px-3 sm:px-4">
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
                    <td className="py-3 px-3 sm:px-4 font-bold text-sm">
                      {formatVND(order.total_amount)}
                    </td>
                    <td className="py-3 px-3 sm:px-4 hidden md:table-cell">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold ${paymentCfg.color}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${order.payment_status?.toLowerCase() === "paid" ? "bg-primary" : "bg-secondary"}`}
                        />
                        {paymentCfg.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 sm:px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold ${statusCfg.bg} ${statusCfg.text}`}
                      >
                        {statusCfg.label}
                      </span>
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
