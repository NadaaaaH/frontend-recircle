import React, { Suspense, useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    BellRing, 
    MessageSquareText, 
    Wallet, 
    Lock, 
    Package, 
    ShoppingCart, 
    ArrowRight, 
    AlertCircle, 
    Sparkles 
} from 'lucide-react';
import api from '@/lib/axios';

// Dynamic Import for Recharts to optimize FCP
const AreaChart = React.lazy(() => import('recharts').then(m => ({ default: m.AreaChart })));
const Area = React.lazy(() => import('recharts').then(m => ({ default: m.Area })));
const XAxis = React.lazy(() => import('recharts').then(m => ({ default: m.XAxis })));
const YAxis = React.lazy(() => import('recharts').then(m => ({ default: m.YAxis })));
const Tooltip = React.lazy(() => import('recharts').then(m => ({ default: m.Tooltip })));
const ResponsiveContainer = React.lazy(() => import('recharts').then(m => ({ default: m.ResponsiveContainer })));

// Sub-components to prevent unnecessary re-renders
const OverviewCard = ({ title, value, icon: Icon, isFinancial }) => (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute right-4 bottom-4 text-slate-100 group-hover:text-slate-200/80 transition-colors duration-300 pointer-events-none">
            <Icon className="w-16 h-16 shrink-0 stroke-[1.5]" />
        </div>
        <div className="relative z-10">
            <p className="text-sm text-slate-500 mb-2">{title}</p>
            <p className={`text-3xl font-semibold mt-2 ${isFinancial ? 'text-[#43552c]' : 'text-slate-900'}`}>
                {value}
            </p>
        </div>
    </div>
);

