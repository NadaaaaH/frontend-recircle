import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/Layouts/MainLayout';
import { MessageSquare, Clock, CheckCircle, XCircle, ShoppingCart } from 'lucide-react';
import api from '@/lib/axios';

export default function BuyerOffers() {
    const [offers, setOffers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        document.title = "Penawaran Saya | ReCircle";
        api.get('/offers')
            .then((res) => {
                const raw = res.data?.data;
                const list = Array.isArray(raw) ? raw : [];
                setOffers(list);
            })
            .catch(() => {
                setOffers([]);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const formatPrice = (price) => 'Rp ' + Number(price).toLocaleString('id-ID');

    const statusConfig = {
        pending:   { icon: <Clock className="w-4 h-4" />,       bg: 'bg-amber-100 text-amber-700',  label: 'Menunggu' },
        accepted:  { icon: <CheckCircle className="w-4 h-4" />, bg: 'bg-green-100 text-green-700',  label: 'Diterima' },
        rejected:  { icon: <XCircle className="w-4 h-4" />,     bg: 'bg-red-100 text-red-700',      label: 'Ditolak' },
        cancelled: { icon: <XCircle className="w-4 h-4" />,     bg: 'bg-gray-100 text-gray-500',    label: 'Dibatalkan' },
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-secondary">
                    <div className="flex min-h-[60vh] items-center justify-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-600"></div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-secondary">
                <div className="max-w-4xl mx-auto px-4 py-8 pt-28">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Penawaran Saya</h1>

                    {offers.length === 0 ? (
                        <div className="bg-white rounded-[2rem] p-10 text-center shadow-sm">
                            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Belum ada penawaran</p>
                            <Link to="/products" className="inline-block mt-4 text-primary font-medium hover:underline">Jelajahi Produk</Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {offers.map((offer) => {
                                // OfferResource returns: id, offeredPrice, dealPrice, status, isExpired, createdAt, product: { id, name, price, image, sellerName }
                                const config = statusConfig[offer.status] ?? statusConfig.cancelled;
                                return (
                                    <div key={offer.id} className="bg-white rounded-2xl p-5 shadow-sm">
                                        <div className="flex items-start gap-4">
                                            <Link to={`/products/${offer.product?.id}`}>
                                                {offer.product?.image ? (
                                                    <img src={offer.product.image} alt={offer.product?.name} className="w-16 h-16 rounded-xl object-cover" />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center">
                                                        <ShoppingCart className="w-6 h-6 text-slate-300" />
                                                    </div>
                                                )}
                                            </Link>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <Link to={`/products/${offer.product?.id}`} className="font-semibold text-gray-900 hover:text-primary transition-colors">
                                                            {offer.product?.name}
                                                        </Link>
                                                        <p className="text-sm text-gray-500">{offer.product?.sellerName}</p>
                                                    </div>
                                                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg}`}>
                                                        {config.icon} {config.label}
                                                    </span>
                                                </div>
                                                 {offer.status === 'accepted' && (offer.negotiated_price || offer.dealPrice) ? (
                                                     <div className="flex items-center gap-4 mt-3">
                                                         <div>
                                                             <p className="text-xs text-gray-400">Harga asli</p>
                                                             <p className="text-sm text-gray-400 line-through">{formatPrice(offer.product?.price)}</p>
                                                         </div>
                                                         <div className="text-gray-300">→</div>
                                                         <div>
                                                             <p className="text-xs text-gray-400">Tawaranmu</p>
                                                             <p className="text-sm text-gray-400 line-through">{formatPrice(offer.offeredPrice)}</p>
                                                         </div>
                                                         <div className="text-gray-300">→</div>
                                                         <div>
                                                             <p className="text-xs text-green-600 font-bold">Harga Deal</p>
                                                             <p className="text-sm font-extrabold text-green-600 animate-pulse">{formatPrice(offer.negotiated_price || offer.dealPrice)}</p>
                                                         </div>
                                                         <span className="text-xs text-gray-400 ml-auto">{offer.createdAt}</span>
                                                     </div>
                                                 ) : (
                                                     <div className="flex items-center gap-4 mt-3">
                                                         <div>
                                                             <p className="text-xs text-gray-400">Harga asli</p>
                                                             <p className="text-sm text-gray-600">{formatPrice(offer.product?.price)}</p>
                                                         </div>
                                                         <div className="text-gray-300">→</div>
                                                         <div>
                                                             <p className="text-xs text-gray-400">Tawaranmu</p>
                                                             <p className="text-sm font-bold text-primary">{formatPrice(offer.offeredPrice)}</p>
                                                         </div>
                                                         {offer.dealPrice && (
                                                             <>
                                                                 <div className="text-gray-300">→</div>
                                                                 <div>
                                                                     <p className="text-xs text-gray-400">Deal</p>
                                                                     <p className="text-sm font-bold text-green-600">{formatPrice(offer.dealPrice)}</p>
                                                                 </div>
                                                             </>
                                                         )}
                                                         <span className="text-xs text-gray-400 ml-auto">{offer.createdAt}</span>
                                                     </div>
                                                 )}
                                                {/* CTA for accepted non-expired offers */}
                                                {offer.status === 'accepted' && !offer.isExpired && (
                                                    <Link
                                                        to={`/checkout/${offer.product?.id}?offer_id=${offer.id}`}
                                                        className="inline-flex items-center gap-2 mt-4 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors"
                                                    >
                                                        <ShoppingCart className="w-4 h-4" /> Checkout Sekarang
                                                    </Link>
                                                )}
                                                {offer.status === 'accepted' && offer.isExpired && (
                                                    <p className="text-xs text-red-500 mt-3">⏰ Deal sudah kedaluwarsa</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
