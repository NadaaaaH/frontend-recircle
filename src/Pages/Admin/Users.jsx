import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import axios from "@/lib/axios";
import {
  Search,
  Shield,
  User as UserIcon,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  Power,
  Edit,
  Trash2,
  Plus,
  Filter,
  X,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download
} from "lucide-react";
import api from "@/lib/axios";
import { useNotification } from "@/contexts/NotificationContext";
import { useSearchParams } from "react-router-dom";
import SearchFilterBar from "@/Components/SearchFilterBar";

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

export default function AdminUsersPage() {
  const { showToast } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState({
    data: [],
    total: 0,
    current_page: 1,
    last_page: 1,
  });
  const [stats, setStats] = useState({
    total: 0,
    admin: 0,
    seller: 0,
    user: 0,
  });
  
  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [formErrors, setFormErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/admin/users", {
        params: { 
          page,
          search,
          role
        },
      });
      const payload = res.data?.data || res.data;
      if (payload && typeof payload === 'object') {
        const dataArray = Array.isArray(payload) ? payload : (payload.data || []);
        const meta = payload.meta || payload || {};
        setUsers({
          data: dataArray,
          total: meta.total ?? payload.total ?? dataArray.length,
          current_page: meta.current_page ?? payload.current_page ?? 1,
          last_page: meta.last_page ?? payload.last_page ?? 1,
        });
        if (payload.stats) {
          setStats(payload.stats);
        }
      } else {
        setUsers({
          data: [],
          total: 0,
          current_page: 1,
          last_page: 1,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat data pengguna.");
    } finally {
      setLoading(false);
    }
  }, [page, search, role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openCreateModal = () => {
    setEditingUser(null);
    setForm({ name: "", email: "", password: "", role: "user" });
    setFormErrors({});
    setIsModalOpen(true);
  };
  const openEditModal = (u) => {
    setEditingUser(u);
    setForm({
      name: u.name || "",
      email: u.email || "",
      password: "",
      role: u.role || "user",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setFormErrors({});
    try {
      if (editingUser) {
        await axios.patch(`/admin/users/${editingUser.id}`, form);
        showToast("Perubahan data pengguna berhasil disimpan.", "success");
      } else {
        await axios.post("/admin/users", form);
        showToast("Pengguna baru berhasil ditambahkan.", "success");
      }
      closeModal();
      fetchUsers();
    } catch (err) {
      if (err.response?.status === 422) {
        setFormErrors(err.response.data.errors || {});
      } else {
        showToast(err.response?.data?.message || "Terjadi kesalahan saat menyimpan data.", "error");
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus pengguna ini?")) return;
    try {
      await axios.delete(`/admin/users/${id}`);
      showToast("Pengguna berhasil dihapus.", "success");
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal menghapus.", "error");
    }
  };

  const handleToggleStatus = async (id) => {
    if (!confirm("Ubah status user ini?")) return;
    try {
      await axios.post(`/admin/users/${id}/toggle-status`);
      showToast("Status pengguna berhasil diubah.", "success");
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || "Gagal mengubah status.", "error");
    }
  };

  return (
    <AdminLayout title="Manajemen Pengguna">
      <div className="space-y-6 max-w-[1200px] mx-auto">

        {/* 1. TOP ACTION HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              Manajemen Pengguna
            </h2>
            <p className="text-xs text-slate-400 font-normal mt-0.5">
              Total {users.total || 0} pengguna terdaftar di sistem.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchUsers}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-slate-200/80 hover:border-slate-300 text-slate-500 rounded-lg text-xs font-normal bg-white transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <button 
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#43552c] hover:bg-[#324021] text-white rounded-lg text-xs font-medium transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah User
            </button>
          </div>
        </div>

        {/* 2. SUMMARY STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span className="text-xs font-normal text-slate-400">Total Pengguna</span>
            </div>
            <span className="text-2xl font-bold text-slate-800 mt-2.5 leading-none">{stats.total}</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-normal text-slate-400">Administrator</span>
            </div>
            <span className="text-2xl font-bold text-slate-800 mt-2.5 leading-none">{stats.admin}</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-xs font-normal text-slate-400">Penjual Terverifikasi</span>
            </div>
            <span className="text-2xl font-bold text-slate-800 mt-2.5 leading-none">{stats.seller}</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="text-xs font-normal text-slate-400">Regular Buyer</span>
            </div>
            <span className="text-2xl font-bold text-slate-800 mt-2.5 leading-none">{stats.user}</span>
          </div>
        </div>

        {/* 3. SEARCH & FILTER BAR PLACEMENT */}
        <div className="flex justify-end mb-4">
          <div className="w-full md:w-96">
            <SearchFilterBar
              filterOptions={[
                { value: "user", label: "User" },
                { value: "seller", label: "Seller" },
                { value: "admin", label: "Admin" },
              ]}
              filterKey="role"
              placeholder="Cari nama atau email..."
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
                  <th className="py-3 px-4 font-normal">Pengguna</th>
                  <th className="py-3 px-4 font-normal">Kontak</th>
                  <th className="py-3 px-4 font-normal">Peran</th>
                  <th className="py-3 px-4 font-normal text-center">Status</th>
                  <th className="py-3 px-6 font-normal text-right">Aksi</th>
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
                      <button onClick={fetchUsers} className="text-[#43552c] text-xs underline mt-2.5 inline-block">
                        Coba Lagi
                      </button>
                    </td>
                  </tr>
                ) : users?.data?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <UserIcon className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-slate-400 text-xs mt-2.5">Tidak ada data pengguna.</p>
                    </td>
                  </tr>
                ) : (
                  users.data.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="py-3.5 px-6 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-slate-200 text-[#43552c] focus:ring-[#43552c]/20 cursor-pointer" 
                          checked={false} 
                          readOnly 
                        />
                      </td>

                      {/* Info Pengguna */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#43552c]/5 text-[#43552c] border border-[#43552c]/10 flex items-center justify-center font-normal text-xs flex-shrink-0">
                            {user.name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <span className="font-normal text-slate-700 text-xs block">
                              {user.name}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[9px] text-slate-400 font-normal mt-0.5">
                              <Calendar className="w-2.5 h-2.5" />
                              Daftar: {formatDate(user.createdAt)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Kontak */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-normal">
                          <Mail className="w-3.5 h-3.5 text-slate-300" />
                          {user.email}
                        </div>
                      </td>

                      {/* Peran (Role) */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-normal lowercase capitalize border ${
                          user.role === "admin" 
                            ? "bg-red-50 text-red-600 border-red-100/70" 
                            : user.role === "seller" 
                              ? "bg-emerald-50 text-[#43552c] border-[#43552c]/10" 
                              : "bg-blue-50 text-blue-600 border-blue-100/70"
                        }`}>
                          {user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {user.isActive ? (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-normal bg-green-50 text-green-600 border border-green-100/70">
                            aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-normal bg-rose-50 text-rose-600 border border-rose-100/70">
                            diblokir
                          </span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggleStatus(user.id)}
                            title={user.isActive ? "Blokir" : "Aktifkan"}
                            className={`p-1.5 rounded-lg transition-colors ${
                              user.isActive ? "text-slate-400 hover:text-amber-500 hover:bg-amber-50" : "text-slate-400 hover:text-green-500 hover:bg-green-50"
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-rose-50 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 5. PAGINATION FOOTER */}
          {users?.last_page > 1 && (
            <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border-t border-slate-100/60">
              <span className="text-[11px] text-slate-400 font-normal">
                Halaman {users.current_page} dari {users.last_page} ({users.total} total user)
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
                  {users.current_page}
                </button>
                <button
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set("page", Math.min(users.last_page, page + 1));
                    setSearchParams(newParams);
                  }}
                  disabled={page >= users.last_page}
                  className="px-2.5 py-1 border border-slate-100 rounded text-xs font-normal text-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100 animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
                </h3>
                <p className="text-slate-400 text-[10px] font-normal mt-0.5">
                  Lengkapi informasi kredensial di bawah ini.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {[
                {
                  key: "name",
                  label: "Nama Lengkap",
                  type: "text",
                  placeholder: "Masukkan nama lengkap...",
                },
                {
                  key: "email",
                  label: "Alamat Email",
                  type: "email",
                  placeholder: "nama@email.com",
                },
                {
                  key: "password",
                  label: "Password",
                  type: "password",
                  placeholder: "Min. 8 karakter...",
                },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key} className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-normal block">
                    {label}{" "}
                    {key === "password" && editingUser && (
                      <span className="text-slate-300">
                        (kosongkan jika tidak diubah)
                      </span>
                    )}
                  </label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                    placeholder={placeholder}
                    className={`w-full px-3.5 py-2 bg-slate-50 border ${formErrors[key] ? "border-red-300" : "border-slate-100"} rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-[#43552c]/10 focus:border-[#43552c] transition-all outline-none`}
                  />
                  {formErrors[key] && (
                    <p className="text-red-500 text-[10px] font-normal px-1 mt-0.5">
                      {formErrors[key][0]}
                    </p>
                  )}
                </div>
              ))}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-normal block">
                  Peran (Role)
                </label>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role: e.target.value }))
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-[#43552c]/10 focus:border-[#43552c] transition-all outline-none"
                >
                  <option value="user">User</option>
                  <option value="seller">Seller</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs font-normal hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-[#43552c] text-white rounded-lg text-xs font-medium hover:bg-[#324021] transition-colors disabled:opacity-50"
                >
                  {processing
                    ? "Menyimpan..."
                    : editingUser
                      ? "Simpan"
                      : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
