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
  Download
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useNotification } from "@/contexts/NotificationContext";
import SearchFilterBar from "@/Components/SearchFilterBar";

const formatCurrency = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n || 0);

const statusColors = {
  active: "bg-green-50 text-green-600 border-green-100/70",
  sold: "bg-amber-50 text-amber-600 border-amber-100/70",
  archived: "bg-slate-50 text-slate-500 border-slate-200/50",
  pending: "bg-orange-50 text-orange-600 border-orange-100/70",
  rejected: "bg-rose-50 text-rose-600 border-rose-100/70",
};

export default function AdminProducts() {
  const { showToast } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState({
    data: [],
    total: 0,
    current_page: 1,
    last_page: 1,
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    sold: 0,
    archived: 0,
  });
  
  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/admin/products", {
        params: { 
          page,
          search,
          status
        },
      });
      const rawData = res.data?.data || res.data;
      if (rawData && typeof rawData === 'object') {
        const dataArray = Array.isArray(rawData) ? rawData : (rawData.data || []);
        const meta = rawData.meta || rawData || {};
        setProducts({
          data: dataArray,
          total: meta.total ?? rawData.total ?? dataArray.length,
          current_page: meta.current_page ?? rawData.current_page ?? 1,
          last_page: meta.last_page ?? rawData.last_page ?? 1,
        });
        if (rawData.stats) {
          setStats(rawData.stats);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat data produk.");
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleStatusUpdate = async (id, newStatus) => {
    if (!confirm(`Ubah status produk ini menjadi ${newStatus}?`)) return;
    try {
      await axios.post(`/admin/products/${id}/status`, { status: newStatus });
      showToast(`Status produk berhasil diubah menjadi ${newStatus}.`, "success");
      fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal mengubah status produk.", "error");
    }
  };

  return (
    <AdminLayout title="Manajemen Produk">
      <div className="space-y-6 max-w-[1200px] mx-auto">

        {/* 1. TOP ACTION HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              Manajemen Produk
            </h2>
            <p className="text-xs text-slate-400 font-normal mt-0.5">
              Total {products.total || 0} produk terdaftar di marketplace ReCircle.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchProducts}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-slate-200/80 hover:border-slate-300 text-slate-500 rounded-lg text-xs font-normal bg-white transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <button className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#43552c] hover:bg-[#324021] text-white rounded-lg text-xs font-medium transition-all shadow-sm">
              <Download className="w-3.5 h-3.5" />
              Ekspor Data
            </button>
          </div>
        </div>

        {/* 2. SUMMARY STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span className="text-xs font-normal text-slate-400">Total Produk</span>
            </div>
            <span className="text-2xl font-bold text-slate-800 mt-2.5 leading-none">{stats.total}</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-normal text-slate-400">Produk Aktif</span>
            </div>
            <span className="text-2xl font-bold text-slate-800 mt-2.5 leading-none">{stats.active}</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-xs font-normal text-slate-400">Terjual</span>
            </div>
            <span className="text-2xl font-bold text-slate-800 mt-2.5 leading-none">{stats.sold}</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="text-xs font-normal text-slate-400">Diarsipkan</span>
            </div>
            <span className="text-2xl font-bold text-slate-800 mt-2.5 leading-none">{stats.archived}</span>
          </div>
        </div>

        {/* 3. SEARCH & FILTER BAR PLACEMENT */}
        <div className="flex justify-end mb-4">
          <div className="w-full md:w-96">
            <SearchFilterBar
              filterOptions={[
                { value: "active", label: "Aktif" },
                { value: "sold", label: "Terjual" },
                { value: "archived", label: "Diarsipkan" },
              ]}
              filterKey="status"
              placeholder="Cari nama produk atau seller..."
            />
          </div>
        </div>

        {/* 3. MODERN TABLE CONTAINER */}
        <div className="bg-white rounded-xl border border-slate-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.015)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100/70 text-xs font-normal text-slate-400/90 bg-slate-50/50">
                  <th className="py-3 px-6 w-12 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-200 text-[#43552c] focus:ring-[#43552c]/20" 
                      checked={false} 
                      readOnly 
                    />
                  </th>
                  <th className="py-3 px-4 font-normal">Info Produk</th>
                  <th className="py-3 px-4 font-normal">Kategori & Harga</th>
                  <th className="py-3 px-4 font-normal text-center">Status</th>
                  <th className="py-3 px-6 font-normal text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <RefreshCw className="w-5 h-5 text-[#43552c] animate-spin mx-auto" />
                      <p className="text-xs text-slate-400 mt-2.5">Memuat data...</p>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <AlertCircle className="w-8 h-8 text-red-300 mx-auto" />
                      <p className="text-xs text-slate-400 mt-2.5">{error}</p>
                      <button onClick={fetchProducts} className="text-[#43552c] text-xs underline mt-2.5 inline-block">
                        Coba Lagi
                      </button>
                    </td>
                  </tr>
                ) : products.data?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-slate-400 text-xs mt-2.5">Tidak ada produk ditemukan.</p>
                    </td>
                  </tr>
                ) : (
                  products.data.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="py-3.5 px-6 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-slate-200 text-[#43552c] focus:ring-[#43552c]/20 cursor-pointer" 
                          checked={false} 
                          readOnly 
                        />
                      </td>

                      {/* Info Produk */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-8 rounded bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {product.image ? (
                              <img 
                                src={product.image.startsWith('http') ? product.image : `${import.meta.env.VITE_API_URL || ''}/storage/${product.image.replace(/^\/?(storage\/)?/, '')}`} 
                                alt="" 
                                className="w-full h-full object-cover" 
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://placehold.co/400x400/f3f4f6/9ca3af?text=No+Image";
                                }}
                              />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-slate-300" />
                            )}
                          </div>
                          <div>
                            <span className="font-normal text-slate-700 text-xs block truncate max-w-[200px]" title={product.name}>
                              {product.name}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[9px] text-slate-400 font-normal mt-0.5">
                              <User className="w-2.5 h-2.5" />
                              Seller: {product.seller}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Kategori & Harga */}
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="inline-flex items-center gap-1 text-[9px] bg-slate-50 text-slate-500 border border-slate-200/50 px-1.5 py-0.2 rounded font-normal capitalize">
                            <Tag className="w-2.5 h-2.5 text-slate-400" />
                            {product.category}
                          </span>
                          <span className="text-xs font-medium text-slate-700 block mt-0.5">
                            {formatCurrency(product.price)}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-normal lowercase capitalize border ${
                          statusColors[product.status] || statusColors.archived
                        }`}>
                          {product.status || "archived"}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {product.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(product.id, "active")}
                                className="p-1 rounded bg-green-50 text-green-500 hover:bg-green-100 transition-colors border border-green-100/60"
                                title="Setujui"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(product.id, "rejected")}
                                className="p-1 rounded bg-red-50 text-red-500 hover:bg-red-100 transition-colors border border-red-100/60"
                                title="Tolak"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {product.status === "active" && (
                            <button
                              onClick={() => handleStatusUpdate(product.id, "archived")}
                              className="p-1 rounded bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors border border-slate-200/50"
                              title="Arsipkan"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <Link
                            to={`/products/${product.id}`}
                            className="p-1 rounded bg-white text-[#43552c] border border-slate-200 hover:border-[#43552c]/30 hover:bg-[#f7f9f7] transition-colors"
                            title="Detail Halaman Produk"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 5. PAGINATION FOOTER */}
          {products?.last_page > 1 && (
            <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border-t border-slate-100/60">
              <span className="text-[11px] text-slate-400 font-normal">
                Halaman {products.current_page} dari {products.last_page} ({products.total} total produk)
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set("page", Math.max(1, page - 1));
                    setSearchParams(newParams);
                  }}
                  disabled={page <= 1}
                  className="px-2.5 py-1 border border-slate-100 rounded text-xs font-normal text-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Sebelumnya
                </button>
                <button className="w-7 h-7 rounded text-xs font-normal bg-[#43552c] text-white flex items-center justify-center shadow-sm">
                  {products.current_page}
                </button>
                <button
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set("page", Math.min(products.last_page, page + 1));
                    setSearchParams(newParams);
                  }}
                  disabled={page >= products.last_page}
                  className="px-2.5 py-1 border border-slate-100 rounded text-xs font-normal text-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
