import { createSupabasePublicClient } from "@/lib/supabase/server";
import { cacheLife, cacheTag } from "next/cache";

export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
};

/**
 * Fetch all active categories, sorted by sort_order.
 * Cached for hours — categories rarely change.
 */
export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("categories");

  const supabase = createSupabasePublicClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getCategories error:", error);
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  return (data ?? []) as Category[];
}

/**
 * Fetch a single active category by slug.
 * Cached per slug for hours.
 */
export async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("categories");

  const supabase = createSupabasePublicClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, sort_order, is_active")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) {
    console.error("getCategoryBySlug error:", error);
    throw new Error(`Failed to fetch category by slug ${slug}: ${error.message}`);
  }

  if (!data) return null;

  return data as Category;
}
