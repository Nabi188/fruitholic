import Link from "next/link";
import { ArrowRight, Leaf, Droplets, Package } from "lucide-react";

export const metadata = {
  title: "Về chúng tôi | Fruitholic",
  description:
    "Câu chuyện đằng sau Fruitholic — sứ mệnh mang năng lượng thuần khiết từ thiên nhiên đến mỗi gia đình Việt.",
};

export default function AboutPage() {
  return (
    <main className="overflow-x-hidden">
      {/* ── Hero Section: Editorial Asymmetry ── */}
      <section className="px-6 lg:px-12 pt-8 lg:pt-16 pb-16 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div>
            <h1 className="font-headline font-extrabold text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tighter text-on-surface mb-8">
              Năng Lượng <br />
              <span className="text-primary italic">Thuần Khiết.</span>
            </h1>
            <p className="text-on-surface-variant leading-relaxed text-lg md:text-xl max-w-lg font-body">
              Chúng tôi tin rằng sức khỏe không nên là gánh nặng. Nó phải là
              một cuộc tôn vinh sống động, rực rỡ nhất của những mùa quả tốt
              nhất từ thiên nhiên.
            </p>
            <p className="mt-6 text-on-surface-variant/70 leading-relaxed font-body">
              Sứ mệnh của Fruitholic rất đơn giản: Đóng chai năng lượng thô sơ
              nhất của đất mẹ — và mang đến tận tay bạn mỗi ngày.
            </p>
          </div>
          <div className="relative">
            <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl relative">
              <img
                alt="Fresh vibrant fruits"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyY49x7OaDZTbnUdMvZJKZ3ikW4BB6tl-Jn-fo5BLBqk3Nm-kVgcesa8IRHukzNnmu3Gs6A4X6YLp1bMn2XzB9HzgqQDSRUOrp3KNJD_wsDcXjA2WC-oaqOeQIf_CcqpSxDE304AsgOpWO65alOCMtdM0VlpgfBIllI0BfEGFs0voCMGkPTIBeXnXqHSNZ4eu5HwjbCEyIS1MUHpWRfQPclCgrg6vgSBWE5a_lkWyJV2aXiz1MBrYuXyzqwoifmpI-6OSlt4yPBgc"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <p className="text-white font-medium text-lg leading-snug">
                  Mỗi chai nước ép là một lời hứa từ thiên nhiên.
                </p>
              </div>
            </div>
            {/* Decorative element */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary-container/40 rounded-full blur-2xl -z-10" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-secondary-container/30 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </section>

      {/* ── Process Section: The 3-Step Journey ── */}
      <section className="px-6 lg:px-12 py-20 max-w-[1400px] mx-auto">
        <div className="flex items-end justify-between mb-16">
          <h2 className="font-headline font-bold text-4xl md:text-5xl tracking-tight text-on-surface">
            Quy trình <br className="md:hidden" />
            <span className="text-primary">Sáng Tạo.</span>
          </h2>
          <div className="hidden md:block h-[2px] w-32 bg-secondary/30 mb-3" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {/* Step 1 */}
          <div className="relative group">
            <div className="absolute -left-4 -top-8 text-[8rem] font-black text-surface-container font-headline leading-none -z-10 opacity-40 select-none">
              1
            </div>
            <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 shadow-lg group-hover:shadow-xl transition-shadow rotate-1 group-hover:rotate-0 duration-500">
              <img
                alt="Ethical Sourcing"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7a1jP4mAQ-iHZY3RmW89_UiYWbOh7cp33xjx9cYzh6bobOM_ygzYNfBTUSSiiKLixrJLID7sUW5zY36eWhhzyB5cxaze18zkE4IjZkiInhOCOySsmsyZEKyKWtKpWM8K6DR-VFgfrQZDb4OkIQALybytsoqruLd4FxwRJ9YC70puIkBJvC_HbW0QAqYhv0bgCJh6CAntgRzk_CggIyYd4uwjyqSpqQ4QmXLjseHnyEJiHixiRdAWhxMcQ6HU0xf_e_-KbsODYjhg"
              />
            </div>
            <h3 className="font-headline font-bold text-xl mb-3 text-primary">
              Nguồn Gốc Thuần Khiết
            </h3>
            <p className="text-on-surface-variant font-body leading-relaxed">
              Chúng tôi hợp tác trực tiếp với các nông trại hữu cơ, nơi đất
              được chăm sóc với sự tôn trọng như chăm sóc chính cơ thể mình.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative group md:mt-12">
            <div className="absolute -right-4 -top-8 text-[8rem] font-black text-surface-container font-headline leading-none -z-10 opacity-40 select-none">
              2
            </div>
            <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 shadow-lg group-hover:shadow-xl transition-shadow -rotate-1 group-hover:rotate-0 duration-500">
              <img
                alt="Cold Press Tech"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0UlWiR8Iau8iE5V6l8BcXG0MoRbJMm11rc63SJamJfxMN00frK69fV8DFYVTMgthfI9tf0u2mhrmm3gT2m0RrgyaVZLr1nXu4HOPqbkEZU6lGbf3rzcw2yojD96nrHSwoZ8ybVIdd9zH1w3zGa0fxPUcqIeWBzOFZI-YKdtLZgqot8PZJau599w3Zxwb2s2SBJfitMyn0M-MJMppaf0GTqQicuqGeeGsqk3Tc2bcm5EC8F7D7ZghlMtJUcIHDN1gIqWJXZQjm9KE"
              />
            </div>
            <h3 className="font-headline font-bold text-xl mb-3 text-secondary">
              Ép Lạnh Tinh Tế
            </h3>
            <p className="text-on-surface-variant font-body leading-relaxed">
              Không nhiệt. Không tiệt trùng. Chỉ dùng áp suất thủy lực thuần
              khiết để giữ nguyên mọi enzyme và vitamin sống.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative group">
            <div className="absolute -left-4 -top-8 text-[8rem] font-black text-surface-container font-headline leading-none -z-10 opacity-40 select-none">
              3
            </div>
            <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 shadow-lg group-hover:shadow-xl transition-shadow rotate-2 group-hover:rotate-0 duration-500">
              <img
                alt="Glass Bottling"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8WqC26u2QRI6m5UwNouwknjtq2bmhvqtkCl6chYV04922-K90Yfo3WXtofxhAC5i4-Xt1MR7RHxplZJ6I6RBYVW2xRvcOCsDOpTtbtJqgHJ-M7bMmvx2nGdeK5tB9IB75PUTdVzQF4r3lTx9hQaXXroN0mPQplNrdunuVWIxmbJGwJRzRfmTGY0j7yIupZhkPYNNgy7dGPKPQslDtIm8-pEQhqf-NpeBoOOjgrN-pT3O9bm4ZJCeSdpukkLGZniGFTa8_hHwW2OU"
              />
            </div>
            <h3 className="font-headline font-bold text-xl mb-3 text-primary">
              Đóng Chai Thủy Tinh
            </h3>
            <p className="text-on-surface-variant font-body leading-relaxed">
              Không nhựa, vì hành tinh xanh. Chúng tôi đóng chai trong thủy
              tinh cao cấp để giữ trọn hương vị thuần khiết nhất.
            </p>
          </div>
        </div>
      </section>

      {/* ── Commitment Section: Tonal Layering ── */}
      <section className="bg-surface-container-low py-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center">
          <span className="inline-block px-5 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] uppercase tracking-widest font-bold mb-6">
            Cam kết
          </span>
          <h2 className="font-headline font-extrabold text-4xl md:text-5xl mb-10 text-on-surface tracking-tight">
            Không Đường Tắt.
            <br />
            Trọn Vẹn Hương Vị.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-4 text-left p-6 bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-primary/10 rounded-full shrink-0">
                <Leaf className="w-5 h-5 text-primary" />
              </div>
              <p className="font-medium text-sm">
                100% nguyên liệu hữu cơ, không thuốc trừ sâu
              </p>
            </div>
            <div className="flex items-center gap-4 text-left p-6 bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-secondary/10 rounded-full shrink-0">
                <Droplets className="w-5 h-5 text-secondary" />
              </div>
              <p className="font-medium text-sm">
                Không đường, không chất bảo quản, không phẩm màu
              </p>
            </div>
            <div className="flex items-center gap-4 text-left p-6 bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-primary/10 rounded-full shrink-0">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <p className="font-medium text-sm">
                Đóng gói bền vững, hỗ trợ tái chế chai thủy tinh
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="px-6 lg:px-12 py-20 max-w-[1400px] mx-auto text-center">
        <h3 className="font-headline font-bold text-3xl md:text-4xl mb-8 text-on-surface tracking-tight">
          Sẵn sàng cảm nhận sự khác biệt?
        </h3>
        <Link
          href="/products"
          className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-primary to-primary-dim text-white rounded-full font-headline font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
        >
          Khám Phá Bộ Sưu Tập
          <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
        </Link>
      </section>
    </main>
  );
}
