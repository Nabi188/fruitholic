import Link from "next/link";
import { CheckCircle2, Search, Home } from "lucide-react";
import { CopyButton } from "@/components/ui/CopyButton";

export const metadata = {
  title: "Cám ơn bạn đã đặt hàng! | Fruitholic",
};

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  if (!code) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-3xl font-bold">Order not found</h1>
        <Link
          href="/"
          className="text-primary mt-4 inline-block hover:underline"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-2xl text-center relative overflow-hidden">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-primary/10 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>

      <div className="h-28 w-28 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
        <CheckCircle2 className="h-14 w-14" strokeWidth={2.5} />
      </div>

      <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface mb-4 tracking-tighter font-headline">
        Thank you for your order!
      </h1>
      <p className="text-on-surface-variant font-body mb-8 max-w-sm mx-auto text-lg leading-relaxed">
        Your order has been successfully placed. We are preparing your order
        with care.
      </p>

      <div className="bg-white p-8 rounded-[2rem] border border-surface-container shadow-sm flex flex-col gap-4 text-center mx-auto max-w-sm relative z-10">
        <span className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">
          Order code
        </span>
        <div className="flex items-center justify-center gap-3">
          <span className="text-3xl font-mono font-extrabold text-primary tracking-wider">
            {code}
          </span>
          <CopyButton text={code} />
        </div>
        <p className="text-xs text-outline italic mt-2">
          (Save this code to track your order)
        </p>
      </div>

      <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 w-full max-w-sm mx-auto">
        <Link
          href="/orders/track"
          className="w-full sm:w-auto flex justify-center items-center gap-2 rounded-full border border-primary text-primary px-8 py-3.5 text-sm font-bold hover:bg-primary/5 transition-colors font-headline"
        >
          <Search className="w-4 h-4" />
          Track order
        </Link>
        <Link
          href="/"
          className="w-full sm:w-auto flex justify-center items-center gap-2 rounded-full bg-primary text-white px-8 py-3.5 text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:brightness-110 font-headline"
        >
          <Home className="w-4 h-4" />
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
