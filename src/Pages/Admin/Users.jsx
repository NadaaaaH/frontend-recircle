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
} from "lucide-react";
import api from "@/lib/axios";

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

export default function AdminUsersPage() {
  const [users, setUsers] = useState({
    data: [],
    total: 0,
    current_page: 1,
    last_page: 1,
  });
  const [filters, setFilters] = useState({ search: "", role: "" });
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
  const [page, setPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/admin/users", {
        params: { page, ...filters },
      });
      // Normalize response: API wraps data with { status, message, data }
      // and resources with paginator return { data: [...], meta: { total, current_page, last_page } }
      const payload = res.data?.data || res.data;
      if (payload && payload.data && payload.meta) {
        setUsers({
          data: payload.data,
          total: payload.meta.total,
          current_page: payload.meta.current_page,
          last_page: payload.meta.last_page,
        });
      } else {
        setUsers(payload);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat data pengguna.");
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

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
      if (editingUser)
        await axios.patch(`/admin/users/${editingUser.id}`, form);
      else await axios.post("/admin/users", form);
      closeModal();
      fetchUsers();
    } catch (err) {
      if (err.response?.status === 422)
        setFormErrors(err.response.data.errors || {});
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus pengguna ini?")) return;
    try {
      await axios.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus.");
    }
  };

  const handleToggleStatus = async (id) => {
    if (!confirm("Ubah status user ini?")) return;
    try {
      await axios.post(`/admin/users/${id}/toggle-status`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal mengubah status.");
    }
  };

  return (
    <AdminLayout title="Manajemen Pengguna">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Manajemen Pengguna
            </h2>
            <p className="text-gray-500 mt-1">
              Total {users.total || 0} pengguna terdaftar.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-44">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filters.role}
                onChange={(e) => {
                  setFilters((f) => ({ ...f, role: e.target.value }));
                  setPage(1);
                }}
                className="w-full pl-11 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#43552c]/20 appearance-none"
              >
                <option value="">Semua Peran</option>
                <option value="user">User</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, search: e.target.value }))
                }
                onKeyDown={(e) =>
                  e.key === "Enter" && (setPage(1), fetchUsers())
                }
                placeholder="Cari nama atau email..."
                className="w-full pl-11 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#43552c]/20 transition-all"
              />
            </div>
            <button
              onClick={openCreateModal}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-[#43552c] text-white rounded-xl text-sm font-bold hover:bg-[#324021] transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" /> Tambah User
            </button>
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
                onClick={fetchUsers}
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
                      Pengguna
                    </th>
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Kontak
                    </th>
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Peran
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
                  {users?.data?.length > 0 ? (
                    users.data.map((user) => (
                      <tr
                        key={user.id}
                        className="group hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#43552c]/10 text-[#43552c] flex items-center justify-center font-bold">
                              {user.name?.charAt(0) || "?"}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-sm">
                                {user.name}
                              </p>
                              <div className="flex items-center gap-1 mt-0.5 text-[10px] text-gray-400">
                                <Calendar className="w-3 h-3" />{" "}
                                {formatDate(user.createdAt)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />{" "}
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                                                    ${user.role === "admin" ? "bg-red-50 text-red-600" : user.role === "seller" ? "bg-[#43552c]/10 text-[#43552c]" : "bg-blue-50 text-blue-600"}`}
                          >
                            {user.role === "admin" ? (
                              <Shield className="w-3 h-3" />
                            ) : (
                              <UserIcon className="w-3 h-3" />
                            )}{" "}
                            {user.role}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {user.isActive ? (
                            <div className="flex items-center gap-1.5 text-green-600 text-[10px] font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> AKTIF
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-red-500 text-[10px] font-bold">
                              <XCircle className="w-3.5 h-3.5" /> DIBLOKIR
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleStatus(user.id)}
                              title={user.isActive ? "Blokir" : "Aktifkan"}
                              className={`p-2 rounded-lg transition-colors ${user.isActive ? "text-orange-400 hover:bg-orange-50" : "text-green-500 hover:bg-green-50"}`}
                            >
                              <Power className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(user)}
                              className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-8 py-10 text-center text-gray-500 italic text-sm"
                      >
                        Tidak ada data pengguna.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {users?.last_page > 1 && (
            <div className="px-8 py-5 bg-[#f7f9f7]/30 border-t border-gray-50 flex items-center justify-between">
              <p className="text-xs text-gray-500 font-medium">
                Halaman{" "}
                <span className="font-bold text-gray-900">
                  {users.current_page}
                </span>{" "}
                dari{" "}
                <span className="font-bold text-gray-900">
                  {users.last_page}
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
                    setPage((p) => Math.min(users.last_page, p + 1))
                  }
                  disabled={page >= users.last_page}
                  className="p-2 rounded-lg bg-white border border-gray-100 text-gray-500 hover:border-[#43552c] hover:text-[#43552c] disabled:opacity-40 disabled:pointer-events-none transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
                </h3>
                <p className="text-gray-500 text-xs mt-1">
                  Lengkapi informasi pengguna di bawah ini.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
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
                <div key={key} className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                    {label}{" "}
                    {key === "password" && editingUser && (
                      <span className="text-gray-300 normal-case font-medium">
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
                    className={`w-full px-5 py-3 bg-gray-50 border ${formErrors[key] ? "border-red-300" : "border-gray-100"} rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-[#43552c]/20 transition-all`}
                  />
                  {formErrors[key] && (
                    <p className="text-red-500 text-[10px] font-bold px-1">
                      {formErrors[key][0]}
                    </p>
                  )}
                </div>
              ))}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                  Peran (Role)
                </label>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role: e.target.value }))
                  }
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-[#43552c]/20 transition-all appearance-none"
                >
                  <option value="user">User</option>
                  <option value="seller">Seller</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border border-gray-100 text-gray-500 rounded-2xl text-sm font-bold hover:bg-gray-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 px-6 py-3 bg-[#43552c] text-white rounded-2xl text-sm font-bold hover:bg-[#324021] transition-all shadow-lg disabled:opacity-50"
                >
                  {processing
                    ? "Menyimpan..."
                    : editingUser
                      ? "Simpan Perubahan"
                      : "Tambah Pengguna"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
