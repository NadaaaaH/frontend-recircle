import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import axios from "@/lib/axios";
import {
  Search,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingDown,
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
  accepted: "bg-green-50 text-green-600 border-green-100",
  rejected: "bg-red-50 text-red-600 border-red-100",
  pending: "bg-orange-50 text-orange-600 border-orange-100",
  cancelled: "bg-gray-50 text-gray-500 border-gray-100",
};

export default function AdminOffers() {
  const [offers, setOffers] = useState({
    data: [],
    total: 0,
    current_page: 1,
    last_page: 1,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/admin/offers", {
        params: { page, search },
      });
      const rawData = res.data?.data || res.data;
      if (rawData && typeof rawData === 'object') {
        const dataArray = Array.isArray(rawData) ? rawData : (rawData.data || []);
        const meta = rawData.meta || {};
        setOffers({
          data: dataArray,
          total: meta.total ?? rawData.total ?? dataArray.length,
          current_page: meta.current_page ?? rawData.current_page ?? 1,
          last_page: meta.last_page ?? rawData.last_page ?? 1,
        });
      } else {
        setOffers({
          data: [],
          total: 0,
          current_page: 1,
          last_page: 1,
        });
      }
    } catch (err) {
      console.error("Fetch offers error:", err);
      const status = err.response?.status;
      let errorMsg = "Gagal memuat data penawaran.";
      if (status === 404) {
        errorMsg = "Endpoint penawaran tidak ditemukan (404). Silakan hubungi admin.";
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
    fetchOffers();
  }, [fetchOffers]);

  return (
    <AdminLayout title="Aktivitas Penawaran">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Aktivitas Penawaran
            </h2>
            <p className="text-gray-500 mt-1">
              Pantau negosiasi harga antara pembeli dan penjual.
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (setPage(1), fetchOffers())
              }
              placeholder="Cari produk atau pengguna..."
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
              <p className="text-gray-500 text-sm">{error}</p>
              <button
                onClick={fetchOffers}
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
                      Produk & Waktu
                    </th>
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Negosiasi
                    </th>
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Pihak Terlibat
                    </th>
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {offers.data?.length > 0 ? (
                    offers.data.map((offer) => (
                      <tr
                        key={offer.id}
                        className="group hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-8 py-5">
                          <div className="min-w-0">
                            <p className="font-bold text-gray-800 text-sm truncate max-w-[200px]">
                              {offer.product}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-400">
                              <Calendar className="w-3 h-3" />{" "}
                              {formatDate(offer.created_at)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="text-xs">
                              {offer.status === "accepted" && (offer.negotiated_price || offer.dealPrice || offer.deal_price) ? (
                                <>
                                  <p className="text-gray-400 line-through text-[10px]">
                                    {formatCurrency(offer.original_price)}
                                  </p>
                                  <p className="text-gray-400 line-through text-[10px]">
                                    {formatCurrency(offer.offered_price)}
                                  </p>
                                  <p className="font-extrabold text-green-600">
                                    {formatCurrency(offer.negotiated_price || offer.dealPrice || offer.deal_price)}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="text-gray-400 line-through text-[10px]">
                                    {formatCurrency(offer.original_price)}
                                  </p>
                                  <p className="font-bold text-[#43552c]">
                                    {formatCurrency(offer.offered_price)}
                                  </p>
                                </>
                              )}
                            </div>
                            {offer.original_price > 0 && (
                              <div className="px-2 py-0.5 rounded bg-green-50 text-green-600 text-[10px] font-bold flex items-center gap-1">
                                <TrendingDown className="w-3 h-3" />-
                                {Math.round(
                                  (1 -
                                    (offer.status === "accepted" && (offer.negotiated_price || offer.dealPrice || offer.deal_price) ? (offer.negotiated_price || offer.dealPrice || offer.deal_price) : offer.offered_price) /
                                      offer.original_price) *
                                    100,
                                )}
                                %
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-[11px] font-medium text-gray-600">
                              <div className="w-5 h-5 rounded-md bg-blue-50 text-blue-500 flex items-center justify-center text-[9px] font-bold">
                                B
                              </div>
                              {offer.buyer}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-medium text-gray-600">
                              <div className="w-5 h-5 rounded-md bg-[#43552c]/10 text-[#43552c] flex items-center justify-center text-[9px] font-bold">
                                P
                              </div>
                              {offer.seller}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[offer.status] || statusColors.pending}`}
                          >
                            {offer.status === "accepted" ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : offer.status === "rejected" ? (
                              <XCircle className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            {offer.status}
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
                        Tidak ada data penawaran.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {offers?.last_page > 1 && (
            <div className="px-8 py-5 bg-[#f7f9f7]/30 border-t border-gray-50 flex items-center justify-between">
              <p className="text-xs text-gray-500 font-medium">
                Halaman{" "}
                <span className="font-bold text-gray-900">
                  {offers.current_page}
                </span>{" "}
                dari{" "}
                <span className="font-bold text-gray-900">
                  {offers.last_page}
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
                    setPage((p) => Math.min(offers.last_page, p + 1))
                  }
                  disabled={page >= offers.last_page}
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
