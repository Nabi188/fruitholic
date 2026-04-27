"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import { generateUid } from "@/utils/helpers";
import type { AdminProductImage } from "@/types/admin";

export function useImageUpload(initialImages: AdminProductImage[] = []) {
  const [images, setImages] = useState<AdminProductImage[]>(
    initialImages.map((img) => ({ ...img, uid: img.uid ?? generateUid() })),
  );
  const [uploading, setUploading] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addImage = (url: string) => {
    setImages((prev) => [
      ...prev,
      { uid: generateUid(), url, sort_order: prev.length },
    ]);
  };

  const removeImage = (uid: string) => {
    setImages((prev) => prev.filter((img) => img.uid !== uid));
  };

  const handleDragEnd = (event: DragEndEvent) => {
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
    let successCount = 0;

    try {
      for (const file of files) {
        // 1. Get upload signature from our backend
        const sigRes = await fetch("/api/upload", { method: "POST" });
        if (!sigRes.ok) {
          toast.error("Failed to get upload signature");
          continue;
        }
        const { timestamp, signature, cloudName, apiKey, folder } =
          await sigRes.json();

        // 2. Prepare formData for signed upload
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        if (folder) formData.append("folder", folder);

        // 3. Upload to Cloudinary
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: formData },
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          console.error("Cloudinary upload failed:", errData);
          toast.error(
            `Failed to upload "${file.name}": ${errData?.error?.message ?? res.statusText}`,
          );
          continue;
        }

        const data = await res.json();
        if (data.secure_url) {
          addImage(data.secure_url);
          successCount++;
        } else {
          console.error("Cloudinary response missing secure_url:", data);
          toast.error(`Upload returned no URL for "${file.name}"`);
        }
      }

      if (successCount > 0) {
        toast.success(
          `${successCount} image${successCount > 1 ? "s" : ""} uploaded`,
        );
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Upload failed — check your network connection");
    } finally {
      setUploading(false);
    }
  };

  const handleUrlAdd = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;

    try {
      new URL(trimmed); // validate URL
      addImage(trimmed);
      setNewImageUrl("");
    } catch {
      toast.error("Please enter a valid URL");
    }
  };

  const getImageUrls = () => images.map((img) => img.url);

  const reset = () => {
    setImages([]);
    setNewImageUrl("");
  };

  return {
    images,
    uploading,
    newImageUrl,
    fileInputRef,
    setImages,
    setNewImageUrl,
    addImage,
    removeImage,
    handleDragEnd,
    handleFileUpload,
    handleUrlAdd,
    getImageUrls,
    reset,
  };
}
