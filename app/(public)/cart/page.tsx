/* eslint-disable @next/next/no-img-element */
"use client";

import { useCartStore } from "@/stores/cartStore";
import { formatVND } from "@/lib/formatters";
import Link from "next/link";
import { ShoppingBag, X, Plus, Minus, ArrowRight } from "lucide-react";

import { useEffect, useState } from "react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalAmount, totalItems } =
    useCartStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) return null; //Thêm skeleton loading ở đây

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center text-center max-w-md">
        <div className="h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center mb-6">
          <ShoppingBag className="h-10 w-10 text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">
          Giỏ hàng trống
        </h2>
        <p className="text-slate-500 mb-8">
          Bạn chưa chọn sản phẩm nào. Hãy khám phá menu hấp dẫn của Fruitholic
          nhé!
        </p>
        <Link
          href="/"
          className="w-full rounded-2xl bg-emerald-600 px-6 py-4 font-bold text-white shadow-lg transition-colors hover:bg-emerald-700"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">
        Giỏ Hàng Của Bạn{" "}
        <span className="text-slate-400 font-normal ml-2">
          ({totalItems()})
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        <div className="lg:col-span-8 flex flex-col gap-6">
          {items.map((item) => (
            <div
              key={item.cartKey}
              className="flex gap-6 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm relative group"
            >
              
              <Link
                href={`/products/${item.productSlug}`}
                className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-50"
              >
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="h-full w-full object-cover"
                />
              </Link>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <Link
                      href={`/products/${item.productSlug}`}
                      className="hover:text-emerald-600 transition-colors"
                    >
                      <h3 className="font-bold text-lg text-slate-900 mb-1">
                        {item.productName}
                      </h3>
                    </Link>
                    <button
                      onClick={() => removeItem(item.cartKey)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      aria-label="Xóa"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-medium text-emerald-700 bg-emerald-50 px-2 flex items-center justify-center rounded uppercase text-[10px] tracking-wide h-5">
                      {item.variantName}
                    </span>
                    {item.options.map((opt) => (
                      <span
                        key={opt.optionValueId}
                        className="after:content-[',_'] last:after:content-['']"
                      >
                        {opt.optionValueName}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-end justify-between mt-4">
                  <div className="flex h-10 items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                    <button
                      onClick={() =>
                        updateQuantity(item.cartKey, item.quantity - 1)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm hover:bg-slate-100"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.cartKey, item.quantity + 1)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm hover:bg-slate-100"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-extrabold text-emerald-600">
                      {formatVND(
                        (item.variantPrice +
                          item.options.reduce((s, o) => s + o.price, 0)) *
                          item.quantity,
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-4 sticky top-24">
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex flex-col gap-6">
            <h3 className="text-xl font-bold text-slate-900">
              Tóm tắt đơn hàng
            </h3>

            <div className="flex flex-col gap-4 text-slate-600 text-sm">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span className="font-medium text-slate-900">
                  {formatVND(totalAmount())}
                </span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-4">
                <span>Phí vận chuyển</span>
                <span className="text-slate-400 italic">
                  Tính ở bước thanh toán
                </span>
              </div>
              <div className="flex justify-between items-end pt-2">
                <span className="font-bold text-slate-900">Tổng cộng</span>
                <span className="text-2xl font-extrabold text-emerald-600">
                  {formatVND(totalAmount())}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 font-bold text-white shadow-xl shadow-emerald-600/20 transition-all hover:bg-emerald-700"
            >
              Tiến Hành Thanh Toán <ArrowRight className="h-5 w-5" />
            </Link>

            <p className="text-xs text-center text-slate-400 leading-relaxed">
              Bạn có thể áp dụng mã ưu đãi (nếu có) và theo dõi phí ship chi
              tiết tại bước tiếp theo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
