"use client";

import { useState, useTransition, useCallback, useRef } from "react";
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
  AdminProductImage,
  AdminOptionGroup,
} from "@/types/admin";

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
        name: "Mặc định",
        price: 0,
        is_active: true,
        sort_order: 0,
      },
    ];
  });

  const [images, setImages] = useState<AdminProductImage[]>(
    product?.product_images
      ?.sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => ({ ...img, uid: generateUid() })) ?? [],
  );

  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(
    product?.linked_option_group_ids ?? [],
  );

  const [localGroups, setLocalGroups] =
    useState<AdminOptionGroup[]>(optionGroups);
  const [uploading, setUploading] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const removeImage = (uid: string) => {
    setImages((p) => p.filter((img) => img.uid !== uid));
  };

  const handleImageDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setImages((prev) => {
        const oldIndex = prev.findIndex((img) => img.uid === active.id);
        const newIndex = prev.findIndex((img) => img.uid === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleFileUpload = async (files: File[]) => {
    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "fruitholic");

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData },
        );
        const data = await res.json();
        if (data.secure_url) {
          setImages((prev) => [
            ...prev,
            {
              uid: generateUid(),
              url: data.secure_url,
              sort_order: prev.length,
            },
          ]);
        }
      }
      toast.success("Images uploaded successfully");
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleUrlAdd = () => {
    if (newImageUrl.trim()) {
      setImages((prev) => [
        ...prev,
        {
          uid: generateUid(),
          url: newImageUrl.trim(),
          sort_order: prev.length,
        },
      ]);
      setNewImageUrl("");
    }
  };

  const handleOptionGroupCreated = (group: AdminOptionGroup) => {
    setLocalGroups((p) => [...p, group]);
    setSelectedGroupIds((p) => [...p, group.id]);
  };

  const toggleOptionGroup = (id: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(id) ? prev.filter((gid) => gid !== id) : [...prev, id],
    );
  };

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
        name: "Mặc định",
        price: 0,
        is_active: true,
        sort_order: 0,
      },
    ]);
    setImages([]);
    setSelectedGroupIds([]);
  }, []);

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
        imageUrls: images.map((img) => img.url),
        optionGroupIds: selectedGroupIds,
      };

      const result = product
        ? await updateProduct(product.id, payload)
        : await createProduct(payload);

      if (result.error) {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Failed to save product",
        );
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
      images,
      selectedGroupIds,
      localGroups,
      uploading,
      newImageUrl,
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
      setImages,
      setNewImageUrl,
      addVariant,
      removeVariant,
      updateVariant,
      handleVariantDragEnd,
      handleImageDragEnd,
      removeImage,
      handleFileUpload,
      handleUrlAdd,
      handleOptionGroupCreated,
      toggleOptionGroup,
      handleSubmit,
      handleDelete,
      resetForm,
    },
    refs: {
      fileInputRef,
    },
  };
}
