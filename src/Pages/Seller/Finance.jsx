import React, { useState, useEffect } from "react";
import SellerLayout from "@/Layouts/SellerLayout";
import {
    Wallet,
    ArrowUpRight,
    CheckCircle2,
    AlertCircle,
    TrendingUp
} from "lucide-react";
import api from "@/lib/axios";

export default function Finance() {
    const [balanceData, setBalanceData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        document.title = "Keuangan Toko | ReCircle";
        api.get('/seller/balance')
            .then((res) => {
                setBalanceData(res.data?.data ?? null);
            })
            .catch(() => {
                setBalanceData(null);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const formatRp = (value) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0);

    // history dari API: { id, amount, status, releasedAt, createdAt, orderCode, productName }
    const history = balanceData?.history?.data ?? [];
    const totalDilepas = balanceData?.total_dilepas ?? 0;

    // Dana tertahan = total jumlah status 'ditahan'
    const totalDitahan = history
        .filter(h => h.status === 'ditahan')
        .reduce((acc, h) => acc + (h.amount || 0), 0);

    // Build chart data dari history (persentase relatif terhadap max)
    const chartSource = history.slice(0, 7).reverse();
    const maxVal = Math.max(...chartSource.map(h => h.amount || 0), 1);
    const chartData = chartSource.map((h, i) => ({
        label: h.orderCode ? h.orderCode.split('-').pop() : `T${i + 1}`,
        value: Math.round(((h.amount || 0) / maxVal) * 100),
        isMax: h.amount === maxVal,
    }));

    const statusLabel = {
        ditahan: 'Tertunda',
        dilepas: 'Masuk',
        ditarik: 'Berhasil',
    };

    if (isLoading) {
        return (
            <SellerLayout>
                <div className="flex min-h-[60vh] items-center justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-600"></div>
                </div>
            </SellerLayout>
        );
    }

    return (
        <SellerLayout>
        <div className="pb-12 max-w-[1200px] mx-auto">

            <div className="mb-6 lg:mb-8">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                    Keuangan Toko
                </h1>
                <p className="text-sm text-slate-500 mt-1 font-medium">
                    Pantau saldo pendapatan dan tarik dana ke rekeningmu.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Kolom Kiri: Saldo Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-[1.25rem] border border-slate-200/70 shadow-[0_2px_4px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:border-[#4A5D23]/30 transition-all">
                        {/* Decorative Background Accent */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#4A5D23]/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>

                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="w-12 h-12 bg-[#4A5D23]/10 text-[#4A5D23] rounded-xl flex items-center justify-center">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <span className="bg-[#4A5D23]/10 text-[#4A5D23] text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider">
                                Saldo Siap Tarik
                            </span>
                        </div>

                        <div className="relative z-10">
                            <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-widest">Saldo Aktif</p>
                            <h2 className="text-4xl font-black text-slate-900 mb-8 tracking-tight">
                                {formatRp(totalDilepas)}
                            </h2>
                            <button className="w-full bg-[#4A5D23] text-white font-bold py-3.5 rounded-xl hover:bg-[#3B4A1C] shadow-sm transition-all flex items-center justify-center gap-2">
                                <ArrowUpRight className="w-5 h-5" /> Tarik Dana Sekarang
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[1.25rem] border border-slate-200/70 shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 border border-amber-100">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-0.5">
                                Dana Tertunda
                            </p>
                            <p className="text-xl font-black text-slate-900 leading-tight">
                                {formatRp(totalDitahan)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Kolom Kanan: Grafik Pendapatan */}
                <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[1.25rem] border border-slate-200/70 shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex flex-col">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                Statistik Pendapatan
                            </h3>
                            <p className="text-sm font-medium text-slate-500">
                                Berdasarkan riwayat transaksi
                            </p>
                        </div>
                        {chartData.length > 0 && (
                            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100 w-fit">
                                <TrendingUp className="w-4 h-4" />
                                <span className="font-bold text-sm">{chartData.length} transaksi</span>
                            </div>
                        )}
                    </div>

                    {/* CSS Simple Bar Chart */}
                    {chartData.length > 0 ? (
                        <div className="flex-1 flex items-end justify-between gap-2 sm:gap-4 mt-auto pt-10 h-64 border-b border-slate-100 pb-2 relative">
                            <div className="absolute inset-0 flex flex-col justify-between pt-10 pb-2 pointer-events-none">
                                <div className="w-full border-t border-slate-100 border-dashed"></div>
                                <div className="w-full border-t border-slate-100 border-dashed"></div>
                                <div className="w-full border-t border-slate-100 border-dashed"></div>
                                <div className="w-full"></div>
                            </div>

                            {chartData.map((data, index) => (
                                <div key={index} className="flex flex-col items-center w-full group relative z-10">
                                    <div className="relative w-full flex justify-center h-48 items-end">
                                        <div
                                            className={`w-full max-w-[2.5rem] rounded-t-lg transition-all duration-300 group-hover:opacity-90 ${data.isMax ? "bg-[#4A5D23]" : "bg-slate-200"}`}
                                            style={{ height: `${data.value}%` }}
                                        >
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-bold py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg whitespace-nowrap">
                                                {data.value}%
                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`mt-3 text-[11px] font-bold uppercase tracking-wider ${data.isMax ? "text-[#4A5D23]" : "text-slate-400"}`}>
                                        {data.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                            Belum ada data transaksi
                        </div>
                    )}
                </div>
            </div>

            {/* Tabel Riwayat */}
            <div className="mt-8 bg-white rounded-[1.25rem] border border-slate-200/70 shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="px-6 md:px-8 py-5 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900">Riwayat Transaksi</h2>
                </div>
                {history.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-sm">Belum ada riwayat transaksi.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50/50 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 md:px-8 py-4 border-b border-slate-100">ID Transaksi</th>
                                    <th className="px-6 md:px-8 py-4 border-b border-slate-100">Keterangan</th>
                                    <th className="px-6 md:px-8 py-4 border-b border-slate-100">Nominal</th>
                                    <th className="px-6 md:px-8 py-4 border-b border-slate-100">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {history.map((item, i) => (
                                    <tr key={item.id ?? i} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 md:px-8 py-4 md:py-5">
                                            <p className="font-bold text-slate-900">{item.orderCode || `#${item.id}`}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{item.createdAt}</p>
                                        </td>
                                        <td className="px-6 md:px-8 py-4 md:py-5">
                                            <p className="font-bold text-slate-700">Penjualan</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{item.productName}</p>
                                        </td>
                                        <td className={`px-6 md:px-8 py-4 md:py-5 font-black text-base md:text-lg tracking-tight ${item.status === 'ditahan' ? 'text-amber-600' : 'text-emerald-600'}`}>
                                            + {formatRp(item.amount)}
                                        </td>
                                        <td className="px-6 md:px-8 py-4 md:py-5">
                                            {item.status === 'ditahan' ? (
                                                <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-100 text-xs font-bold">
                                                    <AlertCircle className="w-3.5 h-3.5" /> {statusLabel[item.status]}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100 text-xs font-bold">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> {statusLabel[item.status] || item.status}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
        </SellerLayout>
    );
}
