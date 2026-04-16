"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, PackageSearch } from "lucide-react";
import { findOrderForTracking } from "@/app/actions/track";

export default function OrderTrackingPage() {
  const router = useRouter();
  const [orderRef, setOrderRef] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!orderRef.trim()) {
      setError("Order code is invalid. Please enter at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    const result = await findOrderForTracking(orderRef);

    if (result.success && result.orderCode) {
      router.push(`/orders/${result.orderCode}`);
    } else {
      setError(result.error || "Order not found.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-32 max-w-xl text-center relative overflow-hidden">
      {/* Background decorations STITCH style */}
      <div className="absolute top-10 left-10 w-48 h-48 bg-primary-container/30 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>
      <div className="absolute bottom-10 right-10 w-56 h-56 bg-secondary/10 rounded-full blur-3xl -z-10"></div>

      <div className="h-24 w-24 bg-surface-container-high text-primary rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
        <PackageSearch className="h-10 w-10 text-primary-dim" strokeWidth={2} />
      </div>

      <h1 className="text-4xl md:text-5xl font-extrabold text-primary-dim mb-4 tracking-tighter font-headline">
        Order Tracking
      </h1>
      <p className="text-on-surface-variant font-body mb-10 max-w-sm mx-auto text-lg leading-relaxed">
        Enter your <strong>Order Code</strong> (sent in email) to check your
        shipping status.
      </p>

      <form
        onSubmit={handleSearch}
        className="bg-white p-8 sm:p-10 rounded-[2rem] border border-surface-container shadow-sm flex flex-col gap-6 text-left relative z-10"
      >
        <div>
          <label className="text-sm font-bold text-on-surface block mb-3 font-body">
            Order Code (Order ID / Tracking Ref)
          </label>
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-outline-variant" />
            <input
              type="text"
              value={orderRef}
              onChange={(e) => setOrderRef(e.target.value)}
              placeholder="Example: FH123456"
              className="w-full pl-14 pr-5 py-4 bg-surface-bright border border-surface-container-high rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono text-sm placeholder:font-body placeholder:text-outline/70"
            />
          </div>
        </div>

        {error && (
          <div className="bg-error-container/20 text-error px-4 py-3 rounded-xl text-sm font-medium font-body flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !orderRef.trim()}
          className="mt-4 w-full flex justify-center items-center gap-3 rounded-full bg-primary px-8 py-4 text-base font-bold text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:bg-primary-dim disabled:bg-surface-container-highest disabled:text-outline disabled:shadow-none disabled:cursor-not-allowed font-headline tracking-wide uppercase"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Checking...
            </>
          ) : (
            "Check now"
          )}
        </button>
      </form>
    </div>
  );
}
