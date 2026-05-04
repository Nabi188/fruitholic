import Link from "next/link";
import { HeaderCartButton } from "./HeaderCartButton";
import {
  UserCircle,
  Menu,
  ChevronDown,
  Shield,
  Truck,
  RefreshCw,
  CreditCard,
  Lock,
  FileText,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Category } from "@/lib/data/categories";

type Props = {
  categories: Category[];
};

const policyLinks = [
  {
    href: "/policies/shipping",
    label: "Vận chuyển",
    icon: Truck,
  },
  {
    href: "/policies/returns",
    label: "Đổi trả",
    icon: RefreshCw,
  },
  {
    href: "/policies/payment",
    label: "Thanh toán",
    icon: CreditCard,
  },
  {
    href: "/policies/privacy",
    label: "Bảo mật",
    icon: Lock,
  },
  {
    href: "/policies/terms",
    label: "Điều khoản",
    icon: FileText,
  },
];

export function Header({ categories }: Props) {
  const navLinks = [
    { href: "/products", label: "Cửa hàng" },
    { href: "/about", label: "Giới thiệu" },
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

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-1 font-headline text-sm tracking-wide items-center">
          {/* Category dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1 px-3 py-2 text-on-surface-variant hover:text-primary transition-colors duration-300 font-medium rounded-lg hover:bg-primary/5">
              Danh mục
              <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
            </button>
            <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-outline-variant/10 py-2 min-w-[200px]">
                <Link
                  href="/products"
                  className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
                >
                  Tất cả sản phẩm
                </Link>
                <div className="h-px bg-outline-variant/10 mx-4 my-1" />
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="flex items-center gap-3 px-5 py-3 text-sm text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors font-medium"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Main nav links */}
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-on-surface-variant hover:text-primary transition-colors duration-300 font-medium rounded-lg hover:bg-primary/5"
            >
              {link.label}
            </Link>
          ))}

          {/* Policy dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1 px-3 py-2 text-on-surface-variant hover:text-primary transition-colors duration-300 font-medium rounded-lg hover:bg-primary/5">
              <Shield className="w-3.5 h-3.5" />
              Chính sách
              <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
            </button>
            <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-outline-variant/10 py-2 min-w-[220px]">
                {policyLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-3 px-5 py-3 text-sm text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors font-medium"
                    >
                      <Icon className="w-4 h-4 text-outline" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 text-primary-dim">
          <div className="flex items-center md:gap-2">
            <HeaderCartButton />

            <button className="hidden md:flex p-2 scale-95 active:scale-90 transition-transform hover:bg-primary/10 rounded-full">
              <UserCircle strokeWidth={1.5} className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Menu */}
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

                <div className="flex-1 overflow-y-auto py-4">
                  {/* Categories section */}
                  <div className="px-6 mb-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 mb-3">
                      Danh mục sản phẩm
                    </p>
                    <div className="flex flex-col space-y-0.5">
                      <Link
                        href="/products"
                        className="py-3 px-4 text-base font-semibold text-primary hover:bg-primary/5 rounded-xl transition-colors"
                      >
                        Tất cả sản phẩm
                      </Link>
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/category/${cat.slug}`}
                          className="py-3 px-4 text-base font-medium text-on-surface hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-outline-variant/10 mx-6 my-4" />

                  {/* Main nav */}
                  <div className="flex flex-col px-6 space-y-0.5">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="py-3 px-4 text-base font-medium text-on-surface hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  <div className="h-px bg-outline-variant/10 mx-6 my-4" />

                  {/* Policies section */}
                  <div className="px-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 mb-3">
                      Chính sách
                    </p>
                    <div className="flex flex-col space-y-0.5">
                      {policyLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="py-3 px-4 text-sm font-medium text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-xl transition-colors flex items-center gap-3"
                          >
                            <Icon className="w-4 h-4 text-outline" />
                            {link.label}
                          </Link>
                        );
                      })}
                    </div>
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
