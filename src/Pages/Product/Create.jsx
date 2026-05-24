import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SellerLayout from '@/Layouts/SellerLayout';
import { Upload, X, Image as ImageIcon, ArrowLeft, Eye, Tag, MapPin, FileText, Layers, CheckCircle } from 'lucide-react';
import api from '@/lib/axios';

export default function Create() {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setDataState] = useState({
        nama_barang: '',
        harga: '',
        category_id: '',
        kondisi: 'Bekas - Layak Pakai',
        deskripsi: '',
        lokasi_kampus: 'IPB University',
        images: [],
    });

    const setData = (key, value) => {
        setDataState(prev => ({ ...prev, [key]: value }));
    };

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [flash, setFlash] = useState(null);

    const [previewUrls, setPreviewUrls] = useState([]);
    const [isDragging, setIsDragging] = useState(false);

    const conditions = [
        'Baru',
        'Bekas - Seperti Baru',
        'Bekas - Layak Pakai',
        'Bekas - Butuh Perbaikan',
    ];

    useEffect(() => {
        document.title = "Jual Barang | ReCircle";
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const homeRes = await api.get('/');
            if (homeRes.data?.data?.categories) {
                setCategories(homeRes.data.data.categories);
            }
        } catch (err) {
            console.error("Failed to load categories", err);
        }
    };

    // ── Image Handlers ──
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = [...data.images, ...files].slice(0, 5);
        setData('images', newImages);

        const newPreviews = newImages.map((file) => URL.createObjectURL(file));
        setPreviewUrls(newPreviews);
    };

    const removeImage = (indexToRemove) => {
        URL.revokeObjectURL(previewUrls[indexToRemove]);
        const updatedImages = data.images.filter((_, i) => i !== indexToRemove);
        const updatedPreviews = previewUrls.filter((_, i) => i !== indexToRemove);

        setData('images', updatedImages);
        setPreviewUrls(updatedPreviews);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
            if (files.length > 0) {
                const newImages = [...data.images, ...files].slice(0, 5);
                setData('images', newImages);
                const newPreviews = newImages.map((file) => URL.createObjectURL(file));
                setPreviewUrls(newPreviews);
            }
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        setFlash(null);

        try {
            const formData = new FormData();
            // Mapping keys to standard Backend requirement (CamelCase as per current controllers)
            formData.append('name', data.nama_barang);
            formData.append('price', data.harga);
            formData.append('categoryId', data.category_id);
            formData.append('condition', data.kondisi);
            formData.append('description', data.deskripsi);
            formData.append('campusLocation', data.lokasi_kampus);
            formData.append('stock', 1); // Standard unit item

            // Append image files
            if (data.images.length > 0) {
                data.images.forEach((file) => {
                    formData.append('images[]', file);
                });
            }

            await api.post('/products', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setFlash("Produk berhasil ditayangkan!");
            setTimeout(() => navigate('/seller/products'), 1500);

        } catch (err) {
            console.error("Create product error", err);
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                setErrors({ general: "Gagal menayangkan produk. Silakan periksa koneksi Anda." });
            }
        } finally {
            setProcessing(false);
        }
    };

    const InputError = ({ message }) => {
        if (!message) return null;
        const msg = Array.isArray(message) ? message[0] : message;
        return <p className="text-rose-500 text-xs mt-1.5 font-bold tracking-wide">{msg}</p>;
    };

    return (
        <SellerLayout>
            <div className="pb-12 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        to="/seller/products"
                        className="p-3 bg-white border border-slate-200/70 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Tambah Produk</h1>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Buat iklan baru untuk barang preloved Anda</p>
                    </div>
                </div>

                {flash && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl px-5 py-4 mb-8 flex items-center gap-3 text-sm font-bold">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        {flash}
                    </div>
                )}

                {Object.keys(errors).length > 0 && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-6 py-5 mb-8 flex flex-col gap-2 shadow-sm">
                        <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider text-rose-800 mb-1">
                            <X className="w-4 h-4" />
                            Terjadi Kesalahan Pengisian
                        </div>
                        <ul className="list-disc list-inside space-y-1">
                            {Object.entries(errors).map(([key, messages]) => {
                                const msg = Array.isArray(messages) ? messages[0] : messages;
                                // Prettify image indexing keys so users understand
                                const cleanKey = key.startsWith('images.') ? `Foto ke-${parseInt(key.split('.')[1]) + 1}` : key;
                                return (
                                    <li key={key} className="text-sm font-medium leading-relaxed">
                                        <span className="font-bold opacity-80 capitalize">{cleanKey.replace(/([A-Z])/g, ' $1')}:</span> {msg}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}

                <form onSubmit={submit} className="flex flex-col xl:flex-row gap-8">
                    {/* ── LEFT COLUMN: Form Fields ── */}
                    <div className="flex-1 space-y-6">

                        {/* 1. Photo Upload */}
                        <div className="bg-white rounded-[1.25rem] p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200/70">
                            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100">
                                <div className="w-9 h-9 rounded-full bg-[#4A5D23]/10 flex items-center justify-center">
                                    <ImageIcon className="w-4 h-4 text-[#4A5D23]" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-lg">Foto Produk</h3>
                                <span className="text-xs text-slate-400 ml-auto font-bold">{data.images.length}/5</span>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                                {previewUrls.map((url, idx) => (
                                    <div
                                        key={idx}
                                        className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-sm group"
                                    >
                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur rounded-xl text-slate-500 hover:text-rose-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                        {idx === 0 && (
                                            <span className="absolute bottom-0 left-0 right-0 bg-[#4A5D23] text-white text-[9px] text-center py-1 font-bold tracking-widest uppercase">
                                                Sampul
                                            </span>
                                        )}
                                    </div>
                                ))}

                                {data.images.length < 5 && (
                                    <label 
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        className={`aspect-square border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${isDragging ? 'border-[#4A5D23] bg-[#4A5D23]/5' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'}`}
                                    >
                                        <Upload className={`w-6 h-6 mb-1 ${isDragging ? 'text-[#4A5D23]' : 'text-slate-400'}`} />
                                        <span className="text-xs text-slate-500 font-bold">Tambah</span>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/jpeg,image/png,image/jpg"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                            <InputError message={errors.images} />
                        </div>

                        {/* 2. Product Info */}
                        <div className="bg-white rounded-[1.25rem] p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200/70 space-y-6">
                            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                                <div className="w-9 h-9 rounded-full bg-[#d4a373]/10 flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-[#d4a373]" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-lg">Informasi Barang</h3>
                            </div>

                            {/* Nama Barang */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Nama Produk</label>
                                <input
                                    type="text"
                                    value={data.nama_barang}
                                    onChange={(e) => setData('nama_barang', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 px-5 py-3.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#4A5D23]/20 focus:border-[#4A5D23] transition-all font-medium"
                                    placeholder="Contoh: Keyboard Mechanical Keychron"
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Harga & Kategori */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        <span className="flex items-center gap-1.5"><Tag className="w-4 h-4 text-slate-400" /> Harga (Rp)</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={data.harga}
                                        onChange={(e) => setData('harga', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 px-5 py-3.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#4A5D23]/20 focus:border-[#4A5D23] font-bold"
                                        placeholder="0"
                                        min="1000"
                                    />
                                    <InputError message={errors.price} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        <span className="flex items-center gap-1.5"><Layers className="w-4 h-4 text-slate-400" /> Kategori</span>
                                    </label>
                                    <select
                                        value={data.category_id}
                                        onChange={(e) => setData('category_id', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 px-5 py-3.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#4A5D23]/20 focus:border-[#4A5D23] font-medium"
                                    >
                                        <option value="" disabled>Pilih Kategori</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.categoryId} />
                                </div>
                            </div>

                            {/* Kondisi & Lokasi */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Kondisi</label>
                                    <select
                                        value={data.kondisi}
                                        onChange={(e) => setData('kondisi', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 px-5 py-3.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#4A5D23]/20 focus:border-[#4A5D23] font-medium"
                                    >
                                        {conditions.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.condition} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> Lokasi Kampus</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.lokasi_kampus}
                                        onChange={(e) => setData('lokasi_kampus', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 px-5 py-3.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#4A5D23]/20 focus:border-[#4A5D23] font-medium"
                                        placeholder="IPB University"
                                    />
                                    <InputError message={errors.campusLocation} />
                                </div>
                            </div>

                            {/* Deskripsi */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Deskripsi</label>
                                <textarea
                                    rows="5"
                                    value={data.deskripsi}
                                    onChange={(e) => setData('deskripsi', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 px-5 py-3.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#4A5D23]/20 focus:border-[#4A5D23] resize-none font-medium"
                                    placeholder="Jelaskan kondisi barang, alasan dijual..."
                                />
                                <InputError message={errors.description} />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-4 pt-2">
                            <Link
                                to="/seller/products"
                                className="px-8 py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition-all"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-10 py-3.5 bg-[#4A5D23] text-white font-bold rounded-xl hover:bg-[#3B4A1C] shadow-sm disabled:opacity-70 disabled:cursor-not-allowed text-sm transition-all flex items-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Tayangkan Iklan'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* ── RIGHT COLUMN: Live Preview ── */}
                    <div className="xl:w-80 flex-shrink-0">
                        <div className="sticky top-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Eye className="w-4 h-4 text-slate-400" />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Preview Iklan</p>
                            </div>
                            <div className="bg-white rounded-[1.25rem] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200 overflow-hidden">
                                <div className="aspect-square bg-slate-50 relative flex items-center justify-center border-b border-slate-100">
                                    {previewUrls.length > 0 ? (
                                        <img src={previewUrls[0]} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-slate-300 flex flex-col items-center">
                                            <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                                            <span className="text-xs font-bold">Foto Sampul</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-5">
                                    <span className="text-xl font-black text-slate-900 block tracking-tight">
                                        {data.harga
                                            ? `Rp ${parseInt(data.harga).toLocaleString('id-ID')}`
                                            : 'Rp -'}
                                    </span>
                                    <h3 className="font-bold text-slate-700 text-sm mt-1.5 leading-snug line-clamp-2">
                                        {data.nama_barang || 'Judul Produk...'}
                                    </h3>
                                    {data.lokasi_kampus && (
                                        <div className="mt-4 pt-3 border-t border-slate-100">
                                            <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {data.lokasi_kampus}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </SellerLayout>
    );
}
