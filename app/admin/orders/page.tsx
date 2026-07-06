"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { FaEye, FaMagnifyingGlass, FaXmark, FaFileExcel, FaPrint, FaChevronDown, FaPhone, FaCalendarDays, FaListUl, FaHourglassHalf, FaTruckFast, FaCircleDollarToSlot, FaUser, FaEnvelope, FaCreditCard, FaMapPin, FaPenToSquare } from "react-icons/fa6";
import { getApiBaseUrl } from "@/features/auth/utils";
import { getFirebaseAuth } from "@/lib/firebase";
import { getRealtimeBaseUrl, loadSocketFactory } from "@/lib/socket-client";

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
  paymentStatus?: "unpaid" | "pending" | "paid" | "failed";
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    email?: string;
    address?: string;
    note?: string;
  };
  paymentMethod?: string;
  createdAt?: string;
  statusHistory?: Array<{
    status: string;
    updatedAt: string;
    updatedBy: string;
    note?: string;
  }>;
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "Chờ xử lý", color: "bg-amber-100 text-amber-700" },
  processing: { label: "Đang chuẩn bị", color: "bg-blue-100 text-blue-700" },
  shipped: { label: "Đang giao", color: "bg-indigo-100 text-indigo-700" },
  delivered: { label: "Đã giao", color: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Đã hủy", color: "bg-rose-100 text-rose-700" }
};

