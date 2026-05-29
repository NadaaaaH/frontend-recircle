import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    PackageOpen, 
    Package, 
    RefreshCw, 
    Check,
    X,
    MoreHorizontal,
    Download,
    MessageSquare,
    Phone,
    User,
    Calendar,
    ArrowUpRight
} from 'lucide-react';
import SearchFilterBar from '@/Components/SearchFilterBar';
import api from '@/lib/axios';
import { useNotification } from '@/contexts/NotificationContext';

export default function Offers() {
    const { showToast } = useNotification();
    const [searchParams, setSearchParams] = useSearchParams();
    const [offersList, setOffersList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    
    // State for viewing detailed offer modal
    const [selectedOffer, setSelectedOffer] = useState(null);

    const search = searchParams.get('search') || '';
    const activeTab = searchParams.get('status') || 'all';
    const activeCategory = searchParams.get('category') || '';

    const setActiveTab = (tab) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('status', tab);
        setSearchParams(newParams);
    };

    useEffect(() => {
        document.title = "Penawaran Masuk | ReCircle";
        fetchOffers();
    }, [searchParams]);

    const fetchOffers = () => {
        setIsLoading(true);
        api.get('/seller/offers')
            .then((res) => {
                const raw = res.data?.data;
                const list = Array.isArray(raw) ? raw : [];
                console.log("Loaded incoming offers:", list); // Helpful console debug trace
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
                showToast('Penawaran berhasil disetujui!', 'success');
                if (selectedOffer && selectedOffer.id === id) {
                    setSelectedOffer(prev => ({ ...prev, status: 'accepted' }));
                }
            })
            .catch((err) => {
                showToast(err.response?.data?.message || 'Gagal menerima penawaran.', 'error');
            })
            .finally(() => setProcessingId(null));
    };

    const handleReject = (id) => {
        setProcessingId(id);
        api.post(`/offers/${id}/reject`)
            .then(() => {
                setOffersList(prev => prev.map(o => o.id === id ? { ...o, status: 'rejected' } : o));
                showToast('Penawaran telah ditolak.', 'success');
                if (selectedOffer && selectedOffer.id === id) {
                    setSelectedOffer(prev => ({ ...prev, status: 'rejected' }));
                }
            })
            .catch((err) => {
                showToast(err.response?.data?.message || 'Gagal menolak penawaran.', 'error');
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

    // Filter offers locally matching searches, tabs, and categories
    const filteredOffers = offersList.filter(offer => {
        const matchesSearch = !search || 
            (offer.product?.name || offer.productName || '').toLowerCase().includes(search.toLowerCase()) ||
            (offer.buyer?.name || offer.buyerName || '').toLowerCase().includes(search.toLowerCase());
            
        let matchesTab = false;
        // Match lowercase status to prevent mapping mismatches
        const offerStatus = (offer.status || '').toLowerCase().trim();
        if (activeTab === 'all') matchesTab = true;
        else if (activeTab === 'pending') matchesTab = offerStatus === 'pending';
        else if (activeTab === 'accepted') matchesTab = offerStatus === 'accepted';
        else if (activeTab === 'rejected') matchesTab = offerStatus === 'rejected' || offerStatus === 'cancelled';

        // Check nested product category slug match
        const matchesCategory = !activeCategory || offer.product?.category === activeCategory;
        
        return matchesSearch && matchesTab && matchesCategory;
    });

    // Verify these database ENUM values ('all', 'pending', 'accepted', 'rejected', 'cancelled') match your Laravel models/migrations
    const tabs = [
        { label: 'Semua', value: 'all' },
        { label: 'Menunggu', value: 'pending' },
        { label: 'Disetujui', value: 'accepted' },
        { label: 'Ditolak', value: 'rejected' }
    ];

    const categoryOptions = [
        { value: 'elektronik', label: 'Elektronik' },
        { value: 'furniture', label: 'Furniture' },
        { value: 'fashion', label: 'Fashion' },
        { value: 'buku-modul', label: 'Buku & Modul' },
        { value: 'gadget', label: 'Gadget' },
        { value: 'hobi', label: 'Hobi' },
        { value: 'perlengkapan-kost', label: 'Perlengkapan Kost' },
        { value: 'otomotif', label: 'Otomotif' },
    ];

    return (
        <SellerLayout>
            <div className="pb-12 max-w-[1200px] mx-auto space-y-6">

                {/* 1. TOP ACTION HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                            Penawaran Masuk
                        </h2>
                        <p className="text-xs text-slate-400 font-normal mt-0.5">
                            Kelola tawaran harga preloved dari para mahasiswa pembeli.
                        </p>
                    </div>
                    
                    {/* Action buttons with regular-weight text */}
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={fetchOffers}
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
                    {/* Card 1: Total Offers */}
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-400" />
                            <span className="text-xs font-normal text-slate-400">Total Penawaran</span>
                        </div>
                        <span className="text-2xl font-bold text-slate-800 mt-2.5 leading-none">{offersList.length}</span>
                    </div>

                    {/* Card 2: Pending Offers */}
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            <span className="text-xs font-normal text-slate-400">Menunggu</span>
                        </div>
                        <span className="text-2xl font-bold text-slate-800 mt-2.5 leading-none">
                            {offersList.filter(o => (o.status || '').toLowerCase().trim() === 'pending').length}
                        </span>
                    </div>

                    {/* Card 3: Accepted Offers */}
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-xs font-normal text-slate-400">Disetujui</span>
                        </div>
                        <span className="text-2xl font-bold text-slate-800 mt-2.5 leading-none">
                            {offersList.filter(o => (o.status || '').toLowerCase().trim() === 'accepted').length}
                        </span>
                    </div>

                    {/* Card 4: Rejected Offers */}
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-400" />
                            <span className="text-xs font-normal text-slate-400">Ditolak</span>
                        </div>
                        <span className="text-2xl font-bold text-slate-800 mt-2.5 leading-none">
                            {offersList.filter(o => {
                                const s = (o.status || '').toLowerCase().trim();
                                return s === 'rejected' || s === 'cancelled';
                            }).length}
                        </span>
                    </div>
                </div>

                {/* 3. TAB NAVIGATION & FILTER BAR */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100/80 mb-6 gap-4">
                    <div className="flex gap-5 overflow-x-auto no-scrollbar">
                        {tabs.map(tab => {
                            const isActive = activeTab === tab.value;
                            return (
                                <button
                                    key={tab.value}
                                    onClick={() => setActiveTab(tab.value)}
                                    className={`pb-2.5 text-xs font-normal transition-all relative whitespace-nowrap ${
                                        isActive ? 'text-[#43552c] font-medium' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    {tab.label}
                                    {isActive && (
                                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#43552c] rounded-full" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* Category Filter integrated elegantly inside search bar */}
                    <div className="w-full md:w-96 pb-1.5">
                        <SearchFilterBar 
                            filterOptions={categoryOptions}
                            filterKey="category"
                            placeholder="Cari penawaran..." 
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
                                    <th className="py-3 px-4 font-normal">Produk</th>
                                    <th className="py-3 px-4 font-normal">Pembeli</th>
                                    <th className="py-3 px-4 font-normal text-center">Tanggal</th>
                                    <th className="py-3 px-4 font-normal text-right">Harga Asli</th>
                                    <th className="py-3 px-4 font-normal text-right">Harga Nego</th>
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
                                ) : filteredOffers.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-16 text-center">
                                            <PackageOpen className="w-8 h-8 text-slate-300 mx-auto" strokeWidth={1.5} />
                                            <p className="text-slate-400 text-xs mt-2.5">Belum ada penawaran di kategori ini.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOffers.map((offer) => {
                                        const productName = offer.product?.name || offer.productName || "Produk";
                                        const imageUrl = offer.product?.image || offer.product?.imageUrl;
                                        const statusClean = (offer.status || '').toLowerCase().trim();

                                        return (
                                            <tr key={offer.id} className="hover:bg-slate-50/30 transition-colors group">
                                                {/* Checkbox column */}
                                                <td className="py-3.5 px-6 text-center">
                                                    <input 
                                                        type="checkbox" 
                                                        className="rounded border-slate-200 text-[#43552c] focus:ring-[#43552c]/20 cursor-pointer" 
                                                        checked={false} 
                                                        readOnly 
                                                    />
                                                </td>

                                                {/* Info Produk */}
                                                <td className="py-3.5 px-4 cursor-pointer" onClick={() => setSelectedOffer(offer)}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-8 rounded bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                            {imageUrl ? (
                                                                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Package className="w-4 h-4 text-slate-300" />
                                                            )}
                                                        </div>
                                                        <span className="font-normal text-slate-700 text-xs hover:text-[#43552c] transition-colors truncate max-w-[200px]" title={productName}>
                                                            {productName}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Pembeli */}
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-5.5 h-5.5 rounded-full bg-slate-100 border border-slate-200/80 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                            {offer.buyer?.avatar ? (
                                                                <img src={offer.buyer.avatar} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-[9px] font-semibold text-[#43552c]">
                                                                    {offer.buyer?.name?.charAt(0) || "?"}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-xs font-normal text-slate-500 truncate max-w-[120px]">
                                                            {offer.buyer?.name || "Pembeli"}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Tanggal */}
                                                <td className="py-3.5 px-4 text-center text-xs text-slate-400 font-normal">
                                                    {offer.created_at ? new Date(offer.created_at).toLocaleDateString("id-ID", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric"
                                                    }) : "-"}
                                                </td>

                                                {/* Harga Asli */}
                                                <td className="py-3.5 px-4 text-right text-xs text-slate-400/80 line-through font-normal">
                                                    {formatRp(offer.product?.price || offer.originalPrice)}
                                                </td>

                                                {/* Harga Nego */}
                                                <td className="py-3.5 px-4 text-right text-xs font-medium text-slate-700">
                                                    {statusClean === 'accepted' && (offer.negotiated_price || offer.dealPrice) ? (
                                                        <span className="text-emerald-600 font-medium">
                                                            {formatRp(offer.negotiated_price || offer.dealPrice)}
                                                        </span>
                                                    ) : (
                                                        <span>{formatRp(offer.offeredPrice)}</span>
                                                    )}
                                                </td>

                                                {/* Status Badges */}
                                                <td className="py-3.5 px-6 text-center">
                                                    {statusClean === 'pending' ? (
                                                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-normal lowercase capitalize bg-amber-50 text-amber-600 border border-amber-100/70">
                                                            menunggu
                                                        </span>
                                                    ) : statusClean === 'accepted' ? (
                                                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-normal lowercase capitalize bg-emerald-50 text-emerald-600 border border-emerald-100/70">
                                                            disetujui
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-normal lowercase capitalize bg-rose-50 text-rose-600 border border-rose-100/70">
                                                            ditolak
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Aksi */}
                                                <td className="py-3.5 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {statusClean === 'pending' ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleReject(offer.id)}
                                                                    disabled={processingId === offer.id}
                                                                    className="p-1 rounded bg-red-50 text-red-500 hover:bg-red-100/75 border border-red-100/60 transition-colors"
                                                                    title="Tolak Nego"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleAccept(offer.id)}
                                                                    disabled={processingId === offer.id}
                                                                    className="p-1 rounded bg-green-50 text-green-500 hover:bg-green-100/75 border border-green-100/60 transition-colors"
                                                                    title="Terima Nego"
                                                                >
                                                                    <Check className="w-3 h-3" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button 
                                                                onClick={() => setSelectedOffer(offer)}
                                                                className="p-1 rounded text-slate-400 hover:text-slate-500 hover:bg-slate-50 transition-colors"
                                                                title="Opsi Lain / Detail"
                                                            >
                                                                <MoreHorizontal className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
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
                            Menampilkan {filteredOffers.length === 0 ? 0 : 1}-{filteredOffers.length} dari {filteredOffers.length} penawaran
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

            </div>

            {/* 6. MODERN SHOPIFY-STYLE DETAILS DIALOG MODAL */}
            {selectedOffer && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 shadow-xl overflow-hidden p-6 space-y-5 animate-scale-up">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">Detail Penawaran</h3>
                                <p className="text-[10px] text-slate-400 font-normal mt-0.5">ID Penawaran #{selectedOffer.id}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedOffer(null)}
                                className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Product Info */}
                        <div className="flex items-center gap-4 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                            <div className="w-12 h-10 rounded-lg bg-white border border-slate-200/50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                {selectedOffer.product?.image || selectedOffer.product?.imageUrl ? (
                                    <img src={selectedOffer.product?.image || selectedOffer.product?.imageUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <Package className="w-4 h-4 text-slate-300" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-slate-700 truncate">{selectedOffer.product?.name || selectedOffer.productName || "Produk"}</p>
                                <p className="text-[11px] text-[#43552c] font-normal mt-0.5">
                                    Harga Asli: {formatRp(selectedOffer.product?.price || selectedOffer.originalPrice)}
                                </p>
                            </div>
                        </div>

                        {/* Negotiation Metrics */}
                        <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                            <div>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-normal">Diajukan</span>
                                <span className="text-sm font-bold text-slate-700">{formatRp(selectedOffer.offeredPrice)}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-normal">Kesepakatan</span>
                                <span className="text-sm font-bold text-emerald-600">
                                    {selectedOffer.status === 'accepted' ? formatRp(selectedOffer.negotiated_price || selectedOffer.dealPrice) : '-'}
                                </span>
                            </div>
                        </div>

                        {/* Buyer Info */}
                        <div className="space-y-3">
                            <h4 className="text-[10px] text-slate-400 uppercase tracking-wider font-normal">Informasi Pembeli</h4>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex flex-center items-center justify-center">
                                        {selectedOffer.buyer?.avatar ? (
                                            <img src={selectedOffer.buyer.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[9px] font-semibold text-[#43552c]">{selectedOffer.buyer?.name?.charAt(0) || "?"}</span>
                                        )}
                                    </div>
                                    <span className="text-xs font-normal text-slate-600">{selectedOffer.buyer?.name || "Pembeli"}</span>
                                </div>
                                {selectedOffer.buyer?.nomor_wa && (
                                    <a 
                                        href={`https://wa.me/${selectedOffer.buyer.nomor_wa.replace(/\D/g, '')}`}
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100/70 transition-colors"
                                    >
                                        <Phone className="w-3 h-3" />
                                        WhatsApp
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Buyer Message */}
                        {selectedOffer.message && (
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100/50">
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-normal mb-1">Pesan dari Pembeli</span>
                                <p className="text-xs text-slate-500 italic font-normal leading-relaxed">
                                    "{selectedOffer.message}"
                                </p>
                            </div>
                        )}

                        {/* Bottom Actions inside detail card */}
                        <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
                            {selectedOffer.status === 'pending' ? (
                                <>
                                    <button
                                        onClick={() => {
                                            handleReject(selectedOffer.id);
                                        }}
                                        disabled={processingId === selectedOffer.id}
                                        className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 text-xs font-normal transition-colors"
                                    >
                                        Tolak Nego
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleAccept(selectedOffer.id);
                                        }}
                                        disabled={processingId === selectedOffer.id}
                                        className="px-4 py-2 rounded-lg bg-[#43552c] text-white hover:bg-[#324021] text-xs font-medium transition-colors"
                                    >
                                        Terima Nego
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setSelectedOffer(null)}
                                    className="w-full py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-normal transition-colors text-center"
                                >
                                    Tutup Detail
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </SellerLayout>
    );
}
