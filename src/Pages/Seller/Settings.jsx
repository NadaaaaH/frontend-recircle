import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import SellerLayout from "@/Layouts/SellerLayout";
import { Store, Save, CheckCircle, MapPin, Search, Loader2, X } from "lucide-react";
import api from "@/lib/axios";

export default function Settings() {
    const { user } = useAuth();
    const [data, setDataState] = useState({
        name:     '',
        kampus:   '',
        bio:      '',
        nomor_wa: '',
        komerceDestinationId: '',
        komerceDestinationLabel: ''
    });
    const setData = (key, value) => setDataState(prev => ({ ...prev, [key]: value }));
    
    const [isLoading, setIsLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [flash, setFlash] = useState({});

    // Autocomplete logistics states
    const [searchKeyword, setSearchKeyword] = useState('');
    const [debouncedKeyword, setDebouncedKeyword] = useState('');
    const [destinations, setDestinations] = useState([]);
    const [isSearchingDest, setIsSearchingDest] = useState(false);

    // Load current settings from API
    useEffect(() => {
        document.title = "Pengaturan Toko | ReCircle";
        api.get('/seller/settings')
            .then((res) => {
                const u = res.data?.data;
                if (u) {
                    setDataState({
                        name:     u.name     ?? user?.name ?? '',
                        kampus:   u.kampus   ?? '',
                        bio:      u.bio      ?? '',
                        nomor_wa: u.nomor_wa ?? '',
                        komerceDestinationId: u.komerceDestinationId ?? '',
                        komerceDestinationLabel: u.komerceDestinationLabel ?? ''
                    });
                    setSearchKeyword(u.komerceDestinationLabel ?? '');
                }
            })
            .catch(() => {
                // Fallback ke data dari AuthContext
                setDataState({
                    name:     user?.name     ?? '',
                    kampus:   user?.kampus   ?? '',
                    bio:      user?.bio      ?? '',
                    nomor_wa: user?.nomor_wa ?? '',
                    komerceDestinationId: '',
                    komerceDestinationLabel: ''
                });
            })
            .finally(() => setIsLoading(false));
    }, [user]);

    // Hook Debounce (500ms) for autocomplete
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedKeyword(searchKeyword);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchKeyword]);

    // Fetch destinations from debounced key
    useEffect(() => {
        // Avoid triggering search if it matches exactly our established label or short
        if (debouncedKeyword === data.komerceDestinationLabel) {
            setDestinations([]);
            return;
        }
        if (debouncedKeyword.length < 3) {
            setDestinations([]);
            return;
        }

        const fetchDest = async () => {
            setIsSearchingDest(true);
            try {
                const res = await api.get(`/logistics/destination?keyword=${debouncedKeyword}`);
                setDestinations(res.data?.data || []);
            } catch (err) {
                console.error("Failed to search destinations", err);
            } finally {
                setIsSearchingDest(false);
            }
        };
        fetchDest();
    }, [debouncedKeyword, data.komerceDestinationLabel]);

    const handleSelectDest = (dest) => {
        const label = `${dest.subdistrict_name}, ${dest.district_name}, ${dest.city_name} ${dest.zip_code}`;
        setDataState(p => ({
            ...p,
            komerceDestinationId: dest.id.toString(),
            komerceDestinationLabel: label
        }));
        setSearchKeyword(label);
        setDestinations([]);
    };

    const clearSelectedDest = () => {
        setDataState(p => ({
            ...p,
            komerceDestinationId: '',
            komerceDestinationLabel: ''
        }));
        setSearchKeyword('');
        setDestinations([]);
    };

    const submit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setFlash({});
        api.patch('/seller/settings', data)
            .then(() => {
                setFlash({ success: "Pengaturan berhasil disimpan." });
                setTimeout(() => setFlash({}), 3000);
            })
            .catch((err) => {
                const msg = err.response?.data?.message || 'Gagal menyimpan pengaturan.';
                setFlash({ error: msg });
                setTimeout(() => setFlash({}), 4000);
            })
            .finally(() => setProcessing(false));
    };

    if (isLoading) {
        return (
            <SellerLayout>
                <div className="flex min-h-[60vh] items-center justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-600"></div>
                </div>
            </SellerLayout>
        );
    }

    return (
        <SellerLayout>
        <div className="pb-12 max-w-[1000px] mx-auto">

            <div className="mb-6 lg:mb-8">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                    Pengaturan Toko
                </h1>
                <p className="text-slate-500 mt-1 text-sm font-medium">
                    Kelola informasi publik toko, kontak, dan lokasi pengiriman.
                </p>
            </div>

            {flash?.success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-5 py-4 mb-8 text-sm font-bold flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-5 py-4 mb-8 text-sm font-bold">
                    {flash.error}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6 md:space-y-8">
                {/* Card 1: Profil Publik */}
                <div className="bg-white rounded-[1.25rem] border border-slate-200/70 shadow-[0_2px_4px_rgba(0,0,0,0.02)] p-6 md:p-8">
                    <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-100">
                        <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center">
                            <Store className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Profil Publik</h2>
                            <p className="text-sm font-medium text-slate-500">Informasi ini akan dilihat oleh calon pembeli.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nama Toko / Penjual</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200/70 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#4A5D23]/20 focus:border-[#4A5D23] transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Lokasi Kampus</label>
                                <input
                                    type="text"
                                    value={data.kampus}
                                    onChange={(e) => setData("kampus", e.target.value)}
                                    placeholder="Contoh: IPB University"
                                    className="w-full bg-slate-50 border border-slate-200/70 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#4A5D23]/20 focus:border-[#4A5D23] transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nomor WhatsApp</label>
                            <input
                                type="tel"
                                value={data.nomor_wa}
                                onChange={(e) => setData("nomor_wa", e.target.value)}
                                placeholder="08xxxxxxxxxx"
                                className="w-full bg-slate-50 border border-slate-200/70 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#4A5D23]/20 focus:border-[#4A5D23] transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Deskripsi Bio</label>
                            <textarea
                                rows="3"
                                value={data.bio}
                                onChange={(e) => setData("bio", e.target.value)}
                                placeholder="Tuliskan sedikit tentang tokomu..."
                                className="w-full bg-slate-50 border border-slate-200/70 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#4A5D23]/20 focus:border-[#4A5D23] transition-all resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Card 2: Lokasi Pengiriman (New Logic for Accurate Ongkir) */}
                <div className="bg-white rounded-[1.25rem] border border-slate-200/70 shadow-[0_2px_4px_rgba(0,0,0,0.02)] p-6 md:p-8">
                    <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-100">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Lokasi Asal Pengiriman</h2>
                            <p className="text-sm font-medium text-slate-500">Digunakan untuk menghitung ongkos kirim pembeli secara akurat dari lokasi Anda.</p>
                        </div>
                    </div>

                    <div className="space-y-2 relative">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Kecamatan / Kota Asal</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                placeholder="Ketik nama kecamatan Anda (min. 3 huruf)..."
                                className="w-full bg-slate-50 border border-slate-200/70 rounded-xl pl-11 pr-10 py-3.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            />
                            {(searchKeyword && data.komerceDestinationId) && (
                                <button 
                                    type="button"
                                    onClick={clearSelectedDest}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Autocomplete Dropdown Results */}
                        {isSearchingDest && (
                            <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                                Mencari daerah...
                            </div>
                        )}

                        {!isSearchingDest && destinations.length > 0 && (
                            <ul className="absolute z-10 left-0 right-0 mt-1 max-h-60 overflow-auto bg-white border border-slate-200 rounded-xl shadow-xl divide-y divide-slate-50 border-emerald-100/50 ring-1 ring-black/5">
                                {destinations.map((dest) => (
                                    <li key={dest.id}>
                                        <button
                                            type="button"
                                            onClick={() => handleSelectDest(dest)}
                                            className="w-full text-left px-5 py-3 text-sm font-medium text-slate-700 hover:bg-emerald-50 transition-colors"
                                        >
                                            {dest.subdistrict_name}, {dest.district_name}, {dest.city_name}
                                            <span className="block text-xs text-slate-400 mt-0.5 font-normal">{dest.province_name} ({dest.zip_code})</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        
                        {/* Current status */}
                        {data.komerceDestinationId ? (
                            <div className="mt-2.5 flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50/50 w-fit px-3 py-1.5 rounded-lg border border-emerald-100">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Lokasi pengiriman tersimpan (ID: {data.komerceDestinationId})
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 italic mt-1.5 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> Belum ada lokasi dipilih, sistem akan menggunakan fallback default.
                            </p>
                        )}

                        {!data.komerceDestinationId && !isSearchingDest && debouncedKeyword.length >= 3 && destinations.length === 0 && debouncedKeyword !== data.komerceDestinationLabel && (
                            <p className="text-xs text-rose-500 font-semibold mt-1.5 pl-1">Daerah tidak ditemukan. Silakan ketik kata kunci lain.</p>
                        )}
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="flex items-center gap-2 bg-[#4A5D23] text-white px-8 py-3.5 rounded-xl text-sm font-bold hover:bg-[#3B4A1C] transition-all shadow-sm w-full sm:w-auto justify-center disabled:opacity-60"
                    >
                        {processing ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Simpan Perubahan
                    </button>
                </div>
            </form>
        </div>
        </SellerLayout>
    );
}
