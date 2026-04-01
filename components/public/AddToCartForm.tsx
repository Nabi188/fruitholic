'use client'

import { useState } from 'react'
import { Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCartStore, SelectedOption } from '@/stores/cartStore'
import { formatVND } from '@/lib/formatters'
import type { ProductDetail } from '@/types/app'

type Props = {
  data: ProductDetail
}

export function AddToCartForm({ data }: Props) {
  const { product, variants, option_groups, images } = data
  const addItem = useCartStore((state) => state.addItem)

  const [quantity, setQuantity] = useState(1)
  
  const defaultVariant = variants?.[0]
  const [selectedVariantId, setSelectedVariantId] = useState(defaultVariant?.id ?? '')

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({})

  if (!defaultVariant) return <p>Hết hàng</p>

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? defaultVariant
  const thumbnail = images?.[0]?.url || ''

  let livePrice = selectedVariant.price
  
  const chosenOptions: SelectedOption[] = []
  
  Object.entries(selectedOptions).forEach(([groupId, valueIds]) => {
    const group = option_groups.find((g) => g.id === groupId)
    if (!group) return
    
    valueIds.forEach((valId) => {
      const val = group.values.find((v) => v.id === valId)
      if (val) {
        livePrice += val.price
        chosenOptions.push({
          optionGroupId: group.id,
          optionGroupName: group.name,
          optionValueId: val.id,
          optionValueName: val.name,
          price: val.price,
        })
      }
    })
  })

  const handleOptionToggle = (groupId: string, valueId: string, maxSelect: number) => {
    setSelectedOptions((prev) => {
      const current = prev[groupId] || []
      const isSelected = current.includes(valueId)

      if (isSelected) {
        return { ...prev, [groupId]: current.filter((id) => id !== valueId) }
      } else {
        if (current.length >= maxSelect && maxSelect > 1) {
          alert(`Chỉ được chọn tối đa ${maxSelect} mục.`)
          return prev
        } else if (maxSelect === 1) {
          return { ...prev, [groupId]: [valueId] }
        } else {
          return { ...prev, [groupId]: [...current, valueId] }
        }
      }
    })
  }

  const handleAddToCart = () => {
    for (const group of option_groups) {
      const current = selectedOptions[group.id] || []
      if (current.length < group.min_select) {
        alert(`Vui lòng chọn ít nhất ${group.min_select} mục cho: ${group.name}`)
        return
      }
    }

    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      imageUrl: thumbnail,
      variantId: selectedVariant.id,
      variantName: selectedVariant.name,
      variantPrice: selectedVariant.price,
      options: chosenOptions,
    }, quantity)

    alert('Đã thêm thành công vào giỏ hàng!')
  }

  return (
    <div className="flex flex-col gap-8 rounded-2xl bg-white p-6 shadow-sm border border-slate-100">

      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-slate-800">Kích Cỡ / Biến Thể</h3>
        <div className="flex flex-wrap gap-3">
          {variants.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVariantId(v.id)}
              className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                selectedVariantId === v.id
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200'
              }`}
            >
              <div className="flex flex-col items-start gap-1">
                <span>{v.name}</span>
                <span className="text-xs font-bold">{formatVND(v.price)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {option_groups.length > 0 && (
        <div className="flex flex-col gap-6">
          {option_groups.map((group) => (
            <div key={group.id} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">{group.name}</h3>
                <span className="text-xs text-slate-400">
                  {group.min_select === group.max_select 
                    ? `Chọn đúng ${group.min_select}`
                    : `Chọn ${group.min_select > 0 ? `từ ${group.min_select}` : 'tối đa'} ${group.max_select}`}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {group.values.map((v) => {
                  const isChecked = (selectedOptions[group.id] || []).includes(v.id)
                  return (
                    <button
                      key={v.id}
                      onClick={() => handleOptionToggle(group.id, v.id, group.max_select)}
                      className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-sm font-medium transition-all ${
                        isChecked
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200'
                      }`}
                    >
                      <span className="line-clamp-1 text-left w-full">{v.name}</span>
                      <span className="text-xs opacity-80">
                        {v.price > 0 ? `+${formatVND(v.price)}` : 'Miễn phí'}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-slate-100">
        <div className="flex h-14 items-center rounded-2xl border border-slate-200 bg-slate-50 p-1 w-full sm:w-auto justify-between">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm transition hover:bg-slate-100"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center font-bold text-slate-900">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm transition hover:bg-slate-100"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          className="group relative flex h-14 w-full flex-1 items-center justify-between overflow-hidden rounded-2xl bg-emerald-600 px-6 font-bold text-white shadow-xl shadow-emerald-600/20 transition-all hover:bg-emerald-700"
        >
          <span className="flex items-center gap-2 relative z-10">
            <ShoppingBag className="h-5 w-5" /> Thêm Vào Giỏ
          </span>
          <span className="relative z-10">{formatVND(livePrice * quantity)}</span>
          <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
        </button>
      </div>

    </div>
  )
}
