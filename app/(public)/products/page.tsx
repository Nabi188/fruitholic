import { getProducts } from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";
import { ShopClient } from "@/components/public/ShopClient";

export const metadata = {
  title: "Tất cả sản phẩm | Fruitholic",
  description:
    "Khám phá toàn bộ bộ sưu tập trái cây tươi ngon và nước ép hữu cơ từ Fruitholic.",
};

export default async function ShopPage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  return <ShopClient categories={categories} products={products} />;
}
