"use client";

import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { formatVND } from "@/lib/formatters";
import { findOrderForTracking } from "@/app/actions/track";
import {
  Search,
  Loader2,
  PackageSearch,
  Copy,
  QrCode,
  Check,
  CheckCircle2,
  CreditCard,
  Truck,
  MapPin,
  ShoppingBag,
  Phone,
  Headphones,
  Banknote,
} from "lucide-react";

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const codeParam = searchParams.get("code");

  if (codeParam) {
    return <OrderDetail key={codeParam} code={codeParam} />;
  }

  return <SearchForm />;
}

export default function OrderTrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="mt-4 text-on-surface-variant text-sm font-medium">Loading...</p>
        </div>
      }
    >
      <OrderTrackingContent />
    </Suspense>
  );
}

function SearchForm() {
  const router = useRouter();
  const [orderRef, setOrderRef] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError("");

    if (!orderRef.trim() || orderRef.trim().length < 4) {
      setSearchError(
        "Please enter a valid order code (at least 4 characters).",
      );
      return;
    }

    setIsSearching(true);
    const result = await findOrderForTracking(orderRef);

    if (result.success && result.orderCode) {
      router.push(`/orders/track?code=${result.orderCode}`);
    } else {
      setSearchError(result.error || "Order not found.");
    }
    setIsSearching(false);
  };

  return (
    <div className="container mx-auto px-4 py-32 max-w-xl text-center relative overflow-hidden">
      <div className="absolute top-10 left-10 w-48 h-48 bg-primary-container/30 rounded-full blur-3xl -z-10 mix-blend-multiply" />
      <div className="absolute bottom-10 right-10 w-56 h-56 bg-secondary/10 rounded-full blur-3xl -z-10" />

      <div className="h-24 w-24 bg-surface-container-high text-primary rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
        <PackageSearch className="h-10 w-10 text-primary-dim" strokeWidth={2} />
      </div>

      <h1 className="text-4xl md:text-5xl font-extrabold text-primary-dim mb-4 tracking-tighter font-headline">
        Theo dõi đơn hàng
      </h1>
      <p className="text-on-surface-variant font-body mb-10 max-w-sm mx-auto text-lg leading-relaxed">
        Nhập <strong>Mã đơn hàng</strong> của bạn để kiểm tra trạng thái hiện tại của
        đơn hàng.
      </p>

      <form
        onSubmit={handleSearch}
        className="bg-white p-8 sm:p-10 rounded-[2rem] border border-surface-container shadow-sm flex flex-col gap-6 text-left relative z-10"
      >
        <div>
          <label className="text-sm font-bold text-on-surface block mb-3 font-body">
            Order Code
          </label>
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-outline-variant" />
            <input
              type="text"
              value={orderRef}
              onChange={(e) => setOrderRef(e.target.value)}
              placeholder="e.g. FH844292"
              className="w-full pl-14 pr-5 py-4 bg-surface-bright border border-surface-container-high rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono text-sm placeholder:font-body placeholder:text-outline/70"
            />
          </div>
        </div>

        {searchError && (
          <div className="bg-error-container/20 text-error px-4 py-3 rounded-xl text-sm font-medium font-body flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-error" />
            {searchError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSearching || !orderRef.trim()}
          className="mt-4 w-full flex justify-center items-center gap-3 rounded-full bg-primary px-8 py-4 text-base font-bold text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:bg-primary-dim disabled:bg-surface-container-highest disabled:text-outline disabled:shadow-none disabled:cursor-not-allowed font-headline tracking-wide uppercase"
        >
          {isSearching ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Searching...
            </>
          ) : (
            "Track Order"
          )}
        </button>
      </form>
    </div>
  );
}

