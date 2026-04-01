'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, PackageSearch } from 'lucide-react'

export default function OrderTrackingPage() {
  const router = useRouter()
  const [orderId, setOrderId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId.trim()) {
      setError('Vui lòng nhập mã đơn hàng hợp lệ')
      return
    }

    setIsSubmitting(true)
    setError('')

    // Basic regex to check if it looks roughly like a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    
    if (uuidRegex.test(orderId.trim())) {
      router.push(`/orders/${orderId.trim()}`)
    } else {
      setIsSubmitting(false)
      setError('Mã đơn hàng không đúng định dạng. Xin vui lòng kiểm tra lại URL hoặc email.')
    }
  }

  return (
    <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
      <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <PackageSearch className="h-10 w-10" />
      </div>
      
      <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Theo dõi lộ trình đơn hàng</h1>
      <p className="text-slate-500 mb-10 max-w-md mx-auto">
        Nhập chính xác mã đơn hàng (ID) của bạn để kiểm tra tình trạng thanh toán và lộ trình giao hàng mới nhất.
      </p>

      <form onSubmit={handleSearch} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4 text-left">
        <div>
          <label className="text-sm font-bold text-slate-700 block mb-2">Mã đơn hàng (Order ID)</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Ví dụ: 123e4567-e89b-12d3... "
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono text-sm placeholder:font-sans placeholder:text-slate-400"
            />
          </div>
          {error && <span className="text-sm font-medium text-red-500 mt-2 block">{error}</span>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !orderId.trim()}
          className="mt-2 w-full flex justify-center items-center gap-2 rounded-xl bg-emerald-600 px-6 py-4 text-lg font-bold text-white shadow-xl shadow-emerald-600/20 transition-all hover:bg-emerald-700 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <><Loader2 className="w-6 h-6 animate-spin" /> Đang tra cứu...</>
          ) : (
            'Kiểm tra tình trạng'
          )}
        </button>
      </form>
    </div>
  )
}
