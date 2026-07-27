"use client";

import { useEffect, useState } from "react";
import { FaChartPie, FaBoxOpen, FaCartShopping, FaUsers } from "react-icons/fa6";
import { getApiBaseUrl } from "@/features/auth/utils";
import { getFirebaseAuth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

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
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) return;

      try {
        const apiBaseUrl = getApiBaseUrl();
        const token = await firebaseUser.getIdToken();
        const headers: any = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const [productsRes, ordersRes, usersRes] = await Promise.all([
          fetch(`${apiBaseUrl}/products`),
          fetch(`${apiBaseUrl}/orders/all?limit=1000`, { headers }),
          fetch(`${apiBaseUrl}/users`, { headers })
        ]);

        if (productsRes.ok && ordersRes.ok && usersRes.ok) {
          const products = await productsRes.json();
          const ordersResult = await ordersRes.json();
          const users = await usersRes.json();

          const orderList = ordersResult && typeof ordersResult === "object" && Array.isArray(ordersResult.orders)
            ? (ordersResult.orders as OrderItem[])
            : [];
          const totalOrdersCount = ordersResult && typeof ordersResult === "object" && typeof ordersResult.totalCount === "number"
            ? ordersResult.totalCount
            : orderList.length;

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

          // Sort and slice top selling products
          const sortedProducts = Array.isArray(products)
            ? [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 5)
            : [];
          setTopProducts(sortedProducts);

          // Sort and slice recent orders
          const sortedOrders = [...orderList]
            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
            .slice(0, 5);
          setRecentOrders(sortedOrders);

          setStats({
            products: products.length || 0,
            orders: totalOrdersCount,
            users: users.length || 0,
          });
          setStatusStats(statusRows);
          setMonthlyStats(recentMonths.map((month) => monthlyMap[month.key]));
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      }
    });

    return () => unsubscribe();
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

      {/* SECTION: Recent Orders & Top Selling Products */}
      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        
        {/* Recent Orders Card */}
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Đơn hàng mới nhất</h2>
            <p className="text-sm text-slate-500">Các đơn hàng vừa được đặt gần đây</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Khách hàng</th>
                  <th className="pb-3 font-semibold">Thời gian</th>
                  <th className="pb-3 font-semibold">Tổng tiền</th>
                  <th className="pb-3 font-semibold text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentOrders.map((order, idx) => {
                  const meta = STATUS_META[order.status?.toLowerCase() || "pending"] || { label: order.status || "Chờ xử lý", color: "bg-amber-500" };
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 font-semibold text-slate-800">
                        {order.shippingAddress?.fullName || "Khách vãng lai"}
                      </td>
                      <td className="py-3 text-slate-500 font-medium">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        }) : "-"}
                      </td>
                      <td className="py-3 font-bold text-slate-800">
                        {formatMoney(order.total || 0)}
                      </td>
                      <td className="py-3 text-center">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white ${meta.color}`}>
                          {meta.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {recentOrders.length === 0 && (
            <p className="text-center text-sm text-slate-400 py-6 border border-dashed border-slate-200 rounded-xl">
              Chưa có đơn hàng nào.
            </p>
          )}
        </section>

        {/* Top Products Card */}
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Sản phẩm bán chạy</h2>
            <p className="text-sm text-slate-500">Top 5 sản phẩm có lượng tiêu thụ cao nhất</p>
          </div>
          
          <div className="space-y-3.5">
            {topProducts.map((product, idx) => (
              <div key={idx} className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                {product.imageUrls?.[0] ? (
                  <img
                    src={product.imageUrls[0]}
                    alt={product.name}
                    className="h-10 w-10 object-cover rounded-lg border border-slate-100 bg-slate-50 shrink-0"
                  />
                ) : (
                  <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 text-slate-400">
                    👟
                  </div>
                )}
                <div className="min-w-0 flex-1 space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-800 truncate">{product.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{product.brand} • {product.category}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-emerald-600">Đã bán {product.sold || 0}</p>
                  <p className="text-[10px] text-slate-400 font-bold">{product.price}</p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-6 border border-dashed border-slate-200 rounded-xl">
                Chưa có sản phẩm nào.
              </p>
            )}
          </div>
        </section>
        
      </div>
    </div>
  );
}
