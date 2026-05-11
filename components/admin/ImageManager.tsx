"use client";

import { ImagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableImageItem } from "./SortableImageItem";
import type { DragEndEvent } from "@dnd-kit/core";
import type { AdminProductImage } from "@/types/admin";
import { useRef } from "react";

type Props = {
  images: AdminProductImage[];
  uploading: boolean;
  newImageUrl: string;
  onFileUpload: (files: File[]) => void;
  onUrlAdd: () => void;
  onRemove: (uid: string) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onUrlChange: (url: string) => void;
};

export function ImageManager({
  images,
  uploading,
  newImageUrl,
  onFileUpload,
  onUrlAdd,
  onRemove,
  onDragEnd,
  onUrlChange,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const mainImage = images[0];
  const sideImages = images.slice(1, 10);
  const extraCount = images.length > 10 ? images.length - 10 : 0;

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-lg font-bold font-headline text-on-surface">
          Hình ảnh sản phẩm
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Ảnh đầu tiên là ảnh hiển thị chính. Kéo để sắp xếp lại. Hỗ trợ tải lên
          nhiều ảnh.
        </p>
      </div>

      <DndContext
        id="images-dnd"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={images.map((i) => i.uid!)}
          strategy={horizontalListSortingStrategy}
        >
          {images.length > 0 && (
            <div className="flex gap-3 items-start">
              {mainImage && (
                <div className="w-[40%] shrink-0">
                  <SortableImageItem
                    item={mainImage}
                    isMain
                    onRemove={() => onRemove(mainImage.uid!)}
                  />
                </div>
              )}
              {sideImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 flex-1">
                  {sideImages.map((im, idx) => {
                    const isLastVisible = idx === 8 && extraCount > 0;
                    return (
                      <div key={im.uid} className="relative">
                        <SortableImageItem
                          item={im}
                          isMain={false}
                          onRemove={() => onRemove(im.uid!)}
                        />
                        {isLastVisible && (
                          <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center pointer-events-none">
                            <span className="text-white font-bold text-xs">
                              +{extraCount}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </SortableContext>
      </DndContext>

      {/* Upload controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <label className="flex-1 flex items-center justify-center gap-2 h-12 rounded-full border-2 border-dashed border-outline-variant/40 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer text-sm font-semibold text-on-surface-variant">
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang tải lên...
            </>
          ) : (
            <>
              <ImagePlus className="w-4 h-4" />
              Tải ảnh lên
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              if (files.length) {
                onFileUpload(files);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }
            }}
          />
        </label>
        <div className="flex gap-2 flex-1">
          <input
            type="text"
            value={newImageUrl}
            onChange={(e) => onUrlChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onUrlAdd();
              }
            }}
            placeholder="Dán liên kết URL của ảnh..."
            className="flex-1 px-5 py-2 bg-surface-container-low border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={onUrlAdd}
            className="rounded-full px-6"
          >
            Thêm ảnh
          </Button>
        </div>
      </div>
    </section>
  );
}
