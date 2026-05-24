import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import axios from "@/lib/axios";
import {
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  MoreVertical,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "@/lib/axios";

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
  completed: "bg-green-50 text-green-600 border-green-100",
  shipping: "bg-blue-50 text-blue-600 border-blue-100",
  pending: "bg-orange-50 text-orange-600 border-orange-100",
  cancelled: "bg-red-50 text-red-600 border-red-100",
};

const paymentColors = {
  paid: "bg-green-500",
  unpaid: "bg-orange-400",
  failed: "bg-red-500",
};

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState({
    data: [],
    total: 0,
    current_page: 1,
    last_page: 1,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/admin/transactions", {
        params: { page, search },
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
      const status = err.response?.status;
      let errorMsg = "Gagal memuat data transaksi.";
      if (status === 404) {
        errorMsg = "Endpoint transaksi tidak ditemukan (404). Silakan hubungi admin.";
      } else if (status === 500) {
        errorMsg = "Terjadi kesalahan internal pada server (500). Silakan coba beberapa saat lagi.";
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <AdminLayout title="Data Transaksi">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Data Transaksi
            </h2>
            <p className="text-gray-500 mt-1">
              Riwayat semua pesanan dan pembayaran di platform.
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (setPage(1), fetchTransactions())
              }
              placeholder="Cari Order ID, produk, atau user..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#43552c]/20 focus:border-[#43552c] transition-all shadow-sm"
            />
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
              <p className="text-gray-500 text-sm font-medium">{error}</p>
              <button
                onClick={fetchTransactions}
                className="inline-flex items-center gap-2 px-5 py-2 bg-[#43552c] text-white rounded-xl text-xs font-bold hover:bg-[#324021] transition-colors"
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
                      Order ID & Produk
                    </th>
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Nominal
                    </th>
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Pihak Terkait
                    </th>
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">
                      Pembayaran
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions?.data?.length > 0 ? (
                    transactions.data?.map((order) => {
                      const productName = typeof order.product === "object"
                        ? (order.product?.name || "Produk Dihapus")
                        : (order.product || "Produk Dihapus");
                      const buyerName = typeof order.buyer === "object"
                        ? (order.buyer?.name || "Buyer Dihapus")
                        : (order.buyer || "Buyer Dihapus");
                      const sellerName = typeof order.seller === "object"
                        ? (order.seller?.name || "Seller Dihapus")
                        : (order.seller || "Seller Dihapus");
                      const payStatus = order.paymentStatus || order.payment_status || "unpaid";

                      return (
                        <tr
                          key={order.id}
                          className="group hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-8 py-5">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-400 tracking-tighter">
                                  #{order.id}
                                </span>
                                <p className="font-bold text-gray-800 text-sm truncate max-w-[180px]">
                                  {productName}
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-400">
                                <Calendar className="w-3 h-3" />{" "}
                                {formatDate(order.createdAt || order.created_at)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 text-[11px] font-bold text-[#43552c] border border-gray-100">
                              {formatCurrency(order.totalPrice || order.total_price)}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-600">
                                <span className="w-1 h-1 rounded-full bg-blue-400" />{" "}
                                {buyerName}{" "}
                                <span className="text-[9px] text-gray-400">
                                  (Buyer)
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-600">
                                <span className="w-1 h-1 rounded-full bg-[#43552c]" />{" "}
                                {sellerName}{" "}
                                <span className="text-[9px] text-gray-400">
                                  (Seller)
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[order.status] || statusColors.pending}`}
                            >
                              {order.status === "completed" ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : order.status === "shipping" ? (
                                <Truck className="w-3 h-3" />
                              ) : (
                                <Clock className="w-3 h-3" />
                              )}
                              {order.status}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-2.5">
                              <div className="flex flex-col items-end">
                                <span className="text-[10px] font-bold text-gray-800 uppercase tracking-tighter">
                                  {payStatus}
                                </span>
                                <div
                                  className={`w-12 h-1 rounded-full mt-1 ${paymentColors[payStatus] || "bg-gray-200"}`}
                                />
                              </div>
                              <button className="p-1.5 rounded-lg text-gray-300 hover:bg-gray-100 transition-colors">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-8 py-10 text-center text-gray-500 italic text-sm"
                      >
                        Tidak ada data transaksi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {transactions?.last_page > 1 && (
            <div className="px-8 py-5 bg-[#f7f9f7]/30 border-t border-gray-50 flex items-center justify-between">
              <p className="text-xs text-gray-500 font-medium">
                Halaman{" "}
                <span className="font-bold text-gray-900">
                  {transactions.current_page}
                </span>{" "}
                dari{" "}
                <span className="font-bold text-gray-900">
                  {transactions.last_page}
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
                    setPage((p) => Math.min(transactions.last_page, p + 1))
                  }
                  disabled={page >= transactions.last_page}
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
