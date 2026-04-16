"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function findOrderForTracking(
  orderRef: string,
): Promise<{
  success: boolean;
  orderId?: string;
  orderCode?: string;
  error?: string;
}> {
  try {
    const rawRef = orderRef.trim();

    if (!rawRef || rawRef.length < 6) {
      return {
        success: false,
        error: "Order code is invalid. Please enter at least 6 characters.",
      };
    }

    const supabase = await createSupabaseServerClient();

    const { data: matchedOrders, error } = await (supabase as any)
      .from("orders")
      .select("id, code")
      .ilike("code", rawRef)
      .limit(1);

    if (error || !matchedOrders || matchedOrders.length === 0) {
      return { success: false, error: "Order not found." };
    }

    return {
      success: true,
      orderId: matchedOrders[0].id,
      orderCode: matchedOrders[0].code,
    };
  } catch (err) {
    console.error("Tracking Error:", err);
    return { success: false, error: "System error. Please try again later." };
  }
}
