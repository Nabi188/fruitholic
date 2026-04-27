"use client";

import { useState, useTransition } from "react";
import {
  updateOrderStatus,
  updateOrderPaymentStatus,
} from "@/app/actions/admin/orders";
import {
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  Ban,
  CreditCard,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

type Props = {
  orderId: string;
  currentStatus: string;
  currentPaymentStatus: string;
};

const STEPS = [
  {
    key: "PENDING",
    label: "Chờ xử lý",
    icon: Clock,
    color: "text-on-surface-variant",
    bg: "bg-surface-container-high",
    activeBg: "bg-amber-500",
    activeText: "text-white",
  },
  {
    key: "CONFIRMED",
    label: "Đã xác nhận",
    icon: CheckCircle2,
    color: "text-primary",
    bg: "bg-primary/10",
    activeBg: "bg-primary",
    activeText: "text-on-primary",
  },
  {
    key: "DELIVERING",
    label: "Đang giao",
    icon: Truck,
    color: "text-secondary",
    bg: "bg-secondary/10",
    activeBg: "bg-secondary",
    activeText: "text-on-secondary",
  },
  {
    key: "COMPLETED",
    label: "Hoàn thành",
    icon: PackageCheck,
    color: "text-tertiary",
    bg: "bg-tertiary-container/30",
    activeBg: "bg-tertiary",
    activeText: "text-on-tertiary",
  },
];

export function OrderStatusActions({
  orderId,
  currentStatus,
  currentPaymentStatus,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [confirmAction, setConfirmAction] = useState<{
    type: "status" | "payment" | "cancel";
    value: string;
    label: string;
    direction?: "forward" | "backward";
  } | null>(null);

  const currentStepIndex = STEPS.findIndex(
    (s) => s.key === currentStatus?.toUpperCase(),
  );
  const isCancelled = currentStatus?.toUpperCase() === "CANCELLED";

  const handleConfirm = () => {
    if (!confirmAction) return;

    startTransition(async () => {
      try {
        if (confirmAction.type === "status" || confirmAction.type === "cancel") {
          const res = await updateOrderStatus(
            orderId,
            confirmAction.value,
          );
          if (res?.error) {
            toast.error(res.error);
          } else {
            toast.success(`Đã cập nhật trạng thái: ${confirmAction.label}`);
          }
        } else if (confirmAction.type === "payment") {
          const res = await updateOrderPaymentStatus(
            orderId,
            confirmAction.value,
          );
          if (res?.error) {
            toast.error(res.error);
          } else {
            toast.success(`Đã cập nhật thanh toán: ${confirmAction.label}`);
          }
        }
      } catch {
        toast.error("Có lỗi xảy ra");
      }
      setConfirmAction(null);
    });
  };

  const goToStep = (stepIndex: number) => {
    const step = STEPS[stepIndex];
    if (!step || isCancelled) return;
    const direction = stepIndex > currentStepIndex ? "forward" : "backward";
    setConfirmAction({
      type: "status",
      value: step.key,
      label: step.label,
      direction,
    });
  };

  return (
    <div className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(43,48,45,0.06)] space-y-6">
      {/* Stepper Title */}
      <h3 className="font-headline font-bold text-lg flex items-center gap-2">
        <PackageCheck className="w-5 h-5 text-primary" />
        Trạng thái đơn hàng
      </h3>

      {/* Cancelled state */}
      {isCancelled ? (
        <div className="flex items-center gap-3 px-5 py-4 bg-error/10 rounded-2xl">
          <Ban className="w-6 h-6 text-error" />
          <div>
            <p className="font-bold text-error">Đơn hàng đã bị huỷ</p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Đơn này không thể thay đổi trạng thái.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Visual Stepper */}
          <div className="flex items-center gap-0">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = i === currentStepIndex;
              const isPast = i < currentStepIndex;
              const isFuture = i > currentStepIndex;

              return (
                <div key={step.key} className="flex items-center flex-1 last:flex-none">
                  <button
                    onClick={() => goToStep(i)}
                    disabled={isActive || isPending}
                    className={`
                      relative flex flex-col items-center gap-2 group transition-all
                      ${isActive ? "cursor-default" : "cursor-pointer"}
                      ${isPending ? "opacity-60 pointer-events-none" : ""}
                    `}
                  >
                    {/* Icon circle */}
                    <div
                      className={`
                        w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300
                        ${isActive ? `${step.activeBg} ${step.activeText} shadow-lg scale-110` : ""}
                        ${isPast ? "bg-primary/15 text-primary" : ""}
                        ${isFuture ? "bg-surface-container-high text-on-surface-variant" : ""}
                        ${!isActive ? "group-hover:scale-105 group-hover:shadow-md" : ""}
                      `}
                    >
                      {isPast ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>

                    {/* Label */}
                    <span
                      className={`text-[11px] font-bold whitespace-nowrap transition-colors ${
                        isActive
                          ? step.color
                          : isPast
                            ? "text-primary"
                            : "text-on-surface-variant/60"
                      }`}
                    >
                      {step.label}
                    </span>
                  </button>

                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 mx-1.5 h-0.5 rounded-full relative">
                      <div className="absolute inset-0 bg-surface-container-high rounded-full" />
                      <div
                        className={`absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-500 ${
                          isPast ? "w-full" : "w-0"
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Step navigation buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={() => goToStep(currentStepIndex - 1)}
              disabled={currentStepIndex <= 0 || isPending}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
            >
              <ChevronLeft className="w-4 h-4" />
              Lùi lại
            </button>

            <button
              onClick={() =>
                setConfirmAction({
                  type: "cancel",
                  value: "CANCELLED",
                  label: "Đã huỷ",
                })
              }
              disabled={isPending}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold text-error bg-error/5 hover:bg-error/10 transition-all disabled:opacity-30"
            >
              <Ban className="w-4 h-4" />
              Huỷ đơn
            </button>

            <button
              onClick={() => goToStep(currentStepIndex + 1)}
              disabled={currentStepIndex >= STEPS.length - 1 || isPending}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-primary text-on-primary shadow-md shadow-primary/20 hover:shadow-lg"
            >
              Tiếp theo
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}

      {/* Divider */}
      <div className="border-t border-outline-variant/15" />

      {/* Payment Status */}
      <div>
        <h4 className="font-headline font-bold text-sm mb-3 flex items-center gap-2 text-on-surface-variant">
          <CreditCard className="w-4 h-4" />
          Trạng thái thanh toán
        </h4>
        <div className="flex gap-2">
          {[
            { key: "UNPAID", label: "Chưa thanh toán", icon: "○" },
            { key: "PAID", label: "Đã thanh toán", icon: "●" },
            { key: "REFUNDED", label: "Hoàn tiền", icon: "↩" },
          ].map((ps) => {
            const isActive =
              currentPaymentStatus?.toUpperCase() === ps.key;
            return (
              <button
                key={ps.key}
                onClick={() => {
                  if (!isActive) {
                    setConfirmAction({
                      type: "payment",
                      value: ps.key,
                      label: ps.label,
                    });
                  }
                }}
                disabled={isActive || isPending}
                className={`
                  flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all
                  ${
                    isActive
                      ? ps.key === "PAID"
                        ? "bg-primary/15 text-primary ring-2 ring-primary/20"
                        : ps.key === "REFUNDED"
                          ? "bg-outline/10 text-outline ring-2 ring-outline/20"
                          : "bg-secondary/15 text-secondary ring-2 ring-secondary/20"
                      : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                  }
                  disabled:cursor-default
                `}
              >
                {ps.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest rounded-[2rem] w-full max-w-sm shadow-[0_40px_80px_rgba(0,0,0,0.2)] p-8 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h4 className="font-headline font-bold text-lg">
                  Xác nhận thay đổi?
                </h4>
                <p className="text-sm text-on-surface-variant mt-0.5">
                  {confirmAction.type === "cancel"
                    ? "Bạn có chắc muốn huỷ đơn hàng này?"
                    : confirmAction.direction === "backward"
                      ? `Quay lại trạng thái "${confirmAction.label}"?`
                      : `Chuyển sang "${confirmAction.label}"?`}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                disabled={isPending}
                className="flex-1 py-3 rounded-full text-sm font-bold bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest transition-all"
              >
                Huỷ bỏ
              </button>
              <button
                onClick={handleConfirm}
                disabled={isPending}
                className={`flex-1 py-3 rounded-full text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                  confirmAction.type === "cancel"
                    ? "bg-error text-on-error shadow-error/20"
                    : "bg-primary text-on-primary shadow-primary/20"
                }`}
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Xác nhận"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
