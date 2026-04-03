import Link from "next/link";
import { HeaderCartButton } from "./HeaderCartButton";
import { UserCircle, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Header() {
  const navLinks = [
    { href: "/about", label: "Giới thiệu" },
    { href: "/policies", label: "Chính sách" },
    { href: "/orders/track", label: "Kiểm tra đơn" },
    { href: "/contact", label: "Liên hệ" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border-b border-outline-variant/10">
      <div className="container mx-auto flex justify-between items-center px-6 md:px-8 py-3 md:py-4">
        <Link
          href="/"
          className="text-2xl font-bold text-primary-dim tracking-tighter font-headline flex items-center gap-2"
        >
          <span className="bg-primary text-white w-8 h-8 rounded-lg flex items-center justify-center text-lg">
            F
          </span>
          Fruitholic
        </Link>

        <div className="hidden md:flex gap-8 font-headline text-sm tracking-wide">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-on-surface-variant hover:text-primary transition-colors duration-300 font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-4 text-primary-dim">
          <div className="flex items-center md:gap-2">
            <HeaderCartButton />

            <button className="hidden md:flex p-2 scale-95 active:scale-90 transition-transform hover:bg-primary/10 rounded-full">
              <UserCircle strokeWidth={1.5} className="w-6 h-6" />
            </button>
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger
                render={
                  <button className="p-2 -mr-2 text-primary-dim hover:bg-primary/10 rounded-full transition-colors active:scale-90">
                    <Menu strokeWidth={2} className="w-6 h-6" />
                  </button>
                }
              />
              <SheetContent
                side="right"
                className="w-[300px] sm:w-[350px] p-0 flex flex-col"
              >
                <SheetHeader className="p-6 border-b border-outline-variant/10 text-left">
                  <SheetTitle className="font-headline text-xl font-bold text-primary">
                    Menu
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-6">
                  <div className="flex flex-col px-6 space-y-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="py-4 text-lg font-medium text-on-surface hover:text-primary border-b border-outline-variant/5 transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="p-6 border-t border-outline-variant/10 bg-surface-container-low">
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-3 w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all"
                  >
                    <UserCircle strokeWidth={2} className="w-5 h-5" />
                    Đăng nhập
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
