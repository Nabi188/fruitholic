import Link from 'next/link'
import { HeaderCartButton } from './HeaderCartButton'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tighter text-emerald-600">
              Fruitholic
            </span>
          </Link>

          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-emerald-600 transition-colors">
              Trang Chủ
            </Link>
            <Link href="/about" className="hover:text-emerald-600 transition-colors">
              Về Chúng Tôi
            </Link>
            <Link href="/orders/track" className="hover:text-emerald-600 transition-colors">
              Kiểm Tra Đơn
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block text-sm font-medium">
            <span className="text-slate-500">Hotline: </span>
            <a href="tel:0909123456" className="text-emerald-600 font-bold hover:underline">
              0909 123 456
            </a>
          </div>
          
          <HeaderCartButton />
        </div>
      </div>
    </header>
  )
}
