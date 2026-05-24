import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "@/Layouts/MainLayout";
import {
    Store,
    Mail,
    Phone,
    Building,
    ArrowLeft,
    AlertCircle,
    ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/axios";

export default function RegisterSeller() {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    
    const [data, setDataState] = useState({
        name: user?.name || "",
        email: user?.email || "",
        nomor_wa: user?.nomor_wa || "",
        kampus: user?.kampus || "",
        bio: user?.bio || "",
    });
    
    const setData = (key, value) => setDataState(prev => ({ ...prev, [key]: value }));
    
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        document.title = "Daftar sebagai Penjual - ReCircle";
        if (user) {
            setDataState({
                name: user.name || "",
                email: user.email || "",
                nomor_wa: user.nomor_wa || "",
                kampus: user.kampus || "",
                bio: user.bio || "",
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            // Update user profile with initial store details
            const res = await api.patch('/profile', {
                name: data.name,
                email: data.email,
                nomor_wa: data.nomor_wa,
                kampus: data.kampus,
                bio: data.bio
            });

            // Update global auth state if relevant
            if (setUser) {
                setUser(res.data?.data);
            }

            // Jump to actual Identity Verification step
            navigate("/seller/verification");
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                alert(err.response?.data?.message || 'Terjadi kesalahan, coba lagi nanti.');
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <MainLayout>
            {/* Header Kembali */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <Link
                    to="/"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-[#4A5D23] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali ke Beranda
                </Link>
            </div>

            {/* Hero Section */}
            <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-8 pb-12">
                <div className="text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-600 text-xs font-semibold tracking-wide uppercase mb-6 shadow-sm">
                        <Store className="w-4 h-4 text-[#4A5D23]" />
                        Buka Toko Mahasiswa
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-[#4A5D23] tracking-tighter mb-4">
                        Jual Barang Bekasmu, <br />
                        <span className="font-serif italic font-thin text-slate-800">
                            Raih Penghasilan Tambahan
                        </span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        Langkah 1 dari 2: Lengkapi profil tokomu sebelum mengirimkan verifikasi identitas.
                    </p>
                </div>
            </section>

            {/* Form Pendaftaran */}
            <section className="pb-24 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 md:p-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Nama Toko */}
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-bold text-slate-700 mb-2"
                            >
                                Nama Toko / User{" "}
                                <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#4A5D23]/20 outline-none transition ${errors.name ? 'border-rose-300' : 'border-slate-200 focus:border-[#4A5D23]'}`}
                                    placeholder="Mis: Toko Buku Bekas Andi"
                                    required
                                />
                            </div>
                            {errors.name && (
                                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {errors.name[0]}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-bold text-slate-700 mb-2"
                            >
                                Email Aktif{" "}
                                <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#4A5D23]/20 outline-none transition ${errors.email ? 'border-rose-300' : 'border-slate-200 focus:border-[#4A5D23]'}`}
                                    placeholder="kamu@mahasiswa.edu"
                                    required
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {errors.email[0]}
                                </p>
                            )}
                        </div>

                        {/* No Telepon */}
                        <div>
                            <label
                                htmlFor="nomor_wa"
                                className="block text-sm font-bold text-slate-700 mb-2"
                            >
                                Nomor WhatsApp
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    id="nomor_wa"
                                    type="tel"
                                    value={data.nomor_wa}
                                    onChange={(e) =>
                                        setData("nomor_wa", e.target.value)
                                    }
                                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#4A5D23]/20 outline-none transition ${errors.nomor_wa ? 'border-rose-300' : 'border-slate-200 focus:border-[#4A5D23]'}`}
                                    placeholder="08123456789"
                                />
                            </div>
                            {errors.nomor_wa && (
                                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {errors.nomor_wa[0]}
                                </p>
                            )}
                        </div>

                         {/* Kampus */}
                         <div>
                            <label
                                htmlFor="kampus"
                                className="block text-sm font-bold text-slate-700 mb-2"
                            >
                                Asal Kampus
                            </label>
                            <div className="relative">
                                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    id="kampus"
                                    type="text"
                                    value={data.kampus}
                                    onChange={(e) =>
                                        setData("kampus", e.target.value)
                                    }
                                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#4A5D23]/20 outline-none transition ${errors.kampus ? 'border-rose-300' : 'border-slate-200 focus:border-[#4A5D23]'}`}
                                    placeholder="Contoh: IPB University"
                                />
                            </div>
                            {errors.kampus && (
                                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {errors.kampus[0]}
                                </p>
                            )}
                        </div>

                        {/* Bio Deskripsi Toko */}
                        <div>
                            <label
                                htmlFor="bio"
                                className="block text-sm font-bold text-slate-700 mb-2"
                            >
                                Deskripsi Toko
                            </label>
                            <textarea
                                id="bio"
                                rows="3"
                                value={data.bio}
                                onChange={(e) =>
                                    setData("bio", e.target.value)
                                }
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#4A5D23]/20 outline-none transition resize-none ${errors.bio ? 'border-rose-300' : 'border-slate-200 focus:border-[#4A5D23]'}`}
                                placeholder="Ceritakan sedikit tentang barang apa yang kamu jual..."
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-[#4A5D23] text-white py-4 rounded-xl font-bold hover:bg-[#3B4A1C] transition-all shadow-lg shadow-[#4A5D23]/20 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {processing ? "Menyimpan..." : "Lanjut ke Verifikasi"}
                                {!processing && <ChevronRight className="w-5 h-5" />}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </MainLayout>
    );
}
