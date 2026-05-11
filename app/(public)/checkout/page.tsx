"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutInput } from "@/schemas/orders";
import { useCartStore } from "@/stores/cartStore";
import { formatVND } from "@/lib/formatters";
import { createBrowserClient } from "@supabase/ssr";
import {
  ArrowLeft,
  Loader2,
  CreditCard,
  Wallet,
  Banknote,
  Clock,
  Store,
  QrCode,
  Copy,
  Check,
  CheckCircle2,
  X,
} from "lucide-react";
import Link from "next/link";

import { placeOrder } from "@/app/actions/checkout";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const isOrderPlaced = useRef(false);

  // Bank transfer QR modal state
  const [qrModal, setQrModal] = useState<{
    show: boolean;
    orderCode: string;
    orderId: string;
    amount: number;
  } | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [copied, setCopied] = useState("");
  const channelRef = useRef<any>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
  );

  const form = useForm<CheckoutInput & { items?: any[] }>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customer_name: "",
      customer_phone: "",
      customer_email: "",
      is_self_receiver: true,
      receiver_name: "",
      receiver_phone: "",
      address: "",
      note: "",
      delivery_type: "ASAP",
      payment_method: "BANK_TRANSFER",
      items: [],
    },
  });

  const {
    watch,
    register,
    handleSubmit,
    formState: { errors },
  } = form;
  const isSelfReceiver = watch("is_self_receiver");
  const paymentMethod = watch("payment_method");
  const deliveryType = watch("delivery_type");

  useEffect(() => {
    const t = setTimeout(() => {
      setMounted(true);
      form.setValue("items", items as any[]);
    }, 0);
    return () => clearTimeout(t);
  }, [items, form]);

  useEffect(() => {
    if (items.length === 0 && !isOrderPlaced.current) {
      router.replace("/cart");
    }
  }, [items.length, router]);

  if (!mounted) return null;

  if (items.length === 0 && !isOrderPlaced.current) {
    return null;
  }

  const onSubmit = async (data: CheckoutInput) => {
    setIsSubmitting(true);
    setServerError("");

    if (data.is_self_receiver) {
      data.receiver_name = data.customer_name;
      data.receiver_phone = data.customer_phone;
    }

    // For PICKUP: no receiver / address needed
    if (data.delivery_type === "PICKUP") {
      data.is_self_receiver = true;
      data.receiver_name = "Fruitholic";
      data.receiver_phone = data.customer_phone;
      data.address = "Fruitholic";
    }

    try {
      const result = await placeOrder({ ...data, items });

      if (result.success && result.orderId) {
        isOrderPlaced.current = true;
        const capturedTotal = totalAmount();
        clearCart();

        if (data.payment_method === "BANK_TRANSFER") {
          // Show QR modal instead of redirect
          setQrModal({
            show: true,
            orderCode: result.orderCode || "",
            orderId: result.orderId,
            amount: capturedTotal,
          });
        } else {
          router.push(`/thank-you?code=${result.orderCode}`);
        }
      } else {
        setServerError(result.error || "Lỗi không xác định.");
      }
    } catch (_e) {
      setServerError("Lỗi mạng. Vui lòng kiểm tra kết nối.");
      console.error("Checkout submit error:", _e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Link
          href="/cart"
          className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors w-fit font-medium"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại giỏ hàng
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-4">
          Tiến hành đặt hàng
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <form
          id="checkout-form"
          onSubmit={handleSubmit(onSubmit)}
          className="lg:col-span-8 flex flex-col gap-8"
        >
          {serverError && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-200">
              {serverError}
            </div>
          )}

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-6">
            <h2 className="text-xl font-bold text-slate-800 border-b pb-4">
              1. Thông tin người đặt
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">
                  Họ và tên *
                </label>
                <input
                  {...register("customer_name")}
                  placeholder="Nhập tên của bạn"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                />
                {errors.customer_name && (
                  <span className="text-xs text-red-500">
                    {errors.customer_name.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">
                  Số điện thoại *
                </label>
                <input
                  {...register("customer_phone")}
                  type="tel"
                  placeholder="Ví dụ: 0909123456"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                />
                {errors.customer_phone && (
                  <span className="text-xs text-red-500">
                    {errors.customer_phone.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">
                  Email (Tùy chọn nhận hoá đơn)
                </label>
                <input
                  {...register("customer_email")}
                  type="email"
                  placeholder="Ví dụ: hello@fruitholic.vn"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                />
                {errors.customer_email && (
                  <span className="text-xs text-red-500">
                    {errors.customer_email.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-6">
            <h2 className="text-xl font-bold text-slate-800 border-b pb-4">
              2. Thông tin nhận hàng
            </h2>

            <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors w-fit">
              <input
                type="checkbox"
                {...register("is_self_receiver")}
                className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-medium text-slate-700">
                Tôi là người nhận hàng
              </span>
            </label>

            {!isSelfReceiver && deliveryType !== "PICKUP" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Tên người nhận *
                  </label>
                  <input
                    {...register("receiver_name")}
                    placeholder="Nhập tên người nhận"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                  />
                  {errors.receiver_name && (
                    <span className="text-xs text-red-500">
                      {errors.receiver_name.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">
                    SĐT người nhận *
                  </label>
                  <input
                    {...register("receiver_phone")}
                    type="tel"
                    placeholder="SĐT để shipper liên lạc"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                  />
                  {errors.receiver_phone && (
                    <span className="text-xs text-red-500">
                      {errors.receiver_phone.message}
                    </span>
                  )}
                </div>
              </div>
            )}

            {deliveryType !== "PICKUP" && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">
                  Địa chỉ giao hàng chi tiết *
                </label>
                <textarea
                  {...register("address")}
                  rows={3}
                  placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                />
                {errors.address && (
                  <span className="text-xs text-red-500">
                    {errors.address.message}
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">
                Ghi chú thêm (Tùy chọn)
              </label>
              <textarea
                {...register("note")}
                rows={2}
                placeholder="Ví dụ: Bỏ đá riêng, Giao trong giờ hành chính..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Delivery type */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-6">
            <h2 className="text-xl font-bold text-slate-800 border-b pb-4">
              3. Hình thức giao hàng
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(
                [
                  {
                    value: "ASAP",
                    icon: Clock,
                    label: "Giao ngay",
                    desc: "Shipper giao sớm nhất có thể",
                  },
                  {
                    value: "SCHEDULED",
                    icon: Clock,
                    label: "Hẹn giờ",
                    desc: "Chọn giờ giao cụ thể",
                  },
                  {
                    value: "PICKUP",
                    icon: Store,
                    label: "Nhận tại cửa hàng",
                    desc: "Đến lấy trực tiếp",
                  },
                ] as const
              ).map(({ value, icon: Icon, label, desc }) => (
                <label
                  key={value}
                  className={`relative flex cursor-pointer rounded-2xl border-2 p-5 flex-col gap-2 transition-all ${
                    deliveryType === value
                      ? "border-emerald-500 bg-emerald-50/50"
                      : "border-slate-200 hover:border-emerald-200 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    {...register("delivery_type")}
                    value={value}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${deliveryType === value ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`font-bold ${deliveryType === value ? "text-emerald-900" : "text-slate-700"}`}
                    >
                      {label}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">{desc}</span>
                  {deliveryType === value && (
                    <div className="absolute top-4 right-4 h-5 w-5 rounded-full border-[6px] border-emerald-500 bg-white" />
                  )}
                </label>
              ))}
            </div>

            {deliveryType === "SCHEDULED" && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">
                  Chọn thời gian giao *
                </label>
                <input
                  type="datetime-local"
                  {...register("delivery_time")}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                {errors.delivery_time && (
                  <span className="text-xs text-red-500">
                    {errors.delivery_time.message}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-6">
            <h2 className="text-xl font-bold text-slate-800 border-b pb-4">
              3. Phương thức thanh toán
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label
                className={`relative flex cursor-pointer rounded-2xl border-2 p-5 focus:outline-none transition-all ${
                  paymentMethod === "BANK_TRANSFER"
                    ? "border-emerald-500 bg-emerald-50/50"
                    : "border-slate-200 hover:border-emerald-200 bg-white"
                }`}
              >
                <input
                  type="radio"
                  {...register("payment_method")}
                  value="BANK_TRANSFER"
                  className="sr-only"
                />
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${paymentMethod === "BANK_TRANSFER" ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"}`}
                    >
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <span
                      className={`font-bold ${paymentMethod === "BANK_TRANSFER" ? "text-emerald-900" : "text-slate-700"}`}
                    >
                      Chuyển Khoản Mã QR
                    </span>
                  </div>
                  <span className="text-sm text-slate-500 mt-1">
                    Xác nhận thanh toán qua chuyển khoản ngân hàng tự động
                    (Khuyên dùng).
                  </span>
                </div>
                {paymentMethod === "BANK_TRANSFER" && (
                  <div className="absolute top-4 right-4 h-5 w-5 rounded-full border-[6px] border-emerald-500 bg-white" />
                )}
              </label>

              <label
                className={`relative flex cursor-pointer rounded-2xl border-2 p-5 focus:outline-none transition-all ${
                  paymentMethod === "COD"
                    ? "border-emerald-500 bg-emerald-50/50"
                    : "border-slate-200 hover:border-emerald-200 bg-white"
                }`}
              >
                <input
                  type="radio"
                  {...register("payment_method")}
                  value="COD"
                  className="sr-only"
                />
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${paymentMethod === "COD" ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"}`}
                    >
                      <Banknote className="w-5 h-5" />
                    </div>
                    <span
                      className={`font-bold ${paymentMethod === "COD" ? "text-emerald-900" : "text-slate-700"}`}
                    >
                      Thanh toán khi nhận hàng (COD)
                    </span>
                  </div>
                  <span className="text-sm text-slate-500 mt-1">
                    Thanh toán bằng tiền mặt khi nhận hàng.
                  </span>
                </div>
                {paymentMethod === "COD" && (
                  <div className="absolute top-4 right-4 h-5 w-5 rounded-full border-[6px] border-emerald-500 bg-white" />
                )}
              </label>
            </div>
            {errors.payment_method && (
              <span className="text-xs text-red-500">
                {errors.payment_method.message}
              </span>
            )}
          </div>
        </form>

        <div className="lg:col-span-4 sticky top-24">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 overflow-hidden flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex gap-2 items-center border-b pb-4">
              <Wallet className="h-5 w-5 text-emerald-600" /> Thanh toán
            </h3>

            <div className="flex flex-col gap-4 max-h-[40vh] overflow-y-auto pr-2 mb-6 scrollbar-thin">
              {items.map((item) => {
                const itemTotal =
                  (item.variantPrice +
                    item.options.reduce((s, o) => s + o.price, 0)) *
                  item.quantity;
                return (
                  <div
                    key={item.cartKey}
                    className="flex justify-between gap-4 text-sm"
                  >
                    <div className="flex gap-3">
                      <div className="relative font-semibold text-slate-700">
                        {item.quantity}x
                      </div>
                      <div className="flex flex-col text-slate-600">
                        <span className="line-clamp-2">{item.productName}</span>
                        {item.options.length > 0 && (
                          <span className="text-[10px] text-slate-400 uppercase mt-0.5">
                            + {item.options.length} topping
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-medium text-slate-900 shrink-0">
                      {formatVND(itemTotal)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-6 border-t border-dashed border-slate-200 flex flex-col gap-4 mb-8">
              <div className="flex justify-between text-slate-600">
                <span>Tạm tính</span>
                <span>{formatVND(totalAmount())}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Vận chuyển</span>
                <span>Liên hệ báo giá phí</span>
              </div>
              <div className="flex justify-between items-end mt-2">
                <span className="font-bold text-slate-800 text-lg">
                  Tổng cộng
                </span>
                <span className="text-3xl font-extrabold text-emerald-600">
                  {formatVND(totalAmount())}
                </span>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-lg font-bold text-white shadow-xl shadow-emerald-600/20 transition-all hover:bg-emerald-700 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" /> Processing...
                </>
              ) : (
                "Place Order"
              )}
            </button>

            <p className="mt-4 text-xs text-center text-slate-500 leading-relaxed px-4">
              By clicking Place Order, you confirm that you agree to our{" "}
              <Link
                href="/policies/shipping"
                className="text-emerald-600 underline hover:text-emerald-800"
              >
                Terms & Policies
              </Link>{" "}
            </p>
          </div>
        </div>
      </div>

      {qrModal?.show && (
        <BankTransferModal
          orderCode={qrModal.orderCode}
          orderId={qrModal.orderId}
          amount={qrModal.amount}
          paymentConfirmed={paymentConfirmed}
          copied={copied}
          onCopy={(text: string, label: string) => {
            navigator.clipboard.writeText(text);
            setCopied(label);
            setTimeout(() => setCopied(""), 2000);
          }}
          onClose={() => router.push(`/orders/track?code=${qrModal.orderCode}`)}
          supabase={supabase}
          channelRef={channelRef}
          onPaymentConfirmed={() => {
            setPaymentConfirmed(true);
            setTimeout(() => {
              router.push(`/thank-you?code=${qrModal.orderCode}`);
            }, 3000);
          }}
        />
      )}
    </div>
  );
}

function BankTransferModal({
  orderCode,
  orderId,
  amount,
  paymentConfirmed,
  copied,
  onCopy,
  onClose,
  supabase,
  channelRef,
  onPaymentConfirmed,
}: {
  orderCode: string;
  orderId: string;
  amount: number;
  paymentConfirmed: boolean;
  copied: string;
  onCopy: (text: string, label: string) => void;
  onClose: () => void;
  supabase: any;
  channelRef: React.MutableRefObject<any>;
  onPaymentConfirmed: () => void;
}) {
  const BANK_ID = process.env.NEXT_PUBLIC_BANK_ID || "";
  const BANK_ACCOUNT = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NO || "";
  const BANK_NAME = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || "";
  const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${BANK_ACCOUNT}-qr_only.png?amount=${amount}&addInfo=${encodeURIComponent(orderCode)}&accountName=${encodeURIComponent(BANK_NAME).replace(/%20/g, "+")}`;

  useEffect(() => {
    const channel = supabase
      .channel(`checkout-pay-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload: any) => {
          if (payload.new?.payment_status?.toUpperCase() === "PAID") {
            onPaymentConfirmed();
          }
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, supabase, channelRef, onPaymentConfirmed]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        {paymentConfirmed ? (
          <div className="p-10 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              Thanh toán thành công!
            </h3>
            <p className="text-slate-500 mb-4">
              Giao dịch của bạn đã được ghi nhận thành công.
            </p>
            <p className="text-sm text-slate-400">Đang chuyển hướng...</p>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-b from-emerald-50 to-white p-6 sm:p-8 text-center border-b border-emerald-100">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold mb-4">
                <QrCode className="w-3.5 h-3.5" />
                THANH TOÁN CHUYỂN KHOẢN
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">
                Quét mã để thanh toán
              </h3>
              <p className="text-sm text-slate-500">Mã đơn hàng #{orderCode}</p>
            </div>

            <div className="p-6 sm:p-8">
              {/* QR Code */}
              <div className="mx-auto w-48 h-48 rounded-2xl bg-white border-2 border-slate-100 p-2 mb-6 shadow-sm">
                <img
                  src={qrUrl}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Bank details */}
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Ngân hàng</span>
                  <strong className="text-slate-800">{BANK_ID}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Số tài khoản</span>
                  <button
                    onClick={() => onCopy(BANK_ACCOUNT, "account")}
                    className="font-bold text-slate-800 flex items-center gap-1.5 hover:text-emerald-600 transition-colors"
                  >
                    {BANK_ACCOUNT}
                    {copied === "account" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Tên tài khoản</span>
                  <strong className="text-slate-800">{BANK_NAME}</strong>
                </div>
                <div className="flex justify-between items-center bg-emerald-50 -mx-2 px-2 py-2 rounded-xl">
                  <span className="text-emerald-700 font-semibold">
                    Transfer Note
                  </span>
                  <button
                    onClick={() => onCopy(orderCode, "ref")}
                    className="font-bold text-emerald-700 flex items-center gap-1.5 tracking-wider"
                  >
                    {orderCode}
                    {copied === "ref" ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <span className="font-semibold text-slate-700">Số tiền</span>
                  <strong className="text-emerald-600 text-lg">
                    {formatVND(amount)}
                  </strong>
                </div>
              </div>

              {/* Waiting indicator */}
              <div className="flex items-center justify-center gap-2 text-sm text-slate-400 mb-5">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                Chờ thanh toán...
              </div>

              {/* Action button */}
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-sm"
              >
                Theo dõi đơn hàng
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
