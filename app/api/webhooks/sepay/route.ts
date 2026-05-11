import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    if (payload.transferType !== "in") {
      return NextResponse.json({ success: true });
    }

    const { transferAmount, content } = payload;
    if (!content || !transferAmount) {
      return NextResponse.json({
        success: false,
        message: "Missing content or amount",
      });
    }

    const match = content.match(/(FH[A-Z0-9]+)/i);

    if (!match || !match[1]) {
      return NextResponse.json({
        success: true,
        message: "No order code found in content",
      });
    }

    const orderCode = `FH${match[1]}`.toUpperCase();
    const supabase = await createSupabaseServerClient();

    const { data: orders, error: findError } = await (supabase as any)
      .from("orders")
      .select("id, code, total_amount, payment_status")
      .eq("code", orderCode)
      .limit(1);

    if (findError || !orders || orders.length === 0) {
      return NextResponse.json({ success: true, message: "Order not found" });
    }

    const order = orders[0];

    if (order.payment_status === "PAID") {
      return NextResponse.json({ success: true, message: "Already paid" });
    }
    if (Number(transferAmount) < Number(order.total_amount)) {
      return NextResponse.json({
        success: false,
        message: "Transfer amount less than order total",
      });
    }

    const { error: updateError } = await (supabase as any)
      .from("orders")
      .update({
        payment_status: "PAID",
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("Sepay webhook update error:", updateError);
      return NextResponse.json({ success: false }, { status: 500 });
    }

    console.log(`[Sepay] Order ${orderCode} marked as PAID`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Sepay webhook exception:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
