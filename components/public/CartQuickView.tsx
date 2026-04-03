"use client";

import { useCartStore } from "@/stores/cartStore";
import { formatVND } from "@/lib/formatters";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function CartQuickView({ close }: { close?: () => void }) {
  const { items, removeItem, totalAmount, totalItems } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4 text-outline-variant">
          <ShoppingCart strokeWidth={1} size={32} />
        </div>
        <p className="text-on-surface-variant font-medium">
          Giỏ hàng đang trống
        </p>
        <p className="text-xs text-outline-variant mt-1">
          Hãy chọn sản phẩm ngon lành nhé!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[85vh] md:max-h-none">
      <div className="flex items-center justify-between px-5 py-4">
        <h3 className="font-headline font-extrabold text-lg text-on-surface tracking-tight">
          Giỏ hàng của bạn
        </h3>
        <span className="text-[10px] font-bold bg-primary-container text-on-primary-container px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
          {totalItems()} món
        </span>
      </div>

      <Separator className="opacity-10" />

      <ScrollArea className="flex-grow">
        <div className="px-5 py-2 space-y-5">
          {items.map((item) => (
            <div key={item.cartKey} className="flex gap-4 group items-start">
              <div className="w-20 h-20 rounded-2xl bg-surface-container flex items-center justify-center shrink-0 border border-surface-container-highest overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="w-full h-full object-cover mix-blend-multiply transition-transform"
                />
              </div>
              <div className="flex-grow min-w-0 flex flex-col pt-1">
                <h4 className="text-sm font-bold text-on-surface leading-snug truncate pr-4">
                  {item.productName}
                </h4>
                <p className="text-[11px] font-medium text-on-surface-variant/60 mt-0.5 truncate uppercase tracking-tight">
                  {item.variantName}
                  {item.options.length > 0 &&
                    ` • ${item.options.map((o) => o.optionValueName).join(", ")}`}
                </p>

                <div className="flex items-baseline justify-between mt-auto pb-1">
                  <span className="text-xs font-medium text-outline">
                    Số lượng: {item.quantity}
                  </span>
                  <span className="text-sm font-extrabold text-primary-dim">
                    {formatVND(
                      (item.variantPrice +
                        item.options.reduce((s, o) => s + o.price, 0)) *
                        item.quantity,
                    )}
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeItem(item.cartKey)}
                className="mt-1 p-1.5 text-outline-variant hover:text-error hover:bg-error/10 rounded-lg transition-all shrink-0"
                title="Xóa sản phẩm"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-auto">
        <Separator className="opacity-10" />
        <div className="p-6 bg-surface-container-low/30 space-y-5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-outline uppercase tracking-widest">
              Tạm tính
            </span>
            <span className="font-headline font-black text-2xl text-on-surface tracking-tighter">
              {formatVND(totalAmount())}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/cart" onClick={close} className="w-full">
              <Button
                variant="outline"
                className="w-full h-11 rounded-full text-xs font-extrabold uppercase tracking-widest border-surface-container-highest hover:bg-surface-container-high hover:text-on-surface transition-all active:scale-95 duration-200"
              >
                Giỏ hàng
              </Button>
            </Link>
            <Link href="/checkout" onClick={close} className="w-full">
              <Button className="w-full h-11 rounded-full text-xs font-extrabold uppercase tracking-widest bg-primary text-on-primary hover:bg-primary-dim shadow-xl shadow-primary/10 transition-all active:scale-95 duration-200 flex items-center justify-center gap-2">
                Mua ngay{" "}
                <ArrowRight
                  size={14}
                  className="animate-in slide-in-from-left-1"
                />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
