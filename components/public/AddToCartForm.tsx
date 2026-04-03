"use client";

import { useState } from "react";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { useCartStore, SelectedOption } from "@/stores/cartStore";
import { formatVND } from "@/lib/formatters";
import type { ProductDetail } from "@/types/app";
import { toast } from "sonner";

type Props = {
  data: ProductDetail;
};

export function AddToCartForm({ data }: Props) {
  const { product, variants, option_groups, images } = data;
  const addItem = useCartStore((state) => state.addItem);

  const [quantity, setQuantity] = useState(1);

  const defaultVariant = variants?.[0];
  const [selectedVariantId, setSelectedVariantId] = useState(
    defaultVariant?.id ?? "",
  );

  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string[]>
  >({});

  if (!defaultVariant)
    return <p className="text-error font-bold">Tạm thời hết hàng</p>;

  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) ?? defaultVariant;
  const thumbnail = images?.[0]?.url || "";

  let livePrice = selectedVariant.price;

  const chosenOptions: SelectedOption[] = [];

  Object.entries(selectedOptions).forEach(([groupId, valueIds]) => {
    const group = option_groups.find((g) => g.id === groupId);
    if (!group) return;

    valueIds.forEach((valId) => {
      const val = group.values.find((v) => v.id === valId);
      if (val) {
        livePrice += val.price;
        chosenOptions.push({
          optionGroupId: group.id,
          optionGroupName: group.name,
          optionValueId: val.id,
          optionValueName: val.name,
          price: val.price,
        });
      }
    });
  });

  const handleOptionToggle = (
    groupId: string,
    valueId: string,
    maxSelect: number,
  ) => {
    setSelectedOptions((prev) => {
      const current = prev[groupId] || [];
      const isSelected = current.includes(valueId);

      if (isSelected) {
        return { ...prev, [groupId]: current.filter((id) => id !== valueId) };
      } else {
        if (current.length >= maxSelect && maxSelect > 1) {
          alert(`Chỉ được chọn tối đa ${maxSelect} mục.`);
          return prev;
        } else if (maxSelect === 1) {
          return { ...prev, [groupId]: [valueId] };
        } else {
          return { ...prev, [groupId]: [...current, valueId] };
        }
      }
    });
  };

  const handleAddToCart = () => {
    const safeOptionGroups = option_groups ?? [];
    for (const group of safeOptionGroups) {
      const current = selectedOptions[group.id] || [];
      if (current.length < (group.min_select || 0)) {
        alert(
          `Vui lòng chọn ít nhất ${group.min_select} mục cho: ${group.name}`,
        );
        return;
      }
    }

    addItem(
      {
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        imageUrl: thumbnail,
        variantId: selectedVariant.id,
        variantName: selectedVariant.name,
        variantPrice: selectedVariant.price,
        options: chosenOptions,
      },
      quantity,
    );

    toast.success("Đã thêm vào giỏ hàng!");
  };

  const hasOptions = option_groups && option_groups.length > 0;

  return (
    <>
      <div className="mb-4">
        <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-xs font-bold rounded-full tracking-wider uppercase font-headline inline-block">
          Sản phẩm
        </span>
      </div>

      <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface leading-tight mb-4 tracking-tighter font-headline">
        {product.name}
      </h1>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <span className="text-3xl font-extrabold text-primary-dim tracking-tight">
          {formatVND(livePrice)}
        </span>
      </div>

      {product.short_description &&
        !product.short_description.startsWith("{") && (
          <p className="text-on-surface-variant mb-10 text-lg leading-relaxed font-body border-b border-outline-variant/20 pb-8">
            {product.short_description}
          </p>
        )}

      <div className="space-y-8 mb-12">
        {variants.length > 1 && (
          <div>
            <span className="block text-sm font-bold text-on-surface mb-3 uppercase tracking-widest font-headline">
              Kích thước / Cỡ
            </span>
            <div className="flex flex-wrap gap-3">
              {variants.map((v) => {
                const isSelected = selectedVariantId === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold transition-all font-body text-sm text-center ${
                      isSelected
                        ? "border-primary bg-primary-container/20 text-on-surface"
                        : "border-outline-variant/30 text-outline hover:border-primary/50 hover:text-primary"
                    }`}
                  >
                    {v.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {hasOptions && (
          <div className="space-y-8">
            {option_groups.map((group) => {
              const isSingleSelect = group.max_select === 1;
              return (
                <div key={group.id}>
                  <div className="flex justify-between items-end mb-3">
                    <span className="block text-sm font-bold text-on-surface uppercase tracking-widest font-headline">
                      {group.name}
                    </span>
                    <span className="text-xs text-on-surface-variant font-body mb-0.5">
                      {isSingleSelect ? "Chọn 1" : "Tùy chọn"}
                    </span>
                  </div>

                  {isSingleSelect ? (
                    <div className="grid grid-cols-2 gap-3">
                      {group.values.map((v) => {
                        const isChecked = (
                          selectedOptions[group.id] || []
                        ).includes(v.id);
                        return (
                          <button
                            key={v.id}
                            onClick={() =>
                              handleOptionToggle(
                                group.id,
                                v.id,
                                group.max_select,
                              )
                            }
                            className={`py-3 px-4 rounded-xl border-2 font-medium transition-all font-body text-sm text-center truncate ${
                              isChecked
                                ? "border-primary bg-primary-container/20 text-on-surface"
                                : "border-outline-variant/20 text-outline hover:border-primary/50"
                            }`}
                          >
                            {v.name}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {group.values.map((v) => {
                        const isChecked = (
                          selectedOptions[group.id] || []
                        ).includes(v.id);
                        return (
                          <button
                            key={v.id}
                            onClick={() =>
                              handleOptionToggle(
                                group.id,
                                v.id,
                                group.max_select,
                              )
                            }
                            className={`px-4 py-2.5 rounded-full font-body text-sm font-medium transition-all ${
                              isChecked
                                ? "bg-primary text-white shadow-md shadow-primary/20"
                                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                            }`}
                          >
                            {isChecked ? "✓ " : "+ "}
                            {v.name}
                            {v.price > 0 && ` (+${v.price / 1000}k)`}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quantity & Add to Cart */}
      <div className="mt-auto flex gap-4 pt-8 border-t border-outline-variant/20 sticky bottom-0 bg-surface/80 backdrop-blur-md pb-4 z-10 pt-4 px-1 -mx-1">
        <div className="flex items-center bg-surface-container-high rounded-full px-5 py-2">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 flex items-center justify-center hover:text-primary transition-colors text-on-surface-variant"
          >
            <Minus strokeWidth={2.5} className="w-5 h-5" />
          </button>
          <span className="w-10 text-center font-extrabold text-xl font-headline text-on-surface select-none">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 flex items-center justify-center hover:text-primary transition-colors text-on-surface-variant"
          >
            <Plus strokeWidth={2.5} className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          className="flex-1 bg-primary hover:bg-primary-dim text-white py-4 px-8 rounded-full font-bold text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-transform active:scale-95 font-headline"
        >
          <ShoppingCart strokeWidth={2.5} className="w-5 h-5" />
          Thêm vào giỏ hàng
        </button>
      </div>
    </>
  );
}
