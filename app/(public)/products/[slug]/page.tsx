/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { AddToCartForm } from '@/components/public/AddToCartForm'
import type { ProductDetail } from '@/types/app'

export const revalidate = 30

type Props = {
  params: Promise<{ slug: string }>
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.rpc('get_product_detail', { p_slug: slug } as any)

  if (error || !data) {
    notFound()
  }

  const productDetail = data as unknown as ProductDetail
  const { product, images } = productDetail

  const mainImage = images?.[0]?.url || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1000&q=80'

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

        <div className="sticky top-24 flex flex-col gap-4">
          <div className="aspect-square w-full overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 shadow-sm relative group">
            <img
              src={mainImage}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          {images && images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img) => (
                <div key={img.id} className="h-20 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 border-transparent hover:border-emerald-500 transition-colors bg-slate-50">
                  <img src={img.url} alt="Thumbnail" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-8">

          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4 leading-tight">
              {product.name}
            </h1>

            {product.short_description && (
              <p className="text-lg text-slate-500 leading-relaxed mb-6">
                
                {typeof product.short_description === 'string' && product.short_description.startsWith('{')
                  ? 'Mô tả nguyên bản với 100% trái cây tươi.'
                  : product.short_description}
              </p>
            )}
          </div>

          <AddToCartForm data={productDetail} />

          {product.description && (
            <div className="mt-8 pt-8 border-t border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Chi Tiết Sản Phẩm</h3>
              <div className="prose prose-emerald max-w-none text-slate-600">
                  
                  <p>Thông tin dinh dưỡng và nguồn gốc của {product.name}...</p>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  )
}
