import React, { useState, useEffect } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { 
    Bell, 
    BellOff, 
    Check, 
    CheckSquare,
    Clock, 
    ShoppingBag, 
    Tag, 
    User, 
    AlertCircle 
} from 'lucide-react';
import api from '@/lib/axios';

export default function NotificationsIndex() {
    const [activeTab, setActiveTab] = useState('buyer'); // 'buyer' or 'seller'
    const [buyerNotifs, setBuyerNotifs] = useState([]);
    const [sellerNotifs, setSellerNotifs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNotifications = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch both in parallel to compute distinct badge counts!
            const [buyerRes, sellerRes] = await Promise.all([
                api.get('/notifications?role=buyer'),
                api.get('/notifications?role=seller')
            ]);

            setBuyerNotifs(Array.isArray(buyerRes.data?.data) ? buyerRes.data.data : []);
            setSellerNotifs(Array.isArray(sellerRes.data?.data) ? sellerRes.data.data : []);
        } catch (err) {
            setError("Gagal memuat notifikasi.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        document.title = "Notifikasi | ReCircle";
        fetchNotifications();
    }, []);

    const markAsRead = async (id, role) => {
        try {
            await api.post(`/notifications/${id}/read`);
            if (role === 'buyer') {
                setBuyerNotifs(prev => prev.map(n => n._id === id ? { ...n, is_read: true } : n));
            } else {
                setSellerNotifs(prev => prev.map(n => n._id === id ? { ...n, is_read: true } : n));
            }
        } catch (err) {
            console.error("Gagal menandai dibaca:", err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.post(`/notifications/read-all?role=${activeTab}`);
            if (activeTab === 'buyer') {
                setBuyerNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
            } else {
                setSellerNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
            }
        } catch (err) {
            console.error("Gagal menandai semua dibaca:", err);
        }
    };

    const currentNotifs = activeTab === 'buyer' ? buyerNotifs : sellerNotifs;
    const unreadBuyerCount = buyerNotifs.filter(n => !n.is_read).length;
    const unreadSellerCount = sellerNotifs.filter(n => !n.is_read).length;

    const getIcon = (type) => {
        switch (type) {
            case 'new_offer':
            case 'offer':
                return <Tag className="w-5 h-5 text-blue-600" />;
            case 'order_update':
            case 'order':
                return <ShoppingBag className="w-5 h-5 text-emerald-600" />;
            case 'user':
                return <User className="w-5 h-5 text-indigo-600" />;
            default:
                return <Bell className="w-5 h-5 text-amber-600" />;
        }
    };

    const getBg = (type) => {
        switch (type) {
            case 'new_offer':
            case 'offer':
                return 'bg-blue-50 border-blue-100';
            case 'order_update':
            case 'order':
                return 'bg-emerald-50 border-emerald-100';
            case 'user':
                return 'bg-indigo-50 border-indigo-100';
            default:
                return 'bg-amber-50 border-amber-100';
        }
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-slate-50/50 py-10">
                <div className="max-w-3xl mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                                <Bell className="w-8 h-8 text-[#43552c]" /> Notifikasi Saya
                            </h1>
                            <p className="text-sm text-slate-500 mt-1 font-medium">
                                Pantau terus kabar terbaru tentang transaksi dan tokomu.
                            </p>
                        </div>
                        {currentNotifs.some(n => !n.is_read) && (
                            <button
                                onClick={markAllAsRead}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#43552c] hover:bg-[#344222] text-white rounded-xl text-xs font-bold shadow-sm transition-all self-start sm:self-center"
                            >
                                <CheckSquare className="w-4 h-4" /> Tandai Semua Dibaca
                            </button>
                        )}
                    </div>

                    {/* Role Tabs */}
                    <div className="flex border-b border-slate-200 mb-6 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                        <button
                            onClick={() => setActiveTab('buyer')}
                            className={`flex-1 py-3 text-center text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2.5 ${
                                activeTab === 'buyer'
                                    ? 'bg-[#43552c] text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                            }`}
                        >
                            Sebagai Pembeli
                            {unreadBuyerCount > 0 && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                    activeTab === 'buyer' ? 'bg-white text-[#43552c]' : 'bg-red-500 text-white'
                                }`}>
                                    {unreadBuyerCount}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('seller')}
                            className={`flex-1 py-3 text-center text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2.5 ${
                                activeTab === 'seller'
                                    ? 'bg-[#43552c] text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                            }`}
                        >
                            Sebagai Penjual
                            {unreadSellerCount > 0 && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                    activeTab === 'seller' ? 'bg-white text-[#43552c]' : 'bg-red-500 text-white'
                                }`}>
                                    {unreadSellerCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Notification List Container */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        {isLoading ? (
                            <div className="divide-y divide-slate-50 animate-pulse">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="p-6 flex gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex-shrink-0 animate-pulse" />
                                        <div className="flex-1 space-y-3">
                                            <div className="h-4 bg-slate-100 rounded-lg w-1/3" />
                                            <div className="h-3 bg-slate-50 rounded-lg w-2/3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                                <AlertCircle className="w-10 h-10 text-red-400" />
                                <p className="text-slate-500 text-sm font-medium">{error}</p>
                                <button
                                    onClick={fetchNotifications}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-200 transition-colors"
                                >
                                    Coba Lagi
                                </button>
                            </div>
                        ) : currentNotifs.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {currentNotifs.map((notif) => (
                                    <div 
                                        key={notif._id} 
                                        className={`p-6 flex gap-4 hover:bg-slate-50/50 transition-all group border-l-4 ${
                                            notif.is_read ? 'border-transparent' : 'border-[#43552c] bg-slate-50/25'
                                        }`}
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center border ${getBg(notif.type)}`}>
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <p className={`text-base leading-snug ${notif.is_read ? 'text-slate-600' : 'text-slate-900 font-bold'}`}>
                                                        {notif.message}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-2 font-medium flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {new Date(notif.created_at).toLocaleDateString("id-ID", {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit"
                                                        })}
                                                    </p>
                                                </div>
                                                {!notif.is_read && (
                                                    <button
                                                        onClick={() => markAsRead(notif._id, activeTab)}
                                                        className="p-2 bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-all border border-slate-100/50 flex-shrink-0 self-center"
                                                        title="Tandai dibaca"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-16 text-center">
                                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100/50">
                                    <BellOff className="w-8 h-8" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-1">Belum ada notifikasi</h3>
                                <p className="text-slate-500 text-sm max-w-xs mx-auto">
                                    Semua kabar tentang aktivitas transaksi {activeTab === 'buyer' ? 'pembelianmu' : 'tokomu'} akan muncul di sini.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
