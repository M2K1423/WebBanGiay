"use client";

import { useEffect, useState } from "react";
import { FaEye, FaPenToSquare } from "react-icons/fa6";

const STATUS_MAP: Record<string, { label: string, color: string }> = {
  "pending": { label: "Chờ xử lý", color: "bg-amber-100 text-amber-700" },
  "processing": { label: "Đang chuẩn bị", color: "bg-blue-100 text-blue-700" },
  "shipped": { label: "Đang giao", color: "bg-indigo-100 text-indigo-700" },
  "delivered": { label: "Đã giao", color: "bg-emerald-100 text-emerald-700" },
  "cancelled": { label: "Đã hủy", color: "bg-rose-100 text-rose-700" },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    fetch("http://localhost:3001/orders/all")
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:3001/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchOrders();
      else alert("Cập nhật thất bại");
    } catch (e) {
      alert("Lỗi khi cập nhật");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Quản lý Đơn Hàng</h1>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Mã Đơn</th>
                <th className="px-6 py-4 font-medium">Khách hàng</th>
                <th className="px-6 py-4 font-medium">Sản phẩm</th>
                <th className="px-6 py-4 font-medium">Tổng tiền</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Đang tải...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Chưa có đơn hàng nào</td>
                </tr>
              ) : (
                orders.map(order => {
                  const statusConf = STATUS_MAP[order.status || "pending"] || STATUS_MAP["pending"];
                  return (
                    <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        #{order._id.substring(order._id.length - 6).toUpperCase()}
                        <div className="mt-1 text-[10px] text-slate-400 font-normal">
                          {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{order.shippingAddress?.fullName}</div>
                        <div className="text-xs text-slate-500">{order.shippingAddress?.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex -space-x-2">
                          {order.items?.map((item: any, i: number) => (
                            <img 
                              key={i} 
                              src={item.image || "/placeholder.jpg"} 
                              className="h-8 w-8 rounded-full border-2 border-white object-cover bg-slate-100" 
                              title={item.name} 
                            />
                          ))}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">{order.items?.length || 0} sản phẩm</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-rose-600">
                        {order.total?.toLocaleString("vi-VN")}đ
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={order.status || "pending"}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold outline-none border-none cursor-pointer appearance-none ${statusConf.color}`}
                        >
                          <option value="pending">Chờ xử lý</option>
                          <option value="processing">Đang chuẩn bị</option>
                          <option value="shipped">Đang giao</option>
                          <option value="delivered">Đã giao</option>
                          <option value="cancelled">Đã hủy</option>
                        </select>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
