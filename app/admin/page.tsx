"use client";

import { useEffect, useState } from "react";
import { FaChartPie, FaBoxOpen, FaCartShopping, FaUsers } from "react-icons/fa6";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
  });

  useEffect(() => {
    // In a real app, you would fetch these from a /api/admin/stats endpoint
    // For now, we fetch them individually
    Promise.all([
      fetch("http://localhost:3001/products").then(res => res.json()),
      fetch("http://localhost:3001/orders/all").then(res => res.json()),
      fetch("http://localhost:3001/users").then(res => res.json()),
    ])
      .then(([products, orders, users]) => {
        setStats({
          products: products.length || 0,
          orders: orders.length || 0,
          users: users.length || 0,
        });
      })
      .catch(console.error);
  }, []);

  const STAT_CARDS = [
    { title: "Tổng Sản Phẩm", value: stats.products, icon: FaBoxOpen, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Tổng Đơn Hàng", value: stats.orders, icon: FaCartShopping, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Khách Hàng", value: stats.users, icon: FaUsers, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Doanh Thu Ước Tính", value: "---", icon: FaChartPie, color: "text-rose-600", bg: "bg-rose-50" },
  ];

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
      
      <div className="mt-8 rounded-2xl bg-white p-8 shadow-sm border border-slate-100 min-h-[400px] flex items-center justify-center">
        <p className="text-slate-400">Biểu đồ thống kê sẽ hiển thị ở đây</p>
      </div>
    </div>
  );
}
