import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/Layouts/MainLayout";
import LikeButton from "@/Components/LikeButton";
import {
    ArrowRight,
    Search,
    Book,
    BookOpen,
    Smartphone,
    Gamepad2,
    Bed,
    Shirt,
    Laptop,
    PenTool,
    Truck,
    LayoutGrid,
    ShieldCheck,
    RefreshCw,
    Globe,
    TrendingUp,
    MapPin,
} from "lucide-react";
import axios from "@/lib/axios";

export default function Home() {
    const [auth, setAuth] = useState({ user: null });
    const [categories, setCategories] = useState([]);
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        document.title = "ReCircle - Marketplace Mahasiswa Indonesia";

        // Fetch authenticated user
        axios.get('/user')
            .then(res => {
                setAuth({ user: res.data.data });
            })
            .catch(() => {
                setAuth({ user: null });
            });

        // Fetch categories & recommended products
        axios.get('/')
            .then(res => {
                setCategories(res.data.data.categories || []);
                setRecommendations(res.data.data.trending_products || []);
            })
            .catch(() => {});
    }, []);

    const getProductImageUrl = (path) => {
        if (!path) return "/images/placeholder-product.png";
        if (path.startsWith('http') || path.startsWith('data:')) return path;
        return `${import.meta.env.VITE_API_URL || ''}/storage/${path.replace(/^\/?(storage\/)?/, '')}`;
    };

    const categoriesList = [
        { name: "Buku & Modul", icon: BookOpen, link: "/explore?category=buku-modul" },
        { name: "Perlengkapan Kost", icon: Bed, link: "/explore?category=perlengkapan-kost" },
        { name: "Fashion", icon: Shirt, link: "/explore?category=fashion" },
        { name: "Elektronik", icon: Laptop, link: "/explore?category=elektronik" },
        { name: "Gadget", icon: Smartphone, link: "/explore?category=gadget" },
        { name: "Hobi", icon: Gamepad2, link: "/explore?category=hobi" },
        { name: "Semua Kategori", icon: LayoutGrid, link: "/explore" },
    ];

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* 1. HERO BANNER GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-12">
                    
                    {/* Left: One large main banner (span 2 on desktop) */}
                    <div className="lg:col-span-2 relative bg-gradient-to-br from-[#edf2e8] via-[#f7f9f6] to-[#e6ede1] rounded-2xl p-8 md:p-12 flex flex-col justify-between overflow-hidden border border-gray-100 min-h-[380px] group">
                        <div className="absolute right-0 bottom-0 w-80 h-80 bg-[#edf2e8] rounded-full blur-3xl opacity-60 group-hover:scale-110 transition-transform duration-700 -z-10"></div>
                        <div className="max-w-lg">
                            <span className="text-[#43552c] text-xs font-black tracking-widest uppercase mb-4 block">
                                Kampus Green Movement
                            </span>
                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight mb-4">
                                LEBIH HEMAT UNTUK ANAK KOS!
                            </h1>
                            <p className="text-sm md:text-base text-gray-600 font-medium mb-8 leading-relaxed">
                                Borong furniture, kasur, lemari, rice cooker, hingga gantungan baju bekas layak pakai dengan harga mahasiswa banget.
                            </p>
                        </div>
                        <div>
                            <Link 
                                to="/explore?category=perlengkapan-kost" 
                                className="inline-flex items-center gap-2 bg-[#43552c] text-white px-6 py-3.5 rounded-xl font-bold hover:bg-[#344222] hover:-translate-y-0.5 transition-all shadow-soft"
                            >
                                Mulai Belanja
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Right: Two smaller banners stacked vertically */}
                   

                </div>

                {/* 2. QUICK ACTION CATEGORY ICONS */}
                <div className="mb-16">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold tracking-tight text-gray-900 uppercase tracking-widest text-xs">
                            Eksplorasi Berdasarkan Kategori
                        </h2>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-4">
                        {categoriesList.map((cat, idx) => (
                            <Link 
                                key={idx} 
                                to={cat.link} 
                                className="flex flex-col items-center group text-center cursor-pointer"
                            >
                                <div className="w-14 h-14 rounded-full bg-[#edf2e8] hover:bg-[#43552c] flex items-center justify-center text-[#43552c] group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md mb-2">
                                    <cat.icon className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-extrabold text-gray-700 group-hover:text-[#43552c] transition-colors leading-tight">
                                    {cat.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* 3. PRODUCT FEED SECTION */}
                <div className="mb-20">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5 mb-10">
                        <div>
                            <span className="text-[#43552c] text-xs font-bold tracking-widest uppercase mb-1.5 block">
                                Pilihan Mahasiswa
                            </span>
                            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
                                Rekomendasi Preloved Kampus
                            </h2>
                        </div>
                        <div>
                            <Link
                                to="/explore"
                                className="inline-flex items-center gap-2 border border-gray-200 hover:border-[#43552c] text-gray-800 hover:text-[#43552c] font-bold px-5 py-3 rounded-xl transition-all text-sm shadow-sm"
                            >
                                Eksplorasi Semua
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {recommendations.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {recommendations.map((product) => {
                                const sellerName = product.seller?.name || (typeof product.seller === "string" ? product.seller : "Seller");
                                const sellerAvatar = product.seller?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(sellerName)}&background=43552c&color=ffffff`;

                                return (
                                    <Link
                                        to={`/products/${product.id}`}
                                        key={product.id}
                                        className="group cursor-pointer bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                                    >
                                        <div>
                                            {/* Image Section */}
                                            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3 border border-gray-100/50">
                                                <img
                                                    src={getProductImageUrl(product.img)}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "/images/placeholder-product.png";
                                                    }}
                                                />
                                                
                                                {/* Category Tag on Top-Right */}
                                                {product.category && (
                                                    <div className="absolute top-2.5 right-2.5 bg-white/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-medium text-slate-700 shadow-sm border border-gray-100/30">
                                                        {product.category}
                                                    </div>
                                                )}

                                                {/* Condition/Tag on Top-Left */}
                                                {product.tag && (
                                                    <div className="absolute top-2.5 left-2.5 bg-[#43552c]/90 backdrop-blur-sm px-2.5 py-0.5 rounded-lg text-[10px] font-semibold text-white uppercase tracking-wider shadow-sm">
                                                        {product.tag}
                                                    </div>
                                                )}
                                                
                                                {/* Like Button Wrapper */}
                                                <div className="absolute bottom-2.5 right-2.5 z-10 transition-transform duration-300">
                                                    <LikeButton productId={product.id} className="p-2 bg-white/90 backdrop-blur-sm shadow-sm rounded-full" />
                                                </div>
                                            </div>

                                            {/* University/Location */}
                                            <div className="flex items-center gap-1 text-[10px] text-gray-500 font-normal mb-1">
                                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                                <span className="truncate">{product.loc || "Kampus Terdekat"}</span>
                                            </div>

                                            {/* Product Title */}
                                            <h3 className="text-slate-800 text-sm font-medium leading-snug group-hover:text-[#43552c] transition-colors line-clamp-2 min-h-[40px] mb-2">
                                                {product.name}
                                            </h3>
                                        </div>

                                        <div>
                                            {/* Price */}
                                            <div className="text-base font-bold text-[#43552c]">
                                                Rp {Number(product.price).toLocaleString("id-ID")}
                                            </div>

                                            {/* Divider */}
                                            <div className="border-t border-gray-100/60 mt-3 pt-3"></div>

                                            {/* Seller Info */}
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-200/50">
                                                    <img
                                                        src={sellerAvatar}
                                                        alt={sellerName}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(sellerName)}&background=43552c&color=ffffff`;
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-[11px] font-medium text-gray-600 truncate">
                                                    {sellerName}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-slate-50/50 rounded-2xl border border-dashed border-gray-200 text-center py-16">
                            <p className="text-gray-400 text-sm font-semibold">
                                Belum ada produk rekomendasi tersedia saat ini.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </MainLayout>
    );
}
