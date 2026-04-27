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
import {
  RevenueChart,
  OrdersByStatusChart,
  TopProductsChart,
} from "@/components/admin/DashboardCharts";

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
  const pending = orders.filter(
    (o) => o.status?.toUpperCase() === "PENDING",
  ).length;
  const delivering = orders.filter(
    (o) => o.status?.toUpperCase() === "DELIVERING",
  ).length;
  const completed = orders.filter(
    (o) => o.status?.toUpperCase() === "COMPLETED",
  ).length;
  const cancelled = orders.filter(
    (o) => o.status?.toUpperCase() === "CANCELLED",
  ).length;
  const confirmed = orders.filter(
    (o) => o.status?.toUpperCase() === "CONFIRMED",
  ).length;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayRevenue = orders
    .filter(
      (o) =>
        new Date(o.created_at) >= todayStart &&
        o.payment_status?.toUpperCase() === "PAID",
    )
    .reduce((sum: number, o: any) => sum + (o.total_amount ?? 0), 0);

  const monthRevenue = orders
    .filter((o) => o.payment_status?.toUpperCase() === "PAID")
    .reduce((sum: number, o: any) => sum + (o.total_amount ?? 0), 0);

  // Revenue per day (last 30 days)
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const paidOrders = orders.filter(
    (o) =>
      o.payment_status?.toUpperCase() === "PAID" &&
      new Date(o.created_at) >= thirtyDaysAgo,
  );

  const revenueByDay: Record<string, number> = {};
  for (let d = new Date(thirtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
    const key = d.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
    });
    revenueByDay[key] = 0;
  }
  paidOrders.forEach((o) => {
    const key = new Date(o.created_at).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
    });
    if (revenueByDay[key] !== undefined) {
      revenueByDay[key] += o.total_amount ?? 0;
    }
  });

  const revenueData = Object.entries(revenueByDay).map(([day, revenue]) => ({
    day,
    revenue,
  }));

  const statusData = [
    { name: "Pending", value: pending, color: "#8d8d8d" },
    { name: "Confirmed", value: confirmed, color: "#006b1b" },
    { name: "Delivering", value: delivering, color: "#8d4a00" },
    { name: "Completed", value: completed, color: "#176a21" },
    { name: "Cancelled", value: cancelled, color: "#b02500" },
  ].filter((d) => d.value > 0);

  return {
    total,
    pending,
    delivering,
    completed,
    cancelled,
    todayRevenue,
    monthRevenue,
    revenueData,
    statusData,
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

async function getTopProducts() {
  const supabase = await createSupabaseServerClient();
  const { data } = await (supabase as any).rpc("get_revenue_by_product");
  if (!data) return [];
  return (data as any[]).slice(0, 8).map((p: any) => ({
    name:
      p.product_name?.length > 15
        ? p.product_name.substring(0, 15) + "…"
        : p.product_name,
    revenue: Number(p.total_revenue) || 0,
    qty: Number(p.total_qty) || 0,
  }));
}

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

export default async function AdminDashboard() {
  const [stats, recentOrders, topProducts] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(),
    getTopProducts(),
  ]);

  const metricCards = [
    {
      label: "Total Orders",
      value: stats?.total ?? 0,
      icon: ListTodo,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Pending",
      value: stats?.pending ?? 0,
      icon: Clock,
      color: "text-secondary",
      bg: "bg-secondary/10",
      highlight: true,
    },
    {
      label: "Delivering",
      value: stats?.delivering ?? 0,
      icon: Truck,
      color: "text-tertiary",
      bg: "bg-tertiary-container/30",
    },
    {
      label: "Completed",
      value: stats?.completed ?? 0,
      icon: CheckCircle2,
      color: "text-primary",
      bg: "bg-primary-container/30",
    },
    {
      label: "Cancelled",
      value: stats?.cancelled ?? 0,
      icon: XCircle,
      color: "text-error",
      bg: "bg-error/10",
    },
  ];

  return (
    <div className=" mx-auto">
      <div className="mb-6 sm:mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-headline tracking-tight text-on-surface">
            Dashboard Overview
          </h2>
          <p className="text-on-surface-variant font-body mt-1 text-sm sm:text-base">
            Real-time data for Fruitholic.
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="bg-primary text-on-primary px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
        >
          <ShoppingCart className="w-5 h-5" />
          View Orders
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-6 mb-6 sm:mb-10">
        {metricCards.map((card) => (
          <div
            key={card.label}
            className={`bg-surface-container-lowest p-4 sm:p-6 rounded-[1.25rem] sm:rounded-[1.5rem] shadow-[0px_20px_40px_rgba(43,48,45,0.06)] flex flex-col justify-between ${card.highlight ? "border-l-4 border-secondary" : ""}`}
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
                {card.value.toLocaleString("en-US")}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-10">
        <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-[1.5rem] shadow-[0px_20px_40px_rgba(43,48,45,0.06)]">
          <h3 className="text-xl font-extrabold font-headline mb-2">
            Revenue This Month
          </h3>
          <p className="text-on-surface-variant text-sm mb-6">
            Total successful payments this month
          </p>
          <p className="text-4xl font-extrabold font-headline text-primary">
            {formatVND(stats?.monthRevenue ?? 0)}
          </p>
        </div>

        <div className="bg-primary p-8 rounded-[1.5rem] text-on-primary shadow-lg overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-sm font-medium opacity-80">
              Today&apos;s Revenue
            </p>
            <h4 className="text-3xl font-extrabold font-headline mt-2">
              {formatVND(stats?.todayRevenue ?? 0)}
            </h4>
            <Link
              href="/admin/orders"
              className="mt-6 inline-flex items-center gap-2 bg-on-primary/20 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold hover:bg-on-primary/30 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              Manage Orders
            </Link>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-on-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-0 -right-4 w-24 h-24 bg-tertiary-container/20 rounded-full blur-2xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <RevenueChart data={stats?.revenueData ?? []} />
        <OrdersByStatusChart data={stats?.statusData ?? []} />
      </div>

      <div className="mb-10">
        <TopProductsChart data={topProducts} />
      </div>

      <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-[0px_20px_40px_rgba(43,48,45,0.06)] overflow-hidden">
        <div className="px-8 py-6 flex justify-between items-center border-b border-outline-variant/10">
          <h3 className="text-xl font-extrabold font-headline">
            Recent Orders
          </h3>
          <Link
            href="/admin/orders"
            className="text-primary text-sm font-bold flex items-center gap-1 hover:underline"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Order ID
                </th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Customer
                </th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Total
                </th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {recentOrders.map((order: any) => {
                const cfg =
                  statusConfig[order.status?.toUpperCase()] ??
                  statusConfig.PENDING;
                return (
                  <tr
                    key={order.id}
                    className="hover:bg-primary/5 transition-colors relative cursor-pointer"
                  >
                    <td className="px-8 py-4 font-bold text-primary">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="absolute inset-0 z-10"
                        aria-label={`View order #${order.code}`}
                      />
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
                  </tr>
                );
              })}
              {recentOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-12 text-center text-on-surface-variant text-sm"
                  >
                    No orders found.
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
