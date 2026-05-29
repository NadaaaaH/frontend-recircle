import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/Layouts/MainLayout";
import api from "@/lib/axios";
import {
  ArrowLeft,
  Package,
  CreditCard,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { useNotification } from "@/contexts/NotificationContext";

export default function Show() {
  const { showToast } = useNotification();
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isShipping, setIsShipping] = useState(false);
  const [midtransClientKey, setMidtransClientKey] = useState(
    import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "",
  );

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data.data);
    } catch (error) {
      console.error("Failed to fetch order details:", error);
      showToast("Gagal mengambil detail pesanan.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      const data = response.data?.data || response.data;
      setOrder(data);
      document.title = `Pesanan ${data.orderCode} | ReCircle`;
    } catch (error) {
      console.error("Gagal memuat detail pesanan:", error);
      showToast("Gagal memuat detail pesanan.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize Midtrans Snap Script
  useEffect(() => {
    const clientKey = midtransClientKey || order?.midtransClientKey;
    const snapUrl = order?.midtransSnapUrl || "https://app.sandbox.midtrans.com/snap/snap.js";

    if (order?.isPending && order?.snapToken && clientKey) {
      const scriptId = "midtrans-snap-script";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = snapUrl;
        script.setAttribute("data-client-key", clientKey);
        script.async = true;
        document.head.appendChild(script);
      }
    }
  }, [order, midtransClientKey]);

  const handlePayNow = () => {
    if (typeof window.snap === 'undefined') {
      showToast("Sistem pembayaran (Midtrans Snap) sedang memuat atau belum siap. Silakan tunggu 2-3 detik lalu klik kembali, atau refresh halaman jika masalah berlanjut.", "warning");
      return;
    }

    if (order?.snapToken) {
      setIsPaying(true);
      window.snap.pay(order.snapToken, {
        onSuccess: function (result) {
          setIsPaying(false);
          showToast("Pembayaran berhasil!", "success");
          fetchOrderDetails();
        },
        onPending: function (result) {
          setIsPaying(false);
          showToast("Pembayaran pending. Silakan selesaikan pembayaran Anda.", "info");
        },
        onError: function (result) {
          setIsPaying(false);
          showToast("Pembayaran gagal atau dibatalkan.", "error");
        },
        onClose: function () {
          setIsPaying(false);
        },
      });
    } else {
      showToast("Token transaksi tidak valid. Silakan hubungi admin.", "error");
    }
  };

  const handleCompleteOrder = async () => {
    setIsCompleting(true);
    try {
      await api.put(`/orders/${order.id}`, { status: 'completed' });
      showToast("Pesanan telah selesai dikonfirmasi!", "success");
      fetchOrderDetails();
    } catch (error) {
      console.error("Gagal menyelesaikan pesanan:", error);
      showToast(error.response?.data?.message || "Gagal mengonfirmasi pesanan selesai.", "error");
    } finally {
      setIsCompleting(false);
    }
  };

  const handleShipOrder = async () => {
    setIsShipping(true);
    try {
      await api.put(`/orders/${order.id}`, { status: 'shipped' });
      showToast("Pesanan berhasil diperbarui menjadi dikirim!", "success");
      fetchOrderDetails();
    } catch (error) {
      console.error("Gagal mengirim pesanan:", error);
      showToast(error.response?.data?.message || "Gagal memperbarui status pengiriman.", "error");
    } finally {
      setIsShipping(false);
    }
  };

  const formatPrice = (price) => "Rp " + Number(price).toLocaleString("id-ID");

  // Mappings for status aesthetics
  const statusConfig = {
    pending: {
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
      icon: <Clock className="w-5 h-5" />,
      label: "Menunggu Pembayaran",
    },
    dibayar: {
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: <CreditCard className="w-5 h-5" />,
      label: "Sudah Dibayar",
    },
    dikirim: {
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
      icon: <Truck className="w-5 h-5" />,
      label: "Sedang Dikirim",
    },
    selesai: {
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      icon: <CheckCircle2 className="w-5 h-5" />,
      label: "Selesai",
    },
    dibatalkan: {
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
      icon: <XCircle className="w-5 h-5" />,
      label: "Dibatalkan",
    },
  };

  useEffect(() => {
    if (order?.orderCode) {
      document.title = `Pesanan ${order.orderCode} | ReCircle`;
    } else {
      document.title = "Detail Pesanan | ReCircle";
    }
  }, [order?.orderCode]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#f7f9f7] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#43552c]" />
            <p className="text-gray-500 font-medium animate-pulse">
              Memuat detail pesanan...
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#f7f9f7] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Pesanan Tidak Ditemukan
            </h2>
            <Link
              to="/orders"
              className="text-primary font-bold hover:underline"
            >
              Kembali ke Daftar Pesanan
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const currentStatus = statusConfig[order.status] || statusConfig.pending;
  const product = order.product;

  const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
  const isBuyer = authUser?.id === order?.userId || authUser?.id === order?.user_id;
  const isSeller = authUser?.id === product?.seller?.id || authUser?.id === product?.userId || authUser?.id === product?.user_id;

  // Ordered steps logic
  const timelineSteps = [
    { key: "pending", label: "Pesanan Dibuat", done: true },
    {
      key: "dibayar",
      label: "Pembayaran Diterima",
      done: ["dibayar", "dikirim", "selesai"].includes(order.status),
    },
    {
      key: "dikirim",
      label: "Pesanan Dikirim",
      done: ["dikirim", "selesai"].includes(order.status),
    },
    {
      key: "selesai",
      label: "Pesanan Selesai",
      done: order.status === "selesai",
    },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#f7f9f7] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              to="/orders"
              className="p-3 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow text-gray-400 hover:text-[#43552c] border border-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                Detail Pesanan
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full border border-gray-200 flex items-center gap-1.5 ${currentStatus.bg} ${currentStatus.color} ${currentStatus.border}`}
                >
                  {currentStatus.icon}
                  {currentStatus.label}
                </span>
              </h1>
              <p className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-2">
                <span className="uppercase tracking-wider">
                  #{order.orderCode}
                </span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <Calendar className="w-4 h-4" />
                {new Date(order.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* MAIN CONTENT: Items & Delivery Info */}
            <div className="lg:col-span-8 space-y-6">
              {/* Product Card */}
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#43552c]" />
                  Barang yang Dibeli
                </h2>

                <div className="flex gap-6 items-start">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100 shadow-inner">
                    <img
                      src={
                        product?.images?.[0] ||
                        "https://placehold.co/400x400/eeeeee/999999?text=No+Image"
                      }
                      alt={product?.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/400x400/eeeeee/999999?text=No+Image";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {product?.name}
                    </h3>
                    <p className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-1.5">
                      Penjual:{" "}
                      <span className="text-gray-900">
                        {product?.seller?.name}
                      </span>
                      <span className="text-gray-300 mx-1">•</span>
                      {product?.seller?.kampus}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm font-medium text-gray-500">
                        1 x {formatPrice(order.totalPrice)}
                      </span>
                      <span className="text-lg font-black text-gray-900">
                        {formatPrice(order.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery & Notes Card */}
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#43552c]" />
                      Info Pengiriman
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium text-gray-400 mb-1">
                          Metode
                        </p>
                        <p className="text-sm font-bold text-gray-900 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 inline-flex">
                          {order.shippingMethod === "cod"
                            ? "Cash on Delivery (COD)"
                            : "Kirim Paket"}
                        </p>
                      </div>
                      {order.shippingMethod === "kirim_paket" && (
                        <div>
                          <p className="text-xs font-medium text-gray-400 mb-1">
                            Alamat Pengiriman
                          </p>
                          <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                            {order.shippingAddress ||
                              "Tidak ada alamat tercatat."}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-l-4 border-[#43552c] pl-3">
                      Metode Pembayaran
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#43552c]/10 flex items-center justify-center text-[#43552c]">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 hover:text-[#43552c] transition-colors cursor-default">
                            {order.paymentMethod
                              ? order.paymentMethod
                                  .replace("_", " ")
                                  .toUpperCase()
                              : "Midtrans Payment"}
                          </p>
                          <p className="text-xs font-medium text-gray-500">
                            Otomatis & Aman
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Catatan */}
                    {order.notes && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-400 mb-2">
                          Catatan untuk Penjual
                        </p>
                        <p className="text-sm font-medium text-gray-700 italic border-l-2 border-gray-300 pl-3">
                          "{order.notes}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SIDEBAR: Order Summary & Timeline */}
            <div className="lg:col-span-4 space-y-6">
              {/* Payment Action Box */}
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                {/* Decorative accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#43552c]/5 rounded-bl-[100px] z-0 pointer-events-none"></div>

                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">
                    Ringkasan Pesanan
                  </h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                      <span>Subtotal (1 Barang)</span>
                      <span className="text-gray-900">
                        {formatPrice(order.totalPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                      <span>Ongkos Kirim</span>
                      <span className="text-gray-900">
                        {order.shippingMethod === "cod"
                          ? "Rp 0"
                          : "Gratis / Sesuai Aplikasi"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                      <span>Biaya Layanan</span>
                      <span className="text-gray-900">Rp 0</span>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold text-gray-900">
                        Total Belanja
                      </span>
                      <span className="text-2xl font-black text-[#43552c]">
                        {formatPrice(order.totalPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons based on status */}
                  {order.isPending &&
                    order.shippingMethod === "kirim_paket" && (
                      <button
                        onClick={handlePayNow}
                        disabled={isPaying || !order.snapToken}
                        className="w-full bg-[#43552c] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#43552c]/20 hover:-translate-y-0.5 hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isPaying ? "Memproses..." : "Bayar Sekarang"}
                      </button>
                    )}

                  {order.shippingMethod === "cod" && order.isPending && (
                    <div className="w-full bg-[#43552c]/10 text-[#43552c] border border-[#43552c]/20 font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-sm text-center px-4">
                      Menunggu COD. Hubungi penjual.
                    </div>
                  )}

                  {order.status === 'dibayar' && isSeller && (
                    <button
                      onClick={handleShipOrder}
                      disabled={isShipping}
                      className="w-full bg-[#43552c] hover:bg-[#324021] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#43552c]/20 hover:-translate-y-0.5 hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isShipping && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isShipping ? "Memproses..." : "Kirim Pesanan"}
                    </button>
                  )}

                  {order.status === 'dikirim' && isBuyer && (
                    <button
                      onClick={handleCompleteOrder}
                      disabled={isCompleting}
                      className="w-full bg-[#43552c] hover:bg-[#324021] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#43552c]/20 hover:-translate-y-0.5 hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isCompleting && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isCompleting ? "Memproses..." : "Pesanan Selesai"}
                    </button>
                  )}

                  <div className="mt-4 flex items-start gap-2 text-xs text-gray-400 font-medium">
                    <ShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <p>
                      Dana tertahan aman di sistem kami hingga kamu
                      mengonfirmasi barang telah diterima.
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline Card */}
              {order.status !== "dibatalkan" && (
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">
                    Status Perjalanan
                  </h3>
                  <div className="relative pl-3">
                    {/* Vertical Line Connector */}
                    <div className="absolute left-[19px] top-2 bottom-4 w-0.5 bg-gray-100"></div>

                    <div className="space-y-6">
                      {timelineSteps.map((step, index) => {
                        const isDone = step.done;
                        return (
                          <div
                            key={step.key}
                            className="relative flex items-start gap-4 z-10"
                          >
                            <div
                              className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 ${isDone ? "bg-[#43552c] ring-4 ring-[#43552c]/20" : "bg-gray-200"}`}
                            ></div>
                            <div>
                              <p
                                className={`text-sm font-bold ${isDone ? "text-gray-900" : "text-gray-400"}`}
                              >
                                {step.label}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
