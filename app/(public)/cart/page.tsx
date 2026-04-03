"use client";

import { useCartStore } from "@/stores/cartStore";
import { formatVND } from "@/lib/formatters";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalAmount, totalItems } =
    useCartStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-24 flex flex-col items-center">
        {/* Empty State Suggestion (Editorial Feel) */}
        <div className="bg-primary/5 rounded-2xl border-2 border-dashed border-primary/20 p-12 flex flex-col items-center justify-center text-center max-w-lg w-full">
          <Trash2
            className="text-primary w-12 h-12 mb-6 opacity-50"
            strokeWidth={1.5}
          />
          <p className="font-headline font-extrabold text-2xl text-primary mb-2 tracking-tight">
            Giỏ hàng trống
          </p>
          <p className="text-on-surface-variant font-body mb-8 leading-relaxed">
            Bạn chưa chọn sản phẩm nào. Hãy khám phá thực đơn hữu cơ tươi mát
            của hôm nay nhé.
          </p>
          <Link
            href="/"
            className="px-8 py-4 bg-primary text-on-primary rounded-full font-headline font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-12 py-12">
      {/* Back Action */}
      <div className="mb-8 flex items-center gap-2 group">
        <ArrowLeft
          className="text-primary w-5 h-5 group-hover:-translate-x-1 transition-transform"
          strokeWidth={2.5}
        />
        <Link
          href="/"
          className="font-headline font-bold text-lg text-primary tracking-tight group-hover:underline overflow-hidden"
        >
          Tiếp tục mua sắm
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Cart Items Section */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <h1 className="text-4xl font-headline font-extrabold text-on-background mb-4 tracking-tighter">
            Giỏ hàng của bạn{" "}
            <span className="text-on-surface-variant/50 text-2xl font-medium">
              ({totalItems()})
            </span>
          </h1>

          {items.map((item) => (
            <div
              key={item.cartKey}
              className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0px_20px_40px_rgba(43,48,45,0.04)] flex flex-col md:flex-row gap-6 relative overflow-hidden border border-outline-variant/10 transition-all hover:border-primary/20"
            >
              <div className="w-full md:w-32 h-32 flex-shrink-0 bg-surface rounded-xl overflow-hidden group">
                <Link href={`/products/${item.productSlug}`}>
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
              </div>

              <div className="flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <Link href={`/products/${item.productSlug}`}>
                      <h3 className="font-headline font-bold text-xl text-on-surface hover:text-primary transition-colors">
                        {item.productName}
                      </h3>
                    </Link>
                    <span className="font-headline font-bold text-lg text-primary-dim whitespace-nowrap">
                      {formatVND(
                        item.variantPrice +
                          item.options.reduce((s, o) => s + o.price, 0),
                      )}
                    </span>
                  </div>

                  {/* Variant & Options */}
                  <div className="text-sm text-on-surface-variant font-body mt-1 flex flex-wrap gap-2">
                    <span className="font-bold text-primary-dim">
                      {item.variantName}
                    </span>
                    {item.options.map((opt) => (
                      <span
                        key={opt.optionValueId}
                        className="flex items-center"
                      >
                        <span className="mx-1 opacity-50">•</span>{" "}
                        {opt.optionValueName}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6">
                  {/* Quantity Control */}
                  <div className="flex items-center bg-surface-container-high rounded-full px-4 py-2 gap-4">
                    <button
                      onClick={() =>
                        updateQuantity(item.cartKey, item.quantity - 1)
                      }
                      className="hover:text-primary transition-colors p-1"
                      aria-label="Giảm số lượng"
                    >
                      <Minus className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                    <span className="font-headline font-bold w-6 text-center text-on-surface select-none">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.cartKey, item.quantity + 1)
                      }
                      className="hover:text-primary transition-colors p-1"
                      aria-label="Tăng số lượng"
                    >
                      <Plus className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="font-headline font-extrabold text-xl text-on-background">
                      {formatVND(
                        (item.variantPrice +
                          item.options.reduce((s, o) => s + o.price, 0)) *
                          item.quantity,
                      )}
                    </span>
                    <button
                      onClick={() => removeItem(item.cartKey)}
                      className="text-error-dim bg-error/5 hover:bg-error-container/40 p-2.5 rounded-full transition-all"
                      aria-label="Xóa"
                    >
                      <Trash2 className="w-5 h-5" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary & Payment Section */}
        <aside className="lg:col-span-4 sticky top-32 space-y-6">
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-8 shadow-[0px_20px_40px_rgba(43,48,45,0.04)]">
            <h2 className="text-2xl font-headline font-extrabold text-on-background mb-8 tracking-tight">
              Tóm tắt đơn hàng
            </h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-on-surface-variant font-body">
                <span>Tạm tính</span>
                <span className="font-headline font-bold text-on-surface">
                  {formatVND(totalAmount())}
                </span>
              </div>
              <div className="flex justify-between text-on-surface-variant font-body">
                <span>Phí vận chuyển</span>
                <span className="italic text-sm">Tính ở bước thanh toán</span>
              </div>
              <div className="mb-6 pt-6 border-t border-outline-variant/20">
                <p className="font-headline font-bold text-xs text-on-surface-variant mb-3 uppercase tracking-widest">
                  Mã giảm giá
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập mã của bạn..."
                    className="flex-grow bg-surface-container border border-outline-variant/20 rounded-full px-5 py-3 text-sm font-body focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all placeholder:text-outline"
                  />
                  <button className="px-6 py-3 bg-on-surface text-surface-container-lowest rounded-full text-sm font-bold hover:bg-on-surface-variant transition-colors whitespace-nowrap">
                    Áp dụng
                  </button>
                </div>
              </div>
              <div className="pt-6 border-t border-outline-variant/20 flex justify-between items-end">
                <span className="font-headline font-bold text-lg text-on-surface">
                  Tổng cộng
                </span>
                <span className="text-3xl font-headline font-extrabold text-primary-dim tracking-tight">
                  {formatVND(totalAmount())}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-4 bg-primary text-on-primary rounded-full font-headline font-bold text-lg shadow-[0px_10px_20px_rgba(0,107,27,0.2)] hover:shadow-[0px_15px_30px_rgba(0,107,27,0.3)] hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-2"
            >
              Tiến hành thanh toán
              <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
            </Link>

            <p className="text-center text-xs text-on-surface-variant mt-6 font-body leading-relaxed max-w-xs mx-auto">
              Bằng cách thanh toán, bạn đồng ý với{" "}
              <Link
                href="/policies"
                className="underline hover:text-primary transition-colors"
              >
                Điều khoản & Chính sách
              </Link>{" "}
              của chúng tôi.
            </p>
          </div>

          {/* Promotional Banner */}
          <div className="bg-secondary-container text-on-secondary-container p-6 rounded-2xl relative overflow-hidden group shadow-sm">
            <div className="relative z-10">
              <h4 className="font-headline font-bold text-lg mb-1 tracking-tight">
                Giao hàng siêu tốc
              </h4>
              <p className="text-sm opacity-90 font-body leading-relaxed pr-8">
                Fruitholic cam kết giao trái cây tươi ngon trong vòng 2h tại nội
                thành Hà Nội.
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 bg-white/20 w-24 h-24 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
