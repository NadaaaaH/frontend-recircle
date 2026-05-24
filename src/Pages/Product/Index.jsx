import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import MainLayout from "@/Layouts/MainLayout";
import {
    MapPin,
    ChevronDown,
    Filter,
    Sparkles,
    ArrowUpRight,
    Search,
    Check,
} from "lucide-react";
import api from "@/lib/axios";

export default function Index() {
    // Baca URL params (dari Navbar search atau kategori di Homepage)
    const [searchParams, setSearchParams] = useSearchParams();
    const urlSearch   = searchParams.get('search')   || '';
    const urlCategory = searchParams.get('category') || '';

    // --- STATE UTAMA ---
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filter state — diinisialisasi dari URL params
    const [searchQuery, setSearchQuery]       = useState(urlSearch);
    const [selectedCategory, setSelectedCategory] = useState(urlCategory || 'Semua');
    const [selectedUni, setSelectedUni]       = useState('');
    const [sortBy, setSortBy]                 = useState('newest');

    useEffect(() => {
        document.title = "Explore Harta Karun | ReCircle";
    }, []);

    // Fetch produk dari API setiap kali filter berubah
    useEffect(() => {
        setIsLoading(true);
        const params = {};
        if (searchQuery)                          params.search   = searchQuery;
        if (selectedCategory && selectedCategory !== 'Semua') params.category = selectedCategory;
        if (selectedUni)                          params.kampus   = selectedUni;
        if (sortBy === 'price_low')               params.sort     = 'price_asc';
        else if (sortBy === 'price_high')         params.sort     = 'price_desc';
        else                                      params.sort     = 'newest';

        api.get('/products', { params })
            .then(res => {
                const raw = res.data?.data;
                const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
                setProducts(list);
            })
            .catch(() => setProducts([]))
            .finally(() => setIsLoading(false));
    }, [searchQuery, selectedCategory, selectedUni, sortBy]);

    // Sinkronkan URL params saat filter berubah dari UI
    useEffect(() => {
        const params = {};
        if (searchQuery)                          params.search   = searchQuery;
        if (selectedCategory && selectedCategory !== 'Semua') params.category = selectedCategory;
        setSearchParams(params, { replace: true });
    }, [searchQuery, selectedCategory]);

    // Saat URL params berubah dari luar (misal klik kategori di Homepage)
    useEffect(() => {
        if (urlSearch)   setSearchQuery(urlSearch);
        if (urlCategory) setSelectedCategory(urlCategory);
    }, [urlSearch, urlCategory]);


    // --- STATE KHUSUS DROPDOWN KAMPUS ---
    const [universities, setUniversities] = useState([]);
    const [isUniOpen, setIsUniOpen] = useState(false); // Buka/Tutup Dropdown
    const [uniSearch, setUniSearch] = useState(""); // Text Search Kampus
    const uniDropdownRef = useRef(null); // Untuk deteksi klik di luar

    // --- FETCH API KAMPUS ---
    useEffect(() => {
        const fetchUnis = async () => {
            try {
                const response = await fetch(
                    "http://universities.hipolabs.com/search?country=Indonesia",
                );
                const data = await response.json();
                setUniversities(data.map((u) => u.name).sort());
            } catch (error) {
                // Default jika API error
                setUniversities([
                    "IPB University",
                    "Universitas Indonesia",
                    "ITB",
                    "UGM",
                    "Unpad",
                    "ITS",
                    "Undip",
                    "Unair",
                ]);
            }
        };
        fetchUnis();

        // Event Listener: Tutup dropdown jika klik di luar
        function handleClickOutside(event) {
            if (
                uniDropdownRef.current &&
                !uniDropdownRef.current.contains(event.target)
            ) {
                setIsUniOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- LOGIC FILTER KAMPUS ---
    // Filter list universitas berdasarkan ketikan user di dropdown
    const filteredUniversities = universities.filter((uni) =>
        uni.toLowerCase().includes(uniSearch.toLowerCase()),
    );

    // Filter sudah dilakukan di server via API — products langsung dipakai
    const filteredProducts = products;

    const categories = [
        "Semua",
        "Elektronik",
        "Furniture",
        "Fashion",
        "Buku",
        "Gadget",
        "Otomotif",
    ];

    return (
        <MainLayout>

            {/* --- HEADER --- */}
            <div className="pt-10 pb-6 bg-secondary">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl md:text-6xl font-black text-primary tracking-tighter mb-3">
                        Temukan{" "}
                        <span className="font-serif italic font-light text-gray-800">
                            Harta Karun.
                        </span>
                    </h1>
                    <p className="text-gray-500 font-medium max-w-lg leading-relaxed text-sm md:text-base">
                        Barang preloved berkualitas dari mahasiswa seluruh
                        Indonesia. Harga teman, kualitas sultan.
                    </p>
                </div>
            </div>

            {/* --- STICKY FILTER BAR --- */}
            <div className="sticky top-20 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100/50 shadow-sm transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        {/* LEFT: Filters */}
                        <div className="flex gap-3 w-full md:w-auto items-center">
                            {/* === CUSTOM SEARCHABLE UNI DROPDOWN === */}
                            <div
                                className="relative w-full md:w-[280px]"
                                ref={uniDropdownRef}
                            >
                                {/* Trigger Button */}
                                <button
                                    onClick={() => setIsUniOpen(!isUniOpen)}
                                    className={`w-full flex items-center justify-between pl-10 pr-4 py-2.5 border transition-all rounded-xl text-sm font-bold ${
                                        isUniOpen || selectedUni
                                            ? "bg-white border-primary ring-2 ring-primary/10 text-primary"
                                            : "bg-secondary border-transparent text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    <span className="truncate">
                                        {selectedUni || "Pilih Kampus..."}
                                    </span>
                                    <ChevronDown
                                        className={`w-4 h-4 transition-transform ${isUniOpen ? "rotate-180" : ""}`}
                                    />
                                </button>
                                <MapPin
                                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${selectedUni ? "text-primary" : "text-gray-400"}`}
                                />

                                {/* Dropdown Panel */}
                                {isUniOpen && (
                                    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                                        {/* Sticky Search Input inside Dropdown */}
                                        <div className="p-2 border-b border-gray-100 bg-gray-50 sticky top-0 z-10">
                                            <div className="relative">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    placeholder="Cari nama kampus..."
                                                    value={uniSearch}
                                                    onChange={(e) =>
                                                        setUniSearch(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-primary focus:border-primary"
                                                />
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                            </div>
                                        </div>

                                        {/* Scrollable List */}
                                        <div className="max-h-[250px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-gray-200">
                                            <button
                                                onClick={() => {
                                                    setSelectedUni("");
                                                    setIsUniOpen(false);
                                                }}
                                                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 mb-1"
                                            >
                                                Reset (Semua Kampus)
                                            </button>

                                            {filteredUniversities.length > 0 ? (
                                                filteredUniversities.map(
                                                    (uni, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => {
                                                                setSelectedUni(
                                                                    uni,
                                                                );
                                                                setIsUniOpen(
                                                                    false,
                                                                );
                                                                setUniSearch(
                                                                    "",
                                                                );
                                                            }}
                                                            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between group ${
                                                                selectedUni ===
                                                                uni
                                                                    ? "bg-primary/10 text-primary font-bold"
                                                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                                            }`}
                                                        >
                                                            <span className="truncate pr-2">
                                                                {uni}
                                                            </span>
                                                            {selectedUni ===
                                                                uni && (
                                                                <Check className="w-3.5 h-3.5 flex-shrink-0" />
                                                            )}
                                                        </button>
                                                    ),
                                                )
                                            ) : (
                                                <div className="px-4 py-3 text-center text-xs text-gray-400">
                                                    Kampus tidak ditemukan.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* === END CUSTOM DROPDOWN === */}

                            {/* Category Dropdown (Simple) */}
                            <div className="relative hidden md:block w-[180px]">
                                <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                                <select
                                    value={selectedCategory}
                                    onChange={(e) =>
                                        setSelectedCategory(e.target.value)
                                    }
                                    className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-200 hover:border-gray-300 focus:border-primary focus:ring-primary rounded-xl text-sm font-bold text-gray-700 cursor-pointer appearance-none transition-all"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                            </div>
                        </div>

                        {/* RIGHT: Sort Buttons */}
                        <div className="w-full md:w-auto">
                            <div className="flex p-1 bg-secondary rounded-xl w-full md:w-auto overflow-x-auto">
                                {[
                                    { label: "Terbaru", val: "newest" },
                                    { label: "Termurah", val: "price_low" },
                                    { label: "Termahal", val: "price_high" },
                                ].map((opt) => (
                                    <button
                                        key={opt.val}
                                        onClick={() => setSortBy(opt.val)}
                                        className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                            sortBy === opt.val
                                                ? "bg-white text-primary shadow-sm"
                                                : "text-gray-500 hover:text-gray-700"
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Category Scroll (Visible only on mobile) */}
                    <div className="md:hidden mt-3 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
                        <div className="flex gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border ${
                                        selectedCategory === cat
                                            ? "bg-primary border-primary text-white"
                                            : "bg-white border-gray-200 text-gray-600"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- PRODUCT GRID --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-gray-900">
                            {filteredProducts.length}
                        </span>
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">
                            Barang
                        </span>
                        {searchQuery && (
                            <span className="ml-2 text-sm text-gray-500 font-medium hidden sm:inline">
                                hasil pencarian <span className="text-gray-900 font-bold">"{searchQuery}"</span>
                            </span>
                        )}
                    </div>
                    {(searchQuery || selectedUni || selectedCategory !== "Semua") && (
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedUni("");
                                setSelectedCategory("Semua");
                            }}
                            className="text-xs font-bold text-red-500 hover:underline bg-red-50 px-3 py-1 rounded-full"
                        >
                            Reset Filter
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary mb-4"></div>
                        <p className="text-sm text-gray-400 font-medium animate-pulse">Memuat produk...</p>
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                        {filteredProducts.map((product) => {
                            // Support both API resource fields & legacy dummy fields
                            const name      = product.nama_barang   || product.name;
                            const price     = product.harga          || product.price || 0;
                            const img       = product.gambar_url     || product.img || '';
                            const uni       = product.kampus_seller  || product.location_uni || '';
                            const seller    = product.seller_name    || '';
                            const avatar    = product.seller_avatar  || '';
                            const postedAt  = product.posted_at      || '';
                            return (
                            <Link
                                to={`/products/${product.id}`}
                                key={product.id}
                                className="group block"
                            >
                                {/* IMAGE */}
                                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3 border border-gray-100 shadow-sm transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-gray-200/50 group-hover:-translate-y-2">
                                    {img ? (
                                        <img src={img} alt={name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center"><Sparkles className="w-8 h-8 text-gray-300" /></div>
                                    )}
                                    {uni && (
                                        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm border border-white/50">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                                            <span className="text-[10px] font-bold text-gray-800 uppercase tracking-wide truncate max-w-[120px]">{uni}</span>
                                        </div>
                                    )}
                                </div>
                                {/* INFO */}
                                <div className="px-1">
                                    <div className="flex items-end justify-between mb-1.5">
                                        <span className="text-lg font-black text-primary leading-none">Rp {price.toLocaleString('id-ID')}</span>
                                        {price < 500000 && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">Best Deal</span>}
                                    </div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-gray-900 text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors pr-2">{name}</h3>
                                        <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0" />
                                    </div>
                                    {seller && (
                                        <div className="flex items-center gap-2 border-t border-dashed border-gray-100 pt-2">
                                            {avatar ? (
                                                <img src={avatar} alt="Avatar" className="w-5 h-5 rounded-full bg-gray-200 object-cover" />
                                            ) : (
                                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">{seller.charAt(0)}</div>
                                            )}
                                            <span className="text-xs text-gray-500 font-medium truncate flex-1">{seller}</span>
                                            {postedAt && <span className="text-[10px] text-gray-400">{postedAt}</span>}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-gray-100 rounded-[3rem] bg-gray-50/50">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                            <Sparkles className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">
                            Yah, kosong nih.
                        </h3>
                        <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">
                            Barang yang kamu cari belum ada. Coba ganti filter.
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedUni("");
                                setSelectedCategory("Semua");
                            }}
                            className="px-6 py-3 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary-hover shadow-lg"
                        >
                            Reset Filter
                        </button>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
