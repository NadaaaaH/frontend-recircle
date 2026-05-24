import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import MainLayout from "@/Layouts/MainLayout";
import {
    MapPin,
    ShieldCheck,
    MessageCircle,
    Share2,
    AlertCircle,
    Check,
    ArrowLeft,
    Calendar,
    ShoppingBag,
    Tags,
    MessageSquare
} from "lucide-react";
import NegoModal from "@/Components/NegoModal";
import LikeButton from "@/Components/LikeButton";
import api from "@/lib/axios";

export default function Show() {
    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeImage, setActiveImage] = useState("");
    const [isNegoOpen, setIsNegoOpen] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        api.get(`/products/${id}`)
            .then((res) => {
                const data = res.data.data;
                const formattedProduct = {
                    id: data.id,
                    name: data.name,
                    category: data.category?.name || "Lainnya",
                    price: data.price,
                    original_price: null,
                    loc: data.campusLocation,
                    img: data.images?.length > 0 ? data.images[0] : 'https://placehold.co/800x600/eeeeee/999999?text=Image+Not+Found',
                    images: data.images || [],
                    desc: data.description,
                    condition: data.condition,
                    posted_at: new Date(data.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                    seller: {
                        id: data.seller?.id,
                        name: data.seller?.name || 'Unknown',
                        avatar: data.seller?.avatar_url || `https://ui-avatars.com/api/?name=${data.seller?.name || 'User'}`,
                        kampus: data.seller?.kampus || data.campusLocation,
                        is_verified: data.seller?.is_seller || false
                    }
                };
                setProduct(formattedProduct);
                setActiveImage(formattedProduct.img);
                document.title = `${formattedProduct.name} - ReCircle`;
            })
            .catch((err) => {
                console.error("Gagal mengambil data produk", err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [id]);

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary mb-4"></div>
                    <p className="text-gray-400 font-medium animate-pulse">Memuat detail produk...</p>
                </div>
            </MainLayout>
        );
    }

    if (!product) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                    <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Produk Tidak Ditemukan</h2>
                    <p className="text-gray-500 mb-6">Produk ini mungkin telah dihapus atau tidak tersedia.</p>
                    <Link to="/products" className="px-6 py-3 bg-primary text-white rounded-full font-bold">Kembali ke Eksplorasi</Link>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>

            {/* --- BREADCRUMB & BACK BUTTON --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
                <Link
                    to="/products"
                    className="inline-flex items-center text-gray-400 hover:text-primary transition-colors text-sm font-medium gap-1"
                >
                    <ArrowLeft className="w-4 h-4" /> Kembali
                </Link>
            </div>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* --- LEFT COLUMN: GALLERY (Editorial Grid) --- */}
                    <div className="lg:col-span-7 space-y-4">
                        {/* Main Image */}
                        <div className="aspect-[4/3] w-full rounded-[2rem] overflow-hidden bg-gray-100 border border-gray-100 shadow-sm relative group">
                            <img
                                src={activeImage || 'https://placehold.co/800x600/eeeeee/999999?text=Image+Not+Found'}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/800x600/eeeeee/999999?text=Image+Not+Found'; }}
                            />
                            {/* Floating Action (Desktop) */}
                            <div className="absolute top-4 right-4 z-10 transition-transform duration-300">
                                <LikeButton productId={product.id} className="p-3" />
                            </div>
                        </div>

                        {/* Thumbnails Grid (Only show if more than 1 image) */}
                        {product.images?.length > 1 && (
                            <div className="grid grid-cols-3 gap-4">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img)}
                                        className={`aspect-square rounded-[2rem] overflow-hidden border-2 transition-all shadow-sm ${activeImage === img ? "border-primary opacity-100" : "border-transparent opacity-70 hover:opacity-100"}`}
                                    >
                                        <img
                                            src={img || 'https://placehold.co/800x600/eeeeee/999999?text=Image+Not+Found'}
                                            alt={`${product.name} ${idx + 1}`}
                                            className="w-full h-full object-cover rounded-xl"
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/800x600/eeeeee/999999?text=Image+Not+Found'; }}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* --- RIGHT COLUMN: DETAILS & ACTION --- */}
                    <div className="lg:col-span-5 relative">
                        <div className="sticky top-28 space-y-8">
                            {/* Header Info */}
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1 bg-secondary text-primary text-xs font-bold uppercase tracking-wider rounded-full border border-primary/10">
                                        {product.category}
                                    </span>
                                    <span className="flex items-center gap-1 text-gray-400 text-xs font-medium">
                                        <MapPin className="w-3 h-3" />{" "}
                                        {product.loc}
                                    </span>
                                    <span className="flex items-center gap-1 text-gray-400 text-xs font-medium">
                                        <Calendar className="w-3 h-3" />{" "}
                                        {product.posted_at}
                                    </span>
                                </div>

                                <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-2 tracking-tight">
                                    {product.name}
                                </h1>

                                <div className="flex items-baseline gap-3 mt-4">
                                    <span className="text-3xl font-bold text-primary">
                                        Rp{" "}
                                        {product.price.toLocaleString("id-ID")}
                                    </span>
                                    {product.original_price && product.original_price > product.price && (
                                        <span className="text-lg text-gray-400 line-through font-medium">
                                            Rp{" "}
                                            {product.original_price.toLocaleString(
                                                "id-ID",
                                            )}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Seller Profile Card */}
                            <div className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <img
                                            src={product.seller.avatar}
                                            alt={product.seller.name}
                                            className="w-12 h-12 rounded-full object-cover border border-gray-100"
                                        />
                                        {product.seller.is_verified && (
                                            <div
                                                className="absolute -bottom-1 -right-1 bg-primary text-white p-0.5 rounded-full border-2 border-white"
                                                title="Verified Student"
                                            >
                                                <ShieldCheck className="w-3 h-3" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-sm">
                                            {product.seller.name}
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            {product.seller.kampus}
                                        </p>
                                    </div>
                                </div>
                                <Link 
                                    to={`/users/${product.seller.id}`}
                                    className="text-xs font-bold text-primary border border-primary/20 px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition-colors"
                                >
                                    Lihat Profil
                                </Link>
                            </div>

                            {/* Description */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-3 text-lg">
                                    Deskripsi{" "}
                                    <span className="font-serif italic text-primary font-light">
                                        Barang
                                    </span>
                                </h3>
                                <div className="prose prose-sm prose-gray text-gray-500 leading-relaxed">
                                    <p>{product.desc}</p>
                                </div>
                            </div>

                            {/* Condition & Safety Badge */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-secondary rounded-2xl border border-gray-100">
                                    <p className="text-xs text-gray-400 mb-1">
                                        Kondisi
                                    </p>
                                    <p className="font-bold text-gray-800 flex items-center gap-2">
                                        <Check className="w-4 h-4 text-primary" />{" "}
                                        {product.condition}
                                    </p>
                                </div>
                                <div className="p-4 bg-secondary rounded-2xl border border-gray-100">
                                    <p className="text-xs text-gray-400 mb-1">
                                        Keamanan
                                    </p>
                                    <p className="font-bold text-gray-800 flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-primary" />{" "}
                                        Verifikasi KTM
                                    </p>
                                </div>
                            </div>

                            {/* Safety Notice */}
                            <div className="flex gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 items-start">
                                <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Utamakan COD di area kampus atau tempat
                                    ramai. Jangan transfer uang sebelum melihat
                                    barang secara langsung.
                                </p>
                            </div>

                            {/* Desktop Actions */}
                            <div className="hidden lg:flex flex-col gap-3 pt-4">
                                <Link 
                                    to={`/checkout/${product.id}`}
                                    className="w-full bg-[#43552c] text-white font-bold py-4 rounded-full shadow-lg shadow-[#43552c]/20 hover:shadow-xl hover:-translate-y-1 hover:scale-[0.98] active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <ShoppingBag className="w-5 h-5" /> Beli Langsung
                                </Link>
                                <div className="grid grid-cols-2 gap-3 w-full">
                                    <button
                                        onClick={() => setIsNegoOpen(true)}
                                        className="w-full bg-[#d4a373] text-white font-bold py-3.5 rounded-full shadow-md shadow-[#d4a373]/20 hover:shadow-lg hover:-translate-y-0.5 hover:scale-[0.98] active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Tags className="w-5 h-5" /> Nego Harga
                                    </button>
                                    <Link 
                                        to={`/chat?user_id=${product.seller.id}&user_name=${encodeURIComponent(product.seller.name)}&product_id=${product.id}&product_name=${encodeURIComponent(product.name)}&product_price=${product.price}&product_img=${encodeURIComponent(product.images[0])}`}
                                        className="w-full bg-transparent border-2 border-[#43552c] text-[#43552c] font-bold py-3.5 rounded-full hover:bg-[#43552c]/5 hover:scale-[0.98] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <MessageSquare className="w-5 h-5" /> Chat Penjual
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- MOBILE STICKY BOTTOM BAR --- */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 z-40 safe-area-pb shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="flex flex-col gap-3 max-w-7xl mx-auto">
                    <Link 
                        to={`/checkout/${product.id}`}
                        className="w-full bg-[#43552c] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#43552c]/20 hover:scale-[0.98] active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        <ShoppingBag className="w-5 h-5" /> Beli Langsung
                    </Link>
                    <button 
                        onClick={() => setIsNegoOpen(true)}
                        className="w-full bg-[#d4a373] text-white font-bold py-3.5 rounded-xl shadow-md shadow-[#d4a373]/20 hover:scale-[0.98] active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        <Tags className="w-5 h-5" /> Nego Harga
                    </button>
                    <Link 
                        to={`/chat?user_id=${product.seller.id}&user_name=${encodeURIComponent(product.seller.name)}&product_id=${product.id}&product_name=${encodeURIComponent(product.name)}&product_price=${product.price}&product_img=${encodeURIComponent(product.images[0])}`}
                        className="w-full bg-transparent border-2 border-[#43552c] text-[#43552c] font-bold py-3.5 rounded-xl hover:bg-[#43552c]/5 hover:scale-[0.98] active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                    >
                        <MessageSquare className="w-5 h-5" /> Chat Penjual
                    </Link>
                </div>
            </div>
            <NegoModal
                isOpen={isNegoOpen}
                onClose={() => setIsNegoOpen(false)}
                product={product}
            />
        </MainLayout>
    );
}
