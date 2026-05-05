import { Suspense } from "react";
import { redirect } from "next/navigation";

/**
 * Backward compatibility redirect.
 * Old URL: /trai-cay → New URL: /category/trai-cay
 */
type Props = {
  params: Promise<{ category: string }>;
};

export default function OldCategoryRedirect({ params }: Props) {
  return (
    <Suspense fallback={null}>
      <RedirectHandler params={params} />
    </Suspense>
  );
}

async function RedirectHandler({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;

  // Don't redirect known static routes that might conflict
  const staticRoutes = [
    "about",
    "contact",
    "cart",
    "checkout",
    "products",
    "policies",
    "orders",
    "thank-you",
    "admin",
    "login",
    "flash-sale",
    "category",
  ];

  if (staticRoutes.includes(slug)) {
    // This shouldn't happen because Next.js resolves static routes first,
    // but just in case — let the request pass through
    return null;
  }

  redirect(`/category/${slug}`);
}
