"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function findOrderForTracking(
  orderRef: string,
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    const rawRef = orderRef.trim().toLowerCase();

    if (!rawRef || rawRef.length < 8) {
      return {
        success: false,
        error: "Mã đơn hàng không hợp lệ. Vui lòng nhập tối thiểu 8 ký tự.",
      };
    }

    const supabase = await createSupabaseServerClient();

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (uuidRegex.test(rawRef)) {
      const { data } = (await supabase
        .from("orders")
        .select("id")
        .eq("id", rawRef)
        .single()) as { data: any, error: any };

      if (data) return { success: true, orderId: data.id };
      return { success: false, error: "Không tìm thấy đơn hàng với mã này." };
    }

    // Fallback: search by 8-char shortcode prefix
    const { data: orders, error } = (await supabase.from("orders").select("id")) as { data: any[], error: any };

    if (error || !orders) {
      return {
        success: false,
        error: "Hệ thống đang bảo trì, vui lòng thử lại sau.",
      };
    }

    const matchedOrder = orders.find((o) =>
      o.id.toLowerCase().startsWith(rawRef),
    );

    if (!matchedOrder) {
      return { success: false, error: "Mã đơn hàng không tồn tại." };
    }

    return { success: true, orderId: matchedOrder.id };
  } catch (err) {
    console.error("Tracking Error:", err);
    return { success: false, error: "Đã xảy ra lỗi hệ thống khi tra cứu." };
  }
}
