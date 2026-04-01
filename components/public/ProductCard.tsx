import Link from 'next/link'
import { formatVND } from '@/lib/formatters'
import { ShoppingBag } from 'lucide-react'

type ProductCardProps = {
  id: string
  name: string
  slug: string
  price: number
  imageUrl?: string
  shortDescription?: string | null
}

export function ProductCard({ name, slug, price, imageUrl, shortDescription }: ProductCardProps) {
  const displayImage = imageUrl || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&q=80'

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-md hover:border-emerald-100">
      <Link href={`/products/${slug}`} className="relative aspect-square w-full overflow-hidden bg-slate-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayImage}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex justify-end">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition-colors">
            <ShoppingBag className="h-5 w-5" />
          </button>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/products/${slug}`} className="group-hover:text-emerald-600 transition-colors">
          <h3 className="font-bold text-slate-800 line-clamp-2">{name}</h3>
        </Link>
        
        {shortDescription && (
          <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            
            {typeof shortDescription === 'string' && shortDescription.startsWith('{') 
              ? 'Chi tiết tuyệt hảo với hương vị tự nhiên...' 
              : shortDescription}
          </p>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-lg font-extrabold text-emerald-600">
            {formatVND(price)}
          </span>
        </div>
      </div>
    </div>
  )
}
