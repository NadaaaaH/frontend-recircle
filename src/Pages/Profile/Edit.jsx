import React, { useState, useEffect } from "react";
import MainLayout from "@/Layouts/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
    User as UserIcon,
    Settings,
    ShoppingBag,
    Clock,
    Star,
    ShieldCheck,
    LogOut,
    ChevronRight,
    MapPin,
    Package,
    AlertCircle,
    CheckCircle,
    Loader2,
} from "lucide-react";
import api from '@/lib/axios';

export default function Edit() {
    const { user, logout, isSeller } = useAuth();
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState("orders");
    const [isLoading, setIsLoading] = useState(true);
    const [orders, setOrders] = useState({ ongoing: [], history: [] });

    useEffect(() => {
        document.title = "Profil & Pengaturan | ReCircle";
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/orders');
            const allOrders = res.data?.data?.data || []; // Handle standard nested resource array
            
            // Logic to split into active/ongoing and static history
            const ongoingStates = ['pending', 'dibayar', 'dikemas', 'dikirim'];
            const ongoing = allOrders.filter(o => ongoingStates.includes(o.status?.toLowerCase()));
            const history = allOrders.filter(o => !ongoingStates.includes(o.status?.toLowerCase()));

            setOrders({ ongoing, history });
        } catch (err) {
            console.error("Failed loading orders", err);
        } finally {
            setIsLoading(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const colors = {
            pending: "bg-amber-100 text-amber-700 border-amber-200",
            dibayar: "bg-blue-100 text-blue-700 border-blue-200",
            dikemas: "bg-orange-100 text-orange-700 border-orange-200",
            dikirim: "bg-indigo-100 text-indigo-700 border-indigo-200",
            selesai: "bg-emerald-100 text-emerald-700 border-emerald-200",
            dibatalkan: "bg-rose-100 text-rose-700 border-rose-200",
            failed: "bg-red-100 text-red-700 border-red-200",
        };
        
        const normalizedStatus = status?.toLowerCase() || 'unknown';
        const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Status';
        
        return (
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${colors[normalizedStatus] || "bg-gray-100"}`}>
                {label}
            </span>
        );
    };

    // Format helper for date joined
    const getJoinDate = () => {
        if (!user?.created_at) return "Baru Saja";
        const date = new Date(user.created_at);
        return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-secondary">
            <div className="max-w-4xl mx-auto px-4 py-8 pt-28">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Profil Saya</h1>
                {/* --- 1. PROFILE CARD HERO --- */}
                <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-gray-100 shadow-sm mb-8 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-secondary border-4 border-white shadow-lg overflow-hidden">
                                <img
                                    src={
                                        user?.avatar_url
                                            ? user.avatar
                                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=43552c&color=fff`
                                    }
                                    alt={user?.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className={`absolute bottom-0 right-0 p-1.5 rounded-full border-2 border-white shadow-sm ${user?.is_seller ? "bg-[#4A5D23]" : "bg-gray-400"}`}>
                                <ShieldCheck className="w-4 h-4 text-white" />
                            </div>
                        </div>

                        {/* Info */}
                        <div className="text-center md:text-left flex-1">
                            <h3 className="text-2xl font-black text-gray-900 mb-1">
                                {user?.name || 'Memuat...'}
                            </h3>
                            <p className="text-gray-500 font-medium text-xs mb-2">
                                {user?.is_seller ? "Verifed Seller" : "Pembeli"} •{" "}
                                {user?.kampus || "Lokasi Belum Diatur"}
                            </p>
                            
                            <div className="flex items-center justify-center md:justify-start gap-6">
                                <div className="flex items-center gap-2">
                                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                    <span className="font-bold text-gray-900">5.0</span>
                                    <span className="text-xs text-gray-400">(0 ulasan)</span>
                                </div>
                                <div className="w-px h-8 bg-gray-200"></div>
                                <div>
                                    <p className="text-xs text-gray-400">Bergabung</p>
                                    <p className="font-bold text-gray-900 text-sm">{getJoinDate()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Seller Prompt if not seller */}
                        {!user?.is_seller && (
                            <div className="mt-4 md:mt-0">
                                <Link 
                                    to="/seller/register" 
                                    className="bg-[#4A5D23]/10 text-[#4A5D23] border border-[#4A5D23]/20 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-[#4A5D23] hover:text-white transition-all flex items-center gap-2 whitespace-nowrap"
                                >
                                    <ShoppingBag className="w-4 h-4" /> Daftar Jadi Penjual
                                </Link>
                                <p className="text-[10px] text-gray-400 mt-2 text-center md:text-right max-w-[150px]">
                                    Mulai tawarkan barang preloved-mu ke kampus
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#4A5D23]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                </div>

                {/* --- 2. TABS NAVIGATION --- */}
                <div className="flex p-1 bg-white border border-gray-100 rounded-2xl mb-8 shadow-sm overflow-x-auto">
                    {[
                        { id: "orders", label: "Diproses", icon: Package },
                        { id: "history", label: "Riwayat", icon: Clock },
                        { id: "settings", label: "Pengaturan", icon: Settings },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                                ? "bg-[#E4E8DA] text-[#4A5D23] shadow-sm"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                        >
                            <tab.icon className="w-4 h-4" /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* --- 3. TAB CONTENT --- */}
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center text-gray-400">
                        <Loader2 className="w-8 h-8 animate-spin text-[#4A5D23] mb-2" />
                        <span className="text-sm font-medium">Memuat...</span>
                    </div>
                ) : (
                    <>
                        {/* TAB: ONGOING */}
                        {activeTab === "orders" && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-gray-900">Pesanan Berjalan</h3>
                                    <span className="text-xs bg-[#4A5D23] text-white px-2.5 py-1 rounded-full font-bold">
                                        {orders.ongoing.length}
                                    </span>
                                </div>

                                {orders.ongoing.length > 0 ? (
                                    orders.ongoing.map((order) => (
                                        <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 hover:border-[#4A5D23]/30 transition-colors shadow-sm">
                                            <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-50">
                                                <img
                                                    src={order.product?.image || 'https://placehold.co/400x400?text=Product'}
                                                    alt={order.product?.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start gap-2">
                                                        <h4 className="font-bold text-gray-900 line-clamp-1 leading-snug">
                                                            {order.product?.name || `Pesanan #${order.orderCode}`}
                                                        </h4>
                                                        <StatusBadge status={order.status} />
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1 font-medium">
                                                        ID: {order.orderCode}
                                                    </p>
                                                </div>
                                                <div className="flex justify-between items-end mt-2">
                                                    <p className="text-[#4A5D23] font-black text-base">
                                                        Rp {Number(order.totalPrice).toLocaleString("id-ID")}
                                                    </p>
                                                    <Link 
                                                        to={`/orders/${order.id}`} 
                                                        className="text-xs font-bold bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all"
                                                    >
                                                        Detail Trx
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <EmptyState message="Tidak ada transaksi aktif yang sedang diproses." />
                                )}
                            </div>
                        )}

                        {/* TAB: HISTORY */}
                        {activeTab === "history" && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-gray-900">Riwayat Belanja</h3>
                                </div>
                                {orders.history.length > 0 ? (
                                    orders.history.map((order) => (
                                        <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 opacity-85 hover:opacity-100 transition-all shadow-sm border-l-4 border-l-[#4A5D23]">
                                            <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                                <img
                                                    src={order.product?.image || 'https://placehold.co/400x400?text=Done'}
                                                    alt="Past product"
                                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-bold text-gray-800 line-clamp-1">
                                                        {order.product?.name || `Transaksi ${order.orderCode}`}
                                                    </h4>
                                                    <StatusBadge status={order.status} />
                                                </div>
                                                <p className="text-xs text-gray-500 font-medium mb-2">
                                                    Selesai pada {new Date(order.createdAt).toLocaleDateString('id-ID')}
                                                </p>
                                                <div className="flex justify-between items-center">
                                                    <p className="text-sm font-bold text-gray-900">Rp {Number(order.totalPrice).toLocaleString("id-ID")}</p>
                                                    <Link to={`/orders/${order.id}`} className="text-xs font-bold text-[#4A5D23] hover:underline">Lihat Nota</Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <EmptyState message="Belum ada riwayat transaksi." />
                                )}
                            </div>
                        )}

                {/* TAB: SETTINGS (Menu Grid) */}
                {activeTab === "settings" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Profile Edit */}
                        <div
                            onClick={() => navigate('/profile/edit')}
                            className="bg-white border border-gray-100 p-5 rounded-2xl hover:border-primary/30 transition-all cursor-pointer group"
                        >
                            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
                                <User className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold text-gray-900">
                                Edit Profil
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                                Nama, Email, Foto Profil, Bio
                            </p>
                        </div>

                                <div className="bg-white border border-gray-100 p-5 rounded-2xl hover:border-[#4A5D23]/30 transition-all cursor-pointer group shadow-sm">
                                    <div className="w-10 h-10 bg-[#E4E8DA] rounded-xl flex items-center justify-center text-[#4A5D23] mb-3 group-hover:bg-[#4A5D23] group-hover:text-white transition-colors">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-gray-900">Alamat Pengiriman</h4>
                                    <p className="text-xs text-gray-500 mt-1">Ubah alamat default penerimaan</p>
                                </div>

                        {/* Seller Center */}
                        <div
                            onClick={() => navigate(isSeller ? '/seller/dashboard' : '/seller/verification')}
                            className="bg-white border border-gray-100 p-5 rounded-2xl hover:border-primary/30 transition-all cursor-pointer group"
                        >
                            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold text-gray-900">
                                Menu Penjual
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                                Kelola barang daganganmu
                            </p>
                        </div>

                                <div className="bg-white border border-gray-100 p-5 rounded-2xl hover:border-[#4A5D23]/30 transition-all cursor-pointer group shadow-sm">
                                    <div className="w-10 h-10 bg-[#E4E8DA] rounded-xl flex items-center justify-center text-[#4A5D23] mb-3 group-hover:bg-[#4A5D23] group-hover:text-white transition-colors">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-gray-900">Ubah Password</h4>
                                    <p className="text-xs text-gray-500 mt-1">Kelola kredensial keamanan akun</p>
                                </div>

                                <div className="md:col-span-2 mt-4">
                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 font-bold py-4 rounded-2xl hover:bg-red-100 transition-colors border border-red-100"
                                    >
                                        <LogOut className="w-5 h-5" /> Keluar Sesi
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
            </div>
        </MainLayout>
    );
}

const EmptyState = ({ message }) => (
    <div className="text-center py-14 border border-dashed border-gray-200 bg-white rounded-2xl flex flex-col items-center justify-center">
        <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
            <Package className="w-7 h-7 text-gray-300" />
        </div>
        <p className="text-sm text-gray-400 font-bold tracking-wide">{message}</p>
    </div>
);
