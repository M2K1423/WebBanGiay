"use client";

import { useEffect, useState } from "react";
import { FaChartPie, FaBoxOpen, FaCartShopping, FaUsers } from "react-icons/fa6";
import { getApiBaseUrl } from "@/features/auth/utils";

type OrderItem = {
  status?: string;
  total?: number;
  createdAt?: string;
};

type StatusStat = {
  key: string;
  label: string;
  count: number;
  color: string;
};

type MonthlyStat = {
  label: string;
  count: number;
  revenue: number;
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending: { label: "Chờ xử lý", color: "bg-amber-500" },
  processing: { label: "Đang xử lý", color: "bg-sky-500" },
  shipped: { label: "Đang giao", color: "bg-violet-500" },
  delivered: { label: "Đã giao", color: "bg-emerald-500" },
  cancelled: { label: "Đã hủy", color: "bg-rose-500" }
};

function formatMoney(value: number) {
  return value.toLocaleString("vi-VN") + "đ";
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getRecentMonths(monthCount: number) {
  const now = new Date();
  const months: { key: string; label: string }[] = [];

  for (let offset = monthCount - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    months.push({
      key: getMonthKey(date),
      label: date.toLocaleDateString("vi-VN", { month: "short" })
    });
  }

  return months;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
  });
  const [statusStats, setStatusStats] = useState<StatusStat[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  useEffect(() => {
    // In a real app, you would fetch these from a /api/admin/stats endpoint
    // For now, we fetch them individually
    const apiBaseUrl = getApiBaseUrl();

    Promise.all([
      fetch(`${apiBaseUrl}/products`).then(res => res.json()),
      fetch(`${apiBaseUrl}/orders/all`).then(res => res.json()),
      fetch(`${apiBaseUrl}/users`).then(res => res.json()),
    ])
      .then(([products, orders, users]) => {
        const orderList = Array.isArray(orders) ? (orders as OrderItem[]) : [];
        const recentMonths = getRecentMonths(6);

        const statusCounts = orderList.reduce<Record<string, number>>((acc, order) => {
          const key = (order.status ?? "pending").toLowerCase();
          acc[key] = (acc[key] ?? 0) + 1;
          return acc;
        }, {});

        const monthlyMap = recentMonths.reduce<Record<string, MonthlyStat>>((acc, month) => {
          acc[month.key] = { label: month.label, count: 0, revenue: 0 };
          return acc;
        }, {});

        orderList.forEach((order) => {
          if (!order.createdAt) {
            return;
          }

          const createdAt = new Date(order.createdAt);
          const key = getMonthKey(createdAt);
          const current = monthlyMap[key];

          if (current) {
            current.count += 1;
            current.revenue += Number(order.total ?? 0);
          }
        });

        const statusRows = Object.entries(STATUS_META).map(([key, meta]) => ({
          key,
          label: meta.label,
          count: statusCounts[key] ?? 0,
          color: meta.color
        }));

        setStats({
          products: products.length || 0,
          orders: orders.length || 0,
          users: users.length || 0,
        });
        setStatusStats(statusRows);
        setMonthlyStats(recentMonths.map((month) => monthlyMap[month.key]));
      })
      .catch(console.error);
  }, []);

  const totalRevenue = monthlyStats.reduce((s, m) => s + (m.revenue || 0), 0);

  const STAT_CARDS = [
    { title: "Tổng Sản Phẩm", value: stats.products, icon: FaBoxOpen, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Tổng Đơn Hàng", value: stats.orders, icon: FaCartShopping, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Khách Hàng", value: stats.users, icon: FaUsers, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Doanh Thu Ước Tính", value: formatMoney(totalRevenue), icon: FaChartPie, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  // Prepare line chart geometry
  const lineChart = (() => {
    const w = 600;
    const h = 140;
    const padding = 36;
    const n = Math.max(monthlyStats.length, 1);
    const points = monthlyStats.map((m, i) => {
      const x = padding + (i * (w - padding * 2)) / Math.max(n - 1, 1);
      return { x, revenue: m.revenue, label: m.label };
    });

    const maxRev = Math.max(...monthlyStats.map((m) => m.revenue), 1);

    const plotted = points.map((p) => ({
      x: p.x,
      y: h - padding - (p.revenue / maxRev) * (h - padding * 2),
      revenue: p.revenue,
      label: p.label,
    }));

    const path = plotted.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
    const areaPath = `${path} L ${w - padding} ${h - padding} L ${padding} ${h - padding} Z`;

    return { w, h, padding, plotted, path, areaPath };
  })();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Tổng quan</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((card, idx) => (
          <div key={idx} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg} ${card.color}`}>
                <card.icon className="text-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Biểu đồ đơn hàng 6 tháng gần nhất</h2>
              <p className="text-sm text-slate-500">Số đơn và doanh thu theo từng tháng</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Line chart: revenue over months */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-700 mb-2">Doanh thu (6 tháng)</h3>
              <div className="w-full overflow-x-auto">
                <svg viewBox={`0 0 ${lineChart.w} ${lineChart.h}`} className="w-full h-36">
                  <defs>
                    <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#0d3a6b" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#0d3a6b" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>

                  {lineChart.plotted.length > 0 && (
                    <>
                      <path d={lineChart.areaPath} fill="url(#g)" stroke="none" />
                      <path d={lineChart.path} fill="none" stroke="#0d3a6b" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                      {lineChart.plotted.map((p, idx) => (
                        <circle
                          key={idx}
                          cx={p.x}
                          cy={p.y}
                          r={4}
                          fill="#0d3a6b"
                          onMouseEnter={() => setHoveredPoint(idx)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      ))}

                      {/* month labels */}
                      {lineChart.plotted.map((p, idx) => (
                        <text key={`t-${idx}`} x={p.x} y={lineChart.h - 6} fontSize={10} textAnchor="middle" fill="#64748b">
                          {p.label}
                        </text>
                      ))}

                      {/* tooltip */}
                      {hoveredPoint !== null && lineChart.plotted[hoveredPoint] && (() => {
                        const p = lineChart.plotted[hoveredPoint];
                        const tx = Math.max(lineChart.padding + 36, Math.min(p.x, lineChart.w - lineChart.padding - 36));
                        const ty = p.y - 12;
                        return (
                          <g>
                            <rect x={tx - 42} y={ty - 28} rx={6} width={84} height={24} fill="#0d3a6b" />
                            <text x={tx} y={ty - 12} fontSize={12} textAnchor="middle" fill="#fff">
                              {formatMoney(p.revenue)}
                            </text>
                          </g>
                        );
                      })()}
                    </>
                  )}
                </svg>
              </div>
            </div>
            {monthlyStats.map((month) => {
              const peak = Math.max(...monthlyStats.map((item) => item.count), 1);
              const width = Math.max((month.count / peak) * 100, month.count > 0 ? 10 : 0);

              return (
                <div key={month.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{month.label}</span>
                    <span className="text-slate-500">{month.count} đơn • {formatMoney(month.revenue)}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#0d3a6b] to-sky-500 transition-all"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {monthlyStats.every((item) => item.count === 0) && (
              <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                Chưa có đơn hàng trong 6 tháng gần nhất.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Phân bố trạng thái đơn hàng</h2>
            <p className="text-sm text-slate-500">Theo dữ liệu từ toàn bộ đơn hàng</p>
          </div>

          <div className="space-y-4">
            {statusStats.map((status) => {
              const total = Math.max(stats.orders, 1);
              const percent = Math.round((status.count / total) * 100);

              return (
                <div key={status.key} className="rounded-2xl border border-slate-100 p-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{status.label}</span>
                    <span className="text-slate-500">{status.count} đơn • {percent}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${status.color} transition-all`}
                      style={{ width: `${Math.max(percent, status.count > 0 ? 6 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {statusStats.every((item) => item.count === 0) && (
              <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                Chưa có đơn hàng để thống kê trạng thái.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