function OrderDetail({ code }: { code: string }) {
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState("");
  const channelRef = useRef<any>(null);

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
      ),
    [],
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const upperCode = code.toUpperCase();
      const { data: oData } = await supabase
        .from("orders")
        .select("*")
        .eq("code", upperCode)
        .single();

      if (cancelled) return;

      if (oData) {
        setOrder(oData);
        const { data: iData } = await supabase
          .from("order_items")
          .select(
            "*, order_item_options(option_value_name, price), products(product_images(url))",
          )
          .eq("order_id", oData.id);
        if (!cancelled && iData) setItems(iData);
      }
      if (!cancelled) setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [code, supabase]);

  useEffect(() => {
    if (!order?.id) return;

    const channel = supabase
      .channel(`track-${order.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${order.id}`,
        },
        (payload) => {
          setOrder((prev: any) => ({ ...prev, ...payload.new }));
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order?.id, supabase]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-md text-center">
        <PackageSearch className="w-16 h-16 text-on-surface-variant/30 mx-auto mb-6" />
        <h2 className="text-2xl font-bold font-headline mb-2">
          Order Not Found
        </h2>
        <p className="text-on-surface-variant mb-8">
          We couldn&apos;t find an order with code <strong>{code}</strong>.
        </p>
        <button
          onClick={() => router.push("/orders/track")}
          className="px-6 py-3 bg-primary text-on-primary rounded-full font-bold"
        >
          Try Again
        </button>
      </div>
    );
  }

  const isPaid = order.payment_status?.toUpperCase() === "PAID";
  const isCancelled = order.status?.toUpperCase() === "CANCELLED";
  const BANK_ID = process.env.NEXT_PUBLIC_BANK_ID || "";
  const BANK_ACCOUNT = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NO || "";
  const BANK_NAME = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || "";
  const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${BANK_ACCOUNT}-qr_only.png?amount=${order.total_amount}&addInfo=${encodeURIComponent(order.code)}&accountName=${encodeURIComponent(BANK_NAME).replace(/%20/g, "+")}`;

  const STATUS_STEPS = [
    {
      key: "PENDING",
      label: "Order Received",
      desc: "Your order has been placed and is awaiting confirmation.",
      icon: Check,
    },
    {
      key: "CONFIRMED",
      label: "Confirmed",
      desc: "Your order has been confirmed and is being prepared.",
      icon: CheckCircle2,
    },
    {
      key: "DELIVERING",
      label: "Out for Delivery",
      desc: "Your order is on its way to you.",
      icon: Truck,
    },
    {
      key: "COMPLETED",
      label: "Delivered",
      desc: "Your order has been successfully delivered. Enjoy!",
      icon: CheckCircle2,
    },
  ];

  const currentStepIndex = STATUS_STEPS.findIndex(
    (s) => s.key === order.status?.toUpperCase(),
  );

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 max-w-6xl">
      {/* Header */}
      <header className="mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold mb-5 text-sm">
          <ShoppingBag className="w-4 h-4" />
          Order #{order.code}
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-3 font-headline">
          {isCancelled
            ? "Order Cancelled"
            : isPaid || order.status?.toUpperCase() === "COMPLETED"
              ? "Thank You for Your Order!"
              : "Track Your Order"}
        </h1>
        <p className="text-on-surface-variant text-base sm:text-lg leading-relaxed font-body">
          {isCancelled
            ? "This order has been cancelled."
            : "Follow the progress of your order from our farm to your doorstep."}
        </p>
      </header>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">
          {/* Payment QR — only show for bank transfer + unpaid */}
          {order.payment_method === "BANK_TRANSFER" &&
            !isPaid &&
            !isCancelled && (
              <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(43,48,45,0.06)] border border-surface-container relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/20 rounded-full -mr-16 -mt-16 blur-3xl" />
                <div className="relative z-10 flex flex-col sm:flex-row gap-6 sm:gap-8 items-center">
                  <div className="flex-shrink-0 w-36 sm:w-40 aspect-square rounded-2xl p-2 bg-white border border-surface-container-highest shadow-sm">
                    <img
                      src={qrUrl}
                      alt="QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-grow space-y-3 font-body text-sm text-on-surface-variant w-full">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-on-surface mb-4 font-headline flex items-center gap-2">
                      <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      Quét mã để thanh toán
                    </h2>
                    <div className="flex justify-between">
                      <span>Ngân hàng</span>
                      <strong className="text-on-surface">{BANK_ID}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Account No.</span>
                      <button
                        onClick={() => copyToClipboard(BANK_ACCOUNT, "account")}
                        className="font-bold text-on-surface flex items-center gap-1.5 hover:text-primary transition-colors"
                      >
                        {BANK_ACCOUNT}
                        {copied === "account" ? (
                          <Check className="w-3.5 h-3.5 text-primary" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <div className="flex justify-between">
                      <span>Tên tài khoản</span>
                      <strong className="text-on-surface">{BANK_NAME}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-primary">
                        Transfer Note (required)
                      </span>
                      <button
                        onClick={() => copyToClipboard(order.code, "ref")}
                        className="font-bold text-primary flex items-center gap-1.5 hover:text-primary-dim transition-colors tracking-wider"
                      >
                        {order.code}
                        {copied === "ref" ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-outline-variant/15">
                      <span className="font-semibold">Số tiền</span>
                      <strong className="text-primary text-lg">
                        {formatVND(order.total_amount)}
                      </strong>
                    </div>
                  </div>
                </div>
                {/* Waiting indicator */}
                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-on-surface-variant font-body">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  Waiting for payment confirmation...
                </div>
              </div>
            )}

          {/* Payment confirmed banner */}
          {isPaid && order.payment_method === "BANK_TRANSFER" && (
            <div className="bg-primary/5 border border-primary/15 p-5 sm:p-6 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-on-primary" />
              </div>
              <div>
                <p className="font-bold text-on-surface font-headline">
                  Payment Confirmed
                </p>
                <p className="text-sm text-on-surface-variant">
                  Bank transfer received successfully. Thank you!
                </p>
              </div>
            </div>
          )}

          {/* Order Timeline */}
          <div className="bg-surface-container-lowest p-6 sm:p-10 rounded-[2rem] shadow-[0_20px_40px_rgba(43,48,45,0.06)] relative overflow-hidden">
            <div className="flex items-center justify-between mb-8 sm:mb-10">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-headline">
                Order Progress
              </h2>
              <span
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-sm ${
                  isCancelled
                    ? "bg-error/10 text-error"
                    : order.status?.toUpperCase() === "COMPLETED"
                      ? "bg-primary-container text-on-primary-container"
                      : "bg-secondary-container text-on-secondary-container"
                }`}
              >
                {isCancelled
                  ? "Cancelled"
                  : STATUS_STEPS[currentStepIndex]?.label || order.status}
              </span>
            </div>

            {isCancelled ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✕</span>
                </div>
                <p className="text-on-surface-variant">
                  This order has been cancelled.
                </p>
              </div>
            ) : (
              <div className="relative pl-10 space-y-10 sm:space-y-12 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-container-high">
                {STATUS_STEPS.map((step, i) => {
                  const isCompleted = i <= currentStepIndex;
                  const isCurrent = i === currentStepIndex;
                  const Icon = step.icon;

                  return (
                    <div
                      key={step.key}
                      className={`relative ${!isCompleted && !isCurrent ? "opacity-40" : ""}`}
                    >
                      <div
                        className={`absolute -left-[38px] top-0 w-8 h-8 rounded-full flex items-center justify-center z-10 shadow-sm ${
                          isCompleted
                            ? "bg-primary shadow-primary/20"
                            : "bg-surface-container-highest border border-outline-variant"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4 text-on-primary font-bold" />
                        ) : (
                          <Icon className="w-4 h-4 text-outline-variant" />
                        )}
                      </div>
                      <div>
                        <span
                          className={`text-base sm:text-lg font-bold font-headline ${
                            isCurrent
                              ? "text-primary"
                              : isCompleted
                                ? "text-on-surface"
                                : "text-on-surface-variant"
                          }`}
                        >
                          {step.label}
                        </span>
                        <p
                          className={`text-sm font-medium font-body leading-relaxed mt-1 ${
                            isCurrent
                              ? "text-primary/80"
                              : "text-on-surface-variant"
                          }`}
                        >
                          {isCompleted || isCurrent ? step.desc : "Pending..."}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Shipping Info */}
          <div className="bg-surface p-6 sm:p-8 rounded-[2rem] border border-surface-container flex flex-col sm:flex-row gap-5 sm:gap-6 items-center shadow-sm">
            <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-surface-container-lowest rounded-full flex items-center justify-center shadow-sm">
              <MapPin className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
            </div>
            <div className="flex-grow text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-bold mb-2 font-headline">
                Delivery Address
              </h3>
              <p className="text-on-surface-variant font-medium font-body mb-1">
                <strong className="text-on-surface">
                  {order.receiver_name}
                </strong>{" "}
                &mdash; {order.receiver_phone}
              </p>
              <p className="text-on-surface-variant text-sm font-body">
                {order.address}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 space-y-6 sm:space-y-8">
          <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(43,48,45,0.06)] border border-surface-container relative">
            <h3 className="text-lg sm:text-xl font-bold mb-6 sm:mb-8 flex items-center gap-2 font-headline">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Order Summary
            </h3>

            <div className="space-y-5 sm:space-y-6">
              {items.map((item) => {
                const imgUrl =
                  item.products?.product_images?.[0]?.url ||
                  "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&q=80";
                const optCost = item.order_item_options
                  ? item.order_item_options.reduce(
                      (s: number, o: any) => s + (o.price || 0),
                      0,
                    )
                  : 0;
                const itemTotal = (item.price + optCost) * item.quantity;
                return (
                  <div key={item.id} className="flex gap-3 sm:gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-surface-container-low overflow-hidden flex-shrink-0">
                      <img
                        src={imgUrl}
                        className="w-full h-full object-cover"
                        alt={item.product_name}
                      />
                    </div>
                    <div className="flex flex-col flex-grow py-0.5 sm:py-1 min-w-0">
                      <span className="font-bold text-sm text-on-surface font-body truncate">
                        {item.product_name}
                      </span>
                      {(item.variant_name ||
                        (item.order_item_options &&
                          item.order_item_options.length > 0)) && (
                        <span className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">
                          {[
                            item.variant_name,
                            ...(item.order_item_options?.map(
                              (opt: any) => opt.option_value_name,
                            ) || []),
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      )}
                      <span className="text-xs text-on-surface-variant mt-0.5">
                        Qty: {item.quantity}
                      </span>
                      <span className="text-sm font-bold text-primary mt-auto">
                        {formatVND(itemTotal)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-surface-container">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-on-surface-variant">
                  Payment Method
                </span>
                <span className="text-sm font-semibold flex items-center gap-1.5">
                  {order.payment_method === "COD" ? (
                    <>
                      <Banknote className="w-4 h-4" /> Cash on Delivery
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" /> Bank Transfer
                    </>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-on-surface-variant">
                  Payment Status
                </span>
                <span
                  className={`text-sm font-bold ${isPaid ? "text-primary" : "text-secondary"}`}
                >
                  {isPaid ? "✓ Paid" : "Pending"}
                </span>
              </div>
              <div className="flex justify-between items-center text-lg font-extrabold">
                <span>Tổng cộng</span>
                <span className="text-primary-dim text-2xl">
                  {formatVND(order.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Support card */}
          <div className="bg-primary/5 p-6 sm:p-8 rounded-[2rem] relative overflow-hidden group border border-primary/10">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2 text-primary-dim font-headline">
                Need Help?
              </h3>
              <p className="text-sm text-primary-dim/80 mb-5 font-body leading-relaxed">
                Contact us if you have any questions about your order.
              </p>
              <a
                href="tel:0962651808"
                className="flex items-center justify-center gap-3 bg-white hover:bg-surface-container-low px-4 py-3.5 rounded-full transition-all text-primary-dim font-bold text-sm shadow-sm ring-1 ring-primary/20"
              >
                <Phone className="w-5 h-5" />
                Hotline: 0962 651 808
              </a>
            </div>
            <Headphones className="absolute -right-6 -bottom-6 w-32 h-32 text-primary/5 select-none pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-all duration-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
