"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus, updateOrderPaymentStatus } from "@/app/actions/admin/orders";
import { FileEdit, Loader2, CheckCircle2, Save } from "lucide-react";

const orderStatuses = [
  { value: "pending", label: "Chờ xử lý" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "delivering", label: "Đang giao" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
];

type Props = {
  orderId: string;
  currentStatus: string;
  currentPaymentStatus: string;
};

export function OrderStatusActions({ orderId, currentStatus, currentPaymentStatus }: Props) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus);
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(false);
    startTransition(async () => {
      if (status !== currentStatus) {
        await updateOrderStatus(orderId, status);
      }
      if (paymentStatus !== currentPaymentStatus) {
        await updateOrderPaymentStatus(orderId, paymentStatus);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  };

  return (
    <div className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(43,48,45,0.06)]">
      <h3 className="font-headline font-bold text-lg mb-6 flex items-center gap-2">
        <FileEdit className="w-5 h-5 text-primary" />
        Cập nhật trạng thái
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-on-surface-variant mb-2">
            Trạng thái đơn hàng
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-3 bg-surface-container-low border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30"
          >
            {orderStatuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-on-surface-variant mb-2">
            Trạng thái thanh toán
          </label>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="w-full px-4 py-3 bg-surface-container-low border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="unpaid">Chưa thanh toán</option>
            <option value="paid">Đã thanh toán</option>
            <option value="refunded">Hoàn tiền</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={isPending}
          className="w-full py-3 bg-primary text-on-primary font-bold rounded-full shadow-lg shadow-primary/20 hover:brightness-105 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang lưu...
            </>
          ) : saved ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Đã cập nhật!
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Lưu thay đổi
            </>
          )}
        </button>
      </div>
    </div>
  );
}
