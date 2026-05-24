import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import axios from "@/lib/axios";
import {
  Search,
  ShoppingBag,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Image as ImageIcon,
  Tag,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const formatCurrency = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n || 0);

const statusColors = {
  active: "bg-green-50 text-green-600 border-green-100",
  sold: "bg-amber-50 text-amber-700 border-amber-100",
  archived: "bg-gray-50 text-gray-500 border-gray-100",
  pending: "bg-orange-50 text-orange-600 border-orange-100",
  rejected: "bg-red-50 text-red-600 border-red-100",
};

export default function AdminProducts() {
  const [products, setProducts] = useState({
    data: [],
    total: 0,
    current_page: 1,
    last_page: 1,
  });
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/admin/products", {
        params: { page, ...filters },
      });
      setProducts(res.data?.data || res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat data produk.");
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleStatusUpdate = async (id, newStatus) => {
    if (!confirm(`Ubah status produk ini menjadi ${newStatus}?`)) return;
    try {
      await axios.post(`/admin/products/${id}/status`, { status: newStatus });
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal mengubah status produk.");
    }
  };

  return (
    <AdminLayout title="Manajemen Produk">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Manajemen Produk
            </h2>
            <p className="text-gray-500 mt-1">
              Total {products.total || 0} produk terdaftar di marketplace.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, search: e.target.value }))
                }
                onKeyDown={(e) =>
                  e.key === "Enter" && (setPage(1), fetchProducts())
                }
                placeholder="Cari nama produk atau seller..."
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#43552c]/20 focus:border-[#43552c] transition-all shadow-sm"
              />
            </div>
            <div className="relative">
              <select
                value={filters.status}
                onChange={(e) => {
                  setFilters((f) => ({ ...f, status: e.target.value }));
                  setPage(1);
                }}
                className="pl-4 pr-10 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#43552c]/20 appearance-none transition-all shadow-sm font-medium text-gray-600"
              >
                <option value="">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="sold">Terjual</option>
                <option value="archived">Diarsipkan</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-6 h-6 text-[#43552c] animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <p className="text-gray-500 text-sm">{error}</p>
              <button
                onClick={fetchProducts}
                className="text-[#43552c] font-bold text-sm hover:underline"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f7f9f7]/50 border-b border-gray-50">
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Info Produk
                    </th>
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Kategori & Harga
                    </th>
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.data?.length > 0 ? (
                    products.data.map((product) => (
                      <tr
                        key={product.id}
                        className="group hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-5">
                            <div className="w-16 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-gray-300" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-800 text-sm truncate max-w-[200px]">
                                {product.name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#43552c] font-medium">
                                <User className="w-3 h-3" /> {product.seller}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-600 font-bold uppercase tracking-wider">
                              <Tag className="w-3 h-3 text-[#d4a373]" />{" "}
                              {product.category}
                            </div>
                            <p className="text-sm font-bold text-[#43552c]">
                              {formatCurrency(product.price)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[product.status] || statusColors.archived}`}
                          >
                            {product.status === "active" ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : product.status === "sold" ? (
                              <ArrowUpRight className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            {product.status || "archived"}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {product.status === "pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(product.id, "active")
                                  }
                                  className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors shadow-sm border border-green-100"
                                  title="Setujui"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(product.id, "rejected")
                                  }
                                  className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors shadow-sm border border-red-100"
                                  title="Tolak"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {product.status === "active" && (
                              <button
                                onClick={() =>
                                  handleStatusUpdate(product.id, "archived")
                                }
                                className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors shadow-sm border border-gray-100"
                                title="Arsipkan"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <Link
                              to={`/products/${product.id}`}
                              className="p-2 rounded-xl bg-white text-[#43552c] border border-gray-100 hover:border-[#43552c]/30 hover:bg-[#f7f9f7] transition-all shadow-sm"
                              title="Buka Halaman Produk"
                            >
                              <ArrowUpRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-8 py-10 text-center text-gray-500 italic text-sm"
                      >
                        Tidak ada produk ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {products?.last_page > 1 && (
            <div className="px-8 py-5 bg-[#f7f9f7]/30 border-t border-gray-50 flex items-center justify-between">
              <p className="text-xs text-gray-500 font-medium">
                Halaman{" "}
                <span className="font-bold text-gray-900">
                  {products.current_page}
                </span>{" "}
                dari{" "}
                <span className="font-bold text-gray-900">
                  {products.last_page}
                </span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 rounded-lg bg-white border border-gray-100 text-gray-500 hover:border-[#43552c] hover:text-[#43552c] disabled:opacity-40 disabled:pointer-events-none transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(products.last_page, p + 1))
                  }
                  disabled={page >= products.last_page}
                  className="p-2 rounded-lg bg-white border border-gray-100 text-gray-500 hover:border-[#43552c] hover:text-[#43552c] disabled:opacity-40 disabled:pointer-events-none transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
