import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/Layouts/AdminLayout";
import axios from "@/lib/axios";
import {
  ShieldCheck,
  Check,
  X,
  Eye,
  Clock,
  Mail,
  School,
  Hash,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

export default function AdminVerifications() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flash, setFlash] = useState(null);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchVerifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/admin/verifications");
      setVerifications(res.data?.data || res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat data verifikasi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleApprove = async (id) => {
    if (!confirm("Setujui user ini sebagai penjual?")) return;
    setProcessing(true);
    try {
      await axios.post(`/admin/verifications/${id}/approve`);
      setFlash({ type: "success", message: "Pengajuan berhasil disetujui." });
      fetchVerifications();
    } catch (err) {
      setFlash({
        type: "error",
        message: err.response?.data?.message || "Gagal menyetujui.",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (id) => {
    if (!rejectReason.trim()) return alert("Masukkan alasan penolakan.");
    setProcessing(true);
    try {
      await axios.post(`/admin/verifications/${id}/reject`, {
        catatan_admin: rejectReason,
      });
      setFlash({ type: "success", message: "Pengajuan berhasil ditolak." });
      setRejectId(null);
      setRejectReason("");
      fetchVerifications();
    } catch (err) {
      setFlash({
        type: "error",
        message: err.response?.data?.message || "Gagal menolak.",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AdminLayout title="Verifikasi Seller">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-[#2c4055]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Verifikasi Penjual
              </h1>
              <p className="text-gray-500 mt-0.5">
                Review pengajuan KTM dari user untuk mendapatkan akses seller.
              </p>
            </div>
          </div>
        </div>

        {flash && (
          <div
            className={`rounded-2xl px-6 py-4 flex items-center gap-3 text-sm ${flash.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${flash.type === "success" ? "bg-green-100" : "bg-red-100"}`}
            >
              {flash.type === "success" ? (
                <Check className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </div>
            {flash.message}
            <button
              onClick={() => setFlash(null)}
              className="ml-auto opacity-50 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-6 h-6 text-[#43552c] animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-gray-500 text-sm">{error}</p>
            <button
              onClick={fetchVerifications}
              className="text-[#43552c] font-bold text-sm hover:underline"
            >
              Coba Lagi
            </button>
          </div>
        ) : verifications.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-16 text-center shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Semua Beres!
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Tidak ada pengajuan verifikasi yang tertunda saat ini.
            </p>
            <Link
              to="/admin/dashboard"
              className="mt-8 inline-flex items-center gap-2 text-[#43552c] font-bold hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {verifications.map((v) => (
              <div
                key={v.id}
                className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200 group transition-all hover:shadow-md"
              >
                <div className="flex flex-col lg:flex-row items-stretch gap-8">
                  {/* KTM Preview */}
                  <div className="lg:w-72 flex-shrink-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Dokumen KTM
                    </p>
                    <a
                      href={v.foto_ktm}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative group/img rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 aspect-[3/2]"
                    >
                      <img
                        src={v.foto_ktm}
                        alt="KTM"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl border border-white/30">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </a>
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col pt-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {v.user?.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Mail className="w-3.5 h-3.5" /> {v.user?.email}
                        </div>
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Diajukan {formatDate(v.created_at)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pb-8 border-b border-gray-50">
                      {[
                        { label: "Kampus", value: v.nama_kampus, icon: School },
                        { label: "NIM", value: v.nim, icon: Hash },
                      ].map(({ label, value, icon: Icon }) => (
                        <div
                          key={label}
                          className="flex items-center gap-3 p-4 rounded-2xl bg-[#f7f9f7]/50 border border-gray-100/50"
                        >
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                            <Icon className="w-[18px] h-[18px] text-[#43552c]" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              {label}
                            </p>
                            <p className="text-sm font-bold text-gray-800">
                              {value}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="mt-8">
                      {rejectId === v.id ? (
                        <div className="space-y-4">
                          <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Tuliskan alasan mengapa pengajuan ini ditolak..."
                            rows={3}
                            className="w-full rounded-2xl border border-gray-200 px-5 py-4 text-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 resize-none transition-shadow"
                          />
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleReject(v.id)}
                              disabled={processing}
                              className="flex-1 bg-red-500 text-white h-12 rounded-xl text-sm font-bold hover:bg-red-600 transition-colors shadow-sm disabled:opacity-50"
                            >
                              Konfirmasi Tolak
                            </button>
                            <button
                              onClick={() => {
                                setRejectId(null);
                                setRejectReason("");
                              }}
                              className="px-6 text-gray-500 text-sm font-bold hover:text-gray-900 transition-colors"
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleApprove(v.id)}
                            disabled={processing}
                            className="flex-1 max-w-[200px] flex items-center justify-center gap-2 bg-[#43552c] text-white h-12 rounded-xl text-sm font-bold hover:bg-[#364423] transition-all shadow-sm disabled:opacity-50"
                          >
                            <Check className="w-4 h-4" /> Setujui User
                          </button>
                          <button
                            onClick={() => setRejectId(v.id)}
                            className="flex items-center justify-center gap-2 bg-red-50 text-red-600 h-12 px-6 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors"
                          >
                            <X className="w-4 h-4" /> Tolak
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
