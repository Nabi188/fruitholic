import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Generate a unique order code in the format FH + 6 alphanumeric chars.
 * Replaces the `generate_order_code` RPC with a JS implementation.
 *
 * Uses only unambiguous characters (no 0/O/1/I/L) to avoid
 * customer confusion when reading codes aloud.
 */
export async function generateOrderCode(): Promise<string> {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const supabase = await createSupabaseServerClient();

  for (let attempt = 0; attempt < 10; attempt++) {
    let code = "FH";
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }

    // Check for uniqueness
    const { data } = await supabase
      .from("orders")
      .select("id")
      .eq("code", code)
      .limit(1);

    if (!data || data.length === 0) {
      return code;
    }
  }

  // Fallback: timestamp-based code (extremely unlikely to reach here)
  return `FH${Date.now().toString(36).toUpperCase().slice(-6)}`;
}
