'use client'

import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useCartStore } from '@/stores/cartStore'
import { useEffect, useState } from 'react'
import { formatVND } from '@/lib/formatters'

export function HeaderCartButton() {
  const { totalItems, totalAmount } = useCartStore()
  
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(t)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 p-2">
        <ShoppingBag className="h-5 w-5 text-slate-400" />
      </div>
    )
  }

  return (
    <Link href="/cart" className="flex items-center gap-3 p-2 group transition-colors">
      <div className="relative">
        <ShoppingBag className="h-6 w-6 text-slate-700 group-hover:text-emerald-600 transition-colors" />
        {totalItems() > 0 && (
          <span className="absolute -top-1 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
            {totalItems()}
          </span>
        )}
      </div>

      <div className="hidden lg:flex flex-col items-start leading-none ml-2">
        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
          Giỏ hàng
        </span>
        <span className="text-sm font-bold text-slate-800">
          {totalItems() > 0 ? formatVND(totalAmount()) : '0 ₫'}
        </span>
      </div>
    </Link>
  )
}
