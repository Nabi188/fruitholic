import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroBanner() {
  return (
    <section className="sm:px-8 px-4 mb-8 w-full mx-auto">
      <div className="relative rounded-2xl overflow-hidden bg-surface-container-low min-h-[280px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1665589048355-579bc80169d1?q=80&w=4283&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Fruitholic"
            className="w-full h-full object-cover opacity-100 mix-blend-multiply transition-transform duration-1000 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-container-low via-surface-container-low/30 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-2xl px-4 sm:px-12 py-12 ml-4">
          <span className="inline-block bg-secondary text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
            Trái cây tươi cắt sẵn
          </span>
          <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-primary-dim leading-[1.1] mb-6 tracking-tighter">
            Sự tươi mát <br />{" "}
            <span className="text-secondary">Thuần Khiết</span> Từ Thiên Nhiên.
          </h1>
          <p className="text-on-surface-variant mb-8 text-lg font-body max-w-md">
            100% trái cây tươi ngon mỗi ngày.
          </p>
          <div className="flex gap-4">
            <Link
              href="/products"
              className="bg-primary hover:bg-primary-dim text-white px-8 py-3.5 rounded-full font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group text-sm uppercase tracking-wider"
            >
              Mua Ngay Tại Đây
              <ArrowRight
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                strokeWidth={3}
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
