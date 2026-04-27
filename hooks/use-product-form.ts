"use client";

import { useState, useTransition, useCallback } from "react";
import { toast } from "sonner";
import { arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import { generateUid } from "@/utils/helpers";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/app/actions/admin/products";
import type {
  AdminProduct,
  AdminProductVariant,
  AdminOptionGroup,
} from "@/types/admin";
import { useImageUpload } from "./use-image-upload";

export function useProductForm(
  product?: AdminProduct,
  optionGroups: AdminOptionGroup[] = [],
  onOpenChange?: (open: boolean) => void,
) {
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [shortDesc, setShortDesc] = useState(product?.short_description ?? "");
  const [desc, setDesc] = useState(product?.description ?? "");
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [sortOrder, setSortOrder] = useState(product?.sort_order ?? 0);

  const [variants, setVariants] = useState<AdminProductVariant[]>(() => {
    if (product?.product_variants && product.product_variants.length > 0) {
      return product.product_variants
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((v) => ({ ...v, uid: generateUid() }));
    }
    return [
      {
        uid: generateUid(),
        name: "Default",
        price: 0,
        is_active: true,
        sort_order: 0,
      },
    ];
  });

  // Image upload — delegated to useImageUpload hook
  const imageUpload = useImageUpload(
    product?.product_images
      ?.sort((a, b) => a.sort_order - b.sort_order) ?? [],
  );

  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(
    product?.linked_option_group_ids ?? [],
  );

  const [localGroups, setLocalGroups] =
    useState<AdminOptionGroup[]>(optionGroups);

  // ─── Variant management ───────────────────────────────────────

  const addVariant = () => {
    const nextSort =
      variants.length === 0
        ? 0
        : Math.max(...variants.map((v) => v.sort_order)) + 1;
    setVariants((p) => [
      ...p,
      {
        uid: generateUid(),
        name: "",
        price: 0,
        is_active: true,
        sort_order: nextSort,
      },
    ]);
  };

  const removeVariant = (uid: string) => {
    setVariants((p) => p.filter((v) => v.uid !== uid));
  };

  const updateVariant = (
    uid: string,
    key: keyof AdminProductVariant,
    val: any,
  ) => {
    setVariants((p) =>
      p.map((v) => (v.uid === uid ? { ...v, [key]: val } : v)),
    );
  };

  const handleVariantDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setVariants((prev) => {
        const oldIndex = prev.findIndex((v) => v.uid === active.id);
        const newIndex = prev.findIndex((v) => v.uid === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  // ─── Option group management ──────────────────────────────────

  const handleOptionGroupCreated = (group: AdminOptionGroup) => {
    setLocalGroups((p) => [...p, group]);
    setSelectedGroupIds((p) => [...p, group.id]);
  };

  const toggleOptionGroup = (id: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(id) ? prev.filter((gid) => gid !== id) : [...prev, id],
    );
  };

  // ─── Form actions ─────────────────────────────────────────────

  const resetForm = useCallback(() => {
    setName("");
    setSlug("");
    setCategoryId("");
    setShortDesc("");
    setDesc("");
    setIsActive(true);
    setSortOrder(0);
    setVariants([
      {
        uid: generateUid(),
        name: "Default",
        price: 0,
        is_active: true,
        sort_order: 0,
      },
    ]);
    imageUpload.reset();
    setSelectedGroupIds([]);
  }, [imageUpload]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      toast.error("Name and slug are required");
      return;
    }

    startTransition(async () => {
      const payload = {
        product: {
          name,
          slug,
          category_id: categoryId || null,
          short_description: shortDesc || null,
          description: desc || null,
          is_active: isActive,
          sort_order: sortOrder,
        },
        variants: variants.map((v, i) => ({
          name: v.name,
          price: v.price,
          is_active: v.is_active,
          sort_order: i,
        })),
        imageUrls: imageUpload.getImageUrls(),
        optionGroupIds: selectedGroupIds,
      };

      const result = product
        ? await updateProduct(product.id, payload)
        : await createProduct(payload);

      if (result.error) {
        if (typeof result.error === "string") {
          toast.error(result.error);
        } else {
          // Schema validation errors — show each field error
          const messages = Object.entries(result.error)
            .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
            .join("\n");
          toast.error(`Validation failed:\n${messages}`);
          console.error("Validation errors:", result.error);
        }
      } else {
        toast.success(product ? "Product updated" : "Product created");
        if (onOpenChange) onOpenChange(false);
        if (!product) resetForm();
      }
    });
  };

  const handleDelete = async () => {
    if (!product) return;
    startTransition(async () => {
      const result = await deleteProduct(product.id);
      if (result.error) {
        toast.error("Failed to delete product");
      } else {
        toast.success("Product deleted");
        if (onOpenChange) onOpenChange(false);
      }
    });
  };

  return {
    state: {
      name,
      slug,
      categoryId,
      shortDesc,
      desc,
      isActive,
      sortOrder,
      variants,
      images: imageUpload.images,
      selectedGroupIds,
      localGroups,
      uploading: imageUpload.uploading,
      newImageUrl: imageUpload.newImageUrl,
      isPending,
    },
    actions: {
      setName,
      setSlug,
      setCategoryId,
      setShortDesc,
      setDesc,
      setIsActive,
      setSortOrder,
      setVariants,
      setImages: imageUpload.setImages,
      setNewImageUrl: imageUpload.setNewImageUrl,
      addVariant,
      removeVariant,
      updateVariant,
      handleVariantDragEnd,
      handleImageDragEnd: imageUpload.handleDragEnd,
      removeImage: imageUpload.removeImage,
      handleFileUpload: imageUpload.handleFileUpload,
      handleUrlAdd: imageUpload.handleUrlAdd,
      handleOptionGroupCreated,
      toggleOptionGroup,
      handleSubmit,
      handleDelete,
      resetForm,
    },
    refs: {
      fileInputRef: imageUpload.fileInputRef,
    },
  };
}
