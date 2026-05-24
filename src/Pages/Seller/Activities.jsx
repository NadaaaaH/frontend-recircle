import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SellerLayout from '@/Layouts/SellerLayout';
import {
    MessageSquare,
    Package,
    ShoppingCart,
    Clock,
    ArrowLeft,
    Filter
} from 'lucide-react';
import api from '@/lib/axios';

export default function Activities() {
    const [activities, setActivities] = useState([]);
    const [filter, setFilter] = useState("all");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        document.title = "Aktivitas Toko | ReCircle";
        setIsLoading(true);
        api.get(`/seller/activities?type=${filter}`)
            .then((res) => {
                const raw = res.data?.data;
                const list = Array.isArray(raw) ? raw : [];
                setActivities(list);
            })
            .catch(() => {
                setActivities([]);
            })
            .finally(() => setIsLoading(false));
    }, [filter]);

    const typeIcon = (type) => {
        if (type === 'offer') return <MessageSquare className="w-5 h-5" />;
        return <ShoppingCart className="w-5 h-5" />;
    };

    const typeColor = (type) => {
        if (type === 'offer') return 'bg-blue-50 text-blue-600 border-blue-100/50';
        return 'bg-emerald-50 text-emerald-600 border-emerald-100/50';
    };

    return (
        <SellerLayout>
        <div className="pb-12 max-w-[1000px] mx-auto">

            {/* Header Section */}
            <div className="flex items-center gap-4 mb-6 lg:mb-8">
                <Link
                    to="/seller/dashboard"
                    className="p-3 bg-white border border-slate-200/70 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Aktivitas Toko</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Pantau semua aktivitas dan notifikasi terkait tokomu</p>
                </div>
                <div className="hidden sm:block relative">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="appearance-none pl-10 pr-10 py-2.5 bg-white border border-slate-200/70 rounded-xl text-sm font-bold text-slate-600 shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:bg-slate-50 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        <option value="all">Semua Aktivitas</option>
                        <option value="offer">Penawaran</option>
                        <option value="order">Pesanan</option>
                    </select>
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <Filter className="w-4 h-4" />
                    </div>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none border-l border-slate-100 pl-2">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[1.25rem] shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-slate-200/70 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between sm:hidden">
                    <h3 className="text-xl font-bold text-slate-900">Log Aktivitas</h3>
                    <div className="relative">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="appearance-none pl-8 pr-8 py-1.5 bg-slate-50 border border-slate-200/70 rounded-lg text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="all">Semua</option>
                            <option value="offer">Penawaran</option>
                            <option value="order">Pesanan</option>
                        </select>
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            <Filter className="w-3 h-3" />
                        </div>
                    </div>
                </div>

                <div className="divide-y divide-slate-100">
                    {isLoading ? (
                        <div className="divide-y divide-slate-100">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="p-5 md:p-6 flex gap-4 animate-pulse">
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0" />
                                    <div className="flex-1 space-y-3">
                                        <div className="h-4 bg-slate-100 rounded-lg w-1/3" />
                                        <div className="h-3 bg-slate-50 rounded-lg w-2/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : activities.length > 0 ? (
                        activities.map((activity, idx) => (
                            <div key={idx} className="p-5 md:p-6 flex gap-4 hover:bg-slate-50/50 transition-colors group">
                                <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center border ${typeColor(activity.type)}`}>
                                    {typeIcon(activity.type)}
                                </div>
                                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                                    <div>
                                        <p className="font-bold text-slate-900 text-base leading-tight">{activity.title}</p>
                                        <p className="text-slate-500 mt-1 text-sm leading-relaxed">{activity.description}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 w-fit">
                                        <Clock className="w-3 h-3" />
                                        {activity.time}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <Package className="w-8 h-8" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Belum ada aktivitas</h3>
                            <p className="text-slate-500 text-sm">Aktivitas toko seperti pesanan masuk akan muncul di sini.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </SellerLayout>
    );
}
