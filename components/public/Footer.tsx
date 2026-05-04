import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-surface-container-high bg-surface-container-low">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-12 py-16">
        <div>
          <div className="text-lg font-bold text-primary-dim mb-6 font-headline tracking-tight">
            Fruitholic
          </div>
          <p className="font-body text-sm text-on-surface-variant max-w-xs mb-8 leading-relaxed">
            Mang hương vị tươi ngon của thiên nhiên đến tận bàn ăn của bạn. Hoàn
            toàn tự nhiên, hoàn toàn sức khỏe.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center hover:text-primary transition-all shadow-sm font-bold text-outline"
            >
              FB
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center hover:text-primary transition-all shadow-sm font-bold text-outline"
            >
              IG
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 font-body text-sm">
          <div className="space-y-4">
            <h4 className="font-bold text-primary-dim">Sản phẩm</h4>
            <ul className="space-y-2 text-on-surface-variant">
              <li>
                <Link
                  href="/products"
                  className="hover:text-primary underline-offset-4 hover:underline transition-all"
                >
                  Trái cây cắt sẵn
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="hover:text-primary underline-offset-4 hover:underline transition-all"
                >
                  Nước ép tươi
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="hover:text-primary underline-offset-4 hover:underline transition-all"
                >
                  Set quà tặng
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-primary-dim">Hỗ trợ</h4>
            <ul className="space-y-2 text-on-surface-variant">
              <li>
                <Link
                  href="/policies/shipping"
                  className="hover:text-primary underline-offset-4 hover:underline transition-all"
                >
                  Chính sách giao hàng
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/returns"
                  className="hover:text-primary underline-offset-4 hover:underline transition-all"
                >
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/privacy"
                  className="hover:text-primary underline-offset-4 hover:underline transition-all"
                >
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-primary underline-offset-4 hover:underline transition-all"
                >
                  Tâm sự cùng Fruitholic
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-primary-dim font-headline">Liên hệ</h4>
          <p className="text-sm text-on-surface-variant flex items-start gap-2">
            <MapPin strokeWidth={1.5} className="w-4 h-4 shrink-0 mt-0.5" />
            Số 11, Ngõ An Trạch 1, Quận Đống Đa, <br />
            Thành phố Hà Nội
          </p>
          <p className="text-sm text-on-surface-variant flex items-center gap-2">
            <Phone strokeWidth={1.5} className="w-4 h-4 shrink-0" />
            Hotline:
            <Link href="tel:0962651808">
              <span className="hover:text-primary underline-offset-4 hover:underline transition-all">
                096 265 1808
              </span>
            </Link>
          </p>
          <p className="text-sm text-on-surface-variant flex items-center gap-2">
            <Mail strokeWidth={1.5} className="w-4 h-4 shrink-0" />
            Email:
            <Link href="mailto:hello@fruitholic.com">
              <span className="hover:text-primary underline-offset-4 hover:underline transition-all">
                hello@fruitholic.com
              </span>
            </Link>
          </p>
        </div>
      </div>

      <div className="px-12 py-8 border-t border-surface-container-high flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-outline font-body">
        <span>© 2026 Fruitholic. All rights reserved.</span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-secondary transition-colors">
            Facebook
          </a>
          <a href="#" className="hover:text-secondary transition-colors">
            Instagram
          </a>
          <a href="#" className="hover:text-secondary transition-colors">
            TikTok
          </a>
          <a href="#" className="hover:text-secondary transition-colors">
            Zalo
          </a>
        </div>
      </div>
    </footer>
  );
}
