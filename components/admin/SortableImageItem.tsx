"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Star, X } from "lucide-react";
import type { AdminProductImage } from "@/types/admin";

type Props = {
  item: AdminProductImage;
  isMain: boolean;
  onRemove: () => void;
};

export function SortableImageItem({ item, isMain, onRemove }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.uid!,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative group rounded-xl overflow-hidden cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-50 shadow-xl border-2 border-primary" : ""
      } ${isMain ? "w-full aspect-square" : "aspect-square"}`}
      {...attributes}
      {...listeners}
    >
      <img src={item.url} alt="" className="w-full h-full object-cover" />
      {isMain && (
        <div className="absolute top-2 left-2 bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
          <Star className="w-3 h-3 fill-on-primary" /> MAIN
        </div>
      )}
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-error text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
