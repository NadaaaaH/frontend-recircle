import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    Truck, 
    Package, 
    CheckCircle, 
    Clock, 
    ShoppingBag, 
    User, 
    Calendar, 
    Tag, 
    ArrowUpRight, 
    AlertCircle, 
    RefreshCw,
    Download
} from 'lucide-react';
import ConfirmModal from '@/Components/ConfirmModal';
import SearchFilterBar from '@/Components/SearchFilterBar';
import api from '@/lib/axios';

export default function SellerOrders() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [flash, setFlash] = useState({});
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [orderToShip, setOrderToShip] = useState(null);
    const [isShipping, setIsShipping] = useState(false);

    // Re-fetch data reactively whenever searchParams in the URL change
    useEffect(() => {
        document.title = "Pesanan Masuk | ReCircle";
        fetchOrders();
    }, [searchParams]);

    const fetchOrders = () => {
        setIsLoading(true);
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';

        api.get('/seller/orders', {
            params: {
                search,
                status
            }
        })
            .then((res) => {
                const raw = res.data?.data;
                const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
                setOrders(list);
            })
            .catch(() => {
                setFlash({ error: 'Gagal memuat data pesanan.' });
            })
            .finally(() => setIsLoading(false));
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price || 0);
    };

    const statusColors = {
        pending: 'bg-amber-50 text-amber-600 border-amber-100/70',
        dibayar: 'bg-indigo-50 text-indigo-600 border-indigo-100/70',
        dikirim: 'bg-purple-50 text-purple-600 border-purple-100/70',
        selesai: 'bg-emerald-50 text-emerald-600 border-emerald-100/70',
        dibatalkan: 'bg-rose-50 text-rose-600 border-rose-100/70',
    };

    const statusLabels = {
        pending: 'menunggu bayar',
        dibayar: 'dibayar',
        dikirim: 'dikirim',
        selesai: 'selesai',
        dibatalkan: 'dibatalkan',
    };

    const filterOptions = [
        { value: 'pending', label: 'Menunggu Bayar' },
        { value: 'dibayar', label: 'Dibayar' },
        { value: 'dikirim', label: 'Dikirim' },
        { value: 'selesai', label: 'Selesai' },
        { value: 'dibatalkan', label: 'Dibatalkan' },
    ];

    const triggerShip = (orderId) => {
        setOrderToShip(orderId);
        setIsConfirmOpen(true);
    };

    const confirmShip = () => {
        if (!orderToShip) return;
        setIsShipping(true);
        api.put(`/orders/${orderToShip}`, { status: 'shipped' })
            .then(() => {
                setOrders(prev => prev.map(o =>
                    o.id === orderToShip ? { ...o, status: 'dikirim' } : o
                ));
                setFlash({ success: "Status pesanan berhasil diperbarui menjadi 'Dikirim'" });
                setTimeout(() => setFlash({}), 3000);
            })
            .catch((err) => {
                setFlash({ error: err.response?.data?.message || 'Gagal mengupdate status pesanan.' });
                setTimeout(() => setFlash({}), 3000);
            })
            .finally(() => {
                setIsShipping(false);
                setIsConfirmOpen(false);
                setOrderToShip(null);
            });
    };

    // Calculate dynamic stats
    const totalCount = orders.length;
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const paidCount = orders.filter(o => o.status === 'dibayar').length;
    const completedCount = orders.filter(o => o.status === 'dikirim' || o.status === 'selesai').length;

    return (
        <SellerLayout>
            <div className="pb-12 max-w-[1200px] mx-auto space-y-6">

                {/* 1. TOP ACTION HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                            Manajemen Pesanan
                        </h2>
                        <p className="text-xs text-slate-400 font-normal mt-0.5">
                            Total {orders.length} pesanan terdaftar di tokomu.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={fetchOrders}
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-slate-200/80 hover:border-slate-300 text-slate-500 rounded-lg text-xs font-normal bg-white transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Refresh
                        </button>
                        <button className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#43552c] hover:bg-[#324021] text-white rounded-lg text-xs font-medium transition-all shadow-sm">
                            <Download className="w-3.5 h-3.5" />
                            Ekspor Data
                        </button>
                    </div>
                </div>

                {/* 2. SUMMARY STATS CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-400" />
                            <span className="text-xs font-normal text-slate-400">Total Pesanan</span>
                        </div>
                        <span className="text-2xl font-bold text-slate-800 mt-2.5 leading-none">{totalCount}</span>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            <span className="text-xs font-normal text-slate-400">Menunggu Pembayaran</span>
                        </div>
                        <span className="text-2xl font-bold text-slate-800 mt-2.5 leading-none">{pendingCount}</span>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-400" />
                            <span className="text-xs font-normal text-slate-400">Telah Dibayar</span>
                        </div>
                        <span className="text-2xl font-bold text-slate-800 mt-2.5 leading-none">{paidCount}</span>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-xs font-normal text-slate-400">Selesai / Dikirim</span>
                        </div>
                        <span className="text-2xl font-bold text-slate-800 mt-2.5 leading-none">{completedCount}</span>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl px-4 py-3 flex items-center gap-2.5 text-xs font-normal shadow-sm">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-xl px-4 py-3 text-xs font-normal">
                        {flash.error}
                    </div>
                )}

                {/* 3. SEARCH & FILTER BAR PLACEMENT */}
                <div className="flex justify-end mb-4">
                    <div className="w-full md:w-96">
                        <SearchFilterBar 
                            filterOptions={filterOptions} 
                            filterKey="status" 
                            placeholder="Cari pesanan..." 
                        />
                    </div>
                </div>

                {/* 4. MODERN TABLE CONTAINER */}
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
                                    <th className="py-3 px-4 font-normal">Kode Order</th>
                                    <th className="py-3 px-4 font-normal">Produk</th>
                                    <th className="py-3 px-4 font-normal">Pembeli & Alamat</th>
                                    <th className="py-3 px-4 font-normal text-center">Tanggal</th>
                                    <th className="py-3 px-4 font-normal text-right">Total Harga</th>
                                    <th className="py-3 px-6 font-normal text-center">Status</th>
                                    <th className="py-3 px-6 font-normal text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/60">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={8} className="py-16 text-center">
                                            <RefreshCw className="w-5 h-5 text-[#43552c] animate-spin mx-auto" />
                                            <p className="text-xs text-slate-400 mt-2.5">Memuat data...</p>
                                        </td>
                                    </tr>
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-16 text-center">
                                            <Package className="w-8 h-8 text-slate-300 mx-auto" strokeWidth={1.5} />
                                            <p className="text-slate-400 text-xs mt-2.5">Belum ada pesanan terdaftar.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => {
                                        const productName = order.product?.name || "Produk";
                                        const imageUrl = order.product?.imageUrl || order.product?.image;

                                        return (
                                            <tr key={order.id} className="hover:bg-slate-50/30 transition-colors group">
                                                <td className="py-3.5 px-6 text-center">
                                                    <input 
                                                        type="checkbox" 
                                                        className="rounded border-slate-200 text-[#43552c] focus:ring-[#43552c]/20 cursor-pointer" 
                                                        checked={false} 
                                                        readOnly 
                                                    />
                                                </td>

                                                {/* Kode Order */}
                                                <td className="py-3.5 px-4 text-xs font-mono text-slate-400">
                                                    #{order.orderCode}
                                                </td>

                                                {/* Info Produk */}
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-8 rounded bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                            {imageUrl ? (
                                                                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Package className="w-4 h-4 text-slate-300" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <span className="font-normal text-slate-700 text-xs truncate max-w-[180px] block" title={productName}>
                                                                {productName}
                                                            </span>
                                                            <span className="inline-flex items-center text-[9px] bg-slate-50 text-slate-500 border border-slate-200/50 px-1.5 py-0.2 rounded font-normal capitalize mt-0.5">
                                                                {order.shippingMethod === 'cod' ? 'COD' : 'Kirim Paket'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Pembeli & Alamat */}
                                                <td className="py-3.5 px-4">
                                                    <div className="min-w-0">
                                                        <span className="text-xs font-normal text-slate-600 block">
                                                            {order.buyer?.name || "-"}
                                                        </span>
                                                        {order.shippingAddress && (
                                                            <span className="text-[10px] text-slate-400 font-normal line-clamp-1 block" title={order.shippingAddress}>
                                                                📍 {order.shippingAddress}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Tanggal */}
                                                <td className="py-3.5 px-4 text-center text-xs text-slate-400 font-normal">
                                                    {order.created_at ? new Date(order.created_at).toLocaleDateString("id-ID", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric"
                                                    }) : "-"}
                                                </td>

                                                {/* Total Harga */}
                                                <td className="py-3.5 px-4 text-right text-xs font-medium text-slate-700">
                                                    {formatPrice(order.totalPrice)}
                                                </td>

                                                {/* Status Badge */}
                                                <td className="py-3.5 px-6 text-center">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-normal lowercase capitalize border ${statusColors[order.status] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                                        {statusLabels[order.status] || order.status}
                                                    </span>
                                                </td>

                                                {/* Aksi */}
                                                <td className="py-3.5 px-6 text-right">
                                                    {order.status === 'dibayar' ? (
                                                        <button
                                                            onClick={() => triggerShip(order.id)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#43552c] text-white hover:bg-[#324021] rounded-lg text-[10px] font-normal transition-colors shadow-sm"
                                                        >
                                                            <Truck className="w-3 h-3" />
                                                            Kirim Paket
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-400 font-normal">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* 5. PAGINATION FOOTER */}
                    <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
                        <span className="text-[11px] text-slate-400 font-normal">
                            Menampilkan {orders.length === 0 ? 0 : 1}-{orders.length} dari {orders.length} pesanan
                        </span>
                        <div className="flex items-center gap-1">
                            <button 
                                className="px-2.5 py-1 border border-slate-100 rounded text-xs font-normal text-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-50" 
                                disabled
                            >
                                Sebelumnya
                            </button>
                            <button className="w-7 h-7 rounded text-xs font-normal bg-[#43552c] text-white flex items-center justify-center shadow-sm">
                                1
                            </button>
                            <button 
                                className="px-2.5 py-1 border border-slate-100 rounded text-xs font-normal text-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-50" 
                                disabled
                            >
                                Selanjutnya
                            </button>
                        </div>
                    </div>
                </div>

                <ConfirmModal
                    isOpen={isConfirmOpen}
                    onClose={() => setIsConfirmOpen(false)}
                    onConfirm={confirmShip}
                    title="Konfirmasi Pengiriman"
                    subtitle="Apakah Anda yakin telah mengirimkan barang ini dan ingin memperbarui statusnya menjadi 'Dikirim'?"
                    confirmText="Tandai Dikirim"
                    cancelText="Batal"
                    type="info"
                    isLoading={isShipping}
                />
            </div>
        </SellerLayout>
    );
}
