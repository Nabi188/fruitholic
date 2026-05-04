import { redirect } from "next/navigation";

/**
 * Backward compatibility redirect.
 * Old URL: /trai-cay → New URL: /category/trai-cay
 */
type Props = {
  params: Promise<{ category: string }>;
};

export default async function OldCategoryRedirect({ params }: Props) {
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
