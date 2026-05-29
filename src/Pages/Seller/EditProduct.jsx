import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SellerLayout from '@/Layouts/SellerLayout';
import { Upload, X, Image as ImageIcon, ArrowLeft, Tag, FileText, Layers, CheckCircle, Loader2 } from 'lucide-react';
import api from '@/lib/axios';

export default function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [data, setDataState] = useState({
        nama_barang: '',
        harga: '',
        category_id: '',
        kondisi: 'Bekas - Layak Pakai',
        deskripsi: '',
        status: 'active',
        image: null, // For newly uploaded file
    });
    const setData = (key, value) => setDataState(prev => ({ ...prev, [key]: value }));

    const [previewUrl, setPreviewUrl] = useState(null);
    const [initialProduct, setInitialProduct] = useState(null);

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [flash, setFlash] = useState({});

    useEffect(() => {
        document.title = `Edit Produk | ReCircle`;
        fetchDependenciesAndData();
    }, [id]);

    const fetchDependenciesAndData = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch categories from home API fallback
            const homeRes = await api.get('/');
            if (homeRes.data?.data?.categories) {
                setCategories(homeRes.data.data.categories);
            }

            // 2. Fetch specific product
            const prodRes = await api.get(`/products/${id}`);
            const prod = prodRes.data?.data;
            if (prod) {
                setInitialProduct(prod);
                setDataState({
                    nama_barang: prod.name || '',
                    harga: prod.price || '',
                    category_id: prod.category?.id || '',
                    kondisi: prod.condition || 'Bekas - Layak Pakai',
                    deskripsi: prod.description || '',
                    status: prod.status || 'active',
                    image: null,
                });
                // Set initial cover image preview from backend response array
                if (prod.images && prod.images.length > 0) {
                     setPreviewUrl(prod.images[0]);
                }
                document.title = `Edit ${prod.name} | ReCircle`;
            }
        } catch (error) {
            console.error("Failed to load product for editing", error);
            setErrors({ general: "Gagal memuat data produk." });
        } finally {
            setIsLoading(false);
        }
    };

    const conditions = [
        'Baru',
        'Bekas - Seperti Baru',
        'Bekas - Layak Pakai',
        'Bekas - Butuh Perbaikan',
    ];

    const statuses = [
        { value: 'active', label: 'Aktif / Tayang' },
        { value: 'archived', label: 'Archived / Takedown' },
        { value: 'sold', label: 'Terjual' },
    ];

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setData('image', file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const removeImage = () => {
        setData('image', null);
        // Revert to original initial product image if it existed
        if (initialProduct?.images && initialProduct.images.length > 0) {
            setPreviewUrl(initialProduct.images[0]);
        } else {
            setPreviewUrl(null);
        }
    };

    const [isDragging, setIsDragging] = useState(false);
    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                setData('image', file);
                setPreviewUrl(URL.createObjectURL(file));
            }
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            // Laravel mandates multipart/form-data to bypass standard patch limits by using POST + _method mapping
            const formData = new FormData();
            formData.append('_method', 'PATCH'); // SPOOF METHOD
            
            formData.append('name', data.nama_barang);
            formData.append('price', data.harga);
            formData.append('categoryId', data.category_id);
            formData.append('condition', data.kondisi);
            formData.append('description', data.deskripsi);
            formData.append('status', data.status);
            // Stock standard fallback since backend validation might look for it
            formData.append('stock', 1);
            formData.append('campusLocation', initialProduct?.campusLocation || 'Lokasi Kampus');

            if (data.image) {
                formData.append('image', data.image);
            }

            await api.post(`/products/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setFlash({ success: "Produk berhasil diperbarui!" });
            setTimeout(() => navigate('/seller/products'), 1500);
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                setErrors({ general: "Gagal menyimpan perubahan. Silakan coba lagi." });
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

    if (isLoading) {
        return (
            <SellerLayout>
                <div className="py-32 flex flex-col items-center justify-center text-slate-500">
                    <Loader2 className="w-10 h-10 animate-spin text-[#4A5D23] mb-4" />
                    <p className="font-medium">Memuat data produk...</p>
                </div>
            </SellerLayout>
        );
    }

    return (
        <SellerLayout>
        <div className="pb-12 max-w-[1000px] mx-auto">

            <div className="flex items-center gap-4 mb-6 lg:mb-8">
                <Link
                    to="/seller/products"
                    className="p-3 bg-white border border-slate-200/70 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Edit Produk</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Perbarui informasi dan tampilan barang jualanmu</p>
                </div>
            </div>

            {flash?.success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl px-5 py-4 mb-8 flex items-center gap-3 text-sm font-bold shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    {flash.success}
                </div>
            )}

            {errors.general && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-5 py-4 mb-8 flex items-center gap-3 text-sm font-bold">
                    {errors.general}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6 md:space-y-8">
                {/* PHOTO UPLOAD SECTION */}
                <div className="bg-white rounded-[1.25rem] p-6 md:p-8 shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-slate-200/70">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="w-10 h-10 rounded-full bg-[#4A5D23]/10 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-[#4A5D23]" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">Foto Sampul Produk</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Gambar utama yang dilihat pembeli di etalase</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                        <div 
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`w-full sm:w-48 aspect-square rounded-2xl overflow-hidden border-2 border-dashed bg-slate-50 flex-shrink-0 relative group transition-all ${isDragging ? 'border-[#4A5D23] bg-[#4A5D23]/5' : 'border-slate-200/70'}`}
                        >
                            {previewUrl ? (
                                <>
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    {data.image && (
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur rounded-xl text-slate-500 hover:text-rose-500 shadow-sm"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                    <ImageIcon className={`w-8 h-8 mb-2 opacity-30`} />
                                    <span className={`text-xs font-bold`}>Belum ada foto</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 w-full">
                            <label className="inline-flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto px-6 py-3 bg-slate-50 border border-slate-200/70 rounded-xl cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition-all text-sm font-bold text-slate-700 shadow-sm">
                                <Upload className="w-4 h-4 text-[#4A5D23]" />
                                <span>Ganti Foto Cover</span>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                            <InputError message={errors.image} />
                        </div>
                    </div>
                </div>

                {/* PRODUCT DETAILS SECTION */}
                <div className="bg-white rounded-[1.25rem] p-6 md:p-8 shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-slate-200/70">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#d4a373]/10 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-[#d4a373]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">Informasi Barang</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Detail dan deskripsi produk</p>
                            </div>
                        </div>

                        <div className="flex flex-shrink-0 items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="bg-transparent border-none text-sm font-bold text-slate-900 focus:ring-0 p-0 cursor-pointer outline-none"
                            >
                                {statuses.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Nama Produk</label>
                            <input
                                type="text"
                                value={data.nama_barang}
                                onChange={(e) => setData('nama_barang', e.target.value)}
                                className="w-full rounded-xl border border-slate-200/70 px-5 py-3.5 text-sm focus:ring-2 focus:ring-[#4A5D23]/20 focus:border-[#4A5D23] transition-all bg-slate-50 focus:bg-white text-slate-900 font-medium"
                                placeholder="Contoh: Meja Belajar IKEA"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                <span className="flex items-center gap-1.5"><Tag className="w-4 h-4 text-slate-400" /> Harga (Rp)</span>
                            </label>
                            <input
                                type="number"
                                value={data.harga}
                                onChange={(e) => setData('harga', e.target.value)}
                                className="w-full rounded-xl border border-slate-200/70 px-5 py-3.5 text-sm focus:ring-2 focus:ring-[#4A5D23]/20 focus:border-[#4A5D23] transition-all bg-slate-50 focus:bg-white text-slate-900 font-bold"
                                min="1000"
                                placeholder="0"
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
                                className="w-full rounded-xl border border-slate-200/70 px-5 py-3.5 text-sm focus:ring-2 focus:ring-[#4A5D23]/20 focus:border-[#4A5D23] transition-all bg-slate-50 focus:bg-white text-slate-900 font-medium"
                            >
                                <option value="" disabled>Pilih Kategori</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <InputError message={errors.categoryId} />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Kondisi Barang</label>
                            <select
                                value={data.kondisi}
                                onChange={(e) => setData('kondisi', e.target.value)}
                                className="w-full rounded-xl border border-slate-200/70 px-5 py-3.5 text-sm focus:ring-2 focus:ring-[#4A5D23]/20 focus:border-[#4A5D23] transition-all bg-slate-50 focus:bg-white text-slate-900 font-medium"
                            >
                                {conditions.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <InputError message={errors.condition} />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Deskripsi Lengkap</label>
                            <textarea
                                rows="6"
                                value={data.deskripsi}
                                onChange={(e) => setData('deskripsi', e.target.value)}
                                className="w-full rounded-xl border border-slate-200/70 px-5 py-4 text-sm focus:ring-2 focus:ring-[#4A5D23]/20 focus:border-[#4A5D23] transition-all bg-slate-50 focus:bg-white text-slate-900 resize-none font-medium leading-relaxed max-w-full"
                                placeholder="Jelaskan kondisi detail barang..."
                            />
                            <InputError message={errors.description} />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4">
                    <Link
                        to="/seller/products"
                        className="w-full sm:w-auto px-8 py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition-all text-center shadow-sm"
                    >
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full sm:w-auto px-10 py-3.5 bg-[#4A5D23] text-white font-bold rounded-xl hover:bg-[#3B4A1C] shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed text-sm transition-all flex items-center justify-center gap-2"
                    >
                        {processing ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            'Simpan Perubahan'
                        )}
                    </button>
                </div>
            </form>
        </div>
        </SellerLayout>
    );
}
