import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import LikeButton from '@/Components/LikeButton';
import { ShoppingBag, Search, Tag, MapPin, SearchX, CheckCircle, PackageSearch, X, Share2, Heart } from 'lucide-react';

export default function Index() {
    const [wishlists, setWishlists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [categories, setCategories] = useState(["Semua"]);
    const [activeCategory, setActiveCategory] = useState("Semua");
    
    useEffect(() => {
        setIsLoading(true);
        import('@/lib/axios').then(({ default: api }) => {
            api.get('/wishlists')
                .then(res => {
                    const data = res.data?.data || [];
                    const formatted = data.map(item => ({
                        id: item.id,
                        name: item.name,
                        category: item.category?.name || "Lainnya",
                        price: item.price,
                        loc: item.campusLocation,
                        img: item.images?.length > 0 ? item.images[0] : null,
                        status: item.status
                    }));
                    setWishlists(formatted);
                    
                    // Extract unique categories
                    const uniqueCats = ["Semua", ...new Set(formatted.map(item => item.category))];
                    setCategories(uniqueCats);
                })
                .catch(err => console.error("Error fetching wishlists:", err))
                .finally(() => setIsLoading(false));
        });
        document.title = "Wishlist Saya | ReCircle";
    }, []);

    const filteredWishlists = activeCategory === "Semua" 
        ? wishlists 
        : wishlists.filter(item => item.category === activeCategory);

    useEffect(() => {
        document.title = "Wishlist Saya | ReCircle";
    }, []);

    return (
        <MainLayout>
            <div className="bg-gray-50/50 min-h-screen py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Header Section */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Wishlist Saya</h1>
                        <p className="text-gray-500 font-medium mt-1">Daftar produk favorit yang kamu simpan.</p>
                    </div>

                    {/* Filter Category Chips */}
                    {!isLoading && wishlists.length > 0 && categories.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide snap-x mb-6">
                            {categories.map((cat, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`snap-start whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold border transition-all shadow-sm ${
                                        activeCategory === cat 
                                            ? "bg-primary border-primary text-white" 
                                            : "bg-white border-gray-200 text-gray-600 hover:border-primary/50 hover:bg-gray-50"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Content Grid */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary mb-4"></div>
                            <p className="text-gray-400 font-medium">Memuat wishlist...</p>
                        </div>
                    ) : wishlists.length > 0 ? (
                        filteredWishlists.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredWishlists.map(product => (
                                    <div key={product.id} className="group relative bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300">
                                        
                                        {/* Image Area */}
                                        <div className="relative aspect-[4/3] w-full bg-gray-100 overflow-hidden">
                                            <Link to={`/products/${product.id}`} className="block w-full h-full">
                                                <img 
                                                    src={product.img || '/images/placeholder-product.png'} 
                                                    alt={product.name} 
                                                    loading="lazy"
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder-product.png'; }}
                                                />
                                            </Link>
                                            
                                            {/* Status Badge */}
                                            {product.status === 'sold' && (
                                                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                                    TERJUAL
                                                </div>
                                            )}

                                            <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                                                <button 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        import('@/lib/axios').then(({ default: api }) => {
                                                            api.post(`/wishlists/${product.id}/toggle`).then(() => {
                                                                setWishlists(wishlists.filter(w => w.id !== product.id));
                                                            });
                                                        });
                                                    }}
                                                    className="p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white text-gray-500 hover:text-red-500 transition-all shadow-sm"
                                                    title="Hapus dari Wishlist"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        navigator.clipboard.writeText(window.location.origin + `/products/${product.id}`);
                                                        alert('Tautan disalin ke clipboard!');
                                                    }}
                                                    className="p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white text-gray-500 hover:text-primary transition-all shadow-sm"
                                                    title="Bagikan"
                                                >
                                                    <Share2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Product Details */}
                                        <div className="p-5">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider line-clamp-1">{product.category}</span>
                                                <div className="flex items-center gap-1 text-green-600 text-xs font-bold">
                                                    <CheckCircle className="w-3.5 h-3.5" /> 
                                                    Tersedia
                                                </div>
                                            </div>
                                            
                                            <Link to={`/products/${product.id}`}>
                                                <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2 md:truncate mb-1">{product.name}</h3>
                                            </Link>

                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-3 mt-2">
                                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="truncate">{product.loc}</span>
                                            </div>

                                            <div className="flex items-center justify-between mt-4">
                                                <span className="font-black text-primary text-xl">Rp {product.price.toLocaleString('id-ID')}</span>
                                            </div>

                                            <div className="mt-5 grid grid-cols-1">
                                                <Link 
                                                    to={`/checkout/${product.id}`}
                                                    className="w-full py-3 px-4 bg-gray-900 border border-transparent rounded-xl flex items-center justify-center gap-2 text-white font-bold text-sm hover:bg-gray-800 transition-colors shadow-sm"
                                                >
                                                    <ShoppingBag className="w-4 h-4" /> Pesan
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-100 rounded-3xl shadow-sm text-center px-4">
                                <SearchX className="w-16 h-16 text-gray-300 mb-4" />
                                <h3 className="text-xl font-bold text-gray-900">Kategori Kosong</h3>
                                <p className="text-gray-500 mt-2 max-w-sm">Tidak ada barang yang kamu sukai dalam kategori '{activeCategory}'.</p>
                                <button onClick={() => setActiveCategory("Semua")} className="mt-6 font-bold text-primary hover:underline">Tampilkan Semua</button>
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-100 rounded-3xl shadow-sm text-center px-4">
                            <PackageSearch className="w-16 h-16 text-gray-300 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900">Wishlist Kamu Masih Kosong</h3>
                            <p className="text-gray-500 mt-2 max-w-sm">Jelajahi berbagai barang menarik dari mahasiswa dan temukan yang kamu suka.</p>
                            <Link to="/products" className="mt-8 px-6 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary-hover transition-colors inline-block shadow-sm">
                                Mulai Eksplorasi
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
