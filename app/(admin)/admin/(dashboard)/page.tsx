import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatVND } from "@/lib/formatters";
import {
  ShoppingCart,
  ListTodo,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getDashboardStats() {
  const supabase = await createSupabaseServerClient();

  const { data: orders } = (await supabase
    .from("orders")
    .select("status, payment_status, total_amount, created_at")) as {
    data: any[];
    error: any;
  };

  if (!orders) return null;

  const total = orders.length;
  const pending = orders.filter((o) => o.status === "pending").length;
  const delivering = orders.filter((o) => o.status === "delivering").length;
  const completed = orders.filter((o) => o.status === "completed").length;
  const cancelled = orders.filter((o) => o.status === "cancelled").length;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayRevenue = orders
    .filter(
      (o) =>
        new Date(o.created_at) >= todayStart && o.payment_status === "paid",
    )
    .reduce((sum: number, o: any) => sum + (o.total_amount ?? 0), 0);

  const monthRevenue = orders
    .filter((o) => o.payment_status === "paid")
    .reduce((sum: number, o: any) => sum + (o.total_amount ?? 0), 0);

  return {
    total,
    pending,
    delivering,
    completed,
    cancelled,
    todayRevenue,
    monthRevenue,
  };
}

async function getRecentOrders() {
  const supabase = await createSupabaseServerClient();
  const { data } = (await supabase
    .from("orders")
    .select(
      "id, code, customer_name, total_amount, status, payment_status, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(8)) as { data: any[]; error: any };
  return data ?? [];
}

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  pending: {
    label: "Chờ xử lý",
    bg: "bg-surface-container-high",
    text: "text-on-surface-variant",
  },
  confirmed: {
    label: "Đã xác nhận",
    bg: "bg-primary/10",
    text: "text-primary",
  },
  delivering: {
    label: "Đang giao",
    bg: "bg-secondary/10",
    text: "text-secondary",
  },
  completed: {
    label: "Hoàn thành",
    bg: "bg-tertiary-container/30",
    text: "text-tertiary",
  },
  cancelled: { label: "Đã hủy", bg: "bg-error/10", text: "text-error" },
};

export default async function AdminDashboard() {
  const [stats, recentOrders] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(),
  ]);

  const metricCards = [
    {
      label: "Tổng đơn hàng",
      value: stats?.total ?? 0,
      icon: ListTodo,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Chờ xử lý",
      value: stats?.pending ?? 0,
      icon: Clock,
      color: "text-secondary",
      bg: "bg-secondary/10",
      highlight: true,
    },
    {
      label: "Đang giao",
      value: stats?.delivering ?? 0,
      icon: Truck,
      color: "text-tertiary",
      bg: "bg-tertiary-container/30",
    },
    {
      label: "Hoàn thành",
      value: stats?.completed ?? 0,
      icon: CheckCircle2,
      color: "text-primary",
      bg: "bg-primary-container/30",
    },
    {
      label: "Đã hủy",
      value: stats?.cancelled ?? 0,
      icon: XCircle,
      color: "text-error",
      bg: "bg-error/10",
    },
  ];

  return (
    <div className=" mx-auto">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">
            Tổng quan
          </h2>
          <p className="text-on-surface-variant font-body mt-1">
            Số liệu thời gian thực của Fruitholic.
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="bg-primary text-on-primary px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
        >
          <ShoppingCart className="w-5 h-5" />
          Xem đơn hàng
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
        {metricCards.map((card) => (
          <div
            key={card.label}
            className={`bg-surface-container-lowest p-6 rounded-[1.5rem] shadow-[0px_20px_40px_rgba(43,48,45,0.06)] flex flex-col justify-between ${card.highlight ? "border-l-4 border-secondary" : ""}`}
          >
            <div className="flex justify-between items-start mb-4">
              <span className={`p-2 ${card.bg} rounded-full`}>
                <card.icon
                  className={`w-5 h-5 ${card.color} fill-current/10`}
                />
              </span>
            </div>
            <div>
              <p className="text-on-surface-variant text-xs font-medium uppercase tracking-wider">
                {card.label}
              </p>
              <p
                className={`text-2xl font-extrabold font-headline mt-1 ${card.highlight ? card.color : ""}`}
              >
                {card.value.toLocaleString("vi-VN")}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-10">
        <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-[1.5rem] shadow-[0px_20px_40px_rgba(43,48,45,0.06)]">
          <h3 className="text-xl font-extrabold font-headline mb-2">
            Doanh thu tháng này
          </h3>
          <p className="text-on-surface-variant text-sm mb-6">
            Tổng thanh toán thành công trong tháng
          </p>
          <p className="text-4xl font-extrabold font-headline text-primary">
            {formatVND(stats?.monthRevenue ?? 0)}
          </p>
        </div>

        <div className="bg-primary p-8 rounded-[1.5rem] text-on-primary shadow-lg overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-sm font-medium opacity-80">Doanh thu hôm nay</p>
            <h4 className="text-3xl font-extrabold font-headline mt-2">
              {formatVND(stats?.todayRevenue ?? 0)}
            </h4>
            <Link
              href="/admin/orders"
              className="mt-6 inline-flex items-center gap-2 bg-on-primary/20 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold hover:bg-on-primary/30 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              Quản lý đơn hàng
            </Link>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-on-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-0 -right-4 w-24 h-24 bg-tertiary-container/20 rounded-full blur-2xl" />
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-[0px_20px_40px_rgba(43,48,45,0.06)] overflow-hidden">
        <div className="px-8 py-6 flex justify-between items-center border-b border-outline-variant/10">
          <h3 className="text-xl font-extrabold font-headline">
            Đơn hàng mới nhất
          </h3>
          <Link
            href="/admin/orders"
            className="text-primary text-sm font-bold flex items-center gap-1 hover:underline"
          >
            Xem tất cả
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Mã đơn
                </th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Khách hàng
                </th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Tổng tiền
                </th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Trạng thái
                </th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">
                  Chi tiết
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {recentOrders.map((order: any) => {
                const cfg = statusConfig[order.status] ?? statusConfig.pending;
                return (
                  <tr
                    key={order.id}
                    className="hover:bg-surface-container-low/30 transition-colors"
                  >
                    <td className="px-8 py-4 font-bold text-primary">
                      #{order.code}
                    </td>
                    <td className="px-8 py-4">{order.customer_name}</td>
                    <td className="px-8 py-4 font-bold">
                      {formatVND(order.total_amount)}
                    </td>
                    <td className="px-8 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold ${cfg.bg} ${cfg.text}`}
                      >
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-primary text-sm font-semibold hover:underline"
                      >
                        Xem
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {recentOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-8 py-12 text-center text-on-surface-variant text-sm"
                  >
                    Chưa có đơn hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
