"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Copy, Check } from "lucide-react";
import { formatVND } from "@/lib/formatters";
import { toast } from "sonner";
import { ProductDrawer } from "@/components/admin/ProductDrawer";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toggleProductActive } from "@/app/actions/admin/products";
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
      toast.success("Link copied!");
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
        setOptimistic(!next); // revert
        toast.error("Failed to update status");
      } else {
        toast.success(
          next ? "Product is now visible" : "Product is now hidden",
        );
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

export function ProductsClient({
  products,
  categories,
  optionGroups,
  siteUrl,
}: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(
    null,
  );

  const openCreate = () => {
    setEditingProduct(null);
    setDrawerOpen(true);
  };

  const openEdit = (p: AdminProduct) => {
    setEditingProduct(p);
    setDrawerOpen(true);
  };

  const drawerProduct = editingProduct
    ? {
        ...editingProduct,
        product_variants: editingProduct.product_variants.sort(
          (a, b) => a.sort_order - b.sort_order,
        ),
        product_images: editingProduct.product_images.sort(
          (a, b) => a.sort_order - b.sort_order,
        ),
      }
    : undefined;

  return (
    <>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">
            Products
          </h2>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs font-medium text-primary bg-primary-container px-3 py-1 rounded-full">
              Total: {products.length} products
            </span>
          </div>
        </div>
        <Button
          onClick={openCreate}
          className="font-headline font-bold px-6 h-11 rounded-full shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          Add product
        </Button>
      </div>

      <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-[0px_20px_40px_rgba(43,48,45,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/10">
                {[
                  "Image",
                  "Product",
                  "Category",
                  "Short desc",
                  "Long desc",
                  "Price from",
                  "Active",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant whitespace-nowrap"
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
                    No products yet.{" "}
                    <button
                      onClick={openCreate}
                      className="text-primary font-semibold underline"
                    >
                      Add one now
                    </button>
                  </td>
                </tr>
              )}
              {products.map((product) => {
                const thumb = product.product_images?.sort(
                  (a, b) => a.sort_order - b.sort_order,
                )?.[0]?.url;
                const minPrice = product.product_variants
                  ?.filter((v) => v.is_active)
                  .reduce((min, v) => Math.min(min, v.price), Infinity);

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-surface-container/30 transition-colors group cursor-pointer"
                    onClick={() => openEdit(product)}
                  >
                    <td className="px-4 py-3">
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

                    <td className="px-4 py-3 min-w-[160px]">
                      <div className="font-bold text-on-surface">
                        {product.name}
                      </div>
                      <div className="text-xs font-mono text-on-surface-variant opacity-50 mt-0.5">
                        /{product.slug}
                      </div>
                    </td>

                    <td className="px-4 py-3">
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

                    <td className="px-4 py-3 max-w-[150px]">
                      {product.short_description ? (
                        <span className="text-xs text-on-surface-variant line-clamp-2 opacity-60">
                          {product.short_description}
                        </span>
                      ) : (
                        <span className="text-on-surface-variant opacity-30 text-xs">
                          —
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 max-w-[150px]">
                      {product.description ? (
                        <span className="text-xs text-on-surface-variant line-clamp-2 opacity-60">
                          {product.description}
                        </span>
                      ) : (
                        <span className="text-on-surface-variant opacity-30 text-xs">
                          —
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 font-semibold whitespace-nowrap">
                      {minPrice && isFinite(minPrice)
                        ? formatVND(minPrice)
                        : "—"}
                    </td>

                    <td className="px-4 py-3">
                      <ActiveSwitch product={product} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(product);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <CopyLinkButton slug={product.slug} siteUrl={siteUrl} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ProductDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        categories={categories}
        optionGroups={optionGroups}
        product={drawerProduct}
        key={editingProduct?.id ?? "new"}
      />
    </>
  );
}
