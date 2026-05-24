import React, { useState, useEffect } from 'react';
import SellerLayout from '@/Layouts/SellerLayout';
import { Truck, Package, CheckCircle } from 'lucide-react';
import ConfirmModal from '@/Components/ConfirmModal';
import api from '@/lib/axios';

export default function SellerOrders() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [flash, setFlash] = useState({});
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [orderToShip, setOrderToShip] = useState(null);
    const [isShipping, setIsShipping] = useState(false);

    useEffect(() => {
        document.title = "Pesanan Masuk | ReCircle";
        fetchOrders();
    }, []);

    const fetchOrders = () => {
        setIsLoading(true);
        api.get('/seller/orders')
            .then((res) => {
                // Backend returns { data: { data: [...], ... } } via resource collection
                const raw = res.data?.data;
                const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
                setOrders(list);
            })
            .catch(() => {
                setFlash({ error: 'Gagal memuat data pesanan.' });
            })
            .finally(() => setIsLoading(false));
    };

    const formatPrice = (price) => 'Rp ' + Number(price).toLocaleString('id-ID');

    const statusColors = {
        pending: 'bg-amber-50 text-amber-700 border-amber-100',
        dibayar: 'bg-blue-50 text-blue-700 border-blue-100',
        dikirim: 'bg-purple-50 text-purple-700 border-purple-100',
        selesai: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        dibatalkan: 'bg-rose-50 text-rose-700 border-rose-100',
    };

    const statusLabels = {
        pending: 'Menunggu Bayar',
        dibayar: 'Dibayar',
        dikirim: 'Dikirim',
        selesai: 'Selesai',
        dibatalkan: 'Dibatalkan',
    };

    const triggerShip = (orderId) => {
        setOrderToShip(orderId);
        setIsConfirmOpen(true);
    };

    const confirmShip = () => {
        if (!orderToShip) return;
        setIsShipping(true);
        api.post(`/seller/orders/${orderToShip}/ship`)
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

    // Loader
    if (isLoading) {
        return (
            <SellerLayout>
                <div className="flex min-h-[60vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-600"></div>
                        <p className="text-sm font-semibold text-emerald-600 animate-pulse">Memuat Pesanan...</p>
                    </div>
                </div>
            </SellerLayout>
        );
    }

    return (
        <SellerLayout>
        <div className="pb-12 max-w-[1200px] mx-auto">

            {/* Header Section */}
            <div className="mb-6 lg:mb-8">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Pesanan Masuk</h1>
                <p className="text-sm text-slate-500 mt-1 font-medium">Kelola pesanan dari pembeli dan perbarui status pengiriman</p>
            </div>

            {flash?.success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl px-5 py-4 mb-8 flex items-center gap-3 text-sm font-bold shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    {flash.success}
                </div>
            )}

            {flash?.error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-5 py-4 mb-8 text-sm font-bold">
                    {flash.error}
                </div>
            )}

            {orders.length === 0 ? (
                <div className="bg-white rounded-[1.25rem] p-12 text-center shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-slate-200/70 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <Package className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Belum ada pesanan masuk</h3>
                    <p className="text-slate-500 text-sm font-medium">Pesanan dari pembeli akan muncul di sini.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-[1.25rem] p-5 md:p-6 shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-slate-200/70 hover:border-slate-300 transition-all group">
                            <div className="flex flex-col sm:flex-row gap-5">
                                {order.product?.imageUrl ? (
                                    <img src={order.product.imageUrl} alt={order.product?.name} className="w-20 h-20 rounded-xl object-cover bg-slate-50 border border-slate-100 flex-shrink-0" />
                                ) : (
                                    <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0 flex items-center justify-center">
                                        <Package className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                                        <div>
                                            <p className="font-bold text-slate-900 text-lg leading-tight mb-1">{order.product?.name || 'Produk'}</p>
                                            <p className="text-sm text-slate-600 font-medium">Pembeli: {order.buyer?.name || '-'}</p>
                                            <p className="text-xs text-slate-400 font-medium mt-0.5">{order.orderCode}</p>
                                        </div>
                                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${statusColors[order.status] || 'bg-slate-50 text-slate-600 border-slate-100'} w-fit`}>
                                            {statusLabels[order.status] || order.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pt-4 border-t border-slate-100">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="font-black text-slate-900 text-lg tracking-tight">{formatPrice(order.totalPrice)}</span>
                                            <span className="text-xs bg-slate-50 text-slate-500 border border-slate-200/70 px-2.5 py-1.5 rounded-lg font-bold uppercase tracking-wider">
                                                {order.shippingMethod === 'cod' ? 'COD' : 'Kirim Paket'}
                                            </span>
                                        </div>
                                        {order.status === 'dibayar' && (
                                            <button
                                                onClick={() => triggerShip(order.id)}
                                                className="flex items-center justify-center gap-2 bg-[#4A5D23] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#3B4A1C] shadow-sm transition-all w-full sm:w-auto"
                                            >
                                                <Truck className="w-4 h-4" /> Kirim Pesanan
                                            </button>
                                        )}
                                    </div>
                                    {order.shippingAddress && (
                                        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-600 font-medium flex items-start gap-2">
                                            <span className="text-xl leading-none">📍</span>
                                            <span className="flex-1">{order.shippingAddress}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
