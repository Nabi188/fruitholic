"use client";

import { GripVertical, X } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import type { AdminOptionValue } from "@/types/admin";

type Props = {
  value: AdminOptionValue;
  index: number;
  onChange: (key: keyof AdminOptionValue, val: any) => void;
  onRemove: () => void;
  canRemove: boolean;
};

export function SortableValueRow({
  value,
  index,
  onChange,
  onRemove,
  canRemove,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: index });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 ${isDragging ? "opacity-50 z-50 bg-surface-container rounded-xl shadow-lg" : ""}`}
    >
      <button
        type="button"
        className="p-1.5 text-on-surface-variant/40 hover:text-on-surface-variant cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <input
        type="text"
        required
        value={value.name}
        onChange={(e) => onChange("name", e.target.value)}
        placeholder="Value name"
        className="flex-1 px-3 py-2 bg-surface-container-low border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30"
      />

      <div className="relative flex items-center">
        <span className="absolute left-3 text-xs text-on-surface-variant pointer-events-none">
          +
        </span>
        <input
          type="number"
          min={0}
          value={value.price}
          onChange={(e) => onChange("price", Number(e.target.value))}
          placeholder="0"
          className="w-28 pl-6 pr-6 py-2 bg-surface-container-low border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
        <span className="absolute right-3 text-xs text-on-surface-variant pointer-events-none">
          ₫
        </span>
      </div>

      {canRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          className="text-error hover:bg-error/10"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
