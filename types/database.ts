/**
 * Supabase auto-generated types placeholder.
 * Run: supabase gen types typescript --linked > types/database.ts
 * after setting up your Supabase project.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: string
          created_at: string
        }
        Insert: {
          id: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          role?: string
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          parent_id: string | null
          name: string
          slug: string
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parent_id?: string | null
          name: string
          slug: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parent_id?: string | null
          name?: string
          slug?: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          category_id: string | null
          name: string
          slug: string
          description: string | null
          short_description: string | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id?: string | null
          name: string
          slug: string
          description?: string | null
          short_description?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string | null
          name?: string
          slug?: string
          description?: string | null
          short_description?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          url: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          url?: string
          sort_order?: number
          created_at?: string
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          name: string
          price: number
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          name: string
          price: number
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          name?: string
          price?: number
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      option_groups: {
        Row: {
          id: string
          name: string
          min_select: number
          max_select: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          min_select?: number
          max_select?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          min_select?: number
          max_select?: number
          created_at?: string
          updated_at?: string
        }
      }
      option_values: {
        Row: {
          id: string
          option_group_id: string
          name: string
          price: number
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          option_group_id: string
          name: string
          price?: number
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          option_group_id?: string
          name?: string
          price?: number
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      product_option_groups: {
        Row: {
          id: string
          product_id: string
          option_group_id: string
          sort_order: number
        }
        Insert: {
          id?: string
          product_id: string
          option_group_id: string
          sort_order?: number
        }
        Update: {
          id?: string
          product_id?: string
          option_group_id?: string
          sort_order?: number
        }
      }
      orders: {
        Row: {
          id: string
          code: string
          customer_name: string
          customer_phone: string
          customer_email: string | null
          receiver_name: string | null
          receiver_phone: string | null
          address: string
          note: string | null
          delivery_type: string
          delivery_time: string | null
          payment_method: string
          payment_status: string
          status: string
          total_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          customer_name: string
          customer_phone: string
          customer_email?: string | null
          receiver_name?: string | null
          receiver_phone?: string | null
          address: string
          note?: string | null
          delivery_type?: string
          delivery_time?: string | null
          payment_method: string
          payment_status?: string
          status?: string
          total_amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          customer_name?: string
          customer_phone?: string
          customer_email?: string | null
          receiver_name?: string | null
          receiver_phone?: string | null
          address?: string
          note?: string | null
          delivery_type?: string
          delivery_time?: string | null
          payment_method?: string
          payment_status?: string
          status?: string
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          variant_id: string | null
          product_name: string
          variant_name: string
          price: number
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          variant_id?: string | null
          product_name: string
          variant_name: string
          price: number
          quantity: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          variant_id?: string | null
          product_name?: string
          variant_name?: string
          price?: number
          quantity?: number
          created_at?: string
        }
      }
      order_item_options: {
        Row: {
          id: string
          order_item_id: string
          option_group_id: string | null
          option_value_id: string | null
          option_group_name: string
          option_value_name: string
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_item_id: string
          option_group_id?: string | null
          option_value_id?: string | null
          option_group_name: string
          option_value_name: string
          price?: number
          created_at?: string
        }
        Update: {
          id?: string
          order_item_id?: string
          option_group_id?: string | null
          option_value_id?: string | null
          option_group_name?: string
          option_value_name?: string
          price?: number
          created_at?: string
        }
      }
    }
    Functions: {
      generate_order_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_product_detail: {
        Args: { p_slug: string }
        Returns: Json
      }
      get_revenue_by_product: {
        Args: { p_from?: string; p_to?: string }
        Returns: {
          product_id: string
          product_name: string
          total_qty: number
          total_revenue: number
        }[]
      }
      get_orders_by_status_per_day: {
        Args: { p_from?: string; p_to?: string }
        Returns: {
          day: string
          status: string
          cnt: number
        }[]
      }
    }
    Enums: Record<PropertyKey, never>
  }
}
