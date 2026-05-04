import Link from "next/link";
import { BookOpen, Zap } from "lucide-react";
import type { Category } from "@/lib/data/categories";

type Props = {
  categories: Category[];
};

export function CategoryNavBar({ categories }: Props) {
  return (
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

        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/category/${c.slug}`}
            className="bg-surface-container-high text-on-surface hover:bg-secondary-container hover:text-on-secondary-container rounded-full px-4 py-1.5 transition-all font-semibold"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
