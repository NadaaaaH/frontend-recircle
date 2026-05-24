import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/Layouts/AdminLayout';
import api from '@/lib/axios';
import {
    Users,
    ShoppingBag,
    ShieldCheck,
    TrendingUp,
    ArrowUpRight,
    Clock,
    UserPlus,
    Package,
    ShoppingCart,
    Loader2,
    RefreshCw,
    AlertCircle,
} from 'lucide-react';

const formatCurrency = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [monthlyStats, setMonthlyStats] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/admin/dashboard');
            // Backend returns: { data: { stats, monthlyStats, recentActivities } }
            const payload = res.data?.data || res.data;
            setStats(payload.stats || payload);
            setMonthlyStats(payload.monthly_stats || []);
            setRecentActivities(Array.isArray(payload.recent_activities) ? payload.recent_activities.slice(0, 5) : []);
        } catch (err) {
            console.error('Admin dashboard error:', err);
            const status = err.response?.status;
            let errorMsg = 'Gagal memuat data dashboard.';
            if (status === 404) {
                errorMsg = 'Endpoint dashboard tidak ditemukan (404). Silakan hubungi admin.';
            } else if (status === 500) {
                errorMsg = 'Terjadi kesalahan internal pada server (500). Silakan coba beberapa saat lagi.';
            } else if (err.response?.data?.message) {
                errorMsg = err.response.data.message;
            }
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // Backend returns camelCase inside stats object
    const statCards = stats ? [
        {
            label: 'Total Pengguna',
            value: stats.totalUsers || 0,
            icon: Users,
            bg: 'bg-blue-50',
            textColor: 'text-blue-600',
            href: '/admin/users'
        },
        {
            label: 'Total Produk',
            value: stats.totalProducts || 0,
            icon: ShoppingBag,
            bg: 'bg-[#43552c]/10',
            textColor: 'text-[#43552c]',
            href: '/admin/products'
        },
        {
            label: 'Total Transaksi',
            value: stats.totalTransactions || 0,
            icon: ShoppingCart,
            bg: 'bg-[#d4a373]/10',
            textColor: 'text-[#d4a373]',
            href: '/admin/transactions'
        },
        {
            label: 'Verifikasi Pending',
            value: stats.pendingVerifications || 0,
            icon: ShieldCheck,
            bg: 'bg-red-50',
            textColor: 'text-red-600',
            href: '/admin/verifications'
        },
    ] : [];

    if (loading) {
        return (
            <AdminLayout title="Dashboard Overview">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-[#43552c]/20 border-t-[#43552c] rounded-full animate-spin" />
                        <p className="text-sm text-slate-500 font-medium">Memuat data dashboard...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout title="Dashboard Overview">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-red-100 max-w-sm w-full">
                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Gagal Memuat Data</h3>
                        <p className="text-sm text-gray-500 mb-6">{error}</p>
                        <button
                            onClick={fetchData}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#43552c] text-white rounded-xl text-sm font-bold hover:bg-[#324021] transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Coba Lagi
                        </button>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Dashboard Overview">
            <div className="space-y-8">

                {/* Welcome Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Halo, Administrator!</h2>
                        <p className="text-slate-500 mt-1 font-medium">Berikut adalah ringkasan aktivitas ReCircle hari ini.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchData}
                            className="p-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-[#43552c] hover:border-[#43552c]/30 transition-all shadow-sm"
                            title="Refresh"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-sm font-medium text-gray-600">Sistem Online</span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-slate-200/60 group hover:shadow-md transition-shadow relative flex flex-col">
                            <div className="flex items-start justify-between">
                                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                    <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                                </div>
                                <Link
                                    to={stat.href}
                                    className="text-gray-300 hover:text-[#43552c] transition-colors p-1 relative z-10"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <ArrowUpRight className="w-5 h-5" />
                                </Link>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-sm font-medium text-gray-500">{stat.label}</h3>
                                <span className="text-2xl font-bold text-gray-900 mt-1 block">
                                    {stat.value?.toLocaleString('id-ID')}
                                </span>
                            </div>
                            <Link to={stat.href} className="absolute inset-0 rounded-[2rem]" aria-label={stat.label} />
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Bar Chart — Statistik Penjualan */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 rounded-2xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-slate-200/60 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Statistik Penjualan</h3>
                                    <p className="text-sm text-gray-500">Pertumbuhan tahun {new Date().getFullYear()}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-700">
                                        <TrendingUp className="w-3.5 h-3.5" />
                                        Aktif
                                    </div>
                                </div>
                            </div>

                            {/* Bar Chart */}
                            <div className="flex-1 flex items-end gap-3 min-h-[200px] pt-4">
                                {monthlyStats.length > 0 ? (
                                    monthlyStats.map((item, i) => {
                                        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
                                        const monthLabel = monthNames[parseInt(item.month) - 1] || '???';
                                        const maxRevenue = Math.max(...monthlyStats.map(s => s.revenue || 0), 1);
                                        const height = ((item.revenue || 0) / maxRevenue) * 90 + 10;

                                        return (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-3 group/bar">
                                                <div
                                                    className="w-full bg-[#f7f9f7] rounded-xl relative overflow-hidden group-hover/bar:bg-[#43552c]/5 transition-colors"
                                                    style={{ height: '100%' }}
                                                    title={`${monthLabel}: ${formatCurrency(item.revenue)}`}
                                                >
                                                    <div
                                                        className="absolute bottom-0 left-0 right-0 bg-[#43552c] rounded-t-xl transition-all duration-700 ease-out opacity-80 group-hover/bar:opacity-100"
                                                        style={{ height: `${height}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    {monthLabel}
                                                </span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex-1 flex items-center justify-center text-slate-400 text-sm font-medium">
                                        Menunggu data terkumpul
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Recent Activities */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Aktivitas Terbaru</h3>
                                <Link to="/admin/activities" className="text-xs font-bold text-[#43552c] hover:underline">
                                    Lihat Semua
                                </Link>
                            </div>
                            <div className="space-y-6">
                                {recentActivities.length > 0 ? recentActivities.map((activity, idx) => (
                                    <div key={idx} className="flex gap-4 relative group">
                                        {idx !== recentActivities.length - 1 && (
                                            <div className="absolute left-[16px] top-8 bottom-[-24px] w-0.5 bg-slate-100 group-hover:bg-slate-200 transition-colors" />
                                        )}
                                        <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm z-10
                                            ${activity.type === 'user' ? 'bg-blue-50 text-blue-500' :
                                              activity.type === 'product' ? 'bg-[#43552c]/10 text-[#43552c]' :
                                              'bg-[#d4a373]/10 text-[#d4a373]'}`}
                                        >
                                            {activity.type === 'user' ? <UserPlus className="w-4 h-4" /> :
                                             activity.type === 'product' ? <Package className="w-4 h-4" /> :
                                             <ShoppingCart className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900 leading-tight truncate">{activity.title}</p>
                                            <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2 font-medium">{activity.description}</p>
                                            <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                                <Clock className="w-3 h-3" />
                                                {activity.time}
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-gray-400 italic text-center py-4">Belum ada aktivitas</p>
                                )}
                            </div>
                        </div>

                        {/* Verifikasi Quick Action */}
                        <div className="bg-[#43552c] p-8 rounded-[2rem] shadow-lg shadow-[#43552c]/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="w-24 h-24 text-white" />
                            </div>
                            <h3 className="text-white font-bold text-lg relative z-10">Verifikasi Seller</h3>
                            <p className="text-white/70 text-sm mt-2 relative z-10 leading-relaxed">
                                Ada <strong className="text-white">{stats?.pendingVerifications ?? 0}</strong> pengajuan yang butuh review.
                            </p>
                            <Link
                                to="/admin/verifications"
                                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#43552c] rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm relative z-10"
                            >
                                Proses Sekarang
                                <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