const PAYMENT_STATUS_MAP: Record<string, { label: string; color: string }> = {
  unpaid: { label: "Chưa thanh toán", color: "bg-slate-50 text-slate-600 border border-slate-200/60" },
  pending: { label: "Đang thanh toán", color: "bg-amber-50 text-amber-700 border border-amber-200/60" },
  paid: { label: "Đã thanh toán", color: "bg-emerald-50 text-emerald-700 border border-emerald-200/60" },
  failed: { label: "Thanh toán thất bại", color: "bg-rose-50 text-rose-700 border border-rose-200/60" }
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
  const [confirmData, setConfirmData] = useState<{ orderId: string; status: string } | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    shippingOrders: 0,
    deliveredOrders: 0,
    revenue: 0
  });

  const apiBaseUrl = getApiBaseUrl();

  const fetchOrders = async (currentPage = page, currentSearch = searchTerm, currentStatus = statusFilter) => {
    setLoading(true);

    try {
      const auth = getFirebaseAuth();
      const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
      const headers: any = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const queryParams = new URLSearchParams({
        page: String(currentPage),
        limit: "20",
        search: currentSearch,
        status: currentStatus
      });

      const response = await fetch(`${apiBaseUrl}/orders/all?${queryParams.toString()}`, { headers });
      const data = await response.json();

      if (data && typeof data === "object" && !Array.isArray(data)) {
        setOrders(Array.isArray(data.orders) ? data.orders : []);
        setTotalPages(Number(data.totalPages) || 1);
        setTotalCount(Number(data.totalCount) || 0);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const stateRef = useRef({ page, searchTerm, statusFilter });
  useEffect(() => {
    stateRef.current = { page, searchTerm, statusFilter };
  }, [page, searchTerm, statusFilter]);

  useEffect(() => {
    void fetchOrders(1, "", "all");

    let activeSocket: any = null;
    let cancelled = false;

    void (async () => {
      try {
        const factory = await loadSocketFactory();
        if (cancelled) return;
        const socket = factory(`${getRealtimeBaseUrl()}/notifications`, {
          transports: ["websocket", "polling"]
        });
        activeSocket = socket;
        socket.on("connect", () => {
          console.log("WebSocket connected to notifications namespace");
        });
        socket.on("order.created", (newOrderNotification: any) => {
          const { page: p, searchTerm: s, statusFilter: sf } = stateRef.current;
          void fetchOrders(p, s, sf);
          
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-84.wav");
          audio.play().catch(() => {});
          
          alert(`🔔 Có đơn hàng mới! Khách hàng: ${newOrderNotification.customerName} - Số tiền: ${newOrderNotification.total.toLocaleString("vi-VN")}đ`);
        });
      } catch (err) {
        console.error("WebSocket connection error:", err);
      }
    })();

    return () => {
      cancelled = true;
      if (activeSocket) {
        activeSocket.disconnect();
      }
    };
  }, []);

  const filteredOrders = orders;

  const handleStatusChange = async (orderId: string, newStatus: string, bypassConfirm = false) => {
    if (!bypassConfirm && (newStatus === "cancelled" || newStatus === "delivered")) {
      setConfirmData({ orderId, status: newStatus });
      return;
    }

    setSavingOrderId(orderId);

    try {
      const auth = getFirebaseAuth();
      const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
      const headers: any = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const response = await fetch(`${apiBaseUrl}/orders/${orderId}/status`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        alert("Cập nhật thất bại");
        return;
      }

      const updatedOrder = await response.json();

      await fetchOrders();

      if (selectedOrder?._id === orderId) {
        setSelectedOrder(updatedOrder);
      }
    } catch {
      alert("Lỗi khi cập nhật");
    } finally {
      setSavingOrderId(null);
      setConfirmData(null);
    }
  };

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
  };

  const closeOrderDetail = () => {
    setSelectedOrder(null);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      void fetchOrders(newPage, searchTerm, statusFilter);
    }
  };

  const handlePrintInvoice = (order: Order) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Hãy cho phép mở tab mới để in hóa đơn");
      return;
    }

    const itemsHtml = (order.items || [])
      .map(
        (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name} (Size: ${item.size}${item.color ? `, Màu: ${item.color}` : ""})</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${item.price}</td>
      </tr>
    `
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Hóa đơn ${formatOrderId(order._id)}</title>
          <style>
            body { font-family: sans-serif; color: #333; margin: 20px; line-height: 1.5; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; border-bottom: 2px solid #333; padding-bottom: 5px; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background-color: #f5f5f5; padding: 8px; text-align: left; border-bottom: 2px solid #ddd; }
            .total { font-size: 1.2em; font-weight: bold; text-align: right; margin-top: 20px; color: #e11d48; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>HÓA ĐƠN BÁN HÀNG - MYSHOES</h2>
            <p>Mã đơn hàng: ${formatOrderId(order._id)}</p>
            <p>Ngày đặt: ${order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "-"}</p>
          </div>
          <div class="section">
            <div class="section-title">Thông tin giao hàng</div>
            <p><strong>Người nhận:</strong> ${order.shippingAddress?.fullName || "-"}</p>
            <p><strong>Số điện thoại:</strong> ${order.shippingAddress?.phone || "-"}</p>
            <p><strong>Địa chỉ:</strong> ${order.shippingAddress?.address || "-"}</p>
            <p><strong>Ghi chú:</strong> ${order.shippingAddress?.note || "-"}</p>
            <p><strong>Hình thức thanh toán:</strong> ${order.paymentMethod || "-"}</p>
          </div>
          <div class="section">
            <div class="section-title">Danh sách sản phẩm</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 60%">Sản phẩm</th>
                  <th style="width: 15%; text-align: center;">SL</th>
                  <th style="width: 25%; text-align: right;">Đơn giá</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>
          <div class="total">
            Tổng cộng: ${formatCurrency(order.total)}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleExportExcel = () => {
    const headers = [
      "Mã đơn hàng",
      "Ngày tạo",
      "Khách hàng",
      "Số điện thoại",
      "Email",
      "Địa chỉ",
      "Sản phẩm",
      "Tổng tiền (VND)",
      "Thanh toán",
      "Trạng thái thanh toán",
      "Trạng thái đơn hàng"
    ];

    const rows = orders.map((order) => {
      const itemsStr = (order.items || [])
        .map((item) => `${item.name} (Size: ${item.size}, SL: ${item.quantity})`)
        .join(" | ");

      return [
        formatOrderId(order._id),
        order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "-",
        order.shippingAddress?.fullName || "Khách lẻ",
        order.shippingAddress?.phone || "-",
        order.shippingAddress?.email || "-",
        order.shippingAddress?.address || "-",
        itemsStr,
        order.total,
        order.paymentMethod || "-",
        PAYMENT_STATUS_MAP[order.paymentStatus || "unpaid"]?.label || "-",
        STATUS_MAP[order.status || "pending"]?.label || "-"
      ];
    });

    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `danh_sach_don_hang_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Page Title Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Quản lý Đơn Hàng</h1>
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="mb-8 grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 w-full">
        {/* Card 1: Tổng đơn */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tổng đơn hàng</p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">{stats.totalOrders}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-slate-500">
              <FaListUl className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Card 2: Chờ xử lý */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-100 bg-amber-550/20 p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 duration-300" style={{ backgroundColor: "rgba(254, 243, 199, 0.2)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-600/80">Chờ xử lý</p>
              <p className="mt-2 text-3xl font-extrabold text-amber-600">{stats.pendingOrders}</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-amber-500">
              <FaHourglassHalf className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Card 3: Đang vận chuyển */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/20 p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 duration-300" style={{ backgroundColor: "rgba(239, 246, 255, 0.2)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600/80">Đang vận chuyển</p>
              <p className="mt-2 text-3xl font-extrabold text-blue-600">{stats.shippingOrders}</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-3 text-blue-500">
              <FaTruckFast className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Card 4: Doanh thu thực tế */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50/20 p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 duration-300" style={{ backgroundColor: "rgba(236, 253, 245, 0.2)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600/80">Doanh thu thực tế (Đã giao)</p>
              <p className="mt-2 text-2xl font-extrabold text-emerald-600 tracking-tight">{formatCurrency(stats.revenue)}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-500">
              <FaCircleDollarToSlot className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Search bar & Excel Export Actions */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <FaMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(event) => {
              const val = event.target.value;
              setSearchTerm(val);
              setPage(1);
              void fetchOrders(1, val, statusFilter);
            }}
            placeholder="Tìm theo mã đơn, khách hàng, số điện thoại..."
            className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#0d3a6b] bg-white shadow-sm"
          />
        </div>

        <button
          type="button"
          onClick={handleExportExcel}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/10 transition hover:bg-emerald-700 w-full sm:w-auto"
        >
          <FaFileExcel /> Xuất báo cáo Excel
        </button>
      </div>

      {/* Scrollable Status Filters */}
      <div className="mb-6 flex overflow-x-auto pb-2 scrollbar-none gap-2">
        {STATUS_OPTIONS.map((status) => {
          const isActive = statusFilter === status;
          const label = status === "all" ? "Tất cả" : STATUS_MAP[status].label;

          return (
            <button
              key={status}
              type="button"
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
                void fetchOrders(1, searchTerm, status);
              }}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition shrink-0 ${
                isActive
                  ? "bg-[#0d3a6b] text-white shadow-md shadow-[#0d3a6b]/20"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 border-collapse table-fixed">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="w-[13%] px-6 py-4 font-bold text-slate-700">Mã đơn</th>
                <th className="w-[18%] px-6 py-4 font-bold text-slate-700">Khách hàng</th>
                <th className="w-[15%] px-6 py-4 font-bold text-slate-700">Sản phẩm</th>
                <th className="w-[14%] px-6 py-4 font-bold text-slate-700">Tổng tiền</th>
                <th className="w-[15%] px-6 py-4 font-bold text-slate-700 text-center">Thanh toán</th>
                <th className="w-[15%] px-6 py-4 font-bold text-slate-700 text-center">Trạng thái</th>
                <th className="w-[10%] px-6 py-4 font-bold text-slate-700 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400 align-middle">
                    Đang tải...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400 align-middle">
                    Không có đơn hàng phù hợp
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const currentStatus = order.status ?? "pending";
                  const statusConf = STATUS_MAP[currentStatus] || STATUS_MAP.pending;
                  const textConfColor = statusConf.color.split(" ").find(c => c.startsWith("text-")) || "text-slate-700";

                  return (
                    <tr key={order._id} className="transition-colors hover:bg-slate-50/80">
                      <td className="px-6 py-4 align-middle font-medium">
                        <span className="inline-block px-2.5 py-1 text-xs font-bold font-mono text-[#0d3a6b] bg-slate-100 rounded-lg">
                          {formatOrderId(order._id)}
                        </span>
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                          <FaCalendarDays className="shrink-0 text-slate-300" />
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <div className="font-semibold text-slate-900 leading-tight">{order.shippingAddress?.fullName ?? "Khách lẻ"}</div>
                        <div className="mt-1 flex items-center gap-1 text-xs text-slate-500 font-medium">
                          <FaPhone className="text-slate-400 text-[10px]" />
                          <span>{order.shippingAddress?.phone ?? order.userId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {order.items?.slice(0, 4).map((item, index) => (
                            <img
                              key={`${order._id}-${index}`}
                              src={item.image || "/placeholder.jpg"}
                              alt={item.name}
                              className="h-8 w-8 rounded-full border-2 border-white object-cover bg-slate-50 shadow-sm"
                            />
                          ))}
                        </div>
                        <div className="mt-1.5 text-xs text-slate-400 font-semibold">{order.items?.length || 0} sản phẩm</div>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <span className="text-sm font-bold text-rose-600 tracking-tight">
                          {formatCurrency(Number(order.total) || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-middle text-center">
                        {(() => {
                          const pStatus = order.paymentStatus || "unpaid";
                          const conf = PAYMENT_STATUS_MAP[pStatus] || PAYMENT_STATUS_MAP.unpaid;
                          return (
                            <span className={`inline-flex items-center justify-center w-40 rounded-full px-3 py-1.5 text-xs font-bold text-center whitespace-nowrap ${conf.color}`}>
                              {conf.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 align-middle text-center">
                        <div className="relative inline-block w-40 text-left">
                          <select
                            value={currentStatus}
                            onChange={(event) => void handleStatusChange(order._id, event.target.value)}
                            disabled={savingOrderId === order._id}
                            className={`cursor-pointer w-full rounded-full border border-current bg-transparent py-1.5 pl-3.5 pr-8 text-xs font-bold outline-none appearance-none ${statusConf.color} disabled:cursor-not-allowed disabled:opacity-70`}
                          >
                            <option value="pending">Chờ xử lý</option>
                            <option value="processing">Đang chuẩn bị</option>
                            <option value="shipped">Đang giao</option>
                            <option value="delivered">Đã giao</option>
                            <option value="cancelled">Đã hủy</option>
                          </select>
                          <div className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] ${textConfColor}`}>
                            <FaChevronDown />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle text-center">
                        <button
                          type="button"
                          onClick={() => openOrderDetail(order)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0d3a6b]/5 px-3 py-1.5 text-xs font-semibold text-[#0d3a6b] transition hover:bg-[#0d3a6b]/10"
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

      {/* Pagination controls */}
      {totalPages > 1 ? (
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500 font-medium text-center sm:text-left">
            Hiển thị trang <span className="font-semibold text-slate-900">{page}</span> / <span className="font-semibold text-slate-900">{totalPages}</span> (Tổng <span className="font-semibold text-slate-900">{totalCount}</span> đơn hàng)
          </p>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
            >
              Trước
            </button>
            <div className="flex gap-1.5">
              {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
                .map((p, idx, arr) => {
                  const prev = arr[idx - 1];
                  const showEllipsis = prev && p - prev > 1;

                  return (
                    <div key={p} className="flex items-center gap-1.5">
                      {showEllipsis ? <span className="text-xs text-slate-400 font-medium">...</span> : null}
                      <button
                        type="button"
                        onClick={() => handlePageChange(p)}
                        className={`rounded-xl w-8 h-8 flex items-center justify-center text-xs font-bold transition-all ${
                          page === p
                            ? "bg-[#0d3a6b] text-white shadow-md shadow-[#0d3a6b]/20 scale-105"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        {p}
                      </button>
                    </div>
                  );
                })}
            </div>
            <button
              type="button"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
            >
              Sau
            </button>
          </div>
        </div>
      ) : null}

      {selectedOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <style dangerouslySetInnerHTML={{__html: `
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
              height: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #cbd5e1;
              border-radius: 9999px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #94a3b8;
            }
          `}} />
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl custom-scrollbar">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Chi tiết đơn hàng</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">{formatOrderId(selectedOrder._id)}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString("vi-VN") : "-"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handlePrintInvoice(selectedOrder)}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  <FaPrint /> In hóa đơn
                </button>
                <button
                  type="button"
                  onClick={closeOrderDetail}
                  className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Đóng"
                >
                  <FaXmark />
                </button>
              </div>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_1fr]">
              <div className="space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <h3 className="text-base font-extrabold text-slate-900">Sản phẩm trong đơn</h3>
                    <span className={`rounded-full px-3.5 py-1 text-xs font-bold shadow-sm ${STATUS_MAP[selectedOrder.status ?? "pending"]?.color ?? STATUS_MAP.pending.color}`}>
                      {STATUS_MAP[selectedOrder.status ?? "pending"]?.label ?? STATUS_MAP.pending.label}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={`${selectedOrder._id}-${index}`} className="flex items-center gap-4 rounded-xl border border-slate-100 p-3.5 hover:border-slate-200 transition-colors bg-white">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
                          <img
                            src={item.image || "/placeholder.jpg"}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold text-slate-900 text-sm leading-snug">{item.name}</p>
                          <p className="text-xs text-slate-400 font-semibold mt-0.5">{item.brand}</p>
                          <p className="mt-1.5 text-xs text-slate-500 font-medium">
                            Size {item.size}
                            {item.color ? ` • ${item.color}` : ""}
                            {item.quantity ? ` • SL ${item.quantity}` : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold text-rose-600 text-sm">{item.price}</p>
                          {item.oldPrice ? <p className="text-[10px] text-slate-400 line-through font-semibold mt-0.5">{item.oldPrice}</p> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-4">Thông tin giao hàng</h3>
                  <div className="mt-5 grid gap-5 text-sm sm:grid-cols-2">
                    <div className="flex gap-3">
                      <div className="mt-0.5 rounded-lg bg-slate-50 p-2 text-slate-400 h-9 w-9 flex items-center justify-center border border-slate-100">
                        <FaUser className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Người nhận</p>
                        <p className="mt-0.5 font-bold text-slate-800">{selectedOrder.shippingAddress?.fullName ?? "-"}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="mt-0.5 rounded-lg bg-slate-50 p-2 text-slate-400 h-9 w-9 flex items-center justify-center border border-slate-100">
                        <FaPhone className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Điện thoại</p>
                        <p className="mt-0.5 font-bold text-slate-800">{selectedOrder.shippingAddress?.phone ?? "-"}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="mt-0.5 rounded-lg bg-slate-50 p-2 text-slate-400 h-9 w-9 flex items-center justify-center border border-slate-100">
                        <FaEnvelope className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email</p>
                        <p className="mt-0.5 font-bold text-slate-800 break-all leading-tight">{selectedOrder.shippingAddress?.email ?? "-"}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="mt-0.5 rounded-lg bg-slate-50 p-2 text-slate-400 h-9 w-9 flex items-center justify-center border border-slate-100">
                        <FaCreditCard className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Thanh toán</p>
                        <p className="mt-0.5 font-bold text-slate-800 uppercase text-xs">{selectedOrder.paymentMethod ?? "-"}</p>
                      </div>
                    </div>

                    <div className="flex gap-3 sm:col-span-2">
                      <div className="mt-0.5 rounded-lg bg-slate-50 p-2 text-slate-400 h-9 w-9 flex items-center justify-center border border-slate-100 shrink-0">
                        <FaMapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Địa chỉ giao hàng</p>
                        <p className="mt-0.5 font-bold text-slate-800 leading-snug">{selectedOrder.shippingAddress?.address ?? "-"}</p>
                      </div>
                    </div>

                    {selectedOrder.shippingAddress?.note ? (
                      <div className="flex gap-3 sm:col-span-2 border-t border-slate-100 pt-4">
                        <div className="mt-0.5 rounded-lg bg-slate-50 p-2 text-slate-400 h-9 w-9 flex items-center justify-center border border-slate-100 shrink-0">
                          <FaPenToSquare className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ghi chú từ khách hàng</p>
                          <p className="mt-0.5 font-medium text-slate-700 italic">"{selectedOrder.shippingAddress.note}"</p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </section>

                {/* Lịch sử trạng thái (timeline) moved to left column bottom */}
                <div className="rounded-2xl border border-slate-200 p-6 bg-white shadow-sm">
                  <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-4">Lịch sử hành trình đơn hàng</h3>
                  <div className="mt-5 relative border-l-2 border-slate-150 pl-6 space-y-5">
                    {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 ? (
                      [...selectedOrder.statusHistory].reverse().map((history, idx) => (
                        <div key={idx} className="relative">
                          <span className="absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#0d3a6b] border-2 border-white ring-4 ring-slate-50" />
                          <p className="text-xs font-bold text-slate-800">
                            {STATUS_MAP[history.status]?.label || history.status}
                          </p>
                          <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                            {new Date(history.updatedAt).toLocaleString("vi-VN")} • bởi {history.updatedBy}
                          </p>
                          {history.note ? <p className="mt-1 text-xs text-slate-500 bg-slate-50 rounded-lg p-2 border border-slate-100 font-medium max-w-xl">"{history.note}"</p> : null}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">Chưa có lịch sử trạng thái</p>
                    )}
                  </div>
                </div>
              </div>

              <aside className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 shadow-sm">
                  <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">Tóm tắt đơn hàng</h3>
                  <div className="mt-4 space-y-3.5 text-sm text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-400 text-xs">Mã đơn hàng</span>
                      <span className="font-bold font-mono text-slate-800 text-xs bg-white px-2 py-0.5 rounded border border-slate-100 shadow-sm">{formatOrderId(selectedOrder._id)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-400 text-xs">Số lượng sản phẩm</span>
                      <span className="font-bold text-slate-900">
                        {selectedOrder.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-400 text-xs">Tổng thanh toán</span>
                      <span className="text-base font-extrabold text-rose-600">{formatCurrency(Number(selectedOrder.total) || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="font-semibold text-slate-400 text-xs">Trạng thái thanh toán</span>
                      {(() => {
                        const pStatus = selectedOrder.paymentStatus || "unpaid";
                        const conf = PAYMENT_STATUS_MAP[pStatus] || PAYMENT_STATUS_MAP.unpaid;
                        return (
                          <span className={`inline-flex items-center justify-center w-36 rounded-full px-2.5 py-1 text-xs font-bold text-center whitespace-nowrap ${conf.color}`}>
                            {conf.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-6 bg-white shadow-sm">
                  <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">Cập nhật trạng thái</h3>
                  <div className="mt-4 space-y-2.5">
                    {Object.entries(STATUS_MAP).map(([status, config]) => {
                      const isActive = (selectedOrder.status ?? "pending") === status;
                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => void handleStatusChange(selectedOrder._id, status)}
                          disabled={isActive || savingOrderId === selectedOrder._id}
                          className={`flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left text-xs font-bold transition border ${
                            isActive
                              ? `${config.color} border-current shadow-sm cursor-default`
                              : "bg-slate-50 border-slate-100 hover:bg-slate-100 hover:border-slate-200 text-slate-700 hover:text-slate-900"
                          } disabled:opacity-75 disabled:cursor-not-allowed`}
                        >
                          <span>{config.label}</span>
                          {isActive ? (
                            <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider opacity-90">
                              <span className="h-1.5 w-1.5 rounded-full bg-current animate-ping" />
                              <span>Hiện tại</span>
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                              Chuyển sang
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      ) : null}

      {confirmData ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl transition-all scale-100">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900">Xác nhận thay đổi trạng thái</h3>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                Bạn có chắc chắn muốn chuyển trạng thái đơn hàng{" "}
                <span className="font-semibold text-slate-900">{formatOrderId(confirmData.orderId)}</span> sang{" "}
                <span className={`font-semibold ${confirmData.status === "cancelled" ? "text-rose-600" : "text-emerald-600"}`}>
                  "{STATUS_MAP[confirmData.status]?.label}"
                </span>
                ? Hành động này không thể hoàn tác một cách dễ dàng.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmData(null)}
                  className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={() => void handleStatusChange(confirmData.orderId, confirmData.status, true)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition ${
                    confirmData.status === "cancelled"
                      ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                      : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                  }`}
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
