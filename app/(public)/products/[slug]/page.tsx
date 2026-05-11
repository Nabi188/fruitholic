import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProductDetail } from "@/lib/data/products";
import { AddToCartForm } from "@/components/public/AddToCartForm";
import { ProductImageGallery } from "@/components/public/ProductImageGallery";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Props = {
  params: Promise<{ slug: string }>;
};

export default function ProductDetailPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <main className="pt-10 pb-16 px-6 lg:px-12 max-w-[1400px] mx-auto min-h-screen">
          <div className="animate-pulse space-y-8">
            <div className="h-4 w-48 bg-slate-200 rounded" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
              <div className="aspect-square bg-slate-200 rounded-2xl" />
              <div className="space-y-4">
                <div className="h-8 w-3/4 bg-slate-200 rounded" />
                <div className="h-6 w-1/3 bg-slate-200 rounded" />
                <div className="h-24 bg-slate-200 rounded" />
              </div>
            </div>
          </div>
        </main>
      }
    >
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const productDetail = await getProductDetail(slug);

  if (!productDetail) {
    notFound();
  }

  const { product, images } = productDetail;

  return (
    <main className="pt-10 pb-16 px-6 lg:px-12 max-w-[1400px] mx-auto">
      <div className="mb-10 flex items-center gap-2 text-xs text-outline uppercase tracking-widest font-headline">
        <Link href="/" className="hover:text-primary transition-colors">
          Trang chủ
        </Link>
        <ChevronRight strokeWidth={2} className="w-3 h-3 opacity-30" />
        <Link
          href={`/category/${product.category_slug}`}
          className="hover:text-primary transition-colors"
        >
          {product.category_name}
        </Link>
        <ChevronRight strokeWidth={2} className="w-3 h-3 opacity-30" />
        <span className="text-on-background font-bold line-clamp-1">
          {product.name}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
        <div className="w-full">
          <ProductImageGallery images={images} productName={product.name} />
        </div>

        <div className="w-full flex flex-col pt-2 sticky top-32">
          <AddToCartForm data={productDetail} />
        </div>
      </div>

      <section className="mt-24 max-w-5xl">
        <div className="border-b border-outline-variant/30 flex gap-8 mb-8 overflow-x-auto no-scrollbar font-headline">
          <button className="pb-4 text-primary font-bold border-b-2 border-primary whitespace-nowrap text-lg">
            Mô tả sản phẩm
          </button>
          <button className="pb-4 text-outline font-medium hover:text-on-surface whitespace-nowrap text-lg">
            Hương vị & Bảo quản
          </button>
        </div>
        <div className="grid grid-cols-1 gap-12">
          {product.description && (
            <div className="space-y-6">
              <div
                className="prose prose-fruitholic max-w-none text-on-surface-variant leading-relaxed font-body text-lg"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
