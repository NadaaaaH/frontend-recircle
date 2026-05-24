import React, { Suspense, useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SellerLayout from '@/Layouts/SellerLayout';
import { BellRing, MessageSquareText } from 'lucide-react';
import api from '@/lib/axios';

// Dynamic Import for Recharts to optimize FCP
const AreaChart = React.lazy(() => import('recharts').then(m => ({ default: m.AreaChart })));
const Area = React.lazy(() => import('recharts').then(m => ({ default: m.Area })));
const XAxis = React.lazy(() => import('recharts').then(m => ({ default: m.XAxis })));
const YAxis = React.lazy(() => import('recharts').then(m => ({ default: m.YAxis })));
const CartesianGrid = React.lazy(() => import('recharts').then(m => ({ default: m.CartesianGrid })));
const Tooltip = React.lazy(() => import('recharts').then(m => ({ default: m.Tooltip })));
const ResponsiveContainer = React.lazy(() => import('recharts').then(m => ({ default: m.ResponsiveContainer })));

// Sub-components to prevent unnecessary re-renders
const OverviewCard = ({ title, value }) => (
    <div className="p-6">
        <p className="text-sm text-slate-500 mb-2">{title}</p>
        <p className="text-3xl font-semibold text-slate-900 mt-2">{value}</p>
    </div>
);

const ActivityItem = ({ avatar, name, action, time }) => (
    <div className="flex items-start gap-4">
        <div className="w-8 h-8 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200">
            {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
                <span className="text-xs font-bold text-slate-600">{name?.charAt(0) || 'U'}</span>
            )}
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-sm text-slate-900 leading-snug">
                <span className="font-medium">{name}</span> {action}
            </p>
            <p className="text-xs text-slate-400 mt-1">{time}</p>
        </div>
    </div>
);

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

    // Beautiful emerald pulse loader
    if (isLoading) {
        return (
            <SellerLayout>
                <div className="flex min-h-screen items-center justify-center bg-[#F4F5F7]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-600"></div>
                        <div className="animate-pulse text-sm font-semibold tracking-wide text-emerald-600">
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
                    <div className="bg-white rounded-[1.25rem] border border-red-100 p-8 max-w-md w-full shadow-sm text-center">
                        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Gagal Memuat Data</h3>
                        <p className="text-sm text-slate-500 mb-6">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors text-sm"
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
                            <div className="bg-white border border-slate-200/70 rounded-xl p-3 flex justify-between items-center shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-slate-50 rounded-lg">
                                        <MessageSquareText className="w-4 h-4 text-slate-600" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-700">Tingkatkan performa tokomu dengan merespons penawaran lebih cepat!</p>
                                </div>
                                <Link to="/seller/offers" className="text-sm font-semibold text-slate-900 hover:opacity-70 transition-opacity">
                                    Cek Penawaran &rarr;
                                </Link>
                            </div>

                            {/* Overview Performance (Grid 2x2) */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-slate-900">Performa Toko</h2>
                                </div>

                                <div className="bg-white border border-slate-200/70 rounded-[1.25rem] shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 border-b border-slate-100">
                                        <OverviewCard
                                            title="Saldo Aktif (Dilepas)"
                                            value={formatRp(stats?.total_revenue)}
                                        />
                                        <OverviewCard
                                            title="Dana Ditahan (Escrow)"
                                            value={formatRp(stats?.pending_balance)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                                        <OverviewCard
                                            title="Total Produk"
                                            value={stats?.total_products || 0}
                                        />
                                        <OverviewCard
                                            title="Pesanan Aktif"
                                            value={stats?.active_orders || 0}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Revenue Graphic */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-slate-900">Grafik Pendapatan (7 Hari)</h2>
                                </div>

                                <div className="bg-white border border-slate-200/70 rounded-[1.25rem] p-6 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                                    <p className="text-sm text-slate-500 mb-1">Total Pendapatan</p>
                                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight mb-8">
                                        {formatRp(stats?.total_revenue)}
                                    </h3>

                                    <div className="h-64 w-full relative">
                                        <Suspense fallback={<div className="w-full h-full bg-slate-50 animate-pulse rounded-[1.25rem]"></div>}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={activeChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#4A5D23" stopOpacity={0.15}/>
                                                            <stop offset="95%" stopColor="#4A5D23" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <XAxis
                                                        dataKey="name"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fontSize: 11, fill: '#64748b' }}
                                                        dy={10}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}
                                                        formatter={(value) => [formatRp(value), 'Pendapatan']}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="total"
                                                        stroke="#4A5D23"
                                                        strokeWidth={2}
                                                        fillOpacity={1}
                                                        fill="url(#colorRevenue)"
                                                        activeDot={{ r: 6, fill: '#fff', stroke: '#4A5D23', strokeWidth: 2 }}
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
                            <div className="bg-white border border-slate-200/70 rounded-[1.25rem] p-6 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-slate-900">Shop Advisor</h2>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="p-2 bg-slate-50 rounded-full text-slate-600 mt-1 flex-shrink-0">
                                        <BellRing className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-900 mb-1">
                                            {stats?.needs_shipping > 0
                                                ? `Kamu memiliki ${stats.needs_shipping} pesanan yang harus dikirim hari ini.`
                                                : 'Semua pesananmu sudah terkirim, toko dalam kondisi prima!'}
                                        </h3>
                                        <Link to="/seller/orders" className="text-xs font-semibold text-slate-600 border border-slate-200/70 rounded-lg px-3 py-1.5 mt-3 inline-block hover:bg-slate-50 transition-colors">
                                            Cek Pesanan
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Products Summary */}
                            <div className="bg-white border border-slate-200/70 rounded-[1.25rem] p-6 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-slate-900">Produk</h2>
                                    <Link to="/seller/products" className="text-sm text-slate-900 hover:underline">Lihat Semua &rarr;</Link>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-500">Aktif</span>
                                        <span className="text-sm font-medium text-slate-900">{stats?.active_products || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-500">Terjual</span>
                                        <span className="text-sm font-medium text-slate-900">{stats?.total_sold || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activities */}
                            <div className="bg-white border border-slate-200/70 rounded-[1.25rem] p-6 shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex-1">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-semibold text-slate-900">Aktivitas Terbaru</h2>
                                    <Link to="/seller/orders" className="text-sm text-slate-900 hover:underline">Lihat Semua &rarr;</Link>
                                </div>

                                {!recentOrders || recentOrders.length === 0 ? (
                                    <p className="text-sm text-slate-400">Belum ada aktivitas.</p>
                                ) : (
                                    <div className="flex flex-col gap-5">
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
