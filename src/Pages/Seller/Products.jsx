import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SellerLayout from '@/Layouts/SellerLayout';
import { Package, Plus, Edit, Trash2, Search, ArrowRight, LayoutGrid, List, CheckCircle, Archive, ArchiveRestore, RefreshCw, Trash, Loader2 } from 'lucide-react';
import ConfirmModal from '@/Components/ConfirmModal';
import api from '@/lib/axios';

export default function SellerProducts() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [flash, setFlash] = useState({});
    const [errors, setErrors] = useState({});
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [activeTab, setActiveTab] = useState('active'); // 'active' | 'archived' | 'trash'

    // Confirmation Modal State
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [deleteType, setDeleteType] = useState('soft'); // 'soft' | 'force'
    const [isProcessing, setIsProcessing] = useState(false);

    const formatPrice = (p) => 'Rp ' + Number(p || 0).toLocaleString('id-ID');

    useEffect(() => {
        document.title = "Kelola Produk | ReCircle";
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/seller/products');
            setProducts(res.data?.data || []);
        } catch (err) {
            console.error("Failed loading products", err);
            setErrors({ error: "Gagal memuat data produk" });
        } finally {
            setIsLoading(false);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = (p.name || '').toLowerCase().includes(search.toLowerCase());
        let matchesTab = false;
        if (activeTab === 'active') {
            matchesTab = !p.is_archived && !p.deleted_at;
        } else if (activeTab === 'archived') {
            matchesTab = p.is_archived && !p.deleted_at;
        } else if (activeTab === 'trash') {
            matchesTab = !!p.deleted_at;
        }
        return matchesSearch && matchesTab;
    });

    const triggerDelete = (id, type = 'soft') => {
        setProductToDelete(id);
        setDeleteType(type);
        setIsConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;
        setIsProcessing(true);
        try {
            const url = deleteType === 'force' 
                ? `/seller/products/${productToDelete}/force`
                : `/seller/products/${productToDelete}`;
            
            const method = deleteType === 'force' ? 'delete' : 'delete'; 
            // Notice both map to DELETE method physically but different endpoints
            await api.delete(url);

            setFlash({ success: deleteType === 'force' ? "Produk dihapus permanen" : "Produk dipindah ke tong sampah" });
            setTimeout(() => setFlash({}), 3000);
            fetchProducts(); // Reload data refresh state
        } catch (err) {
            setErrors({ error: err.response?.data?.message || "Gagal memproses penghapusan" });
            setTimeout(() => setErrors({}), 4000);
        } finally {
            setIsProcessing(false);
            setIsConfirmOpen(false);
            setProductToDelete(null);
        }
    };

    const handleToggleArchive = async (id) => {
        try {
            await api.post(`/seller/products/${id}/toggle-archive`);
            setFlash({ success: "Status arsip produk diperbarui" });
            setTimeout(() => setFlash({}), 3000);
            fetchProducts();
        } catch (err) {
            alert("Gagal merubah arsip");
        }
    };

    const handleRestore = async (id) => {
        try {
            await api.post(`/seller/products/${id}/restore`);
            setFlash({ success: "Produk dipulihkan" });
            setTimeout(() => setFlash({}), 3000);
            fetchProducts();
        } catch (err) {
            alert("Gagal memulihkan produk");
        }
    };

    const getDaysLeft = (deletedAtStr) => {
        if (!deletedAtStr) return 0;
        const deletedDate = new Date(deletedAtStr);
        const autoDeleteDate = new Date(deletedDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        const diffTime = autoDeleteDate - new Date();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    };

    const TabButton = ({ id, label, count }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === id 
                ? 'border-[#4A5D23] text-[#4A5D23]' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
        >
            {label}
            <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === id ? 'bg-[#4A5D23]/10 text-[#4A5D23]' : 'bg-slate-100 text-slate-500'
            }`}>
                {count}
            </span>
        </button>
    );

    const counts = {
        active: products.filter(p => !p.is_archived && !p.deleted_at).length,
        archived: products.filter(p => p.is_archived && !p.deleted_at).length,
        trash: products.filter(p => !!p.deleted_at).length,
    };

    return (
        <SellerLayout>
        <div className="pb-10 max-w-[1200px] mx-auto">

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-6">
                Kelola Produk
            </h1>

            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex-1 relative max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari produkmu..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200/70 rounded-xl text-sm focus:border-[#4A5D23] focus:ring-[#4A5D23]/20 shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white border border-slate-200/70 rounded-xl p-1 flex shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Grid View"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                            title="List View"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                        <Link
                            to="/products/create"
                        className="flex items-center gap-2 bg-[#4A5D23] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#3B4A1C] transition-all"
                    >
                        <Plus className="w-4 h-4" /> Tambah
                        <span className="hidden sm:inline">Produk Baru</span>
                    </Link>
                </div>
            </div>

            {flash?.success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 mb-6 flex items-center gap-2 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    {flash.success}
                </div>
            )}
            
            {errors?.error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 mb-6 flex items-center gap-2 text-sm font-medium">
                    <Trash className="w-4 h-4" />
                    {errors.error}
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-slate-200/70 mb-6 overflow-x-auto hide-scrollbar">
                <TabButton id="active" label="Produk Aktif" count={counts.active} />
                <TabButton id="archived" label="Diarsipkan" count={counts.archived} />
                <TabButton id="trash" label="Tong Sampah" count={counts.trash} />
            </div>

            {isLoading ? (
                <div className="py-20 text-center bg-white border border-slate-100 rounded-2xl">
                    <Loader2 className="w-8 h-8 animate-spin text-[#4A5D23] mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">Memuat data produk...</p>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="bg-white rounded-[1.25rem] p-12 text-center shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-slate-200/70 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <Package className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
                        {activeTab === 'active' ? 'Belum ada produk aktif' : 
                         activeTab === 'archived' ? 'Belum ada produk diarsipkan' : 'Tong sampah kosong'}
                    </h3>
                    <p className="text-slate-500 mb-6 max-w-sm mx-auto font-medium">
                        {activeTab === 'active' ? 'Mulai jual furnitur atau barang di kos/kampusmu yang tidak terpakai!' : ''}
                    </p>
                    {activeTab === 'active' && (
                        <Link
                            to="/products/create"
                            className="inline-flex items-center gap-2 bg-white border border-[#4A5D23] text-[#4A5D23] px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#4A5D23]/5 transition-all group"
                        >
                            Mulai Jualan <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    )}
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map(p => (
                        <div key={p.id} className="bg-white rounded-[1.25rem] overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-slate-200/70 hover:border-slate-300 transition-all group flex flex-col">
                            <div className="aspect-[4/3] bg-slate-50 relative">
                                <img 
                                    src={p.img || '/images/placeholder-product.png'} 
                                    alt={p.name} 
                                    className={`w-full h-full object-cover ${activeTab !== 'active' ? 'grayscale opacity-75' : ''}`} 
                                    onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-product.png'; }}
                                />

                                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                                    {p.status === 'active' && !p.is_archived && !p.deleted_at && <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-emerald-100">Active</span>}
                                    {p.status === 'sold' && !p.deleted_at && <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-amber-100">Sold</span>}
                                    {p.is_archived && !p.deleted_at && <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-200">Archived</span>}
                                    {p.deleted_at && <span className="bg-rose-50 text-rose-600 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-rose-100">Trashed</span>}
                                </div>
                                {p.active_orders > 0 && !p.deleted_at && (
                                    <div className="absolute bottom-2 left-2 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                                        {p.active_orders} Pesanan Aktif
                                    </div>
                                )}
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">{p.category}</div>
                                <h3 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-2 leading-snug flex-1">{p.name}</h3>
                                <div className="text-lg font-bold text-slate-900 tracking-tight mb-4">{formatPrice(p.price)}</div>

                                {activeTab === 'trash' && (
                                    <div className="text-xs text-rose-600 mb-3 font-medium bg-rose-50 p-2 rounded-lg text-center border border-rose-100">
                                        Terhapus otomatis dlm {getDaysLeft(p.deleted_at)} hari
                                    </div>
                                )}

                                <div className={`grid gap-2 mt-auto pt-3 border-t border-slate-100 ${activeTab === 'active' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                                    {activeTab === 'active' && (
                                        <>
                                            <Link
                                                to={`/seller/products/${p.id}/edit`}
                                                className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
                                            >
                                                <Edit className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Edit</span>
                                            </Link>
                                            <button
                                                onClick={() => handleToggleArchive(p.id)}
                                                className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors border border-amber-100/50"
                                            >
                                                <Archive className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Arsip</span>
                                            </button>
                                            <button
                                                onClick={() => triggerDelete(p.id, 'soft')}
                                                className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors border border-rose-100/50"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Hapus</span>
                                            </button>
                                        </>
                                    )}

                                    {activeTab === 'archived' && (
                                        <>
                                            <button
                                                onClick={() => handleToggleArchive(p.id)}
                                                className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 text-[#4A5D23] hover:bg-slate-100 transition-colors border border-slate-200"
                                            >
                                                <ArchiveRestore className="w-3.5 h-3.5" /> Tampilkan
                                            </button>
                                            <button
                                                onClick={() => triggerDelete(p.id, 'soft')}
                                                className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors border border-rose-100/50"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Hapus
                                            </button>
                                        </>
                                    )}

                                    {activeTab === 'trash' && (
                                        <>
                                            <button
                                                onClick={() => handleRestore(p.id)}
                                                className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-100/50"
                                            >
                                                <RefreshCw className="w-3.5 h-3.5" /> Pulihkan
                                            </button>
                                            <button
                                                onClick={() => triggerDelete(p.id, 'force')}
                                                className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors border border-rose-100/50"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Permanen
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-[1.25rem] shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-slate-200/70 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Produk</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Harga</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kategori</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((p, idx) => (
                                    <tr key={p.id} className={`hover:bg-slate-50/80 transition-colors ${idx !== filteredProducts.length - 1 ? 'border-b border-slate-100' : ''}`}>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-4">
                                                <img 
                                                    src={p.img || '/images/placeholder-product.png'} 
                                                    alt="" 
                                                    className={`w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200/50 ${activeTab !== 'active' ? 'grayscale opacity-75' : ''}`} 
                                                    onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-product.png'; }}
                                                />
                                                <div>
                                                    <p className="font-semibold text-slate-900 text-sm max-w-[200px] truncate">{p.name}</p>
                                                    <p className="text-xs text-slate-500 mt-1 font-medium">{p.created_at}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 font-bold text-slate-900 text-sm whitespace-nowrap tracking-tight">{formatPrice(p.price)}</td>
                                        <td className="py-4 px-6 text-sm text-slate-600 font-medium">{p.category}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col gap-1.5 items-start">
                                                {p.status === 'active' && !p.is_archived && !p.deleted_at && <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-emerald-100/50">Active</span>}
                                                {p.status === 'sold' && !p.deleted_at && <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-amber-100/50">Sold</span>}
                                                {p.is_archived && !p.deleted_at && <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-200/50">Archived</span>}
                                                {p.deleted_at && <span className="bg-rose-50 text-rose-600 px-2.5 py-1 rounded-lg text-xs font-bold border border-rose-100/50">Trashed (sisa {getDaysLeft(p.deleted_at)} hr)</span>}
                                                {p.active_orders > 0 && !p.deleted_at && <span className="text-[10px] text-blue-600 font-bold px-1.5">{p.active_orders} pesanan aktif</span>}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-end gap-2">
                                                {activeTab === 'active' && (
                                                    <>
                                                        <Link
                                                            to={`/seller/products/${p.id}/edit`}
                                                            className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-200/50"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleToggleArchive(p.id)}
                                                            className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 hover:text-amber-700 transition-colors border border-amber-100/50"
                                                            title="Arsipkan"
                                                        >
                                                            <Archive className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => triggerDelete(p.id, 'soft')}
                                                            className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 hover:text-rose-700 transition-colors border border-rose-100/50"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {activeTab === 'archived' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleToggleArchive(p.id)}
                                                            className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-200/50"
                                                            title="Tampilkan Lagi"
                                                        >
                                                            <ArchiveRestore className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => triggerDelete(p.id, 'soft')}
                                                            className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 hover:text-rose-700 transition-colors border border-rose-100/50"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {activeTab === 'trash' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleRestore(p.id)}
                                                            className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 hover:text-emerald-700 transition-colors border border-emerald-100/50"
                                                            title="Pulihkan"
                                                        >
                                                            <RefreshCw className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => triggerDelete(p.id, 'force')}
                                                            className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 hover:text-rose-700 transition-colors border border-rose-100/50"
                                                            title="Hapus Permanen"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <ConfirmModal 
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmDelete}
                title={deleteType === 'force' ? "Hapus Permanen" : "Pindah ke Tong Sampah"}
                subtitle={deleteType === 'force' 
                    ? "Apakah Anda yakin ingin menghapus produk ini secara permanen? Data yang dihapus tidak dapat dipulihkan." 
                    : "Apakah Anda yakin ingin menghapus produk ini? Produk akan masuk ke Tong Sampah dan akan dihapus otomatis setelah 30 hari."}
                confirmText={deleteType === 'force' ? "Hapus Permanen" : "Hapus"}
                cancelText="Batal"
                type="danger"
                isLoading={isProcessing}
            />
        </div>
        </SellerLayout>
    );
}
