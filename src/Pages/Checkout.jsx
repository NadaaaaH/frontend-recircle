import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, Navigate, useSearchParams } from 'react-router-dom';
import MainLayout from '@/Layouts/MainLayout';
import { ShieldCheck, MapPin, Package, ArrowLeft, CheckCircle, CreditCard, Loader2, Box } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/axios';
import axios from 'axios';
import { useNotification } from "@/contexts/NotificationContext";

export default function Checkout() {
    const { showToast } = useNotification();
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const offer_id = searchParams.get('offer_id');
    const { user: currentUser } = useAuth();

    const [product, setProduct] = useState(null);
    const [offer, setOffer] = useState(null);
    const [finalPrice, setFinalPrice] = useState(0);
    const [midtransClientKey, setMidtransClientKey] = useState('');
    const [midtransSnapUrl, setMidtransSnapUrl] = useState('https://app.sandbox.midtrans.com/snap/snap.js');
    const [isLoading, setIsLoading] = useState(true);

    const [metodePengiriman, setMetodePengiriman] = useState('cod');
    
    // Alamat state
    const [alamat, setAlamat] = useState('');
    const [catatan, setCatatan] = useState('');
    
    // Komerce RajaOngkir V2 state
    const [searchKeyword, setSearchKeyword] = useState('');
    const [destinations, setDestinations] = useState([]);
    const [selectedDestinationId, setSelectedDestinationId] = useState('');
    const [selectedCourier, setSelectedCourier] = useState('');
    const [shippingCost, setShippingCost] = useState(0);
    const [courierServiceLabel, setCourierServiceLabel] = useState('');
    const [checkingCost, setCheckingCost] = useState(false);
    const [isSearchingDest, setIsSearchingDest] = useState(false);
    const [debouncedKeyword, setDebouncedKeyword] = useState('');
    const [lastSelectedName, setLastSelectedName] = useState('');
    const [selectedDestDetails, setSelectedDestDetails] = useState(null);

    // Form state
    const [firstName, setFirstName] = useState(currentUser?.name?.split(' ')[0] || '');
    const [lastName, setLastName] = useState(currentUser?.name?.split(' ').slice(1).join(' ') || '');
    const [email, setEmail] = useState(currentUser?.email || '');
    const [phone, setPhone] = useState(currentUser?.nomor_wa || '');

    const [processing, setProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    // Fetch Checkout Data
    useEffect(() => {
        if (!id) return;
        
        setIsLoading(true);
        api.get(`/checkout/${id}`, { params: { offer_id } })
            .then(res => {
                const data = res.data.data;
                setProduct(data.product);
                setOffer(data.offer);
                setFinalPrice(data.final_price);
                setMidtransClientKey(data.midtrans_client_key);
                if (data.midtrans_snap_url) {
                    setMidtransSnapUrl(data.midtrans_snap_url);
                }
            })
            .catch(err => {
                console.error("Failed to fetch checkout data", err);
                showToast("Gagal mengambil data checkout. Silakan coba lagi.", "error");
                navigate(-1);
            })
            .finally(() => setIsLoading(false));
    }, [id, offer_id, navigate]);

    // Load Midtrans Snap.js
    useEffect(() => {
        if (midtransClientKey && midtransSnapUrl) {
            const scriptId = 'midtrans-snap-script';
            if (!document.getElementById(scriptId)) {
                const script = document.createElement('script');
                script.id = scriptId;
                script.src = midtransSnapUrl;
                script.setAttribute('data-client-key', midtransClientKey);
                script.async = true;
                document.head.appendChild(script);
            }
        }
    }, [midtransClientKey, midtransSnapUrl]);

    // Hook Debounce (500ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedKeyword(searchKeyword);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchKeyword]);

    // Fetch Destination otomatis saat debouncedKeyword berubah
    useEffect(() => {
        if (debouncedKeyword.length < 3) {
            setDestinations([]);
            return;
        }
        if (debouncedKeyword === lastSelectedName) {
            return;
        }

        const fetchDestinations = async () => {
            setIsSearchingDest(true);
            try {
                // Use custom pre-configured api instance to handle dynamic base URLs (Ngrok/Prod) and Sanctum tokens
                const res = await api.get(`/logistics/destination?keyword=${debouncedKeyword}`);
                // Extract inner 'data' array from standard successResponse wrapper
                setDestinations(res.data?.data || []);
            } catch (error) {
                console.error("Failed to fetch destinations", error);
            } finally {
                setIsSearchingDest(false);
            }
        };
        fetchDestinations();
    }, [debouncedKeyword, lastSelectedName]);

    const handleSearchChange = (val) => {
        setSearchKeyword(val);
        if (selectedDestinationId && val !== lastSelectedName) {
            setSelectedDestinationId('');
            setSelectedDestDetails(null);
            setShippingCost(0);
        }
    };

    const handleSelectDestination = (dest) => {
        const destName = `${dest.district_name}, ${dest.city_name} ${dest.zip_code || ''}`;
        setSelectedDestinationId(dest.id);
        setSelectedDestDetails(dest);
        setSearchKeyword(destName);
        setLastSelectedName(destName);
        setDebouncedKeyword(''); 
        setDestinations([]);
        setShippingCost(0);
        if (selectedCourier) {
            checkShippingCost(dest.id, selectedCourier);
        }
    };

    const handleCourierChange = (e) => {
        const courier = e.target.value;
        setSelectedCourier(courier);
        
        if (selectedDestinationId && courier) {
             checkShippingCost(selectedDestinationId, courier);
        }
    };

    const checkShippingCost = async (destId, courier) => {
        if (!product) return;
        setCheckingCost(true);
        try {
            // Use the backend injected default or actual seller_area_id from API
            const originId = product.seller_area_id && /^\d+$/.test(product.seller_area_id.toString()) 
                ? product.seller_area_id 
                : '34260'; // Default Safe Fallback
 
            const res = await api.post('/logistics/calculate', {
                product_id: product.id,
                origin: originId,
                destination: destId,
                courier: courier,
                weight: 1000 
            });

            // Handle successful pricing data
            const data = res.data?.data || res.data || [];
            const availableServices = data.filter(c => c.code?.toLowerCase() === courier.toLowerCase());
            
            if (availableServices && availableServices.length > 0) {
                const service = availableServices[0];
                setShippingCost(service.cost || 0);
                setCourierServiceLabel(`${service.name} - ${service.service}`);
            } else if (data.length > 0) {
                const service = data[0];
                setShippingCost(service.cost || 0); 
                setCourierServiceLabel(`${service.name} - ${service.service}`);
            } else {
                setShippingCost(0);
                showToast("Layanan kurir ini tidak tersedia untuk rute Anda.", "warning");
            }
        } catch (error) {
            console.error("Logistics Error:", error.response?.data);
            setShippingCost(0);
            showToast(`Gagal menghitung tarif: ${error.response?.data?.message || "Terjadi kesalahan network"}`, "error");
        } finally {
            setCheckingCost(false);
        }
    };

    const handleMetodeChange = (metode) => {
        setMetodePengiriman(metode);
        if (metode === 'cod') {
            setShippingCost(0);
        } else if (metode === 'kirim_paket' && selectedDestinationId && selectedCourier) {
            checkShippingCost(selectedDestinationId, selectedCourier);
        }
    };

    const grandTotal = Number(finalPrice) + Number(shippingCost);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (metodePengiriman === 'kirim_paket') {
            if (!alamat.trim() || !selectedDestinationId || !selectedCourier) {
                showToast("Mohon lengkapi seluruh data pengiriman.", "warning");
                return;
            }
            if (shippingCost === 0 && !checkingCost) {
                showToast("Ongkos kirim belum berhasil dihitung. Silakan pilih ulang kurir atau kota Anda.", "warning");
                return;
            }
        }

        setProcessing(true);

        try {
            const fullShippingAddress = (metodePengiriman === 'kirim_paket' && selectedDestDetails) 
                ? `${alamat}, ${selectedDestDetails.district_name}, ${selectedDestDetails.city_name}, ${selectedDestDetails.province_name} ${selectedDestDetails.zip_code || ''}`
                : alamat;

            const res = await api.post('/checkout', {
                product_id: product.id,
                offer_id: offer?.id || null,
                metode_pengiriman: metodePengiriman,
                alamat_pengiriman: fullShippingAddress,
                catatan: catatan,
                shipping_cost: shippingCost,
                courier_info: courierServiceLabel
            });

            if (res.data.status === 'success') {
                if (metodePengiriman === 'kirim_paket') {
                    const token = res.data.data.snap_token;
                    if (!token) {
                        console.error("Missing token inside res.data.data", res.data);
                        showToast("Token pembayaran (Snap Token) tidak ditemukan dari server. Silakan hubungi tim support.", "error");
                        return;
                    }
                    if (typeof window.snap === 'undefined') {
                        showToast("Sistem pembayaran (Midtrans Snap) belum termuat sempurna. Silakan refresh halaman dan coba kembali.", "warning");
                        return;
                    }
                    
                    window.snap.pay(token, {
                        onSuccess: () => {
                            setPaymentSuccess(true);
                            showToast("Pembayaran berhasil diselesaikan!", "success");
                            setTimeout(() => navigate('/orders'), 2500);
                        },
                        onPending: () => {
                            showToast("Pembayaran tertunda. Silakan selesaikan pembayaran Anda.", "info");
                            navigate('/orders');
                        },
                        onError: () => {
                            showToast('Pembayaran gagal. Silakan coba lagi.', 'error');
                        },
                        onClose: () => {
                            navigate('/orders');
                        },
                    });
                } else {
                    setPaymentSuccess(true);
                    showToast("Checkout berhasil dilakukan!", "success");
                    setTimeout(() => navigate('/orders'), 2500);
                }
            }
        } catch (error) {
            console.error('Checkout error:', error);
            showToast(error.response?.data?.message || 'Terjadi kesalahan saat memproses checkout.', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const formatPrice = (price) => 'Rp ' + Number(price || 0).toLocaleString('id-ID');

    useEffect(() => {
        if (paymentSuccess) {
            document.title = "Pembayaran Berhasil | ReCircle";
        } else {
            document.title = "Checkout | ReCircle";
        }
    }, [paymentSuccess]);

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (isLoading) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-[#43552c]" />
                        <p className="text-gray-500 font-medium animate-pulse">Menyiapkan data checkout...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (!product) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Produk Tidak Ditemukan</h2>
                        <p className="text-gray-500 mb-6">Maaf, data produk yang Anda cari tidak tersedia.</p>
                        <Link to="/products" className="text-[#43552c] font-bold hover:underline">Kembali Belanja</Link>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (paymentSuccess) {
        return (
            <MainLayout>
                <div className="min-h-screen flex items-center justify-center bg-[#f7f9f7]">
                    <div className="text-center bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm max-w-md w-full mx-4">
                        <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Pesanan Berhasil Dibuat!</h2>
                        <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">
                            Terima kasih atas pembelian Anda. Anda akan diarahkan ke halaman detail pesanan secara otomatis...
                        </p>
                        <Loader2 className="w-6 h-6 animate-spin text-[#43552c] mx-auto" />
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (!product) return null;


    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50 pt-28 pb-16">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-[#43552c] mb-8 transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-semibold">Kembali</span>
                    </button>
                    
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-10 tracking-tight">Checkout</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Form Area - 8 cols */}
                        <div className="lg:col-span-8 space-y-8">
                            
                            {/* Section 1: Contact Information */}
                            <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-4">
                                    <div className="w-8 h-8 rounded-full bg-[#43552c]/10 flex items-center justify-center text-[#43552c] font-semibold text-sm">1</div>
                                    <h2 className="text-xl font-bold text-gray-900">Informasi Kontak</h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Depan</label>
                                        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Budi" className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-gray-900 focus:border-[#43552c] focus:ring-[#43552c] text-sm transition-colors bg-gray-50 focus:bg-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Belakang</label>
                                        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Santoso" className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-gray-900 focus:border-[#43552c] focus:ring-[#43552c] text-sm transition-colors bg-gray-50 focus:bg-white" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="budi@student.com" className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-gray-900 focus:border-[#43552c] focus:ring-[#43552c] text-sm transition-colors bg-gray-50 focus:bg-white" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Telepon / WhatsApp</label>
                                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08123456789" className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-gray-900 focus:border-[#43552c] focus:ring-[#43552c] text-sm transition-colors bg-gray-50 focus:bg-white" />
                                    </div>
                                </div>
                            </section>

                            {/* Section 2: Delivery Method */}
                            <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-4">
                                    <div className="w-8 h-8 rounded-full bg-[#43552c]/10 flex items-center justify-center text-[#43552c] font-semibold text-sm">2</div>
                                    <h2 className="text-xl font-bold text-gray-900">Metode Pengiriman</h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <label className={`relative flex flex-col cursor-pointer rounded-2xl border-2 p-6 transition-all duration-200 hover:shadow-md ${metodePengiriman === 'cod' ? 'border-[#43552c] bg-[#43552c]/[0.10]' : 'border-gray-200 bg-white hover:border-gray-300'}`} onClick={() => handleMetodeChange('cod')}>
                                        <input type="radio" name="metode" value="cod" className="sr-only" readOnly checked={metodePengiriman === 'cod'} />
                                        <div className={`p-3 rounded-full w-fit mb-4 ${metodePengiriman === 'cod' ? 'bg-[#43552c] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <p className={`text-lg font-bold mb-1 tracking-tight ${metodePengiriman === 'cod' ? 'text-[#43552c]' : 'text-gray-900'}`}>Ketemuan (COD)</p>
                                        <p className="text-sm text-gray-500">Area Sekitar: {product.loc || "Kampus"}</p>
                                    </label>

                                    <label className={`relative flex flex-col cursor-pointer rounded-2xl border-2 p-6 transition-all duration-200 hover:shadow-md ${metodePengiriman === 'kirim_paket' ? 'border-[#43552c] bg-[#43552c]/[0.10]' : 'border-gray-200 bg-white hover:border-gray-300'}`} onClick={() => handleMetodeChange('kirim_paket')}>
                                        <input type="radio" name="metode" value="kirim_paket" className="sr-only" readOnly checked={metodePengiriman === 'kirim_paket'} />
                                        <div className={`p-3 rounded-full w-fit mb-4 ${metodePengiriman === 'kirim_paket' ? 'bg-[#43552c] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                            <Package className="w-6 h-6" />
                                        </div>
                                        <p className={`text-lg font-bold mb-1 tracking-tight ${metodePengiriman === 'kirim_paket' ? 'text-[#43552c]' : 'text-gray-900'}`}>Kirim Paket</p>
                                        <p className="text-sm text-gray-500">Bayar online via Midtrans</p>
                                    </label>
                                </div>
                            </section>

                            {/* Section 3: Delivery Address */}
                            {metodePengiriman === 'kirim_paket' && (
                                <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-4">
                                        <div className="w-8 h-8 rounded-full bg-[#43552c]/10 flex items-center justify-center text-[#43552c] font-semibold text-sm">3</div>
                                        <h2 className="text-xl font-bold text-gray-900">Alamat Pengiriman</h2>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                                        <div className="sm:col-span-2 relative">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Cari Area Tujuan Pengiriman</label>
                                            <input
                                                type="text"
                                                value={searchKeyword}
                                                onChange={(e) => handleSearchChange(e.target.value)}
                                                placeholder="Ketik Kelurahan / Kecamatan / Kota..."
                                                className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-gray-900 focus:border-[#43552c] focus:ring-[#43552c] text-sm font-medium bg-gray-50 focus:bg-white"
                                            />
                                            {isSearchingDest && (
                                                <div className="absolute right-4 top-10 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white border border-gray-100 shadow-sm">
                                                    <Loader2 className="w-4 h-4 animate-spin text-[#43552c]" />
                                                    <span className="text-xs text-gray-500 font-semibold tracking-wide">Mencari...</span>
                                                </div>
                                            )}
                                            
                                            {destinations.length > 0 && searchKeyword.length >= 3 && (
                                                <ul className={`absolute z-50 w-[calc(100vw-32px)] sm:w-full bg-white border border-gray-200 rounded-xl mt-1 shadow-2xl max-h-[300px] overflow-y-auto transition-opacity duration-200 left-0 ${isSearchingDest ? 'opacity-50' : 'opacity-100'}`}>
                                                    {destinations.map((dest, i) => {
                                                        return (
                                                            <li 
                                                                key={dest.id || i} 
                                                                className="px-4 py-3.5 hover:bg-[#43552c]/5 cursor-pointer text-sm border-b border-gray-50 last:border-0 flex flex-col gap-0.5 transition-colors"
                                                                onClick={() => handleSelectDestination(dest)}
                                                            >
                                                                <span className="font-bold text-gray-900 break-words">{dest.district_name}, {dest.city_name} {dest.zip_code && <span className="text-[#43552c] font-black">({dest.zip_code})</span>}</span>
                                                                <span className="text-gray-500 text-xs font-medium break-words leading-relaxed">
                                                                    {dest.province_name} - Kel. {dest.subdistrict_name}
                                                                </span>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            )}
                                        </div>
                                    </div>

                                    {/* Auto-filled details */}
                                    {selectedDestDetails && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-gray-50/50 p-5 rounded-2xl border border-gray-200/60 shadow-inner">
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Provinsi</label>
                                                <input readOnly value={selectedDestDetails.province_name || ''} className="w-full bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Kota / Kabupaten</label>
                                                <input readOnly value={selectedDestDetails.city_name || ''} className="w-full bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Kecamatan</label>
                                                <input readOnly value={selectedDestDetails.district_name || ''} className="w-full bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Kel. / Desa & Kode Pos</label>
                                                <div className="flex gap-2">
                                                    <input readOnly value={selectedDestDetails.subdistrict_name || ''} className="w-2/3 bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none" />
                                                    <input readOnly value={selectedDestDetails.zip_code || ''} className="w-1/3 bg-gray-100 cursor-not-allowed border border-gray-200 rounded-lg px-3 py-2 text-center text-[#43552c] text-sm font-black focus:outline-none" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Pilih Kurir</label>
                                        <select
                                            value={selectedCourier}
                                            onChange={handleCourierChange}
                                            disabled={!selectedDestinationId}
                                            className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-gray-900 focus:border-[#43552c] focus:ring-[#43552c] text-sm font-medium disabled:opacity-50 disabled:bg-gray-100 bg-gray-50 focus:bg-white"
                                        >
                                            <option value="" disabled>Pilih Layanan Pengiriman</option>
                                            <option value="jne">JNE - Jalur Nugraha Ekakurir</option>
                                            <option value="sicepat">SICEPAT - SiCepat Ekspres</option>
                                            <option value="jnt">J&T - J&T Express</option>
                                        </select>
                                        {checkingCost && (
                                            <p className="text-sm text-[#43552c] mt-2 flex items-center gap-1.5 font-medium animate-pulse">
                                                <Loader2 className="w-4 h-4 animate-spin" /> Menghitung ongkos kirim...
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="alamat" className="block text-sm font-semibold text-gray-700 mb-2">Alamat Lengkap (RT/RW, No Rumah)</label>
                                        <textarea
                                            id="alamat"
                                            value={alamat}
                                            onChange={(e) => setAlamat(e.target.value)}
                                            placeholder="Contoh: Jl. Sudirman No. 10, RT 01 RW 02..."
                                            rows={3}
                                            className="w-full rounded-xl border border-gray-200 px-4 py-4 text-gray-900 focus:border-[#43552c] sm:text-sm resize-none bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                </section>
                            )}
                            
                            {/* Add optional catatatan section always */}
                             <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                <label className="block text-xl font-bold text-gray-900 mb-4">Catatan Tambahan</label>
                                <textarea
                                    value={catatan}
                                    onChange={(e) => setCatatan(e.target.value)}
                                    placeholder="Tulis catatan untuk penjual (opsional)..."
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-gray-900 focus:border-[#43552c] focus:ring-[#43552c] text-sm bg-gray-50 resize-none"
                                    rows="2"
                                />
                            </section>
                        </div>

                        {/* Order Summary Area - 4 cols */}
                        <div className="lg:col-span-4">
                            <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] p-8 sticky top-32 border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-5">Ringkasan Belanja</h3>
                                
                                <div className="flex gap-4 mb-8">
                                    <div className="w-[84px] h-[84px] rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                                        <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex flex-col justify-center min-w-0">
                                        <p className="font-bold text-gray-900 leading-tight mb-1 truncate text-lg pr-2">{product.name}</p>
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-100 w-fit px-2.5 py-1 rounded-md mb-2">
                                            <Box className="w-3.5 h-3.5" />
                                            <span className="truncate max-w-[120px]">Oleh: {product.seller_name}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 py-6 border-y border-dashed border-gray-200 mb-8">
                                    <div className="flex items-center justify-between text-base">
                                        <span className="text-gray-500 font-medium">Subtotal Produk</span>
                                        <div className="text-right">
                                            {offer && (
                                                <span className="text-xs text-gray-400 line-through block font-medium">{formatPrice(product.price)}</span>
                                            )}
                                            <span className="font-semibold text-gray-900">{formatPrice(finalPrice)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-base transition-all duration-300">
                                        <span className="text-gray-500 font-medium whitespace-nowrap">Biaya Pengiriman</span>
                                        {metodePengiriman === 'cod' ? (
                                            <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded text-sm">Gratis</span>
                                        ) : (
                                            <div className="flex flex-col items-end">
                                                <span className="font-semibold text-gray-900">{shippingCost > 0 ? formatPrice(shippingCost) : '-'}</span>
                                                {courierServiceLabel && (
                                                    <span className="text-[11px] text-gray-400 mt-0.5 uppercase tracking-wider font-semibold">{courierServiceLabel}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col mb-8">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-base font-bold text-gray-900">Total Tagihan</span>
                                        <span className="text-3xl font-black text-[#43552c] tabular-nums tracking-tight">
                                            {formatPrice(grandTotal)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={processing || checkingCost || (metodePengiriman === 'kirim_paket' && (!alamat.trim() || shippingCost === 0))}
                                    className="w-full bg-[#43552c] text-white py-4.5 px-6 rounded-full font-bold text-lg hover:bg-[#364423] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-lg shadow-[#43552c]/20 min-h-[56px]"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Memproses...</span>
                                        </>
                                    ) : (
                                        metodePengiriman === 'kirim_paket' ? (
                                            <>
                                                <CreditCard className="w-5 h-5" />
                                                <span>Bayar Sekarang</span>
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck className="w-5 h-5" />
                                                <span>Konfirmasi COD</span>
                                            </>
                                        )
                                    )}
                                </button>
                                {metodePengiriman === 'kirim_paket' && (
                                    <div className="mt-6 flex items-start gap-3 bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                                        <div className="bg-[#43552c]/10 p-1.5 rounded-full flex-shrink-0 mt-0.5"><ShieldCheck className="w-4 h-4 text-[#43552c]" /></div>
                                        <p className="text-xs text-gray-500 font-medium leading-relaxed">Transaksi dilindungi payment gateway Midtrans.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
