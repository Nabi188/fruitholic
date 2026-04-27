"use client";

import { useState, useMemo } from "react";
import { ProductCard } from "@/components/public/ProductCard";
import {
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  ChevronDown,
} from "lucide-react";
import { formatVND } from "@/lib/formatters";
import Link from "next/link";

type Category = { id: string; name: string; slug: string };

type ShopProduct = {
  id: string;
  name: string;
  slug: string;
  categoryId: string | null;
  price: number;
  imageUrl?: string;
  hasRequiredOptions: boolean;
  isActive: boolean;
  hasActiveVariants: boolean;
};

type Props = {
  categories: Category[];
  products: ShopProduct[];
};

const PRICE_RANGES = [
  { label: "Tất cả", min: 0, max: Infinity },
  { label: "Dưới 50k", min: 0, max: 50000 },
  { label: "50k – 100k", min: 50000, max: 100000 },
  { label: "100k – 200k", min: 100000, max: 200000 },
  { label: "Trên 200k", min: 200000, max: Infinity },
];

export function ShopClient({ categories, products }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "name">("default");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    // Category filter
    if (selectedCategory !== "ALL") {
      result = result.filter((p) => p.categoryId === selectedCategory);
    }

    // Price range
    const range = PRICE_RANGES[selectedPriceRange];
    if (range) {
      result = result.filter(
        (p) => p.price >= range.min && p.price < range.max,
      );
    }

    // Available only
    if (showAvailableOnly) {
      result = result.filter((p) => p.hasActiveVariants);
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name, "vi"));
        break;
    }

    return result;
  }, [products, searchQuery, selectedCategory, selectedPriceRange, showAvailableOnly, sortBy]);

  const activeFilterCount =
    (selectedCategory !== "ALL" ? 1 : 0) +
    (selectedPriceRange !== 0 ? 1 : 0) +
    (showAvailableOnly ? 1 : 0);

  const clearFilters = () => {
    setSelectedCategory("ALL");
    setSelectedPriceRange(0);
    setShowAvailableOnly(false);
    setSearchQuery("");
    setSortBy("default");
  };

  const FilterSidebar = () => (
    <div className="space-y-8">
      {/* Category filter */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-3 font-headline">
          Danh mục
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              selectedCategory === "ALL"
                ? "bg-primary text-on-primary font-bold shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            Tất cả ({products.length})
          </button>
          {categories.map((cat) => {
            const count = products.filter((p) => p.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex justify-between items-center ${
                  selectedCategory === cat.id
                    ? "bg-primary text-on-primary font-bold shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-xs ${selectedCategory === cat.id ? "opacity-80" : "opacity-50"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-3 font-headline">
          Khoảng giá
        </h3>
        <div className="space-y-1">
          {PRICE_RANGES.map((range, i) => (
            <button
              key={i}
              onClick={() => setSelectedPriceRange(i)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                selectedPriceRange === i
                  ? "bg-secondary-container text-on-secondary-container font-bold"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-3 font-headline">
          Tình trạng
        </h3>
        <label className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-surface-container-high transition-all">
          <input
            type="checkbox"
            checked={showAvailableOnly}
            onChange={(e) => setShowAvailableOnly(e.target.checked)}
            className="w-4 h-4 rounded text-primary focus:ring-primary accent-[var(--color-primary)]"
          />
          <span className="text-sm font-medium text-on-surface">
            Chỉ hiện sản phẩm còn hàng
          </span>
        </label>
      </div>

      {/* Clear filters */}
      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="w-full text-center px-4 py-3 rounded-xl text-sm font-bold text-error hover:bg-error/5 transition-colors border border-error/20"
        >
          Xoá bộ lọc ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-[80vh]">
      {/* Hero Header */}
      <div className="bg-surface-container-low border-b border-outline-variant/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-on-background tracking-tighter font-headline">
            Tất cả sản phẩm
          </h1>
          <p className="mt-3 text-on-surface-variant font-body text-lg max-w-xl">
            Khám phá {products.length} sản phẩm trái cây tươi ngon, nước ép hữu cơ 100% từ thiên nhiên.
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
          {/* Search */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full pl-11 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all placeholder:text-outline font-body"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-surface-container-high"
              >
                <X className="w-3.5 h-3.5 text-on-surface-variant" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-full text-sm font-medium text-on-surface transition-all hover:border-primary/30 relative"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Bộ lọc
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-on-primary text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="relative flex-1 sm:flex-none">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full sm:w-auto appearance-none px-4 py-3 pr-10 bg-surface-container-lowest border border-outline-variant/20 rounded-full text-sm font-medium text-on-surface outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
              >
                <option value="default">Mặc định</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="name">Tên A-Z</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
            </div>

            {/* View mode */}
            <div className="hidden sm:flex items-center bg-surface-container-lowest border border-outline-variant/20 rounded-full overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 transition-all ${
                  viewMode === "grid"
                    ? "bg-primary text-on-primary"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 transition-all ${
                  viewMode === "list"
                    ? "bg-primary text-on-primary"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-28 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-6 shadow-sm">
              <FilterSidebar />
            </div>
          </aside>

          {/* Mobile Filters Overlay */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-surface-container-lowest rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold font-headline">Bộ lọc</h2>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-2 rounded-full hover:bg-surface-container-high"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <FilterSidebar />
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full mt-6 py-3 bg-primary text-on-primary rounded-full font-bold shadow-lg"
                >
                  Áp dụng ({filteredProducts.length} sản phẩm)
                </button>
              </div>
            </div>
          )}

          {/* Product Grid/List */}
          <div className="flex-1 min-w-0">
            {/* Results count */}
            <div className="mb-4 flex items-center gap-3">
              <span className="text-sm text-on-surface-variant font-body">
                Hiển thị <strong className="text-on-surface">{filteredProducts.length}</strong> / {products.length} sản phẩm
              </span>
              {searchQuery && (
                <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                  &quot;{searchQuery}&quot;
                </span>
              )}
            </div>

            {filteredProducts.length > 0 ? (
              viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
                  {filteredProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      id={p.id}
                      name={p.name}
                      slug={p.slug}
                      price={p.price}
                      imageUrl={p.imageUrl}
                      hasRequiredOptions={p.hasRequiredOptions}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredProducts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.slug}`}
                      className="flex items-center gap-5 bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/10 hover:border-primary/20 hover:shadow-sm transition-all group"
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-container-low shrink-0">
                        <img
                          src={
                            p.imageUrl ||
                            "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&q=80"
                          }
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-on-surface line-clamp-1 font-body group-hover:text-primary transition-colors">
                          {p.name}
                        </h3>
                        <span className="text-sm text-on-surface-variant">
                          {categories.find((c) => c.id === p.categoryId)?.name || "—"}
                        </span>
                      </div>
                      <span className="text-primary font-bold text-lg font-headline shrink-0">
                        {formatVND(p.price)}
                      </span>
                    </Link>
                  ))}
                </div>
              )
            ) : (
              <div className="py-24 text-center bg-surface-container-low rounded-2xl border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center">
                <Search className="w-12 h-12 text-on-surface-variant/30 mb-4" />
                <p className="text-on-surface-variant font-body text-lg mb-2">
                  Không tìm thấy sản phẩm
                </p>
                <p className="text-on-surface-variant/60 font-body text-sm mb-6">
                  Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-bold text-sm"
                >
                  Xoá bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
