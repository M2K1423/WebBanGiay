"use client";

import { useEffect, useState } from "react";
import { FaPenToSquare, FaPlus, FaTrashCan, FaXmark } from "react-icons/fa6";
import { getApiBaseUrl } from "@/features/auth/utils";

type Product = {
  id: string;
  name: string;
  brand: string;
  productType: string;
  description: string;
  price: string;
  category: string;
  imageUrls: string[];
  oldPrice: string;
  discount: string;
  promotion: string;
  rating: number;
  reviewCount: number;
  sold: number;
  colors: string[];
};

type ProductFormState = {
  name: string;
  brand: string;
  productType: string;
  description: string;
  price: string;
  category: string;
  imageUrls: string;
  oldPrice: string;
  discount: string;
  promotion: string;
  rating: string;
  reviewCount: string;
  sold: string;
  colors: string;
};

const EMPTY_FORM: ProductFormState = {
  name: "",
  brand: "",
  productType: "New Arrival",
  description: "",
  price: "",
  category: "",
  imageUrls: "",
  oldPrice: "",
  discount: "",
  promotion: "",
  rating: "0",
  reviewCount: "0",
  sold: "0",
  colors: ""
};

function toList(value: string) {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toNumber(value: string, fallback = 0) {
  if (value.trim() === "") {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function productToForm(product: Product): ProductFormState {
  return {
    name: product.name ?? "",
    brand: product.brand ?? "",
    productType: product.productType ?? "New Arrival",
    description: product.description ?? "",
    price: product.price ?? "",
    category: product.category ?? "",
    imageUrls: (product.imageUrls ?? []).join(", "),
    oldPrice: product.oldPrice ?? "",
    discount: product.discount ?? "",
    promotion: product.promotion ?? "",
    rating: String(product.rating ?? 0),
    reviewCount: String(product.reviewCount ?? 0),
    sold: String(product.sold ?? 0),
    colors: (product.colors ?? []).join(", ")
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormState>(EMPTY_FORM);

  const apiBaseUrl = getApiBaseUrl();

  const fetchProducts = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/products`);
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id);
    setFormData(productToForm(product));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/products/${id}`, { method: "DELETE" });

      if (!response.ok) {
        alert("Xóa thất bại");
        return;
      }

      await fetchProducts();
    } catch {
      alert("Lỗi khi xóa");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      name: formData.name,
      brand: formData.brand,
      productType: formData.productType,
      description: formData.description,
      price: formData.price,
      category: formData.category,
      imageUrls: toList(formData.imageUrls),
      oldPrice: formData.oldPrice,
      discount: formData.discount,
      promotion: formData.promotion,
      rating: toNumber(formData.rating),
      reviewCount: toNumber(formData.reviewCount),
      sold: toNumber(formData.sold),
      colors: toList(formData.colors)
    };

    try {
      const response = await fetch(
        editingId ? `${apiBaseUrl}/products/${editingId}` : `${apiBaseUrl}/products`,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        alert("Lưu thất bại");
        return;
      }

      closeModal();
      await fetchProducts();
    } catch {
      alert("Lỗi khi lưu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Sản Phẩm</h1>
        </div>

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
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Đang tải...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Chưa có sản phẩm nào
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          {product.imageUrls?.[0] ? (
                            <img
                              src={product.imageUrls[0]}
                              alt={product.name}
                              className="h-full w-full object-cover mix-blend-multiply"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-slate-400">?</div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 line-clamp-2">{product.name}</p>
                          <p className="text-xs text-slate-500">{product.productType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize">{product.brand}</td>
                    <td className="px-6 py-4 capitalize">{product.category}</td>
                    <td className="px-6 py-4 font-medium text-rose-600">{product.price}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-lg">
                        <button
                          onClick={() => openEditModal(product)}
                          className="text-slate-400 transition-colors hover:text-blue-600"
                          aria-label="Sửa sản phẩm"
                        >
                          <FaPenToSquare />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-slate-400 transition-colors hover:text-rose-600"
                          aria-label="Xóa sản phẩm"
                        >
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

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingId ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Điền đủ thông tin để sản phẩm hiển thị đúng ở web bán hàng.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Đóng"
              >
                <FaXmark />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Tên sản phẩm *</label>
                  <input
                    required
                    value={formData.name}
                    onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#0d3a6b] focus:outline-none focus:ring-1 focus:ring-[#0d3a6b]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Thương hiệu *</label>
                  <select
                    required
                    value={formData.brand}
                    onChange={(event) => setFormData({ ...formData, brand: event.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-[#0d3a6b] focus:outline-none focus:ring-1 focus:ring-[#0d3a6b]"
                  >
                    <option value="">Chọn hãng</option>
                    <option value="Nike">Nike</option>
                    <option value="Adidas">Adidas</option>
                    <option value="Puma">Puma</option>
                    <option value="New Balance">New Balance</option>
                    <option value="Asics">Asics</option>
                    <option value="Reebok">Reebok</option>
                    <option value="Vans">Vans</option>
                    <option value="Salomon">Salomon</option>
                    <option value="Crocs">Crocs</option>
                    <option value="Khac">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Loại sản phẩm</label>
                  <input
                    value={formData.productType}
                    onChange={(event) => setFormData({ ...formData, productType: event.target.value })}
                    placeholder="New Arrival, Flash Sale..."
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#0d3a6b] focus:outline-none focus:ring-1 focus:ring-[#0d3a6b]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Danh mục *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-[#0d3a6b] focus:outline-none focus:ring-1 focus:ring-[#0d3a6b]"
                  >
                    <option value="">Chọn danh mục</option>
                    <option value="Running">Running</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Court">Court</option>
                    <option value="Training">Training</option>
                    <option value="Casual">Casual</option>
                    <option value="Trail">Trail</option>
                    <option value="Football">Football</option>
                    <option value="Khac">Khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Mô tả *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#0d3a6b] focus:outline-none focus:ring-1 focus:ring-[#0d3a6b]"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Giá bán *</label>
                  <input
                    required
                    value={formData.price}
                    onChange={(event) => setFormData({ ...formData, price: event.target.value })}
                    placeholder="1.890.000đ"
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#0d3a6b] focus:outline-none focus:ring-1 focus:ring-[#0d3a6b]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Giá gốc</label>
                  <input
                    value={formData.oldPrice}
                    onChange={(event) => setFormData({ ...formData, oldPrice: event.target.value })}
                    placeholder="2.490.000đ"
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#0d3a6b] focus:outline-none focus:ring-1 focus:ring-[#0d3a6b]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Giảm giá</label>
                  <input
                    value={formData.discount}
                    onChange={(event) => setFormData({ ...formData, discount: event.target.value })}
                    placeholder="-24%"
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#0d3a6b] focus:outline-none focus:ring-1 focus:ring-[#0d3a6b]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Khuyến mãi</label>
                  <input
                    value={formData.promotion}
                    onChange={(event) => setFormData({ ...formData, promotion: event.target.value })}
                    placeholder="Tặng tất, freeship..."
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#0d3a6b] focus:outline-none focus:ring-1 focus:ring-[#0d3a6b]"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Đánh giá sao</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(event) => setFormData({ ...formData, rating: event.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#0d3a6b] focus:outline-none focus:ring-1 focus:ring-[#0d3a6b]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Số đánh giá</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.reviewCount}
                    onChange={(event) => setFormData({ ...formData, reviewCount: event.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#0d3a6b] focus:outline-none focus:ring-1 focus:ring-[#0d3a6b]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Đã bán</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.sold}
                    onChange={(event) => setFormData({ ...formData, sold: event.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#0d3a6b] focus:outline-none focus:ring-1 focus:ring-[#0d3a6b]"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Hình ảnh</label>
                  <textarea
                    rows={3}
                    value={formData.imageUrls}
                    onChange={(event) => setFormData({ ...formData, imageUrls: event.target.value })}
                    placeholder="Dán 1 hoặc nhiều URL, cách nhau bằng dấu phẩy hoặc xuống dòng"
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#0d3a6b] focus:outline-none focus:ring-1 focus:ring-[#0d3a6b]"
                  />
                  {toList(formData.imageUrls)[0] ? (
                    <div className="mt-3 h-24 w-24 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      <img
                        src={toList(formData.imageUrls)[0]}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Màu sắc</label>
                  <textarea
                    rows={3}
                    value={formData.colors}
                    onChange={(event) => setFormData({ ...formData, colors: event.target.value })}
                    placeholder="White, Black, Grey"
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#0d3a6b] focus:outline-none focus:ring-1 focus:ring-[#0d3a6b]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                  disabled={saving}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#0d3a6b] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#0a2747] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? "Đang lưu..." : "Lưu sản phẩm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
