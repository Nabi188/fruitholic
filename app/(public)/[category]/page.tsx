/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/public/ProductCard'
import { notFound } from 'next/navigation'

export const revalidate = 60

type Props = {
  params: Promise<{ category: string }>
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: categoryData } = (await supabase
    .from('categories')
    .select('id, name')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()) as { data: any; error: any }

  if (!categoryData) {
    notFound()
  }

  const { data: products } = (await supabase
    .from('products')
    .select(`
      id, name, slug, short_description,
      product_images(url, sort_order),
      product_variants(price, is_active)
    `)
    .eq('category_id', categoryData.id)
    .eq('is_active', true)
    .order('sort_order')) as { data: any[]; error: any }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {categoryData.name}
        </h1>
        <p className="mt-2 text-slate-500">
          Khám phá danh sách {products?.length || 0} sản phẩm thơm ngon.
        </p>
      </div>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p) => {
            const activeVariants = p.product_variants?.filter((v: any) => v.is_active) || []
            const basePrice = activeVariants.length > 0 
              ? Math.min(...activeVariants.map((v: any) => v.price)) 
              : 0

            const images = p.product_images || []
            images.sort((a: any, b: any) => a.sort_order - b.sort_order)
            const thumbnailUrl = images[0]?.url

            return (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                slug={p.slug}
                price={basePrice}
                imageUrl={thumbnailUrl}
                shortDescription={p.short_description}
              />
            )
          })}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-500">Chưa có sản phẩm nào trong danh mục này.</p>
        </div>
      )}
    </div>
  )
}
