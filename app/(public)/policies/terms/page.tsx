import React from 'react'

export const metadata = { title: 'Điều khoản dịch vụ' }

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Điều khoản dịch vụ</h1>
      <div className="prose prose-slate max-w-none">
        <p className="text-slate-600 leading-relaxed">
          Nội dung đang được cập nhật. Cảm ơn bạn đã quan tâm đến Fruitholic.
        </p>
      </div>
    </div>
  )
}
