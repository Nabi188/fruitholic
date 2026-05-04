import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Send,
  ArrowUpRight,
  Clock,
} from "lucide-react";

export const metadata = {
  title: "Liên hệ | Fruitholic",
  description:
    "Liên hệ Fruitholic — chúng tôi luôn sẵn sàng lắng nghe bạn. Hotline, email, và địa chỉ cửa hàng.",
};

export default function ContactPage() {
  return (
    <main className="px-6 lg:px-12 pt-8 lg:pt-16 pb-24 max-w-[1400px] mx-auto overflow-x-hidden">
      {/* ── Hero Section ── */}
      <section className="mb-12 lg:mb-16">
        <h1 className="font-headline font-extrabold text-4xl md:text-5xl lg:text-6xl tracking-tight text-on-surface mb-4 leading-tight">
          Kết nối với{" "}
          <span className="text-primary italic">Fruitholic.</span>
        </h1>
        <p className="text-on-surface-variant leading-relaxed text-lg max-w-xl font-body">
          Dù là đặt hàng số lượng lớn hay chỉ muốn nói lời xin chào, đội
          ngũ Fruitholic luôn sẵn sàng hỗ trợ bạn.
        </p>
      </section>

      {/* ── Bento Contact Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Card */}
        <div className="lg:col-span-2 relative h-64 lg:h-80 rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(43,48,45,0.06)]">
          <img
            alt="Map location"
            className="w-full h-full object-cover grayscale opacity-80 mix-blend-multiply"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLAu-VGZCjYSGvWnnwBumrNdeLct1uQfe6av7YADQIi6ONF4dhfnVSRdMCg6m0ArwkZHv5XU5CodiF8sGwltoForxmKrhZy-Y1VqkU2MrLmzdwPbfZ1vWIVgd0WLPMQyAQ9Jc7UeMwj33RU9CIsLJr9F-c9Py_7FPr6wbSr4vhumWfVp4XK33PRr07LI0ikvxEmJCF8hV0B5O6QrmT31xI3QKiEgp8m0ExdNol0CH7h9z34ulCdYyLxtJjnq23E9Q_UnTPQVkNWJk"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 lg:bottom-6 lg:left-6 lg:right-6 bg-white/90 backdrop-blur-md p-4 lg:p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2.5 rounded-full shrink-0">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">
                  Số 11, Ngõ An Trạch 1
                </p>
                <p className="text-xs text-on-surface-variant">
                  Quận Đống Đa, Hà Nội
                </p>
              </div>
            </div>
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-dim transition-colors"
            >
              <ArrowUpRight className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
          <div className="bg-surface-container-low p-5 lg:p-6 rounded-2xl flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow">
            <Phone className="w-7 h-7 text-secondary" />
            <div>
              <p className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1">
                Hotline
              </p>
              <Link
                href="tel:0962651808"
                className="font-bold text-sm hover:text-primary transition-colors"
              >
                096 265 1808
              </Link>
            </div>
          </div>

          <div className="bg-tertiary-container p-5 lg:p-6 rounded-2xl flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow">
            <Mail className="w-7 h-7 text-on-tertiary-container" />
            <div>
              <p className="text-xs uppercase tracking-widest font-bold text-on-tertiary-container/70 mb-1">
                Email
              </p>
              <Link
                href="mailto:hello@fruitholic.com"
                className="font-bold text-sm text-on-tertiary-container hover:opacity-80 transition-opacity"
              >
                hello@fruitholic.com
              </Link>
            </div>
          </div>

          <div className="col-span-2 lg:col-span-1 bg-surface-container-low p-5 lg:p-6 rounded-2xl flex flex-col justify-between min-h-[100px] hover:shadow-md transition-shadow">
            <Clock className="w-7 h-7 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-widest font-bold text-on-surface-variant mb-1">
                Giờ làm việc
              </p>
              <p className="font-bold text-sm">
                7:00 — 21:00 (Thứ 2 – Chủ nhật)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Contact Form ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-[0_20px_40px_rgba(43,48,45,0.06)]">
          <h2 className="font-headline text-2xl font-bold mb-6 text-on-surface">
            Gửi lời nhắn
          </h2>
          <form className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                className="w-full bg-surface-container-low border-none rounded-full px-6 py-4 focus:ring-2 focus:ring-primary text-on-surface placeholder:text-on-surface-variant/50 text-sm outline-none"
                placeholder="Họ và tên"
                type="text"
              />
              <input
                className="w-full bg-surface-container-low border-none rounded-full px-6 py-4 focus:ring-2 focus:ring-primary text-on-surface placeholder:text-on-surface-variant/50 text-sm outline-none"
                placeholder="Số điện thoại"
                type="tel"
              />
            </div>
            <input
              className="w-full bg-surface-container-low border-none rounded-full px-6 py-4 focus:ring-2 focus:ring-primary text-on-surface placeholder:text-on-surface-variant/50 text-sm outline-none"
              placeholder="Email"
              type="email"
            />
            <textarea
              className="w-full bg-surface-container-low border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary text-on-surface placeholder:text-on-surface-variant/50 resize-none text-sm outline-none"
              placeholder="Nội dung tin nhắn..."
              rows={5}
            />
            <button
              type="button"
              className="w-full bg-primary text-white font-bold py-4 rounded-full shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary-dim transition-all active:scale-95 text-sm"
            >
              <span>Gửi tin nhắn</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Social + FAQ */}
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-surface-container-highest/40 p-6 rounded-2xl">
            <p className="font-bold font-headline">Theo dõi Fruitholic</p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:shadow-md transition-shadow font-bold text-xs"
              >
                FB
              </a>
              <a
                href="#"
                className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:shadow-md transition-shadow font-bold text-xs"
              >
                IG
              </a>
              <a
                href="#"
                className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-primary shadow-sm hover:shadow-md transition-shadow font-bold text-xs"
              >
                TT
              </a>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-[0_20px_40px_rgba(43,48,45,0.06)]">
            <h3 className="font-headline font-bold text-lg mb-4">
              Câu hỏi thường gặp
            </h3>
            <div className="space-y-4">
              <div className="border-b border-outline-variant/10 pb-4">
                <p className="font-semibold text-sm text-on-surface mb-1">
                  Tôi có thể đặt hàng số lượng lớn không?
                </p>
                <p className="text-sm text-on-surface-variant">
                  Có! Liên hệ trực tiếp qua hotline hoặc form để được tư vấn
                  về giá sỉ và giao hàng.
                </p>
              </div>
              <div className="border-b border-outline-variant/10 pb-4">
                <p className="font-semibold text-sm text-on-surface mb-1">
                  Thời gian giao hàng mất bao lâu?
                </p>
                <p className="text-sm text-on-surface-variant">
                  Nội thành Hà Nội: 30-60 phút. Các khu vực khác: 2-4 giờ tùy
                  khoảng cách.
                </p>
              </div>
              <div>
                <p className="font-semibold text-sm text-on-surface mb-1">
                  Có hỗ trợ đổi trả không?
                </p>
                <p className="text-sm text-on-surface-variant">
                  Chắc chắn. Xem chi tiết tại{" "}
                  <Link
                    href="/policies/returns"
                    className="text-primary font-medium hover:underline"
                  >
                    chính sách đổi trả
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
