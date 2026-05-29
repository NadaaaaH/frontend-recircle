import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import axios from "@/lib/axios";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingDown,
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
  accepted: "bg-emerald-50 text-emerald-600 border-emerald-100/70",
  rejected: "bg-rose-50 text-rose-600 border-rose-100/70",
  pending: "bg-orange-50 text-orange-600 border-orange-100/70",
  cancelled: "bg-slate-50 text-slate-500 border-slate-200/50",
};

export default function AdminOffers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [offers, setOffers] = useState({
    data: [],
    total: 0,
    current_page: 1,
    last_page: 1,
  });
  
  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/admin/offers", {
        params: { page, search, status },
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
      const errStatus = err.response?.status;
      let errorMsg = "Gagal memuat data penawaran.";
      if (errStatus === 404) {
        errorMsg = "Endpoint penawaran tidak ditemukan (404). Silakan hubungi admin.";
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
    fetchOffers();
  }, [fetchOffers]);

  return (
    <AdminLayout title="Aktivitas Penawaran">
      <div className="space-y-6 max-w-[1200px] mx-auto">

        {/* 1. TOP ACTION HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              Aktivitas Penawaran
            </h2>
            <p className="text-xs text-slate-400 font-normal mt-0.5">
              Pantau aktivitas dan riwayat negosiasi harga produk preloved di ReCircle.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchOffers}
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

        {/* 2. SEARCH & FILTER BAR PLACEMENT */}
        <div className="flex justify-end mb-4">
          <div className="w-full md:w-96">
            <SearchFilterBar
              filterOptions={[
                { value: "pending", label: "Menunggu" },
                { value: "accepted", label: "Disetujui" },
                { value: "rejected", label: "Ditolak" },
                { value: "cancelled", label: "Dibatalkan" },
              ]}
              filterKey="status"
              placeholder="Cari produk atau pengguna..."
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
                  <th className="py-3 px-4 font-normal">Produk & Tanggal</th>
                  <th className="py-3 px-4 font-normal">Negosiasi</th>
                  <th className="py-3 px-4 font-normal">Pihak Terlibat</th>
                  <th className="py-3 px-6 font-normal text-center">Status</th>
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
                      <button onClick={fetchOffers} className="text-[#43552c] text-xs underline mt-2.5 inline-block">
                        Coba Lagi
                      </button>
                    </td>
                  </tr>
                ) : offers.data?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-slate-400 text-xs mt-2.5">Tidak ada data penawaran.</p>
                    </td>
                  </tr>
                ) : (
                  offers.data.map((offer) => (
                    <tr key={offer.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="py-3.5 px-6 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-slate-200 text-[#43552c] focus:ring-[#43552c]/20 cursor-pointer" 
                          checked={false} 
                          readOnly 
                        />
                      </td>

                      {/* Produk & Waktu */}
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-normal text-slate-700 text-xs block truncate max-w-[220px]" title={offer.product}>
                            {offer.product}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[9px] text-slate-400 font-normal mt-0.5">
                            <Calendar className="w-2.5 h-2.5" />
                            {formatDate(offer.created_at)}
                          </span>
                        </div>
                      </td>

                      {/* Negosiasi */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="text-xs font-normal">
                            {offer.status === "accepted" && (offer.negotiated_price || offer.dealPrice || offer.deal_price) ? (
                              <>
                                <p className="text-slate-400 line-through text-[9px] leading-tight">
                                  {formatCurrency(offer.original_price)}
                                </p>
                                <p className="text-slate-400 line-through text-[9px] leading-tight">
                                  {formatCurrency(offer.offered_price)}
                                </p>
                                <p className="font-medium text-emerald-600 text-xs mt-0.5">
                                  {formatCurrency(offer.negotiated_price || offer.dealPrice || offer.deal_price)}
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="text-slate-400 line-through text-[9px] leading-tight">
                                  {formatCurrency(offer.original_price)}
                                </p>
                                <p className="font-medium text-[#43552c] text-xs mt-0.5">
                                  {formatCurrency(offer.offered_price)}
                                </p>
                              </>
                            )}
                          </div>
                          {offer.original_price > 0 && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[9px] font-normal border border-emerald-100/50">
                              <TrendingDown className="w-2.5 h-2.5" />
                              {Math.round(
                                (1 -
                                  (offer.status === "accepted" && (offer.negotiated_price || offer.dealPrice || offer.deal_price) ? (offer.negotiated_price || offer.dealPrice || offer.deal_price) : offer.offered_price) /
                                    offer.original_price) *
                                  100,
                              )}
                              % OFF
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Pihak Terlibat */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[10px] font-normal text-slate-500">
                            <span className="w-4 h-4 rounded bg-blue-50 text-blue-500 flex items-center justify-center text-[8px] font-medium border border-blue-100/50">
                              B
                            </span>
                            <span className="truncate max-w-[120px]">{offer.buyer}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-normal text-slate-500">
                            <span className="w-4 h-4 rounded bg-[#43552c]/5 text-[#43552c] flex items-center justify-center text-[8px] font-medium border border-[#43552c]/10">
                              P
                            </span>
                            <span className="truncate max-w-[120px]">{offer.seller}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-6 text-center">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-normal lowercase capitalize border ${
                          statusColors[offer.status] || statusColors.pending
                        }`}>
                          {offer.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 5. PAGINATION FOOTER */}
          {offers?.last_page > 1 && (
            <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border-t border-slate-100/60">
              <span className="text-[11px] text-slate-400 font-normal">
                Halaman {offers.current_page} dari {offers.last_page} ({offers.total} total penawaran)
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
                  {offers.current_page}
                </button>
                <button
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set("page", Math.min(offers.last_page, page + 1));
                    setSearchParams(newParams);
                  }}
                  disabled={page >= offers.last_page}
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
