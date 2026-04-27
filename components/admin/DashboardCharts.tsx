"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type RevenueDataPoint = {
  day: string;
  revenue: number;
};

type StatusDataPoint = {
  name: string;
  value: number;
  color: string;
};

type TopProductPoint = {
  name: string;
  revenue: number;
  qty: number;
};

const formatCurrency = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toString();
};

export function RevenueChart({ data }: { data: RevenueDataPoint[] }) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-[1.5rem] shadow-[0_20px_40px_rgba(43,48,45,0.06)] min-w-0">
      <h3 className="text-lg font-bold font-headline mb-1">Doanh thu 30 ngày</h3>
      <p className="text-xs text-on-surface-variant mb-4">
        Tổng doanh thu theo ngày (đơn đã thanh toán)
      </p>
      <div className="h-[240px] min-w-0">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#006b1b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#006b1b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#aaaeab30" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "#737875" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fontSize: 11, fill: "#737875" }}
                axisLine={false}
                tickLine={false}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "1rem",
                  border: "none",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  fontSize: 12,
                  fontWeight: 600,
                }}
                formatter={(value: any) => [
                  new Intl.NumberFormat("vi-VN").format(value) + "₫",
                  "Doanh thu",
                ]}
                labelStyle={{ fontWeight: 700, marginBottom: 4 }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#006b1b"
                strokeWidth={2.5}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-on-surface-variant/50 text-sm">
            Chưa có dữ liệu doanh thu
          </div>
        )}
      </div>
    </div>
  );
}

export function OrdersByStatusChart({ data }: { data: StatusDataPoint[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-surface-container-lowest p-6 rounded-[1.5rem] shadow-[0_20px_40px_rgba(43,48,45,0.06)] min-w-0">
      <h3 className="text-lg font-bold font-headline mb-1">Đơn theo trạng thái</h3>
      <p className="text-xs text-on-surface-variant mb-4">
        Phân bổ trạng thái đơn hàng
      </p>
      <div className="h-auto sm:h-[240px] flex flex-col sm:flex-row items-center gap-4">
        {total > 0 ? (
          <>
            <div className="w-full sm:w-1/2 h-[200px] sm:h-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "0.75rem",
                      border: "none",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                    formatter={(value: any, name: any) => [value, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full sm:w-1/2 flex flex-wrap sm:flex-col gap-2 sm:gap-0 sm:space-y-2 justify-center sm:justify-start">
              {data.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-sm w-auto sm:w-full">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="text-on-surface-variant flex-1 min-w-[80px] sm:min-w-0">{d.name}</span>
                  <span className="font-bold">{d.value}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="w-full h-[200px] sm:h-full flex items-center justify-center text-on-surface-variant/50 text-sm">
            Chưa có dữ liệu
          </div>
        )}
      </div>
    </div>
  );
}

export function TopProductsChart({ data }: { data: TopProductPoint[] }) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-[1.5rem] shadow-[0_20px_40px_rgba(43,48,45,0.06)] min-w-0">
      <h3 className="text-lg font-bold font-headline mb-1">Sản phẩm bán chạy</h3>
      <p className="text-xs text-on-surface-variant mb-4">
        Top 8 sản phẩm theo doanh thu (30 ngày)
      </p>
      <div className="h-[280px] min-w-0">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#aaaeab20" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={formatCurrency}
                tick={{ fontSize: 11, fill: "#737875" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "#585d5a" }}
                axisLine={false}
                tickLine={false}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "0.75rem",
                  border: "none",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  fontSize: 12,
                  fontWeight: 600,
                }}
                formatter={(value: any, name: any) => {
                  if (name === "revenue")
                    return [new Intl.NumberFormat("vi-VN").format(value) + "₫", "Doanh thu"];
                  return [value, "Số lượng"];
                }}
              />
              <Bar dataKey="revenue" fill="#006b1b" radius={[0, 6, 6, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-on-surface-variant/50 text-sm">
            Chưa có dữ liệu sản phẩm
          </div>
        )}
      </div>
    </div>
  );
}
