"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { formatVND } from "@/lib/formatters";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  toggleProductActive,
  toggleVariantActive,
} from "@/app/actions/admin/products";
import { AdminProduct, AdminCategory, AdminOptionGroup } from "@/types/admin";

type Props = {
  products: AdminProduct[];
  categories: AdminCategory[];
  optionGroups: AdminOptionGroup[];
  siteUrl: string;
};

function CopyLinkButton({ slug, siteUrl }: { slug: string; siteUrl: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${siteUrl}/products/${slug}`;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("Đã sao chép link!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Button variant="ghost" size="icon-sm" onClick={handleCopy} title={url}>
      {copied ? (
        <Check className="w-4 h-4 text-primary" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </Button>
  );
}

function ActiveSwitch({ product }: { product: AdminProduct }) {
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState(product.is_active);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !optimistic;
    setOptimistic(next);
    startTransition(async () => {
      const result = await toggleProductActive(product.id, next);
      if (result.error) {
        setOptimistic(!next);
        toast.error("Không thể thay đổi trạng thái");
      } else {
        toast.success(next ? "Sản phẩm đã hiển thị" : "Sản phẩm đã ẩn");
      }
    });
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Switch
        checked={optimistic}
        onCheckedChange={() => {}}
        onClick={handleToggle}
        disabled={isPending}
      />
    </div>
  );
}

function VariantActiveSwitch({
  variantId,
  isActive,
}: {
  variantId: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState(isActive);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !optimistic;
    setOptimistic(next);
    startTransition(async () => {
      const result = await toggleVariantActive(variantId, next);
      if (result.error) {
        setOptimistic(!next);
        toast.error("Thay đổi trạng thái thất bại");
      }
    });
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Switch
        checked={optimistic}
        onCheckedChange={() => {}}
        onClick={handleToggle}
        disabled={isPending}
      />
    </div>
  );
}

export function ProductsClient({ products, siteUrl }: Props) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    setExpandedId(expandedId === productId ? null : productId);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            Sản phẩm
          </h2>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs font-medium text-primary bg-primary-container px-3 py-1 rounded-full">
              Tổng cộng: {products.length} sản phẩm
            </span>
          </div>
        </div>
        <Button
          onClick={() => router.push("/admin/products/new")}
          className="font-headline font-bold px-5 sm:px-6 h-10 sm:h-11 rounded-full shadow-lg shadow-primary/20 text-sm"
        >
          <Plus className="w-5 h-5" />
          Thêm sản phẩm
        </Button>
      </div>

      <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-[0px_20px_40px_rgba(43,48,45,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/10">
                {[
                  "",
                  "Hình ảnh",
                  "Sản phẩm",
                  "Danh mục",
                  "Biến thể",
                  "Giá",
                  "Trạng thái",
                  "Thao tác",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-2 sm:px-4 py-3 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-on-surface-variant whitespace-nowrap ${
                      h === "Danh mục" || h === "Biến thể"
                        ? "hidden md:table-cell"
                        : ""
                    } ${h === "Thao tác" ? "hidden sm:table-cell" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-sm">
              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-8 py-12 text-center text-on-surface-variant"
                  >
                    Chưa có sản phẩm.{" "}
                    <button
                      onClick={() => router.push("/admin/products/new")}
                      className="text-primary font-semibold underline"
                    >
                      Thêm sản phẩm ngay
                    </button>
                  </td>
                </tr>
              )}
              {products.map((product) => {
                const thumb = product.product_images?.sort(
                  (a, b) => a.sort_order - b.sort_order,
                )?.[0]?.url;
                const activeVariants = product.product_variants?.filter(
                  (v) => v.is_active,
                );
                const minPrice = activeVariants?.reduce(
                  (min, v) => Math.min(min, v.price),
                  Infinity,
                );
                const hasMultipleVariants =
                  (product.product_variants?.length ?? 0) > 1;
                const isExpanded = expandedId === product.id;

                return (
                  <React.Fragment key={product.id}>
                    <tr
                      className="hover:bg-surface-container/30 transition-colors group cursor-pointer"
                      onClick={() =>
                        router.push(`/admin/products/${product.id}`)
                      }
                    >
                      {/* Expand toggle */}
                      <td className="px-2 py-3 w-8">
                        {hasMultipleVariants ? (
                          <button
                            onClick={(e) => toggleExpand(e, product.id)}
                            className="p-1 rounded hover:bg-surface-container-high transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-on-surface-variant" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                            )}
                          </button>
                        ) : (
                          <div className="w-6" />
                        )}
                      </td>

                      <td className="px-2 sm:px-4 py-3">
                        <div className="w-11 h-11 rounded-xl bg-surface-container overflow-hidden shrink-0">
                          {thumb && (
                            <img
                              src={thumb}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      </td>

                      <td className="px-2 sm:px-4 py-3 min-w-[120px] sm:min-w-[160px]">
                        <div className="font-bold text-on-surface">
                          {product.name}
                        </div>
                        <div className="text-xs font-mono text-on-surface-variant opacity-50 mt-0.5">
                          /{product.slug}
                        </div>
                      </td>

                      <td className="px-2 sm:px-4 py-3 hidden md:table-cell">
                        {product.categories?.name ? (
                          <span className="bg-surface-variant text-on-surface-variant px-2 py-1 rounded text-xs font-medium">
                            {product.categories.name}
                          </span>
                        ) : (
                          <span className="text-on-surface-variant opacity-30 text-xs">
                            —
                          </span>
                        )}
                      </td>

                      <td className="px-2 sm:px-4 py-3 hidden md:table-cell">
                        <span className="bg-surface-container px-2.5 py-1 rounded-full text-xs font-semibold text-on-surface-variant">
                          {product.product_variants?.length ?? 0} biến thể
                        </span>
                      </td>

                      <td className="px-2 sm:px-4 py-3 font-semibold whitespace-nowrap text-sm">
                        {minPrice && isFinite(minPrice)
                          ? formatVND(minPrice)
                          : "—"}
                      </td>

                      <td className="px-2 sm:px-4 py-3">
                        <ActiveSwitch product={product} />
                      </td>
                      <td className="px-2 sm:px-4 py-3 hidden sm:table-cell">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/admin/products/${product.id}`);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <CopyLinkButton
                            slug={product.slug}
                            siteUrl={siteUrl}
                          />
                        </div>
                      </td>
                    </tr>

                    {/* Expanded variant rows */}
                    {isExpanded && hasMultipleVariants && (
                      <tr className="bg-surface-container/15">
                        <td colSpan={8} className="px-6 py-4">
                          <div className="ml-8 space-y-0">
                            <div className="grid grid-cols-[1fr_auto_auto] gap-4 mb-2 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant/60 px-3">
                              <span>Tên biến thể</span>
                              <span className="w-24 text-right">Giá</span>
                              <span className="w-16 text-center">Bật</span>
                            </div>
                            {product.product_variants
                              ?.sort((a, b) => a.sort_order - b.sort_order)
                              .map((v, vi) => (
                                <div
                                  key={v.id ?? v.uid ?? vi}
                                  className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-3 py-2 rounded-lg hover:bg-surface-container/30 transition-colors"
                                >
                                  <span className="text-sm font-medium text-on-surface">
                                    {v.name}
                                  </span>
                                  <span className="w-24 text-right text-sm font-bold text-primary">
                                    {formatVND(v.price)}
                                  </span>
                                  <div className="w-16 flex justify-center">
                                    {v.id ? (
                                      <VariantActiveSwitch
                                        variantId={v.id}
                                        isActive={v.is_active}
                                      />
                                    ) : (
                                      <span
                                        className={`text-xs ${v.is_active ? "text-primary" : "text-on-surface-variant/50"}`}
                                      >
                                        {v.is_active ? "On" : "Off"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
