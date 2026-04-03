import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fruitholic Admin",
  description: "Admin pages Fruitholic",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface font-body">
      {children}
    </div>
  );
}
