import type { Metadata } from "next";
import { Suspense } from "react";
import { Plus_Jakarta_Sans, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Fruitholic",
  description: "Trái Cây Tươi Cắt Sẵn",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${plusJakartaSans.variable} ${beVietnamPro.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-surface font-body text-on-background selection:bg-primary-container selection:text-on-primary-container">
        <Suspense>
          <TooltipProvider>{children}</TooltipProvider>
        </Suspense>
      </body>
    </html>
  );
}
