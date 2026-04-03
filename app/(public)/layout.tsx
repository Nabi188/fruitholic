import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Toaster } from "@/components/ui/sonner";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-surface overflow-x-hidden relative">
      <Header />
      <div className="flex-1 w-full pt-20">{children}</div>
      <Toaster position="bottom-right" richColors />
      <Footer />
    </div>
  );
}
