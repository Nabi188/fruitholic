import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/public/ProductCard";
import { Zap, BookOpen, ArrowRight } from "lucide-react";

export const revalidate = 0;

export const metadata = {
  title: "The Organic Editorial - Trái Cây Tươi & Nước Ép",
  description: "Năng lượng Thuần Khiết Từ Thiên Nhiên",
};

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();

  const [{ data: rawCategories }, { data: rawProducts }] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase
      .from("products")
      .select(
        `
        id, name, slug, category_id,
        product_images(url, sort_order),
        product_variants(price, is_active)
      `,
      )
      .eq("is_active", true),
  ]);

  const categories = rawCategories?.length ? rawCategories : [];

  const products = (rawProducts || []).map((p: any) => {
    const activeVariants =
      p.product_variants?.filter((v: any) => v.is_active) || [];
    let basePrice = 0;

    if (activeVariants.length > 0) {
      const prices = activeVariants
        .map((v: any) => parseFloat(String(v.price)))
        .filter((val: number) => !isNaN(val) && val > 0);

      if (prices.length > 0) {
        basePrice = Math.min(...prices);
      }
    }

    const images = [...(p.product_images || [])];
    images.sort((a: any, b: any) => {
      const sortA =
        a.sort_order === null || a.sort_order === undefined
          ? 999
          : Number(a.sort_order);
      const sortB =
        b.sort_order === null || b.sort_order === undefined
          ? 999
          : Number(b.sort_order);
      return sortA - sortB;
    });

    const thumbnailUrl = images[0]?.url;

    return {
      ...p,
      price: basePrice,
      image_url: thumbnailUrl,
    };
  });

  const groupedProducts = categories
    .map((cat: any) => ({
      category: cat,
      items: products.filter((p: any) => p.category_id === cat.id),
    }))
    .filter((g: any) => g.items.length > 0);

  return (
    <>
      <div className="w-full fixed top-[72px] z-40 bg-white dark:bg-zinc-800 bg-surface shadow-sm border-b border-surface-container overflow-hidden">
        <div className="container mx-auto flex items-center w-full overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap gap-2 px-6 py-3 font-headline font-medium text-sm">
          <div className="hidden sm:flex items-center gap-3 pr-4 border-r border-outline-variant/20">
            <BookOpen className="w-5 h-5 text-primary-dim" strokeWidth={2} />
            <span className="text-primary-dim font-bold">
              Danh mục sản phẩm
            </span>
          </div>
          <Link
            href="/products"
            className="bg-primary text-on-primary rounded-full px-4 py-1.5 transition-all shadow-sm font-bold"
          >
            Tất cả
          </Link>

          <Link
            href="/flash-sale"
            className="bg-surface-container-high text-on-surface hover:bg-secondary-container hover:text-on-secondary-container rounded-full px-4 py-1.5 transition-all relative"
          >
            <span className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-error" /> Flash Sale
            </span>
          </Link>

          {categories.map((c: any) => (
            <Link
              key={c.id}
              href={`/${c.slug}`}
              className="bg-surface-container-high text-on-surface hover:bg-secondary-container hover:text-on-secondary-container rounded-full px-4 py-1.5 transition-all font-semibold"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      <main className="pt-16">
        <section className="sm:px-8 px-4 mb-8 container mx-auto">
          <div className="relative rounded-2xl overflow-hidden bg-surface-container-low min-h-[280px] flex items-center">
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1622345095034-e4c1f9b3b878?q=80&w=1200"
                alt="Banner Trái Cây"
                className="w-full h-full object-cover opacity-90 mix-blend-multiply transition-transform duration-1000 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-surface-container-low via-surface-container-low/80 to-transparent"></div>
            </div>
            <div className="relative z-10 max-w-2xl px-4 sm:px-12 py-12 ml-4">
              <span className="inline-block bg-secondary text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
                Mùa hè rực rỡ
              </span>
              <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-primary-dim leading-[1.1] mb-6 tracking-tighter">
                Năng lượng <br />{" "}
                <span className="text-secondary">Thuần Khiết</span> Từ Thiên
                Nhiên.
              </h1>
              <p className="text-on-surface-variant mb-8 text-lg font-body max-w-md">
                100% trái cây tươi ngon mỗi ngày.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/products"
                  className="bg-primary hover:bg-primary-dim text-white px-8 py-3.5 rounded-full font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group text-sm uppercase tracking-wider"
                >
                  Mua Ngay Tại Đây
                  <ArrowRight
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    strokeWidth={3}
                  />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-16 px-2 pb-32 container mx-auto">
          <section>
            <div className="flex justify-between items-end mb-6 border-b border-outline-variant/20 pb-4">
              <h2 className="font-headline text-3xl font-bold text-on-surface flex items-center gap-2 tracking-tight">
                <Zap
                  className="w-8 h-8 text-error fill-error"
                  strokeWidth={2}
                />
                Flash Sale Hôm Nay
              </h2>
              <Link
                href="/flash-sale"
                className="text-primary font-bold hidden sm:inline-flex items-center gap-1 hover:underline"
              >
                Xem tất cả ưu đãi <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {products.slice(0, 8).map((p: any, i: number) => (
                <ProductCard
                  key={`flash-${p.id}`}
                  id={p.id}
                  name={p.name}
                  slug={p.slug}
                  price={p.price}
                  imageUrl={p.image_url}
                  discountPercentage={i === 0 ? 30 : i === 1 ? 15 : undefined}
                />
              ))}
            </div>
          </section>

          {groupedProducts.map((group: any) => (
            <section key={group.category.id}>
              <div className="flex justify-between items-end mb-6 border-b border-outline-variant/20 pb-4">
                <h2 className="font-headline text-2xl font-bold text-on-surface tracking-tight">
                  {group.category.name}
                </h2>
                <Link
                  href={`/${group.category.slug}`}
                  className="text-primary font-bold text-sm hover:underline"
                >
                  Xem tất cả
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {group.items.slice(0, 6).map((p: any) => (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    slug={p.slug}
                    price={p.price}
                    imageUrl={p.image_url}
                    isMix={group.category.name.toLowerCase().includes("mix")}
                    isPremium={false}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="px-2 pb-32 container mx-auto">
          <div className="bg-surface-container-high rounded-3xl p-4 md:p-16 relative overflow-hidden text-center shadow-sm border border-surface-container-highest">
            <div className="relative z-10 max-w-xl mx-auto">
              <h2 className="font-headline text-4xl font-extrabold text-primary-dim mb-4 tracking-tight">
                Menu mới cập nhật hàng ngày!
              </h2>
              <p className="text-on-surface-variant mb-10 text-lg">
                Đăng ký để nhận thông tin ưu đãi & cập nhật menu mới mỗi ngày.
              </p>
              <form className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Email của bạn..."
                  className="flex-grow rounded-full border border-surface-container-highest bg-white px-6 py-4 focus:ring-2 focus:ring-primary outline-none focus:border-primary shadow-sm text-sm"
                  required
                />
                <button
                  type="button"
                  className="bg-primary text-white font-headline px-8 py-4 rounded-full font-bold hover:bg-primary-dim shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
                >
                  Nhận cập nhật
                </button>
              </form>
            </div>

            <div className="absolute top-0 left-0 w-64 h-64 bg-primary-container/40 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl mix-blend-multiply"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
          </div>
        </section>
      </main>
    </>
  );
}
