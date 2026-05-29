import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/Layouts/AdminLayout";
import axios from "@/lib/axios";
import {
  UserPlus,
  Package,
  ShoppingCart,
  Clock,
  ArrowLeft,
  Filter,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

export default function AdminActivities() {
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/admin/activities?type=${filter}`);
      setActivities(res.data?.data || res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat aktivitas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [filter]);

  return (
    <AdminLayout title="Semua Aktivitas">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#43552c] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none pl-10 pr-10 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-600 shadow-sm hover:shadow-md hover:border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#43552c] transition-all cursor-pointer"
              >
                <option value="all">Semua Aktivitas</option>
                <option value="user">User Baru</option>
                <option value="product">Produk Baru</option>
                <option value="order">Pesanan Baru</option>
              </select>
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <Filter className="w-4 h-4" />
              </div>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none border-l border-gray-100 pl-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <button
              onClick={fetchActivities}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-600 shadow-sm hover:shadow-md hover:border-gray-200 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50">
            <h3 className="text-xl font-bold text-gray-900">
              Log Aktivitas Sistem
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Daftar lengkap aktivitas terbaru di platform ReCircle.
            </p>
          </div>

          {loading ? (
            <div className="divide-y divide-gray-50 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-6 flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex-shrink-0 animate-pulse" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-100 rounded-lg w-1/3" />
                    <div className="h-3 bg-gray-50 rounded-lg w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <p className="text-gray-500 text-sm">{error}</p>
              <button
                onClick={fetchActivities}
                className="text-[#43552c] font-bold text-sm hover:underline"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {activities.length > 0 ? (
                activities.map((activity, idx) => (
                  <div
                    key={idx}
                    className="p-6 flex gap-4 hover:bg-gray-50/50 transition-colors group"
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm
                                        ${
                                          activity.type === "user"
                                            ? "bg-blue-50 text-blue-500"
                                            : activity.type === "product"
                                              ? "bg-[#43552c]/10 text-[#43552c]"
                                              : "bg-[#d4a373]/10 text-[#d4a373]"
                                        }`}
                    >
                      {activity.type === "user" ? (
                        <UserPlus className="w-5 h-5" />
                      ) : activity.type === "product" ? (
                        <Package className="w-5 h-5" />
                      ) : (
                        <ShoppingCart className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-gray-900 text-base leading-tight">
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                            {activity.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
                          <Clock className="w-3.5 h-3.5" /> {activity.time}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <p className="text-gray-400 italic">
                    Tidak ada aktivitas yang ditemukan.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
