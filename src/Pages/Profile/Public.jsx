import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import MainLayout from "@/Layouts/MainLayout";
import {
    MapPin,
    Calendar,
    Sparkles,
    ArrowUpRight,
    ShieldCheck,
    MessageSquare,
    AlertCircle,
    Star
} from "lucide-react";
import api from "@/lib/axios";

export default function PublicProfile() {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        setError(false);
        api.get(`/users/${id}`)
            .then((res) => {
                setProfile(res.data.data);
                document.title = `Profil ${res.data.data.name} | ReCircle`;
            })
            .catch((err) => {
                console.error("Gagal memuat profil:", err);
                setError(true);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [id]);

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary mb-4"></div>
                    <p className="text-gray-400 font-medium animate-pulse">Memuat profil penjual...</p>
                </div>
            </MainLayout>
        );
    }

    if (error || !profile) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                    <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Profil Tidak Ditemukan</h2>
                    <p className="text-gray-500 mb-6">Pengguna ini mungkin tidak ada atau telah dihapus.</p>
                    <Link to="/products" className="px-6 py-3 bg-primary text-white rounded-full font-bold">Kembali ke Eksplorasi</Link>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="bg-secondary min-h-screen pb-24">
                {/* --- HEADER PROFILE CARD --- */}
                <div className="pt-28 pb-6">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                            
                            {/* Left Side: Avatar & Details */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left w-full md:w-auto">
                                <div className="relative flex-shrink-0">
                                    <div className="w-24 h-24 rounded-full bg-[#43552c] flex items-center justify-center text-white text-4xl font-light shadow-inner overflow-hidden border-2 border-white shadow-sm">
                                        {profile.avatar && profile.avatar !== `https://ui-avatars.com/api/?name=${profile.name}` ? (
                                            <img src={profile.avatar} className="w-full h-full object-cover" alt={profile.name}/>
                                        ) : (
                                            profile.name.substring(0, 2).toUpperCase()
                                        )}
                                    </div>
                                    {profile.is_verified && (
                                        <div className="absolute bottom-0 right-0 bg-[#8fa1b4] text-white p-1 rounded-full border-2 border-white shadow-sm">
                                            <ShieldCheck className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex flex-col justify-center">
                                    <h1 className="text-2xl font-black text-[#0f172a] mb-1">{profile.name}</h1>
                                    <p className="text-sm text-gray-500 mb-4">Mahasiswa • {profile.kampus || "Kampus Tidak Diketahui"}</p>
                                    
                                    <div className="flex items-center justify-center sm:justify-start gap-5">
                                        <div className="flex items-center gap-1.5">
                                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                            <span className="text-sm font-bold text-gray-900">{profile.rating || 5}</span>
                                            <span className="text-sm text-gray-400">({profile.reviews_count || 0} ulasan)</span>
                                        </div>
                                        
                                        <div className="w-px h-8 bg-gray-200"></div>
                                        
                                        <div className="flex flex-col items-start">
                                            <span className="text-xs text-gray-400 mb-0.5">Bergabung</span>
                                            <span className="text-sm font-bold text-gray-900">
                                                {new Date(profile.joined_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Right Side: Verification Badge & Bio */}
                            <div className="flex flex-col items-center md:items-end w-full md:w-auto mt-4 md:mt-0">
                                {profile.is_verified ? (
                                    <>
                                        <div className="bg-[#eef2ef] text-[#43552c] px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm shadow-sm border border-[#43552c]/10">
                                            <ShieldCheck className="w-4 h-4" /> Verifikasi Mahasiswa
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-2 text-center md:text-right max-w-[200px]">
                                            Terverifikasi oleh sistem keamanan ReCircle.
                                        </p>
                                    </>
                                ) : (
                                    <div className="bg-gray-100 text-gray-500 px-5 py-2.5 rounded-xl font-bold text-sm">
                                        Belum Terverifikasi
                                    </div>
                                )}
                                
                                <Link 
                                    to={`/chat?user_id=${profile.id}&user_name=${encodeURIComponent(profile.name)}`}
                                    className="mt-6 w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white border-2 border-[#43552c] text-[#43552c] font-bold rounded-xl hover:bg-[#43552c]/5 transition-colors shadow-sm"
                                >
                                    <MessageSquare className="w-4 h-4" /> Chat Penjual
                                </Link>
                            </div>
                            
                        </div>

                        {/* Bio Section Below Card */}
                        {profile.bio && (
                            <div className="mt-6 px-4">
                                <p className="text-gray-600 text-sm italic border-l-4 border-emerald-200 pl-4 py-1 max-w-2xl">
                                    "{profile.bio}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- PRODUCTS LIST --- */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                    <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-2">
                        Etalase <span className="font-serif italic font-light text-primary">Barang</span>
                    </h2>

                    {profile.products && profile.products.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                            {profile.products.map((product) => (
                                <Link
                                    to={`/products/${product.id}`}
                                    key={product.id}
                                    className="group block"
                                >
                                    {/* IMAGE */}
                                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3 border border-gray-100 shadow-sm transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-gray-200/50 group-hover:-translate-y-2">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center"><Sparkles className="w-8 h-8 text-gray-300" /></div>
                                        )}
                                        {product.condition && (
                                            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-sm border border-white/50">
                                                <span className="text-[10px] font-bold text-gray-800 uppercase tracking-wide truncate max-w-[120px]">{product.condition}</span>
                                            </div>
                                        )}
                                    </div>
                                    {/* INFO */}
                                    <div className="px-1">
                                        <div className="flex items-end justify-between mb-1.5">
                                            <span className="text-lg font-black text-primary leading-none">Rp {Number(product.price).toLocaleString('id-ID')}</span>
                                            {product.price < 500000 && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">Best Deal</span>}
                                        </div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-gray-900 text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors pr-2">{product.name}</h3>
                                            <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0" />
                                        </div>
                                        {product.category && (
                                            <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded-md">{product.category}</span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 rounded-[2rem] bg-white">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Sparkles className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Etalase Kosong
                            </h3>
                            <p className="text-gray-500 text-sm max-w-xs mx-auto">
                                Penjual ini belum memiliki barang aktif yang dijual saat ini.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
