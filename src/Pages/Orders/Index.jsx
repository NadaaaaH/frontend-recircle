import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/Layouts/MainLayout";
import { ShoppingBag, ArrowLeft, Package, CheckCircle2 } from "lucide-react";
import api from "@/lib/axios";

export default function BuyerOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [flash, setFlash] = useState({});

  const fetchOrders = () => {
    setIsLoading(true);
    api
      .get("/orders")
      .then((res) => {
        const raw = res.data?.data;
        const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
        setOrders(list);
      })
      .catch((err) => {
        console.error(err);
        setFlash({ error: "Gagal memuat data pesanan." });
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    document.title = "Pesanan Saya | ReCircle";
    fetchOrders();
  }, []);

  const formatPrice = (price) => "Rp " + Number(price).toLocaleString("id-ID");

  // Helper formatter for date if it's ISO string
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const statusColors = {
    pending: "bg-amber-100 text-amber-700",
    dibayar: "bg-blue-100 text-blue-700",
    dikirim: "bg-purple-100 text-purple-700",
    selesai: "bg-green-100 text-green-700",
    dibatalkan: "bg-red-100 text-red-700",
  };

  const statusLabels = {
    pending: "Menunggu Bayar",
    dibayar: "Dibayar",
    dikirim: "Dikirim",
    selesai: "Selesai",
    dibatalkan: "Dibatalkan",
  };

  const handleConfirm = (orderId) => {
    if (
      confirm("Konfirmasi barang sudah diterima? Dana akan dilepas ke penjual.")
    ) {
      api
        .post(`/orders/${orderId}/confirm`)
        .then(() => {
          setOrders((prev) =>
            prev.map((o) =>
              o.id === orderId ? { ...o, status: "selesai" } : o,
            ),
          );
          setFlash({
            success:
              "Pesanan berhasil diselesaikan. Dana diteruskan ke penjual.",
          });
          setTimeout(() => setFlash({}), 3000);
        })
        .catch((err) => {
          setFlash({
            error:
              err.response?.data?.message || "Gagal mengkonfirmasi pesanan.",
          });
          setTimeout(() => setFlash({}), 3000);
        });
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-secondary flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#118B50]/20 border-t-[#118B50]"></div>
            <p className="text-sm font-semibold text-[#118B50] animate-pulse">
              Memuat Pesanan...
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-secondary">
        <div className="max-w-4xl mx-auto px-4 py-8 pt-28">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Pesanan Saya
          </h1>

          {flash?.success && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
              {flash.success}
            </div>
          )}
          {flash?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
              {flash.error}
            </div>
          )}

          {flash?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
              {flash.error}
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p className="text-gray-500 font-medium">Memuat pesanan...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-10 text-center shadow-sm">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Belum ada pesanan</p>
              <Link
                to="/explore"
                className="inline-block mt-4 text-primary font-bold hover:underline"
              >
                Mulai Belanja
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const productName =
                  order.product?.name || "Produk Tidak Diketahui";
                const sellerName =
                  order.product?.seller?.name ||
                  order.product?.user?.name ||
                  "-";
                // In ProductResource, images is an array of urls.
                const productImg =
                  order.product?.images && order.product.images.length > 0
                    ? order.product.images[0]
                    : order.product?.imageUrl || null;

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl p-5 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      {productImg ? (
                        <img
                          src={productImg}
                          alt={productName}
                          className="w-16 h-16 rounded-xl object-cover bg-gray-100"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <Link
                            to={`/orders/${order.id}`}
                            className="hover:text-primary transition-colors block"
                          >
                            <p className="font-bold text-gray-900 text-lg">
                              {productName}
                            </p>
                            <p className="text-sm font-medium text-gray-500 mb-1">
                              {sellerName}
                            </p>
                            <p className="text-xs text-gray-400 font-medium">
                              {order.orderCode} &bull;{" "}
                              {formatDate(order.createdAt)}
                            </p>
                          </Link>
                          <span
                            className={`px-4 py-1.5 rounded-full text-xs font-bold ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}
                          >
                            {statusLabels[order.status] || order.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-primary">
                              {formatPrice(order.totalPrice)}
                            </span>
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">
                              {order.shippingMethod === "cod"
                                ? "COD"
                                : "Kirim Paket"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Link
                              to={`/orders/${order.id}`}
                              className="px-4 py-2 rounded-xl text-sm font-bold text-primary border border-primary/20 hover:bg-primary/5 transition-colors"
                            >
                              Lihat Detail
                            </Link>
                            {order.status === "dikirim" && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleConfirm(order.id);
                                }}
                                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-hover transition-colors shadow-sm shadow-primary/20"
                              >
                                <CheckCircle2 className="w-4 h-4" /> Terima
                                Barang
                              </button>
                            )}
                          </div>
                        </div>
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
