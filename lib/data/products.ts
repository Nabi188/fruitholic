import { createSupabasePublicClient } from "@/lib/supabase/server";
import { cacheLife, cacheTag } from "next/cache";
import type { ProductDetail } from "@/types/app";

// ─── Shared Types ────────────────────────────────────────────────

export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  categoryId: string | null;
  price: number;
  imageUrl?: string;
  hasRequiredOptions: boolean;
  isActive: boolean;
  hasActiveVariants: boolean;
};

// ─── Transform helpers (DRY — used by all product fetchers) ─────

/**
 * Transform a raw Supabase product row (with nested joins) into a
 * normalised ProductListItem. Eliminates the duplicated transform
 * logic that was previously in page.tsx, products/page.tsx, and
 * [category]/page.tsx.
 */
export function transformRawProduct(raw: any): ProductListItem {
  const activeVariants =
    raw.product_variants?.filter((v: any) => v.is_active) || [];

  const prices = activeVariants
    .map((v: any) => parseFloat(String(v.price)))
    .filter((val: number) => !isNaN(val) && val > 0);

  const basePrice = prices.length > 0 ? Math.min(...prices) : 0;

  const images = [...(raw.product_images || [])];
  images.sort((a: any, b: any) => {
    const sortA =
      a.sort_order === null || a.sort_order === undefined
        ? 999
        : Number(a.sort_order);
    const sortB =
      b.sort_order === null || b.sort_order === undefined
        ? 999
        : Number(b.sort_order);
    return sortA - sortB;
  });

  const hasRequiredOptions = (raw.product_option_groups || []).some(
    (pog: any) => pog.option_groups?.min_select > 0,
  );

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    categoryId: raw.category_id ?? null,
    price: basePrice,
    imageUrl: images[0]?.url,
    hasRequiredOptions,
    isActive: raw.is_active ?? true,
    hasActiveVariants: activeVariants.length > 0,
  };
}

// ─── Standard product select fragment ───────────────────────────

const PRODUCT_LIST_SELECT = `
  id, name, slug, category_id, is_active, sort_order,
  product_images(url, sort_order),
  product_variants(price, is_active),
  product_option_groups(option_groups(min_select))
`;

// ─── Data Access Functions ──────────────────────────────────────

/**
 * Fetch all active products and return normalised list items.
 */
export async function getProducts(): Promise<ProductListItem[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  const supabase = createSupabasePublicClient();

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_LIST_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getProducts error:", error);
    return [];
  }

  return (data || []).map(transformRawProduct);
}

/**
 * Fetch active products for a specific category.
 */
export async function getProductsByCategory(
  categoryId: string,
): Promise<ProductListItem[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  const supabase = createSupabasePublicClient();

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_LIST_SELECT)
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getProductsByCategory error:", error);
    return [];
  }

  return (data || []).map(transformRawProduct);
}

/**
 * Fetch all products grouped by category (for homepage display).
 * Returns categories with their products, only including non-empty groups.
 */
export async function getProductsGroupedByCategory(): Promise<
  { category: { id: string; name: string; slug: string }; items: ProductListItem[] }[]
> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products", "categories");

  const supabase = createSupabasePublicClient();

  const [{ data: rawCategories }, { data: rawProducts }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("products")
      .select(PRODUCT_LIST_SELECT)
      .eq("is_active", true),
  ]);

  const categories = (rawCategories || []) as {
    id: string;
    name: string;
    slug: string;
  }[];
  const products = (rawProducts || []).map(transformRawProduct);

  return categories
    .map((cat) => ({
      category: cat,
      items: products.filter((p) => p.categoryId === cat.id),
    }))
    .filter((g) => g.items.length > 0);
}

/**
 * Fetch full product detail by slug.
 * Replaces the `get_product_detail` RPC — uses standard Supabase
 * nested select instead of a database function.
 */
export async function getProductDetail(
  slug: string,
): Promise<ProductDetail | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  const supabase = createSupabasePublicClient();

  const { data: product, error } = await supabase
    .from("products")
    .select(
      `
      id, name, slug, description, short_description, category_id, is_active,
      categories(name, slug),
      product_images(id, product_id, url, sort_order, created_at),
      product_variants(id, product_id, name, price, is_active, sort_order),
      product_option_groups(
        sort_order,
        option_groups(
          id, name, min_select, max_select,
          option_values(id, option_group_id, name, price, is_active, sort_order)
        )
      )
    `,
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !product) return null;

  const p = product as any;

  // Sort images
  const images = [...(p.product_images || [])];
  images.sort(
    (a: any, b: any) => (a.sort_order ?? 999) - (b.sort_order ?? 999),
  );

  // Filter and sort variants
  const variants = (p.product_variants || [])
    .filter((v: any) => v.is_active)
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  // Build option groups (sorted, with active-only values)
  const optionGroups = (p.product_option_groups || [])
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((pog: any) => {
      const og = pog.option_groups;
      if (!og) return null;
      return {
        id: og.id,
        name: og.name,
        min_select: og.min_select,
        max_select: og.max_select,
        values: (og.option_values || [])
          .filter((ov: any) => ov.is_active)
          .sort(
            (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
          ),
      };
    })
    .filter(Boolean);

  return {
    product: {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      short_description: p.short_description,
      category_id: p.category_id,
      category_name: p.categories?.name ?? null,
      category_slug: p.categories?.slug ?? null,
      is_active: p.is_active,
    },
    images,
    variants,
    option_groups: optionGroups,
  };
}
