"use client";

import { useEffect, useState } from "react";
import { FaPlus, FaPenToSquare, FaTrashCan } from "react-icons/fa6";
import { getApiBaseUrl } from "@/features/auth/utils";
import { getFirebaseAuth } from "@/lib/firebase";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    void fetchUsers();
  }, []);

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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Đang tải...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Chưa có khách hàng nào</td>
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
                      {new Date(user.lastLogin).toLocaleDateString("vi-VN", {
                        year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
