"use client";

import { Drawer } from "vaul";
import { X, Plus, ImagePlus, Loader2, Save, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import { AdminProduct, AdminCategory, AdminOptionGroup } from "@/types/admin";
import { useProductForm } from "@/hooks/use-product-form";
import { slugify } from "@/utils/slugify";
import { QuickCreateOptionGroup } from "./QuickCreateOptionGroup";
import { SortableVariantItem } from "./SortableVariantItem";
import { SortableImageItem } from "./SortableImageItem";

export type Props = {
  categories: AdminCategory[];
  optionGroups: AdminOptionGroup[];
  product?: AdminProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ProductDrawer({
  categories,
  optionGroups,
  product,
  open,
  onOpenChange,
}: Props) {
  const { state, actions, refs } = useProductForm(product, optionGroups, () =>
    onOpenChange(false),
  );

  const {
    name,
    slug,
    categoryId,
    shortDesc,
    desc,
    isActive,
    sortOrder,
    variants,
    images,
    selectedGroupIds,
    localGroups,
    uploading,
    newImageUrl,
    isPending,
  } = state;

  const { fileInputRef } = refs;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const mainImage = images[0];
  const sideImages = images.slice(1, 10);
  const extraCount = images.length > 10 ? images.length - 10 : 0;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 max-h-[96vh] bg-surface-container-lowest flex flex-col rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] outline-none z-50 container mx-auto">
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-outline-variant/30 mt-4 mb-2" />

          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between px-6 md:px-8 py-4 shrink-0 border-b border-outline-variant/10">
              <div className="flex-1">
                <Drawer.Title className="text-2xl font-extrabold font-headline text-on-surface">
                  {product ? "Edit product" : "Create new product"}
                </Drawer.Title>
                <Drawer.Description className="text-sm text-on-surface-variant mt-1">
                  {product
                    ? `Update details for ${product.name}`
                    : "Fill in the details below to create a new product."}
                </Drawer.Description>
              </div>
              <div className="flex items-center gap-2">
                {product && (
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button
                          variant="destructive"
                          size="sm"
                          className="rounded-full"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      }
                    />
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete{" "}
                          <strong>{product.name}</strong>. This action cannot be
                          undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={actions.handleDelete}
                          className="bg-error text-on-error hover:bg-error/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 px-6 md:px-8 py-6">
              <form
                id="product-form"
                onSubmit={actions.handleSubmit}
                className="space-y-8"
              >
                <section className="space-y-4">
                  <h3 className="text-lg font-bold font-headline text-on-surface">
                    Basic Info
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-on-surface-variant mb-1.5">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => {
                          actions.setName(e.target.value);
                          if (!product)
                            actions.setSlug(slugify(e.target.value));
                        }}
                        className="w-full px-5 py-3 bg-surface-container-low border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="e.g. Strawberry Smoothie"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-on-surface-variant mb-1.5">
                        Slug *
                      </label>
                      <input
                        type="text"
                        required
                        value={slug}
                        onChange={(e) => actions.setSlug(e.target.value)}
                        className="w-full px-5 py-3 bg-surface-container-low border-none rounded-full text-sm font-mono outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-on-surface-variant mb-1.5">
                        Category
                      </label>
                      <select
                        value={categoryId ?? ""}
                        onChange={(e) => actions.setCategoryId(e.target.value)}
                        className="w-full px-5 py-3 bg-surface-container-low border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <option value="">No Category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-on-surface-variant mb-1.5">
                      Short Description
                    </label>
                    <textarea
                      value={shortDesc ?? ""}
                      onChange={(e) => actions.setShortDesc(e.target.value)}
                      rows={2}
                      className="w-full px-5 py-3 bg-surface-container-low border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-on-surface-variant mb-1.5">
                      Detailed Description
                    </label>
                    <textarea
                      value={desc ?? ""}
                      onChange={(e) => actions.setDesc(e.target.value)}
                      rows={4}
                      className="w-full px-5 py-3 bg-surface-container-low border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-on-surface-variant mb-1.5">
                        Sort Order
                      </label>
                      <input
                        type="number"
                        value={sortOrder}
                        onChange={(e) =>
                          actions.setSortOrder(Number(e.target.value))
                        }
                        className="w-full px-5 py-3 bg-surface-container-low border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-on-surface-variant mb-1.5">
                        Status
                      </label>
                      <div className="flex items-center h-[44px]">
                        <Button
                          type="button"
                          variant={isActive ? "default" : "outline"}
                          onClick={() => actions.setIsActive(!isActive)}
                          className="rounded-full w-full"
                        >
                          {isActive ? "Active" : "Inactive"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </section>

                <hr className="border-outline-variant/10" />

                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold font-headline text-on-surface">
                      Variants
                    </h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={actions.addVariant}
                      className="text-primary"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add Variant
                    </Button>
                  </div>

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={actions.handleVariantDragEnd}
                  >
                    <SortableContext
                      items={variants.map((v) => v.uid!)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {variants.map((v) => (
                          <SortableVariantItem
                            key={v.uid}
                            variant={v}
                            isOnly={variants.length === 1}
                            onUpdate={(key, val) =>
                              actions.updateVariant(v.uid!, key, val)
                            }
                            onRemove={() => actions.removeVariant(v.uid!)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </section>

                <hr className="border-outline-variant/10" />

                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold font-headline text-on-surface">
                        Option Groups
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Customers can customize their order with these groups.
                      </p>
                    </div>
                    <QuickCreateOptionGroup
                      onCreated={actions.handleOptionGroupCreated}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {localGroups.map((g) => {
                      const isSelected = selectedGroupIds.includes(g.id);
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => actions.toggleOptionGroup(g.id)}
                          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                            isSelected
                              ? "bg-primary text-on-primary border-primary shadow-lg shadow-primary/20"
                              : "bg-surface-container-low text-on-surface-variant border-outline-variant/20 hover:border-primary/40"
                          }`}
                        >
                          {g.name}
                          {isSelected && <span className="ml-2">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </section>

                <hr className="border-outline-variant/10" />

                <section className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold font-headline text-on-surface">
                      Images
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      First image is the main display image. Drag to reorder.
                    </p>
                  </div>

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={actions.handleImageDragEnd}
                  >
                    <SortableContext
                      items={images.map((i) => i.uid!)}
                      strategy={horizontalListSortingStrategy}
                    >
                      {images.length > 0 && (
                        <div className="flex gap-4 items-start">
                          {mainImage && (
                            <div className="w-2/3 shrink-0">
                              <SortableImageItem
                                item={mainImage}
                                isMain
                                onRemove={() =>
                                  actions.removeImage(mainImage.uid!)
                                }
                              />
                            </div>
                          )}
                          {sideImages.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 w-1/3">
                              {sideImages.map((im, idx) => {
                                const isLastVisible =
                                  idx === 8 && extraCount > 0;
                                return (
                                  <div key={im.uid} className="relative">
                                    <SortableImageItem
                                      item={im}
                                      isMain={false}
                                      onRemove={() =>
                                        actions.removeImage(im.uid!)
                                      }
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

                  <div className="flex flex-col sm:flex-row gap-3">
                    <label className="flex-1 flex items-center justify-center gap-2 h-12 rounded-full border-2 border-dashed border-outline-variant/40 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer text-sm font-semibold text-on-surface-variant">
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <ImagePlus className="w-4 h-4" />
                          Upload Images
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
                          if (files.length) actions.handleFileUpload(files);
                        }}
                      />
                    </label>
                    <div className="flex gap-2 flex-1">
                      <input
                        type="text"
                        value={newImageUrl}
                        onChange={(e) => actions.setNewImageUrl(e.target.value)}
                        placeholder="Paste image URL..."
                        className="flex-1 px-5 py-2 bg-surface-container-low border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={actions.handleUrlAdd}
                        className="rounded-full px-6"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </section>
              </form>
            </div>

            <div className="flex gap-3 px-6 md:px-8 py-6 border-t border-outline-variant/10 shrink-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="flex-1 rounded-full h-12"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="product-form"
                disabled={isPending}
                className="flex-1 rounded-full h-12 shadow-xl shadow-primary/20"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {product ? "Update Product" : "Create Product"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
