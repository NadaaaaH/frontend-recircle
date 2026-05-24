import React, { useState } from "react";
import { X, TrendingDown, CheckCircle } from "lucide-react";
import axios from "@/lib/axios";

export default function NegoModal({ isOpen, onClose, product }) {
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
        product_id: product.id,
        offer_price: "",
        message: "", // Opsi pesan singkat
    });

    const [processing, setProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const setData = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const reset = () => {
        setFormData({
            product_id: product.id,
            offer_price: "",
            message: "",
        });
    };

    // Hitung persentase turun harga untuk visual feedback
    const originalPrice = product.price;
    const inputPrice = parseInt(formData.offer_price.toString().replace(/\D/g, "")) || 0;
    const discountPercent =
        inputPrice > 0
            ? Math.round(((originalPrice - inputPrice) / originalPrice) * 100)
            : 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);

        try {
            await axios.post('/offers', formData);
            setIsSuccess(true);
        } catch (err) {
            console.error('Submit offer error:', err);
            alert(err.response?.data?.message || 'Gagal mengirim tawaran.');
        } finally {
            setProcessing(false);
        }
    };

    const handlePriceChange = (e) => {
        // Format hanya angka
        const value = e.target.value.toString().replace(/\D/g, "");
        setData("offer_price", value);
    };

    if (isSuccess) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl scale-100 animate-pop-in">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">
                        Tawaran Terkirim!
                    </h3>
                    <p className="text-gray-500 mb-6 leading-relaxed">
                        Penjual akan meninjau tawaranmu. Cek statusnya secara
                        berkala di menu Riwayat Penawaran.
                    </p>
                    <button
                        onClick={() => {
                            setIsSuccess(false);
                            reset();
                            onClose();
                        }}
                        className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors"
                    >
                        Oke, Mengerti
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Card */}
            <div className="relative bg-white w-full sm:max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl transform transition-all animate-slide-up">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-black text-gray-900">
                            Ajukan Penawaran
                        </h3>
                        <p className="text-sm text-gray-400">
                            Barang: {product.name || product.nama_barang}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-secondary rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Price Input Display */}
                    <div className="relative">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                            Harga Tawaranmu
                        </label>
                        <div className="flex items-center border-b-2 border-gray-100 focus-within:border-primary transition-colors py-2">
                            <span className="text-2xl font-bold text-gray-400 mr-2">
                                Rp
                            </span>
                            <input
                                type="text"
                                value={
                                    formData.offer_price
                                        ? parseInt(
                                            formData.offer_price,
                                        ).toLocaleString("id-ID")
                                        : ""
                                }
                                onChange={handlePriceChange}
                                placeholder="0"
                                className="w-full text-4xl font-black text-gray-900 border-none focus:ring-0 p-0 placeholder-gray-200"
                                autoFocus
                            />
                        </div>
                        {/* Feedback Diskon */}
                        {discountPercent > 0 && discountPercent < 100 && (
                            <div className="absolute top-0 right-0 flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-lg text-xs font-bold">
                                <TrendingDown className="w-3 h-3" />
                                Turun {discountPercent}%
                            </div>
                        )}
                        {discountPercent < 0 && (
                            <div className="absolute top-0 right-0 text-red-500 text-xs font-bold bg-red-50 px-2 py-1 rounded-lg">
                                Lebih mahal dari harga asli?
                            </div>
                        )}
                    </div>

                    {/* Quick Buttons (Suggestion) */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {[5, 10, 15].map((percent) => {
                            const reducedPrice =
                                originalPrice - originalPrice * (percent / 100);
                            return (
                                <button
                                    key={percent}
                                    type="button"
                                    onClick={() =>
                                        setData(
                                            "offer_price",
                                            reducedPrice.toString(),
                                        )
                                    }
                                    className="flex-shrink-0 px-4 py-2 bg-secondary border border-transparent rounded-xl text-sm font-bold text-gray-600 hover:border-primary hover:text-primary transition-all"
                                >
                                    Turun {percent}%
                                </button>
                            );
                        })}
                    </div>

                    {/* Optional Message */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                            Pesan (Opsional)
                        </label>
                        <textarea
                            rows="2"
                            className="w-full bg-secondary border-none rounded-2xl p-4 text-sm text-gray-700 focus:ring-1 focus:ring-primary resize-none"
                            placeholder="Contoh: Boleh kurang dikit kak? Saya ambil hari ini."
                            value={formData.message}
                            onChange={(e) => setData("message", e.target.value)}
                        ></textarea>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={processing || !formData.offer_price}
                        className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-1 hover:bg-primary-hover disabled:opacity-50 disabled:hover:translate-y-0 transition-all flex justify-center items-center gap-2"
                    >
                        {processing ? "Mengirim..." : "Kirim Tawaran"}
                    </button>
                </form>
            </div>
        </div>
    );
}
