"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const optionValueSchema = z.object({
  name: z.string().min(1),
  price: z.coerce.number().int().min(0).default(0),
  sort_order: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

const optionGroupSchema = z.object({
  name: z.string().min(1, "Tên nhóm không được trống"),
  min_select: z.coerce.number().int().min(0).default(0),
  max_select: z.coerce.number().int().min(1).default(1),
  values: z.array(optionValueSchema).min(1, "Cần ít nhất 1 giá trị"),
});

export async function createOptionGroup(data: unknown) {
  const supabase = await createSupabaseServerClient();

  const parsed = optionGroupSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { values, ...groupData } = parsed.data;

  const { data: group, error: groupError } = await (supabase as any)
    .from("option_groups")
    .insert(groupData)
    .select("id")
    .single();

  if (groupError || !group)
    return { error: groupError?.message ?? "Lỗi tạo nhóm tuỳ chọn" };

  await (supabase as any)
    .from("option_values")
    .insert(
      values.map((v, i) => ({
        ...v,
        sort_order: i,
        option_group_id: group.id,
      })),
    );

  revalidatePath("/admin/option-groups");
  return { success: true, groupId: group.id };
}

export async function updateOptionGroup(groupId: string, data: unknown) {
  const supabase = await createSupabaseServerClient();

  const parsed = optionGroupSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { values, ...groupData } = parsed.data;

  const { error } = await (supabase as any)
    .from("option_groups")
    .update(groupData)
    .eq("id", groupId);

  if (error) return { error: error.message };

  // Replace values: delete old, insert new
  await (supabase as any)
    .from("option_values")
    .delete()
    .eq("option_group_id", groupId);
  await (supabase as any)
    .from("option_values")
    .insert(
      values.map((v, i) => ({ ...v, sort_order: i, option_group_id: groupId })),
    );

  revalidatePath("/admin/option-groups");
  revalidatePath("/admin/products");
  return { success: true };
}

export async function deleteOptionGroup(groupId: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await (supabase as any)
    .from("option_groups")
    .delete()
    .eq("id", groupId);
  if (error) return { error: error.message };
  revalidatePath("/admin/option-groups");
  return { success: true };
}
