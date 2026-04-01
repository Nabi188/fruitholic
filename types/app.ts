export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "DELIVERING",
  "COMPLETED",
  "CANCELLED",
] as const;
export const PAYMENT_METHODS = ["COD", "BANK_TRANSFER"] as const;
export const PAYMENT_STATUSES = ["UNPAID", "PAID", "REFUNDED"] as const;
export const DELIVERY_TYPES = ["ASAP", "SCHEDULED", "PICKUP"] as const;
export const USER_ROLES = ["admin", "customer"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type DeliveryType = (typeof DELIVERY_TYPES)[number];
export type UserRole = (typeof USER_ROLES)[number];

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  sort_order: number;
  created_at: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  name: string;
  price: number;
  is_active: boolean;
  sort_order: number;
};

export type OptionValue = {
  id: string;
  option_group_id: string;
  name: string;
  price: number;
  is_active: boolean;
  sort_order: number;
};

export type OptionGroup = {
  id: string;
  name: string;
  min_select: number;
  max_select: number;
  values: OptionValue[];
};

export type ProductDetail = {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    short_description: string | null;
    category_id: string | null;
    is_active: boolean;
  };
  images: ProductImage[];
  variants: ProductVariant[];
  option_groups: OptionGroup[];
};

export type OrderItemOption = {
  id: string;
  order_item_id: string;
  option_group_name: string;
  option_value_name: string;
  price: number;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_name: string;
  variant_name: string;
  price: number;
  quantity: number;
  order_item_options: OrderItemOption[];
};

export type Order = {
  id: string;
  code: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  receiver_name: string | null;
  receiver_phone: string | null;
  address: string;
  note: string | null;
  delivery_type: DeliveryType;
  delivery_time: string | null;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  updated_at: string;
};

export type OrderWithItems = Order & {
  order_items: OrderItem[];
};