const ActivityItem = ({ avatar, name, action, time }) => {
    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Buyer')}&background=43552c&color=ffffff`;
    return (
        <div className="flex items-center gap-4 py-1.5 transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200">
                <img 
                    src={avatar ? (avatar.startsWith('http') ? avatar : `${import.meta.env.VITE_API_URL || ''}/storage/${avatar.replace(/^\/?(storage\/)?/, '')}`) : fallbackAvatar} 
                    alt={name} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = fallbackAvatar;
                    }} 
                />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">
                    {name || 'Pembeli'}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                    {action}
                </p>
            </div>
            <div className="text-right shrink-0">
                <span className="text-[10px] font-medium text-gray-400">
                    {time}
                </span>
            </div>
        </div>
    );
};

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        document.title = 'Seller Dashboard | ReCircle';
        setIsLoading(true);

        api.get('/seller/dashboard')
            .then((res) => {
                const data = res.data?.data;
                setStats(data?.stats ?? null);
                setChartData(data?.chartData ?? []);
                setRecentOrders(data?.recent_orders ?? []);
            })
            .catch((err) => {
                setError(err.response?.data?.message || 'Gagal memuat data dashboard.');
            })
            .finally(() => setIsLoading(false));
    }, []);

    const formatRp = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value || 0);
    };

    // If no chartData from API, show a single point with total_revenue
    const activeChartData = useMemo(() => {
        if (chartData && chartData.length > 0) return chartData;
        return [{ name: 'Saat Ini', total: stats?.total_revenue || 0 }];
    }, [chartData, stats?.total_revenue]);

    // Beautiful Recircle pulse loader
    if (isLoading) {
        return (
            <SellerLayout>
                <div className="flex min-h-screen items-center justify-center bg-[#F4F5F7]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#43552c]/20 border-t-[#43552c]"></div>
                        <div className="animate-pulse text-sm font-bold tracking-wide text-[#43552c]">
                            Memuat Dashboard Toko...
                        </div>
                    </div>
                </div>
            </SellerLayout>
        );
    }

    if (error) {
        return (
            <SellerLayout>
                <div className="flex min-h-screen items-center justify-center bg-[#F4F5F7] p-4">
                    <div className="bg-white rounded-2xl border border-red-100 p-8 max-w-md w-full shadow-sm text-center">
                        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Gagal Memuat Data</h3>
                        <p className="text-sm text-slate-500 mb-6">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-[#43552c] hover:bg-[#344222] text-white font-bold py-2.5 px-4 rounded-xl transition-colors text-sm"
                        >
                            Coba Lagi
                        </button>
                    </div>
                </div>
            </SellerLayout>
        );
    }

    return (
        <SellerLayout>
            <div className="min-h-screen bg-[#F4F5F7] pb-10">
                <div className="max-w-[1200px] mx-auto space-y-6">

                    {/* Header Welcome */}
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Selamat Datang di Dashboard Toko!
                        </h1>
                    </div>

                    {/* Asymmetric Grid Layout 70/30 */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* A. KOLOM KIRI (span 8) */}
                        <div className="lg:col-span-8 space-y-6">

                            {/* Banner Info */}
                            <div className="bg-[#43552c]/5 border border-[#43552c]/10 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-[#43552c]/10 rounded-xl text-[#43552c]">
                                        <MessageSquareText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">
                                            Respons Penawaran Lebih Cepat!
                                        </p>
                                        <p className="text-xs text-slate-600 mt-0.5">
                                            Tingkatkan performa tokomu dan tingkatkan konversi penjualan dengan merespons penawaran calon pembeli secara berkala.
                                        </p>
                                    </div>
                                </div>
                                <Link 
                                    to="/seller/offers" 
                                    className="bg-[#43552c] hover:bg-[#344222] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-soft flex items-center gap-1.5 shrink-0"
                                >
                                    Cek Penawaran
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>

                            {/* Overview Performance (Grid 2x2) */}
                            <section className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-slate-900">Performa Toko</h2>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <OverviewCard
                                        title="Saldo Aktif (Dilepas)"
                                        value={formatRp(stats?.total_revenue)}
                                        icon={Wallet}
                                        isFinancial={true}
                                    />
                                    <OverviewCard
                                        title="Dana Ditahan (Escrow)"
                                        value={formatRp(stats?.pending_balance)}
                                        icon={Lock}
                                        isFinancial={true}
                                    />
                                    <OverviewCard
                                        title="Total Produk"
                                        value={stats?.total_products || 0}
                                        icon={Package}
                                        isFinancial={false}
                                    />
                                    <OverviewCard
                                        title="Pesanan Aktif"
                                        value={stats?.active_orders || 0}
                                        icon={ShoppingCart}
                                        isFinancial={false}
                                    />
                                </div>
                            </section>

                            {/* Revenue Graphic */}
                            <section className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-slate-900">Grafik Pendapatan (7 Hari)</h2>
                                </div>

                                <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-all duration-300">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                        <div>
                                            <p className="text-sm text-slate-500 mb-2">Total Pendapatan</p>
                                            <h3 className="text-3xl font-bold text-[#43552c] tracking-tight">
                                                {formatRp(stats?.total_revenue)}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="h-64 w-full relative">
                                        <Suspense fallback={<div className="w-full h-full bg-slate-50 animate-pulse rounded-2xl"></div>}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={activeChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#43552c" stopOpacity={0.15}/>
                                                            <stop offset="95%" stopColor="#43552c" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <XAxis
                                                        dataKey="name"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fontSize: 11, fill: '#64748b', fontWeight: '500' }}
                                                        dy={10}
                                                    />
                                                    <YAxis
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fontSize: 11, fill: '#64748b', fontWeight: '500' }}
                                                        dx={-5}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}
                                                        formatter={(value) => [formatRp(value), 'Pendapatan']}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="total"
                                                        stroke="#43552c"
                                                        strokeWidth={3}
                                                        fillOpacity={1}
                                                        fill="url(#colorRevenue)"
                                                        activeDot={{ r: 6, fill: '#fff', stroke: '#43552c', strokeWidth: 3 }}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </Suspense>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* B. KOLOM KANAN (span 4) */}
                        <div className="lg:col-span-4 flex flex-col gap-6">

                            {/* Shop Advisor */}
                            <div className="bg-[#43552c]/5 border border-[#43552c]/10 rounded-2xl p-6 hover:shadow-md transition-all duration-300">
                                <div className="flex items-center justify-between mb-4 border-b border-[#43552c]/10 pb-3">
                                    <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-[#43552c]" />
                                        Shop Advisor
                                    </h2>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="p-2.5 bg-[#43552c]/10 rounded-xl text-[#43552c] mt-0.5 flex-shrink-0">
                                        <BellRing className="w-5 h-5 animate-bounce" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 leading-snug">
                                            {stats?.needs_shipping > 0
                                                ? `Kamu memiliki ${stats.needs_shipping} pesanan yang harus dikirim hari ini!`
                                                : 'Semua pesananmu sudah dikirim. Toko dalam kondisi prima!'}
                                        </p>
                                        <Link 
                                            to="/seller/orders" 
                                            className="bg-[#43552c] hover:bg-[#344222] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-soft inline-flex items-center gap-1.5 mt-4"
                                        >
                                            Kelola Pesanan
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Products Summary */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-all duration-300">
                                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                    <h2 className="text-lg font-semibold text-slate-900">Produk</h2>
                                    <Link to="/seller/products" className="text-xs font-bold text-[#43552c] hover:underline flex items-center gap-1">
                                        Semua
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-500">Aktif</span>
                                        <span className="text-sm font-bold text-slate-800">{stats?.active_products || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-500">Terjual</span>
                                        <span className="text-sm font-bold text-[#43552c]">{stats?.total_sold || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activities */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-all duration-300 flex-1">
                                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                    <h2 className="text-lg font-semibold text-slate-900">Aktivitas Terbaru</h2>
                                    <Link to="/seller/orders" className="text-xs font-bold text-[#43552c] hover:underline flex items-center gap-1">
                                        Semua
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>

                                {!recentOrders || recentOrders.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                        <Sparkles className="w-8 h-8 text-gray-300 mb-2" />
                                        <p className="text-xs font-medium text-slate-400">Belum ada aktivitas baru.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {recentOrders.map((activity, index) => (
                                            <ActivityItem
                                                key={activity.id || index}
                                                avatar={null}
                                                name={activity.buyer_name}
                                                action={`membeli ${activity.product_name}`}
                                                time={activity.created_at}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
}
