"use client";

import { useEffect, useState } from "react";
import { FaPlus, FaPenToSquare, FaTrashCan } from "react-icons/fa6";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    price: "",
    oldPrice: "",
    image: "",
    description: "",
  });

  const fetchProducts = () => {
    setLoading(true);
    fetch("http://localhost:3001/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: "", brand: "", category: "", price: "", oldPrice: "", image: "", description: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
      oldPrice: product.oldPrice || "",
      image: product.images?.[0] || "",
      description: product.description || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      const res = await fetch(`http://localhost:3001/products/${id}`, { method: "DELETE" });
      if (res.ok) fetchProducts();
      else alert("Xóa thất bại");
    } catch (e) {
      alert("Lỗi khi xóa");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      images: formData.image ? [formData.image] : [],
      colors: ["Đen", "Trắng"], // default colors for now
    };

    try {
      const url = editingId ? `http://localhost:3001/products/${editingId}` : "http://localhost:3001/products";
      const method = editingId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchProducts();
      } else {
        alert("Lưu thất bại");
      }
    } catch (e) {
      alert("Lỗi khi lưu");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Quản lý Sản Phẩm</h1>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-xl bg-[#0d3a6b] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#0d3a6b]/20 transition-transform hover:-translate-y-0.5"
        >
          <FaPlus /> Thêm sản phẩm
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Sản phẩm</th>
                <th className="px-6 py-4 font-medium">Hãng</th>
                <th className="px-6 py-4 font-medium">Danh mục</th>
                <th className="px-6 py-4 font-medium">Giá bán</th>
                <th className="px-6 py-4 font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Đang tải...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Chưa có sản phẩm nào</td>
                </tr>
              ) : (
                products.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover mix-blend-multiply" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-slate-400">?</div>
                          )}
                        </div>
                        <span className="font-semibold text-slate-900 line-clamp-2">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize">{p.brand}</td>
                    <td className="px-6 py-4 capitalize">{p.category}</td>
                    <td className="px-6 py-4 font-medium text-rose-600">{p.price}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-lg">
                        <button onClick={() => openEditModal(p)} className="text-slate-400 transition-colors hover:text-blue-600">
                          <FaPenToSquare />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="text-slate-400 transition-colors hover:text-rose-600">
                          <FaTrashCan />
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">{editingId ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Tên sản phẩm *</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#0d3a6b] focus:outline-none focus:ring-1 focus:ring-[#0d3a6b]" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Thương hiệu *</label>
                  <select required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#0d3a6b] focus:outline-none focus:ring-1 focus:ring-[#0d3a6b] bg-white">
                    <option value="">Chọn hãng</option>
                    <option value="nike">Nike</option>
                    <option value="adidas">Adidas</option>
                    <option value="puma">Puma</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Danh mục *</label>
                  <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#0d3a6b] focus:outline-none focus:ring-1 focus:ring-[#0d3a6b] bg-white">
                    <option value="">Chọn danh mục</option>
                    <option value="running">Chạy bộ</option>
                    <option value="lifestyle">Thời trang</option>
                    <option value="football">Đá bóng</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Giá bán (VD: 2.000.000đ) *</label>
                  <input required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#0d3a6b] focus:outline-none focus:ring-1 focus:ring-[#0d3a6b]" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Giá gốc (Tùy chọn)</label>
                  <input value={formData.oldPrice} onChange={e => setFormData({...formData, oldPrice: e.target.value})} className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#0d3a6b] focus:outline-none focus:ring-1 focus:ring-[#0d3a6b]" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">URL Hình ảnh</label>
                <input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://example.com/image.jpg" className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#0d3a6b] focus:outline-none focus:ring-1 focus:ring-[#0d3a6b]" />
                {formData.image && (
                  <div className="mt-2 h-20 w-20 rounded-lg border border-slate-200 overflow-hidden">
                    <img src={formData.image} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Mô tả</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#0d3a6b] focus:outline-none focus:ring-1 focus:ring-[#0d3a6b]" />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100">Hủy</button>
                <button type="submit" className="rounded-xl bg-[#0d3a6b] px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#0a2747]">Lưu sản phẩm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
