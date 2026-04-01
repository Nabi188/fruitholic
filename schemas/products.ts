import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z
    .string()
    .min(1)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  parent_id: z.string().uuid().nullable().optional(),
  sort_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const variantSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Variant name is required"),
  price: z.number().int().min(0, "Price cannot be negative"),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
});

export type VariantInput = z.infer<typeof variantSchema>;

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z
    .string()
    .min(1)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  category_id: z.string().uuid().nullable().optional(),
  description: z.string().optional().nullable(),
  short_description: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
  variants: z
    .array(variantSchema)
    .min(1, "Product must have at least one variant"),
});

export type ProductInput = z.infer<typeof productSchema>;

export const optionValueSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Option value name is required"),
  price: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
});

export const optionGroupSchema = z.object({
  name: z.string().min(1, "Option group name is required"),
  min_select: z.number().int().min(0).default(0),
  max_select: z.number().int().min(1).default(1),
  values: z
    .array(optionValueSchema)
    .min(1, "Option group must have at least one value"),
});

export type OptionGroupInput = z.infer<typeof optionGroupSchema>;
export type OptionValueInput = z.infer<typeof optionValueSchema>;
