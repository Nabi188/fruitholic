"use client";

import { GripVertical, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Switch } from "@/components/ui/switch";
import type { AdminProductVariant } from "@/types/admin";

type Props = {
  variant: AdminProductVariant;
  onUpdate: (key: keyof AdminProductVariant, val: any) => void;
  onRemove: () => void;
  isOnly: boolean;
};

export function SortableVariantItem({
  variant,
  onUpdate,
  onRemove,
  isOnly,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: variant.uid! });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group flex items-center gap-3 bg-surface-container-low p-3 rounded-2xl shadow-sm border border-outline-variant/5 ${
        isDragging ? "opacity-50 z-50 shadow-xl" : ""
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-surface-container rounded-lg transition-colors"
      >
        <GripVertical className="w-4 h-4 text-on-surface-variant/40" />
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 ml-1 opacity-60">
            Variant Name
          </label>
          <input
            type="text"
            value={variant.name}
            onChange={(e) => onUpdate("name", e.target.value)}
            className="w-full px-3 py-1.5 bg-surface-container border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="e.g. Size M, Regular..."
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 ml-1 opacity-60">
              Price (₫)
            </label>
            <input
              type="number"
              value={variant.price}
              onChange={(e) => onUpdate("price", Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-surface-container border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="shrink-0 flex flex-col items-center">
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 opacity-60">
              Active
            </label>
            <div className="h-8 flex items-center">
              <Switch
                checked={variant.is_active}
                onCheckedChange={(checked) => onUpdate("is_active", checked)}
              />
            </div>
          </div>
        </div>
      </div>

      {!isOnly && (
        <button
          type="button"
          onClick={onRemove}
          className="p-2 text-on-surface-variant/40 hover:text-error hover:bg-error/10 rounded-xl transition-all"
        >
          <Trash2 className="w-4.5 h-4.5" />
        </button>
      )}
    </div>
  );
}
