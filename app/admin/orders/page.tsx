"use client";

import { useEffect, useMemo, useState } from "react";
import { FaEye, FaMagnifyingGlass, FaXmark } from "react-icons/fa6";
import { getApiBaseUrl } from "@/features/auth/utils";

type OrderItem = {
  productId: string;
  name: string;
  brand: string;
  price: string;
  oldPrice?: string;
  image?: string;
  size: string;
  color?: string;
  quantity: number;
};

type Order = {
  _id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status?: string;
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    email?: string;
    address?: string;
    note?: string;
  };
  paymentMethod?: string;
  createdAt?: string;
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "Chờ xử lý", color: "bg-amber-100 text-amber-700" },
  processing: { label: "Đang chuẩn bị", color: "bg-blue-100 text-blue-700" },
  shipped: { label: "Đang giao", color: "bg-indigo-100 text-indigo-700" },
  delivered: { label: "Đã giao", color: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Đã hủy", color: "bg-rose-100 text-rose-700" }
};

const STATUS_OPTIONS = ["all", "pending", "processing", "shipped", "delivered", "cancelled"] as const;

function formatOrderId(orderId: string) {
  return `#${orderId.slice(-6).toUpperCase()}`;
}

function formatCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_OPTIONS)[number]>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const apiBaseUrl = getApiBaseUrl();

  const fetchOrders = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/orders/all`);
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchOrders();
  }, []);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((order) => (order.status ?? "pending") === "pending").length;
    const shippingOrders = orders.filter((order) => ["processing", "shipped"].includes(order.status ?? "pending")).length;
    const deliveredOrders = orders.filter((order) => (order.status ?? "pending") === "delivered").length;

    return {
      totalOrders,
      pendingOrders,
      shippingOrders,
      deliveredOrders,
      revenue: orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0)
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const currentStatus = order.status ?? "pending";

      if (statusFilter !== "all" && currentStatus !== statusFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = [
        order._id,
        order.userId,
        order.shippingAddress?.fullName,
        order.shippingAddress?.phone,
        order.shippingAddress?.email,
        order.shippingAddress?.address,
        order.paymentMethod,
        ...((order.items ?? []).map((item) => [item.name, item.brand, item.size, item.color].filter(Boolean).join(" ")))
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [orders, searchTerm, statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setSavingOrderId(orderId);

    try {
      const response = await fetch(`${apiBaseUrl}/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        alert("Cập nhật thất bại");
        return;
      }

      await fetchOrders();

      if (selectedOrder?._id === orderId) {
        setSelectedOrder((current) => (current ? { ...current, status: newStatus } : current));
      }
    } catch {
      alert("Lỗi khi cập nhật");
    } finally {
      setSavingOrderId(null);
    }
  };

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
  };

  const closeOrderDetail = () => {
    setSelectedOrder(null);
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Đơn Hàng</h1>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Tổng đơn</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.totalOrders}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Chờ xử lý</p>
            <p className="mt-2 text-2xl font-bold text-amber-600">{stats.pendingOrders}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Đang vận chuyển</p>
            <p className="mt-2 text-2xl font-bold text-blue-600">{stats.shippingOrders}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Doanh thu tạm tính</p>
            <p className="mt-2 text-2xl font-bold text-rose-600">{formatCurrency(stats.revenue)}</p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <FaMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tìm theo mã đơn, khách hàng, số điện thoại..."
            className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#0d3a6b]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((status) => {
            const isActive = statusFilter === status;
            const label = status === "all" ? "Tất cả" : STATUS_MAP[status].label;

            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#0d3a6b] text-white shadow-lg shadow-[#0d3a6b]/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Mã đơn</th>
                <th className="px-6 py-4 font-medium">Khách hàng</th>
                <th className="px-6 py-4 font-medium">Sản phẩm</th>
                <th className="px-6 py-4 font-medium">Tổng tiền</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Đang tải...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Không có đơn hàng phù hợp
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const currentStatus = order.status ?? "pending";
                  const statusConf = STATUS_MAP[currentStatus] || STATUS_MAP.pending;

                  return (
                    <tr key={order._id} className="transition-colors hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {formatOrderId(order._id)}
                        <div className="mt-1 text-[10px] font-normal text-slate-400">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{order.shippingAddress?.fullName ?? "Khách lẻ"}</div>
                        <div className="text-xs text-slate-500">{order.shippingAddress?.phone ?? order.userId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex -space-x-2">
                          {order.items?.slice(0, 4).map((item, index) => (
                            <img
                              key={`${order._id}-${index}`}
                              src={item.image || "/placeholder.jpg"}
                              alt={item.name}
                              className="h-8 w-8 rounded-full border-2 border-white object-cover bg-slate-100"
                            />
                          ))}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">{order.items?.length || 0} sản phẩm</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-rose-600">{formatCurrency(Number(order.total) || 0)}</td>
                      <td className="px-6 py-4">
                        <select
                          value={currentStatus}
                          onChange={(event) => void handleStatusChange(order._id, event.target.value)}
                          disabled={savingOrderId === order._id}
                          className={`cursor-pointer rounded-full border-none px-3 py-2 text-xs font-semibold outline-none appearance-none ${statusConf.color} disabled:cursor-not-allowed disabled:opacity-70`}
                        >
                          <option value="pending">Chờ xử lý</option>
                          <option value="processing">Đang chuẩn bị</option>
                          <option value="shipped">Đang giao</option>
                          <option value="delivered">Đã giao</option>
                          <option value="cancelled">Đã hủy</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => openOrderDetail(order)}
                          className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                        >
                          <FaEye /> Xem
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Chi tiết đơn hàng</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">{formatOrderId(selectedOrder._id)}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString("vi-VN") : "-"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeOrderDetail}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Đóng"
              >
                <FaXmark />
              </button>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_1fr]">
              <div className="space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-bold text-slate-900">Sản phẩm trong đơn</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_MAP[selectedOrder.status ?? "pending"]?.color ?? STATUS_MAP.pending.color}`}>
                      {STATUS_MAP[selectedOrder.status ?? "pending"]?.label ?? STATUS_MAP.pending.label}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={`${selectedOrder._id}-${index}`} className="flex items-center gap-4 rounded-2xl bg-white p-3 shadow-sm">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                          <img
                            src={item.image || "/placeholder.jpg"}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-slate-900">{item.name}</p>
                          <p className="text-sm text-slate-500">{item.brand}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            Size {item.size}
                            {item.color ? ` • ${item.color}` : ""}
                            {item.quantity ? ` • SL ${item.quantity}` : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-rose-600">{item.price}</p>
                          {item.oldPrice ? <p className="text-xs text-slate-400 line-through">{item.oldPrice}</p> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 p-5">
                  <h3 className="text-base font-bold text-slate-900">Địa chỉ giao hàng</h3>
                  <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Người nhận</p>
                      <p className="mt-1 font-semibold text-slate-900">{selectedOrder.shippingAddress?.fullName ?? "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Điện thoại</p>
                      <p className="mt-1 font-semibold text-slate-900">{selectedOrder.shippingAddress?.phone ?? "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Email</p>
                      <p className="mt-1 font-semibold text-slate-900 break-words">{selectedOrder.shippingAddress?.email ?? "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Thanh toán</p>
                      <p className="mt-1 font-semibold text-slate-900">{selectedOrder.paymentMethod ?? "-"}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Địa chỉ</p>
                      <p className="mt-1 font-semibold text-slate-900">{selectedOrder.shippingAddress?.address ?? "-"}</p>
                    </div>
                    {selectedOrder.shippingAddress?.note ? (
                      <div className="sm:col-span-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Ghi chú</p>
                        <p className="mt-1 font-semibold text-slate-900">{selectedOrder.shippingAddress.note}</p>
                      </div>
                    ) : null}
                  </div>
                </section>
              </div>

              <aside className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-base font-bold text-slate-900">Tóm tắt</h3>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Mã đơn</span>
                      <span className="font-semibold text-slate-900">{formatOrderId(selectedOrder._id)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Số sản phẩm</span>
                      <span className="font-semibold text-slate-900">{selectedOrder.items?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tổng tiền</span>
                      <span className="font-semibold text-rose-600">{formatCurrency(Number(selectedOrder.total) || 0)}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <h3 className="text-base font-bold text-slate-900">Cập nhật trạng thái</h3>
                  <div className="mt-4 space-y-2">
                    {Object.entries(STATUS_MAP).map(([status, config]) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => void handleStatusChange(selectedOrder._id, status)}
                        disabled={(selectedOrder.status ?? "pending") === status || savingOrderId === selectedOrder._id}
                        className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                          (selectedOrder.status ?? "pending") === status
                            ? `${config.color} cursor-default`
                            : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                        } disabled:opacity-70`}
                      >
                        <span>{config.label}</span>
                        <span className="text-xs uppercase tracking-[0.18em]">{status}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
