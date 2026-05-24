import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Extract order_id from URL query params (e.g., ?order_id=RC-12345)
    const orderId = searchParams.get('order_id');
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orderData, setOrderData] = useState(null);

    useEffect(() => {
        document.title = "Pembayaran Berhasil | ReCircle";
        
        if (!orderId) {
            setError("ID Pesanan tidak ditemukan pada URL.");
            setIsLoading(false);
            return;
        }

        const fetchOrderDetails = async () => {
            try {
                // Fetch dynamic real order details based on the URL parameter
                const response = await api.get('/orders/' + orderId);
                // Handle standard ApiResponse structural wrapper
                setOrderData(response.data?.data || response.data);
            } catch (err) {
                console.error("Failed to fetch order details", err);
                setError("Gagal memuat detail pesanan. " + (err.response?.data?.message || ""));
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    const formatRupiah = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatStatus = (status) => {
        if (!status) return 'Menunggu Konfirmasi';
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Subtle wavy abstract background using simple SVG patterns */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
                <svg viewBox="0 0 1440 320" className="absolute top-0 w-full" preserveAspectRatio="none">
                    <path fill="#e5e7eb" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
                </svg>
                <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full rotate-180" preserveAspectRatio="none">
                    <path fill="#f3f4f6" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,202.7C960,181,1056,139,1152,117.3C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-[2rem] p-8 md:p-10 max-w-sm w-full shadow-[0_15px_40px_rgba(0,0,0,0.06)] relative z-10 text-center border border-gray-100">
                
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-14 h-14 animate-spin text-[#4A5D23] mb-6" />
                        <p className="text-gray-500 font-medium tracking-wide">Memuat rincian pesanan...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <AlertCircle className="w-20 h-20 text-rose-500 mb-6" />
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Oops!</h2>
                        <p className="text-gray-500 mb-8 font-medium">{error}</p>
                        <button 
                            onClick={() => navigate('/')}
                            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                        >
                            Kembali ke Beranda
                        </button>
                    </div>
                ) : (
                    <div className="animate-in fade-in zoom-in duration-500">
                        {/* Massive Icon */}
                        <div className="flex justify-center mb-6">
                            <CheckCircle size={88} className="text-[#4A5D23]" strokeWidth={2} />
                        </div>
                        
                        {/* Heading */}
                        <h1 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">
                            Pembayaran Berhasil!
                        </h1>

                        {/* Clean Data Breakdown Wrapper */}
                        <div className="bg-[#FAFAFA] rounded-2xl p-5 mb-8 text-left space-y-4 border border-gray-100/80">
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">ID Pesanan</span>
                                <span className="text-sm font-semibold text-gray-800 font-mono tracking-wide">
                                    {orderData?.kode_pesanan || orderData?.id || orderId}
                                </span>
                            </div>
                            
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Pembayaran</span>
                                <span className="text-[22px] font-black text-[#4A5D23] tracking-tight">
                                    {formatRupiah(orderData?.total_harga || 0)}
                                </span>
                            </div>

                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</span>
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/50 px-3 py-1.5 rounded-lg w-fit border border-emerald-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    {formatStatus(orderData?.status)}
                                </span>
                            </div>
                        </div>

                        {/* Full Width CTA */}
                        <button 
                            onClick={() => navigate('/')}
                            className="w-full bg-[#4A5D23] text-white py-4 rounded-2xl font-bold text-[15px] hover:bg-[#3B4A1C] transition-all shadow-[0_4px_14px_0_rgba(74,93,35,0.39)] hover:shadow-[0_6px_20px_rgba(74,93,35,0.23)] active:scale-[0.98]"
                        >
                            Kembali ke Beranda
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
