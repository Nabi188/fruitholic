import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Toaster } from "@/components/ui/sonner";
import { getCategories } from "@/lib/data/categories";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();

  return (
    <div className="flex min-h-screen flex-col bg-surface overflow-x-hidden relative">
      <Header categories={categories} />
      <div className="flex-1 w-full pt-20">{children}</div>
      <Toaster position="bottom-right" richColors />
      <Footer />
    </div>
  );
}
