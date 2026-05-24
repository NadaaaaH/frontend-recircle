import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/Layouts/MainLayout";
import LikeButton from "@/Components/LikeButton";
import {
    ArrowRight,
    Search,
    Globe,
    ShieldCheck,
    RefreshCw,
    Zap,
    TrendingUp,
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

        // Fetch categories & recommended products from Home API index
        axios.get('/')
            .then(res => {
                setCategories(res.data.data.categories || []);
                setRecommendations(res.data.data.trending_products || []);
            })
            .catch(() => {});
    }, []);

    return (
        <MainLayout>
            {/* --- HERO SECTION: Clean Editorial Style --- */}
            <section className="relative pt-8 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                    {/* Left: Typography & Action */}
                    <div className="lg:col-span-7 relative z-10">
                        {/* Minimalist Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-600 text-xs font-semibold tracking-wide uppercase mb-8 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            Marketplace Mahasiswa Terpercaya
                        </div>

                        {/* Heading: Mixed Typography (Sans + Serif) */}
                        <h1 className="text-[3.5rem] leading-[1] md:text-8xl font-black text-primary tracking-tighter mb-6">
                            {" "}
                            Dompet{" "}
                            <span className="font-serif italic font-thin text-gray-800 ml-2">
                                {" "}
                                Aman.{" "}
                            </span>{" "}
                            <br /> Kamar{" "}
                            <span className="font-serif italic font-thin text-gray-800 ml-4">
                                {" "}
                                Nyaman.{" "}
                            </span>{" "}
                        </h1>

                        <p className="text-lg text-gray-500 mb-10 max-w-lg leading-relaxed font-medium">
                            Platform jual beli eksklusif untuk mahasiswa di
                            seluruh Indonesia. Transaksi aman, harga terjangkau,
                            dan mendukung gaya hidup berkelanjutan.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                to="/explore"
                                className="group relative px-8 py-4 bg-primary text-white rounded-full font-bold overflow-hidden transition-all hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 text-center"
                            >
                                <span className="relative flex items-center justify-center gap-3">
                                    Mulai Eksplorasi{" "}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Link>
                            <Link
                                to={
                                    auth?.user
                                        ? auth.user.is_seller
                                            ? "/jual"
                                            : "/seller/verification"
                                        : "/login"
                                }
                                className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-full font-bold hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                            >
                                Jual Barang Bekas
                            </Link>
                        </div>

                        {/* Trust Indicators */}
                        <div className="mt-12 flex items-center gap-8 text-gray-400 text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-primary" />{" "}
                                Verified Students
                            </div>
                            <div className="flex items-center gap-2">
                                <RefreshCw className="w-4 h-4 text-primary" />{" "}
                                Sustainable
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-primary" />{" "}
                                Seluruh Indonesia
                            </div>
                        </div>
                    </div>

                    {/* Right: Visual Composition (Masonry/Collage) */}
                    <div className="lg:col-span-5 relative hidden lg:block">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary rounded-full blur-3xl -z-10"></div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4 translate-y-8">
                                <div className="aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl shadow-gray-200 border border-white">
                                    <img
                                        src="https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=600&auto=format&fit=crop"
                                        className="object-cover w-full h-full hover:scale-110 transition-transform duration-700"
                                        alt="Study Desk"
                                    />
                                </div>
                                <div className="p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-bold text-gray-400 uppercase">
                                            Featured
                                        </span>
                                        <TrendingUp className="w-4 h-4 text-primary" />
                                    </div>
                                    <p className="font-bold text-gray-800">
                                        Meja Belajar Aesthetic
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-primary text-white rounded-2xl shadow-lg flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold">
                                            12k+
                                        </p>
                                        <p className="text-xs opacity-80">
                                            Transaksi Sukses
                                        </p>
                                    </div>
                                    <ShieldCheck className="w-8 h-8 opacity-50" />
                                </div>
                                <div className="aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl shadow-gray-200 border border-white">
                                    <img
                                        src="https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=600&auto=format&fit=crop"
                                        className="object-cover w-full h-full hover:scale-110 transition-transform duration-700"
                                        alt="Fashion"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- INFINITE TICKER --- */}
            <div className="bg-primary text-white py-4 overflow-hidden border-y border-primary-light/20">
                <div className="flex gap-12 items-center animate-marquee whitespace-nowrap text-sm font-bold tracking-[0.2em] uppercase opacity-90">
                    <span>Transaksi Aman</span>
                    <span className="w-1 h-1 bg-white rounded-full opacity-50"></span>
                    <span>Verifikasi Mahasiswa</span>
                    <span className="w-1 h-1 bg-white rounded-full opacity-50"></span>
                    <span>COD Kampus & Kirim Paket</span>
                    <span className="w-1 h-1 bg-white rounded-full opacity-50"></span>
                    <span>Hemat Budget</span>
                    <span className="w-1 h-1 bg-white rounded-full opacity-50"></span>
                    <span>Sustainable Living</span>
                    <span className="w-1 h-1 bg-white rounded-full opacity-50"></span>
                    <span>Transaksi Aman</span>
                    <span className="w-1 h-1 bg-white rounded-full opacity-50"></span>
                    <span>Verifikasi Mahasiswa</span>
                </div>
            </div>

            {/* --- CATEGORIES --- */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-10">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                        Kategori{" "}
                        <span className="font-serif italic text-primary">
                            Pilihan
                        </span>
                    </h2>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x">
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            to={`/explore?category=${cat.slug}`}
                            className="snap-start flex-shrink-0 group"
                        >
                            <div className="flex flex-col justify-between p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-gray-200/50 hover:border-primary/20 transition-all min-w-[160px] h-[160px]">
                                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    <Search className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                                        {cat.name}
                                    </h3>
                                    <p className="text-xs text-gray-400 font-medium">
                                        {cat.count} items
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* --- REKOMENDASI MINGGU INI --- */}
            <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-24">
                <div className="flex justify-between items-center gap-4 mb-12">
                    <div className="flex space-x-2">
                        <div className="h-10 w-1 bg-primary rounded-full"></div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                            Rekomendasi <br className="md:hidden" />
                            <span className="font-serif italic text-gray-400 font-normal">
                                Minggu Ini
                            </span>
                        </h2>
                    </div>
                    <Link
                        to="/explore"
                        className="bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-primary-hover transition-all shadow-lg"
                    >
                        Eksplorasi Barang
                    </Link>
                </div>

                {recommendations.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                        {recommendations.map((product) => (
                            <Link
                                to={`/products/${product.id}`}
                                key={product.id}
                                className="group cursor-pointer block"
                            >
                                <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-gray-100 mb-4 shadow-sm group-hover:shadow-xl transition-all duration-300">
                                    <img
                                        src={
                                            product.img ||
                                            "/images/placeholder-product.png"
                                        }
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src =
                                                "/images/placeholder-product.png";
                                        }}
                                    />
                                    {product.tag && (
                                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm border border-gray-100">
                                            {product.tag}
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 z-10 transition-transform duration-300">
                                        <LikeButton productId={product.id} className="p-2" />
                                    </div>
                                    <div className="absolute bottom-4 right-4 bg-white rounded-full p-2 shadow-lg translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                        <ArrowRight className="w-5 h-5 text-gray-900" />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-primary transition-colors">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-gray-500 text-sm">
                                            {product.loc}
                                        </span>
                                        <span className="font-bold text-primary">
                                            {Number(
                                                product.price,
                                            ).toLocaleString("id-ID")}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-gray-400 text-lg">
                            Belum ada produk tersedia. Jadilah penjual pertama!
                        </p>
                    </div>
                )}
            </section>
        </MainLayout>
    );
}
