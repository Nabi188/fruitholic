"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { formatVND } from "@/lib/formatters";
import { Copy, QrCode, Check, CreditCard, Truck, MapPin, ShoppingBag, Phone, Headphones } from "lucide-react";
import { use } from "react";

type Params = Promise<{ id: string }>;

export default function OrderConfirmationPage(props: { params: Params }) {
  const params = use(props.params);
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
  );

  useEffect(() => {
    async function fetchOrder() {
      const { data: oData } = await supabase
        .from("orders")
        .select("*")
        .eq("id", params.id)
        .single();

      if (oData) {
        setOrder(oData);
        const { data: iData } = await supabase
          .from("order_items")
          .select("*, products(name, product_images(url))")
          .eq("order_id", params.id);

        if (iData) setItems(iData);
      }
      setIsLoading(false);
    }

    fetchOrder();

    const payChannel = supabase
      .channel(`order-${params.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${params.id}`,
        },
        (payload) => setOrder((prev: any) => ({ ...prev, ...payload.new })),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(payChannel);
    };
  }, [params.id, supabase]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 text-on-surface-variant">
        Không tìm thấy đơn hàng.
      </div>
    );
  }

  const isPaid = order.payment_status === "paid";
  const BANK_ID = process.env.NEXT_PUBLIC_BANK_ID || "MB";
  const BANK_ACCOUNT = process.env.NEXT_PUBLIC_BANK_ACCOUNT || "0000000000";
  const BANK_NAME = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || "FRUITHOLIC";
  const orderRef = order.id.split("-")[0].toUpperCase();
  const transferContent = `FRUIT ${orderRef}`;
  const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${BANK_ACCOUNT}-qr_only.png?amount=${order.total_amount}&addInfo=${encodeURIComponent(
    transferContent,
  )}&accountName=${encodeURIComponent(BANK_NAME)}`;

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Đang xử lý";
      case "delivering":
        return "Đang giao hàng";
      case "completed":
        return "Đã hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status.toUpperCase();
    }
  };

  const currentStatusString = getStatusText(order.status).toUpperCase();

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <header className="mb-12 text-center md:text-left relative">
        <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-4 font-headline">
          Trạng thái giao dịch
        </h1>
        <p className="text-on-surface-variant max-w-lg text-lg leading-relaxed font-body">
          Cập nhật hành trình tươi mới của bạn từ nông trại đến tận cửa nhà.
        </p>
      </header>

      {/* Main Layout Asymmetric Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Payment & Timeline Section */}
        <div className="lg:col-span-7 space-y-8">
          {/* Payment Prompt Card (if bank transfer + pending) */}
          {order.payment_method === "bank_transfer" && !isPaid && (
            <div className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(43,48,45,0.06)] border border-surface-container relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-shrink-0 w-40 aspect-square rounded-2xl p-2 bg-white border border-surface-container-highest shadow-sm">
                  <img
                    src={qrUrl}
                    alt="QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-grow space-y-3 font-body text-sm text-on-surface-variant">
                  <h2 className="text-2xl font-bold tracking-tight text-on-surface mb-4 font-headline flex items-center gap-2">
                    <QrCode className="w-6 h-6 text-primary" />
                    Thanh toán qua QR
                  </h2>
                  <div className="flex justify-between">
                    <span>Ngân hàng</span>{" "}
                    <strong className="text-on-surface">{BANK_ID}</strong>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span>Số tài khoản</span>
                    <button
                      onClick={() => copyToClipboard(BANK_ACCOUNT)}
                      className="font-bold text-on-surface flex items-center gap-1 group-hover:text-primary transition-colors"
                    >
                      {BANK_ACCOUNT} <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <span>Chủ TK</span>{" "}
                    <strong className="text-on-surface">{BANK_NAME}</strong>
                  </div>
                  <div className="flex justify-between items-center bg-surface-container-low p-2 rounded-lg mt-2 group">
                    <span className="font-semibold text-primary">
                      Nội dung (BẮT BUỘC)
                    </span>
                    <button
                      onClick={() => copyToClipboard(transferContent)}
                      className="font-bold text-primary flex items-center gap-1 group-hover:text-primary-dim transition-colors tracking-wider"
                    >
                      {transferContent} <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timeline Tracking */}
          <div className="bg-surface-container-lowest p-8 sm:p-10 rounded-[2rem] shadow-[0_20px_40px_rgba(43,48,45,0.06)] relative overflow-hidden">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-bold tracking-tight font-headline">
                Tiến độ đơn hàng
              </h2>
              <span
                className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                  order.status === "completed"
                    ? "bg-primary-container text-on-primary-container"
                    : "bg-secondary-container text-on-secondary-container"
                }`}
              >
                {currentStatusString}
              </span>
            </div>

            <div className="relative pl-10 space-y-12 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-container-high transition-all">
              {/* Step 1: Received */}
              <div className="relative">
                <div className="absolute -left-[38px] top-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center z-10 shadow-sm shadow-primary/20">
                  <Check className="w-4 h-4 text-on-primary font-bold" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold font-headline text-on-surface">
                    Đã nhận đơn
                  </span>
                  <p className="text-sm text-on-surface-variant font-medium font-body leading-relaxed mt-1 italic">
                    Hệ thống đã ghi nhận yêu cầu.
                  </p>
                </div>
              </div>

              {/* Step 2: Payment */}
              <div
                className={`relative ${isPaid || order.payment_method === "cod" ? "" : "opacity-40"}`}
              >
                <div
                  className={`absolute -left-[38px] top-0 w-8 h-8 rounded-full flex items-center justify-center z-10 ${isPaid || order.payment_method === "cod" ? "bg-primary shadow-primary/20" : "bg-surface-container-highest border border-outline-variant"} shadow-sm`}
                >
                  {isPaid || order.payment_method === "cod" ? (
                    <Check className="w-4 h-4 text-on-primary font-bold" />
                  ) : (
                    <CreditCard className="w-4 h-4 text-outline-variant" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-lg font-bold font-headline ${isPaid || order.payment_method === "cod" ? "text-on-surface" : "text-on-surface-variant"}`}
                  >
                    {order.payment_method === "cod"
                      ? "Thanh toán COD"
                      : "Xác nhận thanh toán"}
                  </span>
                  <p className="text-sm font-medium font-body leading-relaxed mt-1">
                    {isPaid
                      ? "Giao dịch thành công."
                      : order.payment_method === "cod"
                        ? "Thanh toán tiền mặt khi nhận hàng"
                        : "Đang chờ thanh toán chuyển khoản"}
                  </p>
                </div>
              </div>

              {/* Step 3: Delivery */}
              <div
                className={`relative ${order.status !== "pending" ? "" : "opacity-40"}`}
              >
                <div
                  className={`absolute -left-[38px] top-0 w-8 h-8 rounded-full ring-4 ring-primary-container flex items-center justify-center z-10 ${order.status === "delivering" ? "bg-primary" : order.status === "completed" ? "bg-primary" : "bg-surface-container-highest"}`}
                >
                  <Truck className={`w-4 h-4 ${order.status !== "pending" ? "text-on-primary" : "text-outline-variant"}`} />
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-lg font-bold font-headline ${order.status === "delivering" ? "text-primary" : order.status === "completed" ? "text-on-surface" : "text-on-surface-variant"}`}
                  >
                    Đang giao hàng
                  </span>
                  <p
                    className={`text-sm font-medium font-body leading-relaxed mt-1 ${order.status === "delivering" ? "text-primary" : "text-on-surface-variant"}`}
                  >
                    {order.status === "delivering"
                      ? "Tài xế đang di chuyển tới địa chỉ của bạn."
                      : "Chưa đến bước này."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-surface p-8 rounded-[2rem] border border-surface-container flex flex-col md:flex-row gap-6 items-center shadow-sm">
            <div className="flex-shrink-0 w-20 h-20 bg-surface-container-lowest rounded-full flex items-center justify-center shadow-sm">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-grow text-center md:text-left">
              <h3 className="text-xl font-bold mb-2 font-headline">
                Thông tin nhận hàng
              </h3>
              <p className="text-on-surface-variant font-medium font-body mb-1">
                <strong className="text-on-surface">
                  {order.receiver_name}
                </strong>{" "}
                &mdash; {order.receiver_phone}
              </p>
              <p className="text-on-surface-variant text-sm font-body">
                {order.delivery_address}
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Summary Sidebar */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(43,48,45,0.06)] border border-surface-container relative">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-2 font-headline">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Danh sách sản phẩm
            </h3>

            <div className="space-y-6">
              {items.map((item) => {
                const imgUrl =
                  item.products?.product_images?.[0]?.url ||
                  "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&q=80";
                const optCost = item.selected_options
                  ? item.selected_options.reduce(
                      (s: any, o: any) => s + (o.price || 0),
                      0,
                    )
                  : 0;
                const itemTotal = (item.unit_price + optCost) * item.quantity;
                return (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-20 rounded-xl bg-surface-container-low overflow-hidden flex-shrink-0">
                      <img
                        src={imgUrl}
                        className="w-full h-full object-cover mix-blend-multiply"
                        alt={item.products?.name}
                      />
                    </div>
                    <div className="flex flex-col flex-grow py-1">
                      <span className="font-bold text-sm text-on-surface font-body">
                        {item.products?.name}
                      </span>
                      <span className="text-xs text-on-surface-variant mt-1 line-clamp-1">
                        {item.selected_options &&
                          item.selected_options
                            .map((opt: any) => opt.optionValueName)
                            .join(", ")}
                      </span>
                      <span className="text-xs text-on-surface-variant mt-0.5">
                        SL: x{item.quantity}
                      </span>
                      <span className="text-sm font-bold text-primary mt-auto">
                        {formatVND(itemTotal)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-surface-container text-body">
              <div className="flex justify-between items-center text-lg font-extrabold pb-2">
                <span>Tổng thanh toán</span>
                <span className="text-primary-dim text-2xl">
                  {formatVND(order.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Support Banner */}
          <div className="bg-primary/5 p-8 rounded-[2rem] relative overflow-hidden group border border-primary/10">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-3 text-primary-dim font-headline">
                Cần hỗ trợ gấp?
              </h3>
              <p className="text-sm text-primary-dim/80 mb-6 font-body leading-relaxed">
                Nếu bạn thay đổi địa chỉ hoặc giờ nhận, hãy gọi ngay cho tổng
                đài.
              </p>
              <div className="space-y-3">
                <a
                  href="tel:19001234"
                  className="flex items-center justify-center gap-3 bg-white hover:bg-surface-container-low px-4 py-3.5 rounded-full transition-all text-primary-dim font-bold text-sm shadow-sm ring-1 ring-primary/20"
                >
                  <Phone className="w-5 h-5" />
                  Hotline: 1900 1234
                </a>
              </div>
            </div>
            <Headphones className="absolute -right-6 -bottom-6 w-32 h-32 text-primary/5 select-none pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-all duration-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
