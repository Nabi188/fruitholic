import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-50 border-t py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold tracking-tighter text-emerald-600">
                Fruitholic
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              Thương hiệu đồ uống trái cây tươi ngon, mát gắt mỗi ngày. Đặt nền
              tảng trên những thức quả tự nhiên 100%.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-800 mb-4">Về Fruitholic</h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li>
                <Link
                  href="/about"
                  className="hover:text-emerald-600 transition"
                >
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-emerald-600 transition"
                >
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link
                  href="/orders/track"
                  className="hover:text-emerald-600 transition"
                >
                  Tra cứu trạng thái đơn hàng
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-800 mb-4">
              Chính sách hỗ trợ
            </h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li>
                <Link
                  href="/policies/guide"
                  className="hover:text-emerald-600 transition"
                >
                  Hướng dẫn mua hàng
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/shipping"
                  className="hover:text-emerald-600 transition"
                >
                  Chính sách giao hàng
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/payment"
                  className="hover:text-emerald-600 transition"
                >
                  Chính sách thanh toán
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/privacy"
                  className="hover:text-emerald-600 transition"
                >
                  Bảo mật thông tin
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-800 mb-4">
              Thông tin liên hệ
            </h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li>
                <strong>Hotline:</strong>{" "}
                <a
                  href="tel:0962651808"
                  className="text-emerald-600 hover:underline"
                >
                  096.265.1808
                </a>
              </li>
              <li>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:hello@fruitholic.vn"
                  className="hover:text-emerald-600 transition"
                >
                  hello@fruitholic.vn
                </a>
              </li>
              <li>
                <strong>Địa chỉ:</strong> Số 11 ngõ An Trạch 1, Quốc Tử Giám,
                Đống Đa, Hà Nội
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} Fruitholic. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
