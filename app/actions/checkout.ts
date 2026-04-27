"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { checkoutSchema, type CheckoutInput } from "@/schemas/orders";
import { ZodError } from "zod";
import {
  sendOrderNotification,
  sendCustomerOrderConfirmation,
} from "@/lib/mailer";
import type { CartItem } from "@/stores/cartStore";

export async function placeOrder(
  formData: CheckoutInput & { items: CartItem[] },
) {
  try {
    const payload = checkoutSchema.parse(formData);
    const itemsData = formData.items;

    if (!itemsData || itemsData.length === 0) {
      return { success: false, error: "Cart is empty!" };
    }

    let computedTotal = 0;
    itemsData.forEach((item) => {
      let unitPrice = item.variantPrice || 0;
      if (item.options && Array.isArray(item.options)) {
        item.options.forEach((opt) => {
          unitPrice += opt.price || 0;
        });
      }
      computedTotal += unitPrice * item.quantity;
    });

    const supabase = await createSupabaseServerClient();

    const { data: codeData } = await supabase.rpc("generate_order_code");
    const orderCode = codeData ?? `FH${Date.now()}`;

    const { data: orderParams, error: orderError } = await (supabase as any)
      .from("orders")
      .insert({
        code: orderCode,
        customer_name: payload.customer_name,
        customer_phone: payload.customer_phone,
        customer_email: payload.customer_email || null,
        receiver_name: payload.is_self_receiver
          ? payload.customer_name
          : (payload.receiver_name ?? payload.customer_name),
        receiver_phone: payload.is_self_receiver
          ? payload.customer_phone
          : (payload.receiver_phone ?? payload.customer_phone),
        address: payload.address ?? "",
        note: payload.note || null,
        delivery_type: payload.delivery_type,
        delivery_time:
          payload.delivery_type === "SCHEDULED" ? payload.delivery_time : null,
        payment_method: payload.payment_method,
        payment_status: "UNPAID",
        status: "PENDING",
        total_amount: computedTotal,
      })
      .select("id, code")
      .single();

    if (orderError || !orderParams) {
      console.error("Insert Order Error:", orderError);
      return {
        success: false,
        error: "Failed to create order. Please try again.",
      };
    }

    const orderId = orderParams.id;

    const lineItemsToInsert = itemsData.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      variant_id: item.variantId === "default" ? null : item.variantId,
      product_name: item.productName,
      variant_name: item.variantName,
      price: item.variantPrice,
      quantity: item.quantity,
    }));

    const { data: insertedItems, error: itemsError } = await (supabase as any)
      .from("order_items")
      .insert(lineItemsToInsert)
      .select("id");

    if (itemsError) {
      console.error("Insert Items Error:", itemsError);
      return {
        success: false,
        error: "Error recording products. Please contact hotline!",
      };
    }

    const optionRows: any[] = [];
    itemsData.forEach((item, idx) => {
      const orderItemId = insertedItems?.[idx]?.id;
      if (!orderItemId) return;
      (item.options ?? []).forEach((opt) => {
        optionRows.push({
          order_item_id: orderItemId,
          option_group_id: opt.optionGroupId ?? null,
          option_value_id: opt.optionValueId ?? null,
          option_group_name: opt.optionGroupName ?? "",
          option_value_name: opt.optionValueName ?? "",
          price: opt.price ?? 0,
        });
      });
    });

    if (optionRows.length > 0) {
      await (supabase as any).from("order_item_options").insert(optionRows);
    }

    sendOrderNotification({
      code: orderParams.code,
      customerName: payload.customer_name,
      customerPhone: payload.customer_phone,
      customerEmail: payload.customer_email,
      address: payload.address ?? "",
      deliveryType: payload.delivery_type,
      paymentMethod: payload.payment_method,
      totalAmount: computedTotal,
      items: itemsData.map((item) => ({
        productName: item.productName,
        variantName: item.variantName,
        variantPrice: item.variantPrice,
        quantity: item.quantity,
        options: item.options?.map((opt) => ({
          name: opt.optionValueName,
          price: opt.price,
        })),
      })),
    }).catch((e) => console.error("Mail error:", e));

    if (payload.customer_email) {
      sendCustomerOrderConfirmation({
        code: orderParams.code,
        customerName: payload.customer_name,
        customerPhone: payload.customer_phone,
        customerEmail: payload.customer_email,
        address: payload.address ?? "",
        deliveryType: payload.delivery_type,
        paymentMethod: payload.payment_method,
        totalAmount: computedTotal,
        items: itemsData.map((item) => ({
          productName: item.productName,
          variantName: item.variantName,
          variantPrice: item.variantPrice,
          quantity: item.quantity,
          options: item.options?.map((opt) => ({
            name: opt.optionValueName,
            price: opt.price,
          })),
        })),
      }).catch((e) => console.error("Customer mail error:", e));
    }

    return { success: true, orderId, orderCode: orderParams.code };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: "Invalid data!" };
    }
    console.error("Place Order Exception:", error);
    return { success: false, error: "Internal Server Error!" };
  }
}
