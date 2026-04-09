export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  parent_id: string | null;
  product_count?: number;
};

export type AdminProductVariant = {
  id?: string;
  uid?: string;
  name: string;
  price: number;
  is_active: boolean;
  sort_order: number;
};

export type AdminProductImage = {
  id?: string;
  uid?: string;
  url: string;
  sort_order: number;
};

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  short_description: string | null;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  product_variants: AdminProductVariant[];
  product_images: AdminProductImage[];
  linked_option_group_ids: string[];
  categories?: { name: string } | null;
};

export type AdminOptionValue = {
  id?: string;
  name: string;
  price: number;
  sort_order: number;
  is_active: boolean;
};

export type AdminOptionGroup = {
  id: string;
  name: string;
  min_select: number;
  max_select: number;
  option_values: AdminOptionValue[];
  product_count?: number;
  linked_products?: { id: string; name: string }[];
};
