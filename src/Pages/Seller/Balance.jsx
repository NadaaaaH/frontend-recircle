import React, { useState, useEffect } from 'react';
import SellerLayout from '@/Layouts/SellerLayout';
import { Download, TrendingUp, Clock, ChevronDown, Filter, Loader2, Coins, X, CheckCircle, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';

export default function SellerBalance() {
    const [transactions, setTransactions] = useState([]);
    const [totalDilepas, setTotalDilepas] = useState(0);
    const [totalDitahan, setTotalDitahan] = useState(0);
    const [totalDitarik, setTotalDitarik] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [filter] = useState('Semua');

    // Withdrawal Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [wdAmount, setWdAmount] = useState('');
    const [wdBank, setWdBank] = useState('bca');
    const [wdAccount, setWdAccount] = useState('');
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    
    // Notification Toast State
    const [toast, setToast] = useState({ show: false, type: '', message: '' });

    useEffect(() => {
        document.title = "Saldo Penjualan | ReCircle";
        fetchBalance();
    }, []);

    const fetchBalance = () => {
        setIsLoading(true);
        api.get('/seller/balance')
            .then((res) => {
                const data = res.data?.data;
                // Based on backend: totalDilepas is actually sum of dilepas + ditarik
                // which means it represents available balance.
                setTotalDilepas(data?.totalDilepas ?? 0);
                setTotalDitahan(data?.totalDitahan ?? 0);
                setTotalDitarik(data?.totalDitarik ?? 0);
                setTransactions(data?.history?.data ?? []);
            })
            .catch((err) => {
                console.error("Failed to fetch balance", err);
                setTransactions([]);
            })
            .finally(() => setIsLoading(false));
    };

    const handleWithdrawal = async (e) => {
        e.preventDefault();
        
        const amountNum = Number(wdAmount);
        if (amountNum < 10000) {
            showToast('error', 'Minimal penarikan adalah Rp 10.000');
            return;
        }

        if (amountNum > totalDilepas) {
            showToast('error', 'Saldo aktif tidak mencukupi.');
            return;
        }

        setIsWithdrawing(true);
        try {
            const res = await api.post('/seller/withdrawals', {
                amount: amountNum,
                bankCode: wdBank,
                accountNumber: wdAccount
            });
            
            showToast('success', res.data.message || 'Penarikan berhasil diproses!');
            setIsModalOpen(false);
            setWdAmount('');
            setWdAccount('');
            
            // Refresh data
            fetchBalance();
        } catch (err) {
            const msg = err.response?.data?.message || 'Gagal memproses penarikan.';
            showToast('error', msg);
        } finally {
            setIsWithdrawing(false);
        }
    };

    const showToast = (type, message) => {
        setToast({ show: true, type, message });
        setTimeout(() => setToast({ show: false, type: '', message: '' }), 4000);
    };

    const formatPrice = (price) => {
        const num = Number(price);
        const formatted = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(Math.abs(num)).replace('IDR', 'Rp');
        return num < 0 ? `-${formatted}` : `+${formatted}`;
    };

    const getTypeConfig = (type) => {
        switch (type) {
            case 'ditahan': return { label: 'Escrow', color: 'text-amber-700 bg-amber-50 border-amber-200' };
            case 'dilepas': return { label: 'Released', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
            case 'ditarik': return { label: 'Withdrawal', color: 'text-gray-700 bg-gray-100 border-gray-300' };
            default: return { label: type, color: 'text-gray-600 bg-gray-50 border-gray-200' };
        }
    };

    // totalDilepas currently represents the Available Balance (sum of dilepas + ditarik)
    // To get All-time revenue, we add the absolute value of withdrawn funds plus escrow
    // total_ditarik from backend is negative, so we subtract it to get a positive sum.
    const totalPendapatan = totalDilepas - totalDitarik + totalDitahan;

    if (isLoading) {
        return (
            <SellerLayout>
                <div className="flex min-h-[60vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-gray-900" />
                        <p className="text-sm font-medium text-gray-500 animate-pulse">Memuat data keuangan...</p>
                    </div>
                </div>
            </SellerLayout>
        );
    }

    return (
        <SellerLayout>
            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                        {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <p className="text-sm font-medium">{toast.message}</p>
                    </div>
                </div>
            )}

            {/* Withdrawal Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-lg font-semibold text-gray-900">Tarik Dana</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleWithdrawal} className="p-6">
                            <div className="mb-5 bg-gray-50 border border-gray-200 rounded-xl p-4">
                                <p className="text-xs font-medium text-gray-500 mb-1">Saldo Aktif (Tersedia)</p>
                                <p className="text-xl font-bold text-gray-900 tracking-tight">{formatPrice(totalDilepas).replace('+', '')}</p>
                            </div>
                            
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Tujuan</label>
                                    <select 
                                        value={wdBank} 
                                        onChange={(e) => setWdBank(e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors bg-white outline-none"
                                    >
                                        <option value="bca">BCA</option>
                                        <option value="bni">BNI</option>
                                        <option value="bri">BRI</option>
                                        <option value="mandiri">Mandiri</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Rekening</label>
                                    <input 
                                        type="number" 
                                        required
                                        value={wdAccount}
                                        onChange={(e) => setWdAccount(e.target.value)}
                                        placeholder="Contoh: 1234567890"
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Penarikan (Rp)</label>
                                    <input 
                                        type="number" 
                                        required
                                        min="10000"
                                        max={totalDilepas}
                                        value={wdAmount}
                                        onChange={(e) => setWdAmount(e.target.value)}
                                        placeholder="Minimal 10000"
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors outline-none"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isWithdrawing || !wdAmount || !wdAccount}
                                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors rounded-lg text-sm font-medium px-4 py-3"
                            >
                                {isWithdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                {isWithdrawing ? 'Memproses...' : 'Tarik Sekarang'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="max-w-[1200px] mx-auto pb-12">
                
                {/* PAGE HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Keuangan & Saldo</h1>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white hover:bg-gray-800 transition-colors rounded-lg text-sm font-medium px-4 py-2"
                    >
                        <Download className="w-4 h-4" />
                        Tarik Dana
                    </button>
                </div>

                {/* METRICS CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {/* Card 1 */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between h-32">
                        <p className="text-sm font-medium text-gray-500">Saldo Aktif</p>
                        <div className="flex items-end justify-between">
                            <p className="text-3xl font-semibold text-gray-900 tracking-tight">{formatPrice(totalDilepas).replace('+', '')}</p>
                            <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded text-xs font-medium">
                                <TrendingUp className="w-3 h-3" />
                                Aktif
                            </div>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between h-32">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-500">Dana Ditahan (Escrow)</p>
                            <Clock className="w-4 h-4 text-amber-500" />
                        </div>
                        <p className="text-3xl font-semibold text-gray-900 tracking-tight">{formatPrice(totalDitahan).replace('+', '')}</p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between h-32">
                        <p className="text-sm font-medium text-gray-500">Total Pendapatan</p>
                        <p className="text-3xl font-semibold text-gray-900 tracking-tight">{formatPrice(totalPendapatan).replace('+', '')}</p>
                    </div>
                </div>

                {/* TRANSACTION HISTORY SECTION */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-gray-900 tracking-tight">Riwayat Transaksi</h2>
                        <div className="relative">
                            <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm">
                                <Filter className="w-3.5 h-3.5 text-gray-500" />
                                {filter}
                                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                            </button>
                        </div>
                    </div>

                    {transactions.length === 0 ? (
                        <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                <Coins className="w-8 h-8" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Tidak Ada Transaksi</h3>
                            <p className="text-gray-500 text-sm font-medium">Riwayat uang masuk dan keluar belum tercatat saat ini.</p>
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Tanggal</th>
                                            <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                                            <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Tipe</th>
                                            <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-right w-48">Jumlah</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-transparent">
                                        {transactions.map((trx) => {
                                            const config = getTypeConfig(trx.status);
                                            // Handle withdrawal negative amount
                                            const amount = trx.status === 'ditarik' ? -Math.abs(trx.amount) : trx.amount;
                                            
                                            return (
                                                <tr key={trx.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {trx.createdAt}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {trx.productName || (trx.status === 'ditarik' ? 'Penarikan Dana ke Rekening' : 'Pemasukan Toko')}
                                                        <span className="block text-xs font-normal text-gray-400 mt-0.5">#{trx.orderCode || `INV-${trx.id}`}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${config.color}`}>
                                                            {config.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                                                        {formatPrice(amount)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </SellerLayout>
    );
}
