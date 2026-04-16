import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatVND, formatDateTime } from "@/lib/formatters";
import { OrderStatusActions } from "@/components/admin/OrderStatusActions";
import { ArrowLeft, User, CreditCard, ShoppingBag } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: order } = (await (supabase as any)
    .from("orders")
    .select(
      `
      *,
      order_items(
        id, product_name, variant_name, price, quantity,
        order_item_options(
          id, option_group_name, option_value_name, price
        ),
        products(name, product_images(url, sort_order))
      )
    `,
    )
    .eq("id", id)
    .single()) as { data: any };

  if (!order) notFound();

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

  const cfg = statusConfig[order.status?.toUpperCase()] ?? statusConfig.PENDING;
  const items = order.order_items ?? [];

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/admin/orders"
          className="p-2 hover:bg-surface-container rounded-full transition-all text-on-surface-variant"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-extrabold font-headline text-on-surface">
            Đơn #{order.code}
          </h2>
          <p className="text-on-surface-variant text-sm mt-0.5">
            Đặt lúc {formatDateTime(order.created_at)}
          </p>
        </div>
        <span
          className={`ml-auto px-4 py-1.5 rounded-full text-sm font-bold ${cfg.bg} ${cfg.text}`}
        >
          {cfg.label}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(43,48,45,0.06)]">
            <h3 className="font-headline font-bold text-lg mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Thông tin khách hàng
            </h3>
            <div className="space-y-3 text-sm font-body">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Người đặt</span>
                <strong>{order.customer_name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Điện thoại</span>
                <a
                  href={`tel:${order.customer_phone}`}
                  className="font-bold text-primary"
                >
                  {order.customer_phone}
                </a>
              </div>
              {order.customer_email && (
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Email</span>
                  <span>{order.customer_email}</span>
                </div>
              )}
              <div className="border-t border-surface-container my-3" />
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Người nhận</span>
                <strong>{order.receiver_name || order.customer_name}</strong>
              </div>
              {order.receiver_phone && (
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">SĐT nhận</span>
                  <span>{order.receiver_phone}</span>
                </div>
              )}
              <div className="flex justify-between items-start gap-4">
                <span className="text-on-surface-variant shrink-0">
                  Địa chỉ
                </span>
                <span className="text-right">{order.address}</span>
              </div>
              {order.note && (
                <div className="flex justify-between items-start gap-4">
                  <span className="text-on-surface-variant shrink-0">
                    Ghi chú
                  </span>
                  <span className="text-right italic">{order.note}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(43,48,45,0.06)]">
            <h3 className="font-headline font-bold text-lg mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Thanh toán & Giao hàng
            </h3>
            <div className="space-y-3 text-sm font-body">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Hình thức TT</span>
                <strong>
                  {order.payment_method === "cod" ? "COD" : "Chuyển khoản"}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Trạng thái TT</span>
                <span
                  className={`font-bold ${order.payment_status?.toLowerCase() === "paid" ? "text-primary" : "text-secondary"}`}
                >
                  {order.payment_status?.toLowerCase() === "paid"
                    ? "Đã thanh toán"
                    : "Chưa thanh toán"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Kiểu giao hàng</span>
                <span>{order.delivery_type}</span>
              </div>
            </div>
          </div>

          <OrderStatusActions
            orderId={order.id}
            currentStatus={order.status}
            currentPaymentStatus={order.payment_status}
          />
        </div>

        <div className="lg:col-span-5">
          <div className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(43,48,45,0.06)] sticky top-8">
            <h3 className="font-headline font-bold text-lg mb-6 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Sản phẩm ({items.length})
            </h3>

            <div className="space-y-5">
              {items.map((item: any) => {
                const img = item.products?.product_images?.[0]?.url;
                const optCost = item.order_item_options
                  ? item.order_item_options.reduce(
                      (s: number, o: any) => s + (o.price ?? 0),
                      0,
                    )
                  : 0;
                const itemTotal = (item.price + optCost) * item.quantity;
                return (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl bg-surface-container overflow-hidden flex-shrink-0">
                      {img && (
                        <img
                          src={img}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-grow py-1">
                      <p className="font-bold text-sm">{item.product_name}</p>
                      <p className="text-xs text-on-surface-variant">
                        {item.variant_name}
                      </p>
                      {item.order_item_options && (
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {item.order_item_options
                            .map((o: any) => o.option_value_name)
                            .join(", ")}
                        </p>
                      )}
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        x{item.quantity}
                      </p>
                    </div>
                    <div className="text-sm font-bold text-primary py-1 shrink-0">
                      {formatVND(itemTotal)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-5 border-t border-surface-container">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">Tổng cộng</span>
                <span className="text-2xl font-extrabold text-primary">
                  {formatVND(order.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
