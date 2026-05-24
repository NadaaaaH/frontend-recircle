import React, { useState, useEffect } from 'react';
import SellerLayout from '@/Layouts/SellerLayout';
import { PackageOpen, CheckCircle2, XCircle } from 'lucide-react';
import api from '@/lib/axios';

export default function Offers() {
    const [offersList, setOffersList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        document.title = "Penawaran Masuk | ReCircle";
        fetchOffers();
    }, []);

    const fetchOffers = () => {
        setIsLoading(true);
        api.get('/seller/offers')
            .then((res) => {
                const raw = res.data?.data;
                const list = Array.isArray(raw) ? raw : [];
                setOffersList(list);
            })
            .catch(() => {
                setOffersList([]);
            })
            .finally(() => setIsLoading(false));
    };

    const handleAccept = (id) => {
        setProcessingId(id);
        api.post(`/offers/${id}/accept`)
            .then(() => {
                setOffersList(prev => prev.map(o => o.id === id ? { ...o, status: 'accepted' } : o));
            })
            .catch((err) => {
                alert(err.response?.data?.message || 'Gagal menerima penawaran.');
            })
            .finally(() => setProcessingId(null));
    };

    const handleReject = (id) => {
        setProcessingId(id);
        api.post(`/offers/${id}/reject`)
            .then(() => {
                setOffersList(prev => prev.map(o => o.id === id ? { ...o, status: 'rejected' } : o));
            })
            .catch((err) => {
                alert(err.response?.data?.message || 'Gagal menolak penawaran.');
            })
            .finally(() => setProcessingId(null));
    };

    const formatRp = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value || 0);
    };

    // API returns camelCase from OfferResource
    // status: 'pending' | 'accepted' | 'rejected'
    const filteredOffers = offersList.filter(offer => {
        if (activeTab === 'pending') return offer.status === 'pending';
        if (activeTab === 'accepted') return offer.status === 'accepted';
        if (activeTab === 'rejected') return offer.status === 'rejected';
        return true;
    });

    const tabs = [
        { id: 'pending', label: 'Menunggu' },
        { id: 'accepted', label: 'Disetujui' },
        { id: 'rejected', label: 'Ditolak' },
    ];

    if (isLoading) {
        return (
            <SellerLayout>
                <div className="flex min-h-[60vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-600"></div>
                        <p className="text-sm font-semibold text-emerald-600 animate-pulse">Memuat Penawaran...</p>
                    </div>
                </div>
            </SellerLayout>
        );
    }

    return (
        <SellerLayout>
        <div className="min-h-screen bg-[#F4F5F7] pb-10">

            <div className="max-w-[1000px] mx-auto space-y-2">

                {/* Header */}
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-6">
                    Penawaran Masuk
                </h1>

                {/* Segmented Tabs */}
                <div className="bg-slate-100 p-1 rounded-xl inline-flex mb-8">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                rounded-lg px-6 py-2 font-medium transition-all text-sm
                                ${activeTab === tab.id
                                    ? 'bg-white shadow-sm text-slate-900'
                                    : 'text-slate-500 hover:text-slate-700'
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Offer Cards List */}
                <div className="flex flex-col gap-4">
                    {filteredOffers.length === 0 ? (
                        /* Empty State */
                        <div className="bg-white border border-slate-200/70 rounded-[1.25rem] p-12 shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center text-center">
                            <PackageOpen className="w-12 h-12 text-slate-300 mb-4" strokeWidth={1.5} />
                            <p className="text-slate-500 font-medium">Belum ada penawaran di kategori ini</p>
                        </div>
                    ) : (
                        /* Cards */
                        filteredOffers.map((offer) => (
                            <div key={offer.id} className="bg-white border border-slate-200/70 rounded-[1.25rem] p-5 flex flex-col md:flex-row justify-between items-center gap-6 shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">

                                {/* Kiri: Info Produk & Pembeli */}
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="w-16 h-16 rounded-xl object-cover border border-slate-100 overflow-hidden bg-slate-50 flex-shrink-0 flex items-center justify-center">
                                        {offer.product?.image ? (
                                            <img src={offer.product.image} alt={offer.product?.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <PackageOpen className="w-6 h-6 text-slate-300" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 truncate max-w-xs">{offer.product?.name || 'Produk Tidak Diketahui'}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {offer.buyer?.avatar ? (
                                                    <img src={offer.buyer.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-[10px] font-bold text-slate-600">{offer.buyer?.name?.charAt(0) || '?'}</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 truncate max-w-[200px]">
                                                {offer.buyer?.name || 'Pembeli'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                 {/* Tengah: Harga */}
                                 <div className="w-full md:w-auto flex md:flex-col items-center md:items-start justify-between md:justify-center border-t border-slate-100 md:border-0 pt-4 md:pt-0">
                                     {offer.status === 'accepted' && (offer.negotiated_price || offer.dealPrice) ? (
                                         <>
                                             <p className="text-xs text-green-600 uppercase tracking-wider font-bold">Harga Deal:</p>
                                             <div className="flex items-center md:items-baseline gap-2 mt-0.5">
                                                 <p className="text-2xl font-extrabold text-green-600 tracking-tight">
                                                     {formatRp(offer.negotiated_price || offer.dealPrice)}
                                                 </p>
                                                 <p className="text-xs text-slate-400 line-through font-medium hidden sm:inline-block">
                                                     {formatRp(offer.offeredPrice)}
                                                 </p>
                                             </div>
                                         </>
                                     ) : (
                                         <>
                                             <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Penawaran:</p>
                                             <div className="flex items-center md:items-baseline gap-2 mt-0.5">
                                                 <p className="text-2xl font-bold text-slate-900 tracking-tight">
                                                     {formatRp(offer.offeredPrice)}
                                                 </p>
                                                 <p className="text-sm text-slate-400 line-through font-medium hidden sm:inline-block">
                                                     {formatRp(offer.product?.price)}
                                                 </p>
                                             </div>
                                         </>
                                     )}
                                 </div>

                                {/* Kanan: Aksi / Status */}
                                <div className="w-full md:w-auto flex gap-3 md:justify-end">
                                    {activeTab === 'pending' ? (
                                        <>
                                            <button
                                                onClick={() => handleReject(offer.id)}
                                                disabled={processingId === offer.id}
                                                className="flex-1 md:flex-none bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl px-6 py-2.5 font-medium transition-all text-sm whitespace-nowrap disabled:opacity-60"
                                            >
                                                Tolak
                                            </button>
                                            <button
                                                onClick={() => handleAccept(offer.id)}
                                                disabled={processingId === offer.id}
                                                className="flex-1 md:flex-none bg-[#4A5D23] hover:bg-[#3B4A1C] text-white rounded-xl px-6 py-2.5 font-medium transition-all text-sm whitespace-nowrap disabled:opacity-60"
                                            >
                                                {processingId === offer.id ? '...' : 'Terima'}
                                            </button>
                                        </>
                                    ) : activeTab === 'accepted' ? (
                                        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-semibold border border-emerald-100 w-full md:w-auto justify-center">
                                            <CheckCircle2 className="w-4 h-4" /> Disetujui
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 bg-rose-50 text-rose-700 px-4 py-2 rounded-xl text-sm font-semibold border border-rose-100 w-full md:w-auto justify-center">
                                            <XCircle className="w-4 h-4" /> Ditolak
                                        </div>
                                    )}
                                </div>

                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
        </SellerLayout>
    );
}
