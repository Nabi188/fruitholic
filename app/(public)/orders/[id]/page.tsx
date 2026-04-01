/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { formatVND } from '@/lib/formatters'
import { CheckCircle2, Clock, MapPin, Package, CreditCard, ChevronRight, Copy } from 'lucide-react'
import Link from 'next/link'
import { use } from 'react'

type Params = Promise<{ id: string }>

export default function OrderConfirmationPage(props: { params: Params }) {
  const params = use(props.params)
  const [order, setOrder] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCopied, setIsCopied] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function fetchOrder() {
      const { data: oData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', params.id)
        .single()
        
      if (oData) {
        setOrder(oData)
        const { data: iData } = await supabase
          .from('order_items')
          .select(`
            *,
            products ( name, product_images(url) )
          `)
          .eq('order_id', params.id)
          
        if (iData) setItems(iData)
      }
      setIsLoading(false)
    }
    
    fetchOrder()

    const payChannel = supabase.channel(`order-${params.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${params.id}` },
        (payload) => {
          setOrder((prev: any) => ({ ...prev, ...payload.new }))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(payChannel) }
  }, [params.id, supabase])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!order) {
    return <div className="text-center py-20 text-slate-500">Không tìm thấy đơn hàng.</div>
  }

  const isPaid = order.payment_status === 'paid'

  const BANK_ID = process.env.NEXT_PUBLIC_BANK_ID || 'MB'
  const BANK_ACCOUNT = process.env.NEXT_PUBLIC_BANK_ACCOUNT || '0000000000'
  const BANK_NAME = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || 'FRUITHOLIC'
  
  const orderRef = order.id.split('-')[0].toUpperCase()
  const transferContent = `FRUIT ${orderRef}`

  const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${BANK_ACCOUNT}-qr_only.png?amount=${order.total_amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(BANK_NAME)}`

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex flex-col items-center text-center mb-12">
        {isPaid ? (
          <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-10 w-10" />
          </div>
        ) : (
          <div className="h-20 w-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6">
            <Clock className="h-10 w-10" />
          </div>
        )}
        
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {isPaid ? 'Đặt hàng & Thanh toán thành công!' : 'Đặt hàng thành công!'}
        </h1>
        <p className="mt-4 text-slate-500 max-w-md">
          {isPaid 
            ? 'Cảm ơn bạn đã tin tưởng Fruitholic. Đơn hàng đang được chuẩn bị và sẽ giao tới bạn sớm nhất.' 
            : 'Vui lòng hoàn tất thanh toán để chúng tôi bắt đầu chuẩn bị đơn hàng của bạn.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

        <div className="md:col-span-5">
          {order.payment_method === 'bank_transfer' ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden sticky top-24">
              <div className="p-6 text-center border-b border-dashed border-slate-200">
                <h3 className="font-bold text-slate-800 text-lg">Mã QR Thanh Toán</h3>
                <p className="text-sm text-slate-500 mt-1">Quét mã qua ứng dụng ngân hàng</p>
              </div>

              {isPaid ? (
                <div className="p-12 flex flex-col items-center text-center bg-emerald-50">
                   <div className="h-16 w-16 bg-emerald-500 rounded-full text-white flex items-center justify-center mb-4">
                     <CheckCircle2 className="h-8 w-8" />
                   </div>
                   <h4 className="font-extrabold text-emerald-700 text-xl">Đã thanh toán</h4>
                   <p className="text-emerald-600/80 mt-2 text-sm">Hệ thống ghi nhận thành công.</p>
                </div>
              ) : (
                <div className="p-8 flex items-center justify-center bg-slate-50">
                  <div className="w-full aspect-square max-w-[200px] bg-white rounded-2xl shadow-sm p-2 border border-slate-200 relative overflow-hidden">
                     <img src={qrUrl} alt="VietQR" className="w-full h-full object-contain" />
                     
                     <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-400/20 to-transparent animate-scan" style={{ height: '200%', transform: 'translateY(-100%)' }} />
                  </div>
                </div>
              )}

              <div className="p-6 bg-slate-50/50 flex flex-col gap-4 text-sm relative">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Số tài khoản</span>
                  <button onClick={() => copyToClipboard(BANK_ACCOUNT)} className="font-bold text-slate-800 flex items-center gap-2 hover:text-emerald-600">
                    {BANK_ACCOUNT} <Copy className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Ngân hàng</span>
                  <span className="font-bold text-slate-800">{BANK_ID}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Chủ tài khoản</span>
                  <span className="font-bold text-slate-800">{BANK_NAME}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-dashed border-slate-200">
                  <span className="text-slate-500">Nội dung (BẮT BUỘC)</span>
                  <button onClick={() => copyToClipboard(transferContent)} className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-emerald-100">
                    {transferContent} <Copy className="w-4 h-4" />
                  </button>
                </div>

                {isCopied && (
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 text-white px-4 py-2 rounded-full text-xs shadow-lg animate-in fade-in slide-in-from-bottom-2">
                     Đã sao chép!
                   </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center sticky top-24">
              <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-slate-800 text-xl mb-2">Thanh Toán Tiền Mặt</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Bạn đã chọn hình thức thanh toán COD. Vui lòng thanh toán số tiền cho nhân viên giao hàng khi nhận được sản phẩm.
              </p>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="block text-sm text-slate-500 mb-1">Số tiền cần thanh toán</span>
                <span className="block text-2xl font-extrabold text-slate-900">{formatVND(order.total_amount)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-7 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-dashed border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">Thông tin nhận hàng</h2>
              <span className="text-xs font-medium bg-slate-100 text-slate-600 px-3 py-1 rounded-full uppercase tracking-wider">
                Mã: {orderRef}
              </span>
            </div>
            
            <div className="py-4 flex flex-col gap-4 text-sm text-slate-600">
              <div className="flex gap-4 items-start">
                <Package className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <span className="block font-bold text-slate-900">{order.receiver_name}</span>
                  <span>{order.receiver_phone}</span>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{order.delivery_address}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 overflow-hidden">
            <h2 className="text-lg font-bold text-slate-800 pb-4 border-b border-dashed border-slate-200">
              Chi tiết sản phẩm
            </h2>
            
            <div className="py-4 flex flex-col gap-6">
              {items.map((item) => {
                const imgUrl = item.products?.product_images?.[0]?.url || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&q=80'
                const optCost = item.selected_options ? item.selected_options.reduce((s:any, o:any) => s + (o.price || 0), 0) : 0
                const itemTotal = (item.unit_price + optCost) * item.quantity

                return (
                  <div key={item.id} className="flex gap-4 items-start">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img src={imgUrl} alt="Hình" className="w-16 h-16 rounded-xl object-cover bg-slate-50 border border-slate-100" />
                     <div className="flex-1 flex flex-col justify-between h-full py-0.5">
                       <span className="font-bold text-slate-800 leading-tight">{item.products?.name}</span>
                       <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-1">
                          {item.selected_options && item.selected_options.map((opt:any) => (
                            <span key={opt.optionValueId} className="after:content-[','] last:after:content-['']">{opt.optionValueName}</span>
                          ))}
                       </div>
                     </div>
                     <div className="text-right flex flex-col gap-1 items-end shrink-0">
                       <span className="text-sm font-bold text-slate-900">{formatVND(itemTotal)}</span>
                       <span className="text-xs text-slate-400 font-medium">SL: {item.quantity}</span>
                     </div>
                  </div>
                )
              })}
            </div>

            <div className="pt-4 border-t border-dashed border-slate-200 flex justify-between items-center bg-slate-50 -mx-6 -mb-6 p-6">
              <span className="font-bold text-slate-800">Tổng thanh toán</span>
              <span className="text-2xl font-extrabold text-emerald-600">{formatVND(order.total_amount)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Link href="/" className="text-slate-500 hover:text-emerald-600 font-medium text-sm transition-colors">
              &larr; Về trang chủ
            </Link>
            <Link href="/orders/track" className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold text-sm bg-emerald-50 px-5 py-2.5 rounded-xl transition-all hover:bg-emerald-100">
              Theo dõi lộ trình <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
