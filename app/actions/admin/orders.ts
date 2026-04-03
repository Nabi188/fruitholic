"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await (supabase.from("orders") as any)
    .update({ status })
    .eq("id", orderId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { success: true };
}

export async function updateOrderPaymentStatus(orderId: string, payment_status: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await (supabase.from("orders") as any)
    .update({ payment_status })
    .eq("id", orderId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}
