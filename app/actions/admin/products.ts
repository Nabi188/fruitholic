"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

import { productSchema, variantSchema } from "@/schemas/products";

export async function createProduct(data: {
  product: any;
  variants: any[];
  imageUrls: string[];
  optionGroupIds: string[];
}) {
  const supabase = await createSupabaseServerClient();

  const parsed = productSchema.safeParse(data.product);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { data: product, error: productError } = await (supabase as any)
    .from("products")
    .insert(parsed.data)
    .select("id")
    .single();

  if (productError || !product)
    return { error: productError?.message ?? "Lỗi tạo sản phẩm" };

  if (data.variants.length > 0) {
    const parsedVariants = data.variants.map((v, i) =>
      variantSchema.parse({ ...v, sort_order: i }),
    );
    await (supabase as any)
      .from("product_variants")
      .insert(parsedVariants.map((v) => ({ ...v, product_id: product.id })));
  }

  if (data.imageUrls.length > 0) {
    await (supabase as any).from("product_images").insert(
      data.imageUrls.map((url, i) => ({
        product_id: product.id,
        url,
        sort_order: i,
      })),
    );
  }

  if (data.optionGroupIds.length > 0) {
    await (supabase as any).from("product_option_groups").insert(
      data.optionGroupIds.map((option_group_id, i) => ({
        product_id: product.id,
        option_group_id,
        sort_order: i,
      })),
    );
  }

  revalidatePath("/admin/products");
  return { success: true, productId: product.id };
}

export async function updateProduct(
  productId: string,
  data: {
    product: Record<string, unknown>;
    variants: Record<string, unknown>[];
    imageUrls: string[];
    optionGroupIds: string[];
  },
) {
  const supabase = await createSupabaseServerClient();

  const parsed = productSchema.safeParse(data.product);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { error } = await (supabase as any)
    .from("products")
    .update(parsed.data)
    .eq("id", productId);
  if (error) return { error: error.message };

  await (supabase as any)
    .from("product_variants")
    .delete()
    .eq("product_id", productId);
  if (data.variants.length > 0) {
    const parsedVariants = data.variants.map((v, i) =>
      variantSchema.parse({ ...v, sort_order: i }),
    );
    await (supabase as any)
      .from("product_variants")
      .insert(parsedVariants.map((v) => ({ ...v, product_id: productId })));
  }

  await (supabase as any)
    .from("product_images")
    .delete()
    .eq("product_id", productId);
  if (data.imageUrls.length > 0) {
    await (supabase as any).from("product_images").insert(
      data.imageUrls.map((url, i) => ({
        product_id: productId,
        url,
        sort_order: i,
      })),
    );
  }

  await (supabase as any)
    .from("product_option_groups")
    .delete()
    .eq("product_id", productId);
  if (data.optionGroupIds.length > 0) {
    await (supabase as any).from("product_option_groups").insert(
      data.optionGroupIds.map((option_group_id, i) => ({
        product_id: productId,
        option_group_id,
        sort_order: i,
      })),
    );
  }

  revalidatePath("/admin/products");
  return { success: true };
}

export async function deleteProduct(productId: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await (supabase as any)
    .from("products")
    .delete()
    .eq("id", productId);
  if (error) return { error: error.message };
  revalidatePath("/admin/products");
  return { success: true };
}

export async function toggleProductActive(
  productId: string,
  isActive: boolean,
) {
  const supabase = await createSupabaseServerClient();
  const { error } = await (supabase as any)
    .from("products")
    .update({ is_active: isActive })
    .eq("id", productId);
  if (error) return { error: error.message };
  revalidatePath("/admin/products");
  return { success: true };
}
