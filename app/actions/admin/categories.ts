"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Tên danh mục không được trống"),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug chỉ chứa chữ thường, số và dấu gạch ngang"),
  sort_order: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
  parent_id: z.string().uuid().optional().nullable(),
});

export async function createCategory(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    sort_order: formData.get("sort_order") ?? 0,
    is_active: formData.get("is_active") === "true",
    parent_id: formData.get("parent_id") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // Shift existing sort_order values to prevent collision
  const sortOrder = parsed.data.sort_order ?? 0;
  await (supabase.rpc as any)("shift_sort_order", {
    p_table: "categories",
    p_sort_order: sortOrder,
    p_exclude_id: null,
  }).catch(() => {});

  const { error } = await (supabase.from("categories") as any).insert(
    parsed.data,
  );
  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    sort_order: formData.get("sort_order") ?? 0,
    is_active: formData.get("is_active") === "true",
    parent_id: formData.get("parent_id") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // Shift existing sort_order values to prevent collision
  const sortOrder = parsed.data.sort_order ?? 0;
  await (supabase.rpc as any)("shift_sort_order", {
    p_table: "categories",
    p_sort_order: sortOrder,
    p_exclude_id: id,
  }).catch(() => {});

  const { error } = await (supabase.from("categories") as any)
    .update(parsed.data)
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await (supabase.from("categories") as any)
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function toggleCategoryActive(id: string, is_active: boolean) {
  const supabase = await createSupabaseServerClient();
  const { error } = await (supabase.from("categories") as any)
    .update({ is_active })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  return { success: true };
}
