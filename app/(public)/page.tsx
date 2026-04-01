import Link from "next/link";

export const metadata = {
  title: "Fruitholic - Trái Cây Tươi Ngon Mỗi Ngày",
  description: "Thức uống trái cây tươi ngon 100%, bổ dưỡng, giải nhiệt.",
};

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      <section className="relative h-[600px] w-full bg-emerald-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 to-emerald-700/80 z-10" />
        <img
          src="https://images.unsplash.com/photo-1622345095034-e4c1f9b3b878"
          alt="Fresh Fruits"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />

        <div className="relative z-20 h-full container mx-auto px-4 flex flex-col justify-center items-start text-white max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Năng Lượng Tươi Mới
            <br />
            Mỗi Ngày
          </h1>
          <p className="text-lg md:text-xl text-emerald-50 mb-8 max-w-lg">
            Fruitholic mang đến trọn vẹn hương vị tự nhiên với 100% trái cây
            tươi, không chất bảo quản. Thơm ngon, mát mẻ, đầy vitamin!
          </p>
          <div className="flex gap-4">
            <Link
              href="/menu"
              className="bg-white text-emerald-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-emerald-50 transition-colors shadow-lg"
            >
              Đặt Hàng Ngay
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Món Nổi Bật
          </h2>
          <Link
            href="/menu"
            className="text-emerald-600 font-medium hover:underline"
          >
            Xem tất cả &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div className="col-span-full py-24 text-center text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <i>
              Danh sách sản phẩm sẽ được tự động cập nhật từ hệ thống
              Supabase...
            </i>
          </div>
        </div>
      </section>
    </div>
  );
}
