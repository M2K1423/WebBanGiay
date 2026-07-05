"use client";

import { useEffect, useState } from "react";
import {
  FaPlus,
  FaPenToSquare,
  FaTrashCan,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaShieldHalved,
  FaCircleInfo,
  FaEnvelope,
  FaClock,
  FaIdCard,
  FaUser,
  FaBagShopping
} from "react-icons/fa6";
import { getApiBaseUrl } from "@/features/auth/utils";
import { getFirebaseAuth } from "@/lib/firebase";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Password Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Role Modal States
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<any>(null);
  const [selectedRoleIsAdmin, setSelectedRoleIsAdmin] = useState(false);
  const [changingRole, setChangingRole] = useState(false);
  const [roleErrorMessage, setRoleErrorMessage] = useState("");
  const [roleSuccessMessage, setRoleSuccessMessage] = useState("");

  // Detail Modal States
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<any>(null);
  const [detailActiveTab, setDetailActiveTab] = useState<"info" | "orders">("info");
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersErrorMessage, setOrdersErrorMessage] = useState("");

  // Delete Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<any>(null);
  const [deletingUser, setDeletingUser] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState("");

  const fetchUsers = async () => {
    try {
      const auth = getFirebaseAuth();
      const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
      const headers: any = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${getApiBaseUrl()}/users`, { headers });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, []);

  // Password Modal Handlers
  const handleOpenModal = (user: any) => {
    setSelectedUser(user);
    setNewPassword("");
    setShowPassword(false);
    setErrorMessage("");
    setSuccessMessage("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (changingPassword) return;
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrorMessage("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setChangingPassword(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const auth = getFirebaseAuth();
      const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
      if (!token) {
        setErrorMessage("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.");
        setChangingPassword(false);
        return;
      }

      const res = await fetch(`${getApiBaseUrl()}/users/${selectedUser.uid}/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ password: newPassword })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage("Đổi mật khẩu thành công!");
        setTimeout(() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }, 1500);
      } else {
        setErrorMessage(data.message || "Đã xảy ra lỗi khi đổi mật khẩu.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Lỗi kết nối đến máy chủ.");
    } finally {
      setChangingPassword(false);
    }
  };

  // Role Modal Handlers
  const handleOpenRoleModal = (user: any) => {
    setSelectedUserForRole(user);
    setSelectedRoleIsAdmin(!!user.isAdmin);
    setRoleErrorMessage("");
    setRoleSuccessMessage("");
    setIsRoleModalOpen(true);
  };

  const handleCloseRoleModal = () => {
    if (changingRole) return;
    setIsRoleModalOpen(false);
    setSelectedUserForRole(null);
  };

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingRole(true);
    setRoleErrorMessage("");
    setRoleSuccessMessage("");

    try {
      const auth = getFirebaseAuth();
      const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
      if (!token) {
        setRoleErrorMessage("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.");
        setChangingRole(false);
        return;
      }

      const res = await fetch(`${getApiBaseUrl()}/users/${selectedUserForRole.uid}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ isAdmin: selectedRoleIsAdmin })
      });

      const data = await res.json();

      if (res.ok) {
        setRoleSuccessMessage("Cập nhật quyền thành công!");
        // Update users state locally
        setUsers(prev => prev.map(u => u.uid === selectedUserForRole.uid ? { ...u, isAdmin: selectedRoleIsAdmin } : u));
        setTimeout(() => {
          setIsRoleModalOpen(false);
          setSelectedUserForRole(null);
        }, 1500);
      } else {
        setRoleErrorMessage(data.message || "Đã xảy ra lỗi khi phân quyền.");
      }
    } catch (err: any) {
      setRoleErrorMessage(err.message || "Lỗi kết nối đến máy chủ.");
    } finally {
      setChangingRole(false);
    }
  };

  // Detail Modal Handlers
  const handleOpenDetailModal = (user: any) => {
    setSelectedUserForDetail(user);
    setDetailActiveTab("info");
    setUserOrders([]);
    setOrdersErrorMessage("");
    setLoadingOrders(false);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedUserForDetail(null);
  };

  const handleTabChange = async (tab: "info" | "orders") => {
    setDetailActiveTab(tab);
    if (tab === "orders" && userOrders.length === 0 && selectedUserForDetail) {
      setLoadingOrders(true);
      setOrdersErrorMessage("");
      try {
        const auth = getFirebaseAuth();
        const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
        if (!token) {
          setOrdersErrorMessage("Phiên đăng nhập đã hết hạn.");
          setLoadingOrders(false);
          return;
        }

        const res = await fetch(`${getApiBaseUrl()}/orders/user/${selectedUserForDetail.uid}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUserOrders(Array.isArray(data) ? data : []);
        } else {
          setOrdersErrorMessage("Không thể tải lịch sử đơn hàng.");
        }
      } catch (err: any) {
        setOrdersErrorMessage("Lỗi kết nối đến máy chủ.");
      } finally {
        setLoadingOrders(false);
      }
    }
  };

  // Delete Modal Handlers
  const handleOpenDeleteModal = (user: any) => {
    setSelectedUserForDelete(user);
    setDeleteErrorMessage("");
    setDeleteSuccessMessage("");
    setDeletingUser(false);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    if (deletingUser) return;
    setIsDeleteModalOpen(false);
    setSelectedUserForDelete(null);
  };

  const handleDeleteConfirmSubmit = async () => {
    setDeletingUser(true);
    setDeleteErrorMessage("");
    setDeleteSuccessMessage("");

    try {
      const auth = getFirebaseAuth();
      const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
      if (!token) {
        setDeleteErrorMessage("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.");
        setDeletingUser(false);
        return;
      }

      const res = await fetch(`${getApiBaseUrl()}/users/${selectedUserForDelete.uid}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        setDeleteSuccessMessage("Xóa người dùng thành công!");
        setUsers(prev => prev.filter(u => u.uid !== selectedUserForDelete.uid));
        setTimeout(() => {
          setIsDeleteModalOpen(false);
          setSelectedUserForDelete(null);
        }, 1500);
      } else {
        setDeleteErrorMessage(data.message || "Đã xảy ra lỗi khi xóa người dùng.");
      }
    } catch (err: any) {
      setDeleteErrorMessage(err.message || "Lỗi kết nối đến máy chủ.");
    } finally {
      setDeletingUser(false);
    }
  };

  const getOrderStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "đã giao":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "shipping":
      case "đang giao":
        return "bg-sky-50 text-sky-700 border border-sky-200";
      case "pending":
      case "chờ xử lý":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "cancelled":
      case "đã hủy":
        return "bg-rose-50 text-rose-700 border border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border border-slate-200";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Quản lý Khách Hàng</h1>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Avatar</th>
                <th className="px-6 py-4 font-medium">Tên hiển thị</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Đăng nhập bằng</th>
                <th className="px-6 py-4 font-medium">Quyền</th>
                <th className="px-6 py-4 font-medium">Lần cuối đăng nhập</th>
                <th className="px-6 py-4 font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">Đang tải...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">Chưa có khách hàng nào</td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.uid} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="avatar" className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0d3a6b]/10 font-bold text-[#0d3a6b]">
                          {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{user.displayName || "-"}</div>
                      <div className="text-[10px] text-slate-400 font-mono select-all mt-0.5" title="Click đúp để chọn và copy UID">{user.uid}</div>
                    </td>
                    <td className="px-6 py-4">{user.email || "-"}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600 uppercase">
                        {user.provider || "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.isAdmin ? (
                        <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-semibold text-rose-600 uppercase">
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-600 uppercase">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("vi-VN", {
                        year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                      }) : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleOpenDetailModal(user)}
                          className="flex items-center gap-1.5 rounded-xl bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700 hover:bg-sky-100 transition-colors cursor-pointer"
                        >
                          <FaCircleInfo className="text-sky-500" /> Chi tiết
                        </button>
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                        >
                          <FaKey className="text-amber-500" /> Đổi mật khẩu
                        </button>
                        <button
                          onClick={() => handleOpenRoleModal(user)}
                          className="flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
                        >
                          <FaShieldHalved className="text-indigo-500" /> Phân quyền
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(user)}
                          className="flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                        >
                          <FaTrashCan className="text-rose-500" /> Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ĐỔI MẬT KHẨU */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-2xl p-6 relative">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Đổi Mật Khẩu</h2>
            <p className="text-sm text-slate-500 mb-6">
              Thay đổi mật khẩu cho người dùng <strong className="text-slate-800">{selectedUser.displayName || selectedUser.email}</strong>.
            </p>

            {errorMessage && (
              <div className="mb-4 rounded-2xl bg-rose-50 border border-rose-100 p-3 text-sm text-rose-600 font-medium">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-100 p-3 text-sm text-emerald-600 font-medium">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Mật khẩu mới (Tối thiểu 6 ký tự)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu mới..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#0d3a6b] focus:bg-white transition-all pr-10"
                    required
                    minLength={6}
                    disabled={changingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    disabled={changingPassword}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  disabled={changingPassword}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-[#0d3a6b] hover:bg-[#0b2f55] px-5 py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  disabled={changingPassword || newPassword.length < 6}
                >
                  {changingPassword ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Đang lưu...
                    </>
                  ) : (
                    "Xác nhận"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PHÂN QUYỀN */}
      {isRoleModalOpen && selectedUserForRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-2xl p-6 relative">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Phân Quyền Người Dùng</h2>
            <p className="text-sm text-slate-500 mb-6">
              Thay đổi phân quyền cho tài khoản <strong className="text-slate-800">{selectedUserForRole.displayName || selectedUserForRole.email}</strong>.
            </p>

            {roleErrorMessage && (
              <div className="mb-4 rounded-2xl bg-rose-50 border border-rose-100 p-3 text-sm text-rose-600 font-medium">
                {roleErrorMessage}
              </div>
            )}

            {roleSuccessMessage && (
              <div className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-100 p-3 text-sm text-emerald-600 font-medium">
                {roleSuccessMessage}
              </div>
            )}

            <form onSubmit={handleRoleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Chọn vai trò
                </label>
                <select
                  value={selectedRoleIsAdmin ? "admin" : "user"}
                  onChange={(e) => setSelectedRoleIsAdmin(e.target.value === "admin")}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#0d3a6b] focus:bg-white transition-all cursor-pointer"
                  disabled={changingRole}
                >
                  <option value="user">Khách hàng (User)</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={handleCloseRoleModal}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  disabled={changingRole}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-[#0d3a6b] hover:bg-[#0b2f55] px-5 py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  disabled={changingRole}
                >
                  {changingRole ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Đang lưu...
                    </>
                  ) : (
                    "Xác nhận"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XEM CHI TIẾT */}
      {isDetailModalOpen && selectedUserForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-2xl relative flex flex-col max-h-[90vh]">
            
            {/* Header Banner */}
            <div className="relative overflow-hidden bg-[#0d3a6b] p-6 text-white shrink-0">
              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/10 text-2xl font-bold border border-white/20">
                  {selectedUserForDetail.photoURL ? (
                    <img src={selectedUserForDetail.photoURL} alt="avatar" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    (selectedUserForDetail.displayName || selectedUserForDetail.email || "U").charAt(0).toUpperCase()
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl font-bold">{selectedUserForDetail.displayName || "Khách hàng"}</h3>
                  <p className="text-xs text-white/80 mt-0.5 flex items-center justify-center sm:justify-start gap-1">
                    <FaEnvelope className="text-white/60" /> {selectedUserForDetail.email || "-"}
                  </p>
                  <div className="mt-2 flex gap-2 justify-center sm:justify-start">
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase">
                      {selectedUserForDetail.provider || "Unknown"}
                    </span>
                    {selectedUserForDetail.isAdmin ? (
                      <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        Admin
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        User
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 px-6 gap-6 pt-3 bg-slate-50 shrink-0">
              <button
                onClick={() => handleTabChange("info")}
                className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  detailActiveTab === "info"
                    ? "border-[#0d3a6b] text-[#0d3a6b]"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <FaCircleInfo /> Thông tin cá nhân
              </button>
              <button
                onClick={() => handleTabChange("orders")}
                className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  detailActiveTab === "orders"
                    ? "border-[#0d3a6b] text-[#0d3a6b]"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <FaBagShopping /> Lịch sử đơn hàng
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              
              {/* Tab 1: Profile Info */}
              {detailActiveTab === "info" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
                      <FaIdCard /> Firebase UID
                    </label>
                    <p className="text-xs font-mono bg-slate-50 border border-slate-100 rounded-xl p-3 select-all text-slate-700 break-all">
                      {selectedUserForDetail.uid}
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
                      <FaUser /> Tên hiển thị
                    </label>
                    <p className="text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-100 rounded-xl p-3">
                      {selectedUserForDetail.displayName || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
                      <FaClock /> Lần cuối đăng nhập
                    </label>
                    <p className="text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-100 rounded-xl p-3">
                      {formatDate(selectedUserForDetail.lastLogin)}
                    </p>
                  </div>
                  {selectedUserForDetail.createdAt && (
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
                        <FaClock /> Ngày tham gia
                      </label>
                      <p className="text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-100 rounded-xl p-3">
                        {formatDate(selectedUserForDetail.createdAt)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Order History */}
              {detailActiveTab === "orders" && (
                <div>
                  {loadingOrders ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0d3a6b] border-t-transparent"></div>
                      <p className="text-xs text-slate-500 font-medium">Đang tải lịch sử đơn hàng...</p>
                    </div>
                  ) : ordersErrorMessage ? (
                    <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4 text-center text-sm text-rose-600 font-medium">
                      {ordersErrorMessage}
                    </div>
                  ) : userOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 text-xl">
                        <FaBagShopping />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">Không có đơn hàng nào</h3>
                      <p className="text-xs text-slate-500 mt-1">Người dùng này chưa thực hiện bất kỳ giao dịch nào.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                      <table className="w-full text-left text-xs text-slate-600">
                        <thead className="bg-slate-50 text-[10px] uppercase text-slate-500">
                          <tr>
                            <th className="px-4 py-3 font-semibold">Mã đơn hàng</th>
                            <th className="px-4 py-3 font-semibold">Ngày đặt</th>
                            <th className="px-4 py-3 font-semibold">Tổng tiền</th>
                            <th className="px-4 py-3 font-semibold">Thanh toán</th>
                            <th className="px-4 py-3 font-semibold">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {userOrders.map((order) => (
                            <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 font-mono text-[10px] select-all font-semibold text-slate-700">
                                {order._id}
                              </td>
                              <td className="px-4 py-3 text-slate-500">
                                {formatDate(order.createdAt)}
                              </td>
                              <td className="px-4 py-3 font-bold text-rose-600">
                                {order.totalPrice.toLocaleString("vi-VN")} đ
                              </td>
                              <td className="px-4 py-3 uppercase font-medium text-slate-500">
                                {order.paymentMethod === "cod" ? "COD" : order.paymentMethod}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getOrderStatusBadgeClass(order.status)}`}>
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Footer Actions */}
            <div className="border-t border-slate-100 p-4 flex justify-end bg-slate-50 shrink-0">
              <button
                type="button"
                onClick={handleCloseDetailModal}
                className="rounded-2xl bg-[#0d3a6b] hover:bg-[#0b2f55] px-6 py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA */}
      {isDeleteModalOpen && selectedUserForDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-2xl p-6 relative">
            <h2 className="text-xl font-bold text-rose-600 mb-2 flex items-center gap-2">
              <FaTrashCan /> Xóa Người Dùng
            </h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản <strong className="text-slate-800">{selectedUserForDelete.displayName || selectedUserForDelete.email}</strong>?
              <br />
              <span className="text-rose-500 font-semibold text-xs mt-2 block">
                * CẢNH BÁO: Hành động này sẽ xóa sạch tài khoản khỏi Firebase Authentication và cơ sở dữ liệu MongoDB. Người dùng này sẽ không thể đăng nhập được nữa.
              </span>
            </p>

            {deleteErrorMessage && (
              <div className="mb-4 rounded-2xl bg-rose-50 border border-rose-100 p-3 text-sm text-rose-600 font-medium">
                {deleteErrorMessage}
              </div>
            )}

            {deleteSuccessMessage && (
              <div className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-100 p-3 text-sm text-emerald-600 font-medium">
                {deleteSuccessMessage}
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                disabled={deletingUser}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirmSubmit}
                className="rounded-2xl bg-rose-600 hover:bg-rose-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                disabled={deletingUser}
              >
                {deletingUser ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Đang xóa...
                  </>
                ) : (
                  "Xác nhận xóa"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
