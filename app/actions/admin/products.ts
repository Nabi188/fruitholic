"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const variantSchema = z.object({
  name: z.string().min(1),
  price: z.coerce.number().min(0),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).default(0),
});

const productSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm không được trống"),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  category_id: z.string().uuid().optional().nullable(),
  short_description: z.string().optional(),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).default(0),
});

export async function createProduct(data: {
  product: Record<string, unknown>;
  variants: Record<string, unknown>[];
  imageUrls: string[];
}) {
  const supabase = await createSupabaseServerClient();

  const parsed = productSchema.safeParse(data.product);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const { data: product, error: productError } = await (supabase as any)
    .from("products")
    .insert(parsed.data)
    .select("id")
    .single();

  if (productError || !product) return { error: productError?.message ?? "Lỗi tạo sản phẩm" };

  if (data.variants.length > 0) {
    const parsedVariants = data.variants.map((v, i) =>
      variantSchema.parse({ ...v, sort_order: i }),
    );
    await (supabase as any)
      .from("product_variants")
      .insert(parsedVariants.map((v) => ({ ...v, product_id: product.id })));
  }

  if (data.imageUrls.length > 0) {
    await (supabase as any)
      .from("product_images")
      .insert(
        data.imageUrls.map((url, i) => ({
          product_id: product.id,
          url,
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

  await (supabase as any).from("product_variants").delete().eq("product_id", productId);
  if (data.variants.length > 0) {
    const parsedVariants = data.variants.map((v, i) =>
      variantSchema.parse({ ...v, sort_order: i }),
    );
    await (supabase as any)
      .from("product_variants")
      .insert(parsedVariants.map((v) => ({ ...v, product_id: productId })));
  }

  await (supabase as any).from("product_images").delete().eq("product_id", productId);
  if (data.imageUrls.length > 0) {
    await (supabase as any)
      .from("product_images")
      .insert(
        data.imageUrls.map((url, i) => ({
          product_id: productId,
          url,
          sort_order: i,
        })),
      );
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
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
