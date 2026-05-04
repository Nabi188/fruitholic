export function NewsletterSection() {
  return (
    <section className="px-2 pb-32 container mx-auto">
      <div className="bg-surface-container-high rounded-3xl p-4 md:p-16 relative overflow-hidden text-center shadow-sm border border-surface-container-highest">
        <div className="relative z-10 max-w-xl mx-auto">
          <h2 className="font-headline text-4xl font-extrabold text-primary-dim mb-4 tracking-tight">
            Menu mới cập nhật hàng ngày!
          </h2>
          <p className="text-on-surface-variant mb-10 text-lg">
            Đăng ký để nhận thông tin ưu đãi & cập nhật menu mới mỗi ngày.
          </p>
          <form className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Email của bạn..."
              className="flex-grow rounded-full border border-surface-container-highest bg-white px-6 py-4 focus:ring-2 focus:ring-primary outline-none focus:border-primary shadow-sm text-sm"
              required
            />
            <button
              type="button"
              className="bg-primary text-white font-headline px-8 py-4 rounded-full font-bold hover:bg-primary-dim shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
            >
              Nhận cập nhật
            </button>
          </form>
        </div>

        <div className="absolute top-0 left-0 w-64 h-64 bg-primary-container/40 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl mix-blend-multiply"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
      </div>
    </section>
  );
}
