import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import axios from "@/lib/axios";
import {
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  MoreHorizontal,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import SearchFilterBar from "@/Components/SearchFilterBar";

const formatCurrency = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n || 0);

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

const statusColors = {
  pending: "bg-amber-50 text-amber-600 border-amber-100/70",
  dibayar: "bg-indigo-50 text-indigo-600 border-indigo-100/70",
  dikirim: "bg-purple-50 text-purple-600 border-purple-100/70",
  selesai: "bg-emerald-50 text-emerald-600 border-emerald-100/70",
  dibatalkan: "bg-rose-50 text-rose-600 border-rose-100/70",
};

const statusLabels = {
  pending: "menunggu bayar",
  dibayar: "dibayar",
  dikirim: "dikirim",
  selesai: "selesai",
  dibatalkan: "dibatalkan",
};

const payBadgeColors = {
  paid: "bg-emerald-50 text-emerald-600 border-emerald-100/70",
  unpaid: "bg-amber-50 text-amber-600 border-amber-100/70",
  failed: "bg-rose-50 text-rose-600 border-rose-100/70",
};

export default function AdminTransactions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [transactions, setTransactions] = useState({
    data: [],
    total: 0,
    current_page: 1,
    last_page: 1,
  });
  const [stats, setStats] = useState({
    total: 0,
    revenue: 0,
    pending: 0,
    completed: 0,
  });
  
  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/admin/transactions", {
        params: { page, search, status },
      });
      const rawData = res.data?.data || res.data;
      if (rawData && typeof rawData === 'object') {
        const dataArray = Array.isArray(rawData) ? rawData : (rawData.data || []);
        const meta = rawData.meta || {};
        setTransactions({
          data: dataArray,
          total: meta.total ?? rawData.total ?? dataArray.length,
          current_page: meta.current_page ?? rawData.current_page ?? 1,
          last_page: meta.last_page ?? rawData.last_page ?? 1,
        });
        if (rawData.stats) {
          setStats(rawData.stats);
        }
      } else {
        setTransactions({
          data: [],
          total: 0,
          current_page: 1,
          last_page: 1,
        });
      }
    } catch (err) {
      console.error("Fetch transactions error:", err);
      const errStatus = err.response?.status;
      let errorMsg = "Gagal memuat data transaksi.";
      if (errStatus === 404) {
        errorMsg = "Endpoint transaksi tidak ditemukan (404). Silakan hubungi admin.";
      } else if (errStatus === 500) {
        errorMsg = "Terjadi kesalahan internal pada server (500). Silakan coba beberapa saat lagi.";
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <AdminLayout title="Data Transaksi">
      <div className="space-y-6 max-w-[1200px] mx-auto">

        {/* 1. TOP ACTION HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              Data Transaksi
            </h2>
            <p className="text-xs text-slate-400 font-normal mt-0.5">
              Riwayat semua pesanan dan pembayaran di platform ReCircle.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchTransactions}
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
              <span className="text-xs font-normal text-slate-400">Total Transaksi</span>
            </div>
            <span className="text-2xl font-bold text-slate-800 mt-2.5 leading-none">{stats.total}</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-normal text-slate-400">Total Pendapatan</span>
            </div>
            <span className="text-2xl font-bold text-slate-800 mt-2.5 leading-none">{formatCurrency(stats.revenue)}</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-xs font-normal text-slate-400">Menunggu Pembayaran</span>
            </div>
            <span className="text-2xl font-bold text-slate-800 mt-2.5 leading-none">{stats.pending}</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="text-xs font-normal text-slate-400">Selesai / Dikirim</span>
            </div>
            <span className="text-2xl font-bold text-slate-800 mt-2.5 leading-none">{stats.completed}</span>
          </div>
        </div>

        {/* 3. SEARCH & FILTER BAR PLACEMENT */}
        <div className="flex justify-end mb-4">
          <div className="w-full md:w-96">
            <SearchFilterBar
              filterOptions={[
                { value: "pending", label: "Menunggu Bayar" },
                { value: "dibayar", label: "Dibayar" },
                { value: "dikirim", label: "Dikirim" },
                { value: "selesai", label: "Selesai" },
                { value: "dibatalkan", label: "Dibatalkan" },
              ]}
              filterKey="status"
              placeholder="Cari Order ID, produk, atau user..."
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
                  <th className="py-3 px-4 font-normal">Order ID & Produk</th>
                  <th className="py-3 px-4 font-normal text-right">Nominal</th>
                  <th className="py-3 px-4 font-normal">Pihak Terkait</th>
                  <th className="py-3 px-4 font-normal text-center">Status</th>
                  <th className="py-3 px-6 font-normal text-right">Pembayaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <RefreshCw className="w-5 h-5 text-[#43552c] animate-spin mx-auto" />
                      <p className="text-xs text-slate-400 mt-2.5">Memuat data...</p>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <AlertCircle className="w-8 h-8 text-red-300 mx-auto" />
                      <p className="text-xs text-slate-400 mt-2.5">{error}</p>
                      <button onClick={fetchTransactions} className="text-[#43552c] text-xs underline mt-2.5 inline-block">
                        Coba Lagi
                      </button>
                    </td>
                  </tr>
                ) : transactions?.data?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-slate-400 text-xs mt-2.5">Tidak ada data transaksi.</p>
                    </td>
                  </tr>
                ) : (
                  transactions.data.map((order) => {
                    const productName = typeof order.product === "object"
                      ? (order.product?.name || "Produk Dihapus")
                      : (order.product || "Produk Dihapus");
                    const buyerName = typeof order.buyer === "object"
                      ? (order.buyer?.name || "Buyer Dihapus")
                      : (order.buyer || "Buyer Dihapus");
                    const sellerName = typeof order.seller === "object"
                      ? (order.seller?.name || "Seller Dihapus")
                      : (order.seller || "Seller Dihapus");
                    const payStatus = (order.paymentStatus || order.payment_status || "unpaid").toLowerCase().trim();

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/30 transition-colors group">
                        <td className="py-3.5 px-6 text-center">
                          <input 
                            type="checkbox" 
                            className="rounded border-slate-200 text-[#43552c] focus:ring-[#43552c]/20 cursor-pointer" 
                            checked={false} 
                            readOnly 
                          />
                        </td>

                        {/* Order ID & Produk */}
                        <td className="py-3.5 px-4">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono text-slate-400">
                                #{order.id}
                              </span>
                              <span className="font-normal text-slate-700 text-xs truncate max-w-[180px]" title={productName}>
                                {productName}
                              </span>
                            </div>
                            <span className="inline-flex items-center gap-1 text-[9px] text-slate-400 font-normal mt-0.5">
                              <Calendar className="w-2.5 h-2.5" />
                              {formatDate(order.createdAt || order.created_at)}
                            </span>
                          </div>
                        </td>

                        {/* Nominal */}
                        <td className="py-3.5 px-4 text-right text-xs font-medium text-slate-700">
                          {formatCurrency(order.totalPrice || order.total_price)}
                        </td>

                        {/* Pihak Terkait */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-[10px] font-normal text-slate-500">
                              <span className="w-1 h-1 rounded-full bg-blue-400" />
                              <span className="truncate max-w-[100px]">{buyerName}</span>
                              <span className="text-[9px] text-slate-400/80">(Buyer)</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-normal text-slate-500">
                              <span className="w-1 h-1 rounded-full bg-[#43552c]" />
                              <span className="truncate max-w-[100px]">{sellerName}</span>
                              <span className="text-[9px] text-slate-400/80">(Seller)</span>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-normal lowercase capitalize border ${
                            statusColors[order.status] || statusColors.pending
                          }`}>
                            {statusLabels[order.status] || order.status}
                          </span>
                        </td>

                        {/* Pembayaran */}
                        <td className="py-3.5 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-normal lowercase capitalize border ${
                              payBadgeColors[payStatus] || 'bg-slate-50 text-slate-500 border-slate-100'
                            }`}>
                              {payStatus}
                            </span>
                            <button className="p-1 rounded text-slate-300 hover:text-slate-500 hover:bg-slate-50 transition-colors">
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 5. PAGINATION FOOTER */}
          {transactions?.last_page > 1 && (
            <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border-t border-slate-100/60">
              <span className="text-[11px] text-slate-400 font-normal">
                Halaman {transactions.current_page} dari {transactions.last_page} ({transactions.total} total transaksi)
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
                  {transactions.current_page}
                </button>
                <button
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set("page", Math.min(transactions.last_page, page + 1));
                    setSearchParams(newParams);
                  }}
                  disabled={page >= transactions.last_page}
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
