import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const payload = await req.json()

    if (payload.transferType !== 'in') {
      return NextResponse.json({ success: true })
    }

    const { transferAmount, content } = payload
    if (!content) {
      return NextResponse.json({ success: false })
    }

    const match = content.match(/FRUIT\s+([A-Z0-9\-]+)/i)
    if (!match || !match[1]) {
      return NextResponse.json({ success: true })
    }

    const orderRef = match[1].toLowerCase()
    const supabase = await createSupabaseServerClient()

    const { data: orders, error: findError } = await supabase
      .from('orders')
      .select('id, total_amount, payment_status')
      .ilike('id', `${orderRef}%`)
      .limit(1)

    if (findError || !orders || orders.length === 0) {
      return NextResponse.json({ success: true })
    }

    const order = orders[0]

    if (order.payment_status === 'paid') {
      return NextResponse.json({ success: true })
    }

    if (transferAmount !== order.total_amount) {
      return NextResponse.json({ success: true })
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'processing'
      })
      .eq('id', order.id)

    if (updateError) {
      return NextResponse.json({ success: false }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
