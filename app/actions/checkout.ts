'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { checkoutSchema, type CheckoutInput } from '@/schemas/orders'
import { ZodError } from 'zod'

export async function placeOrder(formData: CheckoutInput & { items: any[] }) {
  try {
    const payload = checkoutSchema.parse(formData)
    const itemsData = formData.items
    
    if (!itemsData || itemsData.length === 0) {
      return { success: false, error: 'Giỏ hàng trống!' }
    }

    let computedTotal = 0
    
    itemsData.forEach((item) => {
      let unitPrice = item.variantPrice || 0
      if (item.options && Array.isArray(item.options)) {
        item.options.forEach((opt: any) => {
          unitPrice += opt.price || 0
        })
      }
      computedTotal += (unitPrice * item.quantity)
    })

    const supabase = await createSupabaseServerClient()

    const { data: orderParams, error: orderError } = (await supabase
      .from('orders')
      .insert({
        customer_name: payload.customer_name,
        customer_phone: payload.customer_phone,
        customer_email: payload.customer_email || null,
        is_self_receiver: payload.is_self_receiver,
        receiver_name: payload.receiver_name || payload.customer_name,
        receiver_phone: payload.receiver_phone || payload.customer_phone,
        delivery_address: payload.address,
        notes: payload.note || null,
        total_amount: computedTotal,
        payment_method: payload.payment_method,
        payment_status: 'pending',
        status: 'pending'
      } as any)
      .select('id')
      .single()) as { data: any, error: any }

    if (orderError || !orderParams) {
      console.error('Insert Order Error:', orderError)
      return { success: false, error: 'Không thể tạo đơn hàng. Vui lòng thử lại.' }
    }

    const orderId = orderParams.id

    const lineItemsToInsert = itemsData.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      variant_id: item.variantId,
      quantity: item.quantity,
      unit_price: item.variantPrice,
      selected_options: item.options
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(lineItemsToInsert as any)

    if (itemsError) {
      console.error('Insert Items Error:', itemsError)
      return { success: false, error: 'Lỗi ghi nhận sản phẩm. Khách hàng vui lòng liên hệ hotline!' }
    }

    return { success: true, orderId }

  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: 'Dữ liệu không hợp lệ!' }
    }
    console.error('Place Order Exception:', error)
    return { success: false, error: 'Đã có lỗi hệ thống xảy ra.' }
  }
}
