import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/Layouts/MainLayout";
import api from "@/lib/axios";

// Helper Format Rupiah
const formatRupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

// Custom Checkbox on-theme
const ThemedCheckbox = ({ checked, onChange }) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    onClick={onChange}
    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 ${
      checked
        ? "bg-emerald-600 border-emerald-600"
        : "bg-white border-gray-300 hover:border-emerald-400"
    }`}
  >
    {checked && (
      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
        <path
          d="M2 6l3 3 5-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </button>
);

// Komponen Countdown Timer
const CountdownTimer = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState({
    label: "",
    isExpired: false,
    isUrgent: false,
  });

  useEffect(() => {
    if (!expiresAt) return;
    const calculateTimeLeft = () => {
      const difference = new Date(expiresAt) - new Date();
      if (difference <= 0)
        return { label: "Waktu Habis", isExpired: true, isUrgent: false };
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      return {
        label: `${hours}j ${minutes}m tersisa`,
        isExpired: false,
        isUrgent: hours < 3,
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  if (!expiresAt) return null;

  const colorClass = timeLeft.isExpired
    ? "text-red-500 bg-red-50"
    : timeLeft.isUrgent
      ? "text-amber-600 bg-amber-50"
      : "text-gray-500 bg-gray-50";

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}
    >
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {timeLeft.label}
    </span>
  );
};

export default function CartIndex() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [groupedCarts, setGroupedCarts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    document.title = "Keranjang Pembelian | ReCircle";
    fetchCarts();
  }, []);

  const fetchCarts = () => {
    setIsLoading(true);
    api
      .get("/carts")
      .then((res) => {
        const raw = res.data?.data;
        let list = [];
        if (Array.isArray(raw)) {
          list = raw;
        } else if (raw && typeof raw === "object") {
          list = Object.values(raw);
        }
        setGroupedCarts(list);
      })
      .catch((err) => {
        console.error("[Cart] Error:", err.response?.data || err.message);
        setGroupedCarts([]);
      })
      .finally(() => setIsLoading(false));
  };

  const getCurrentSelectedSellerId = () => {
    if (selectedItems.length === 0) return null;
    const firstItemId = selectedItems[0];
    for (const group of groupedCarts) {
      if (group.items.some((item) => item.id === firstItemId)) {
        return group.seller.id;
      }
    }
    return null;
  };

  const handleSelectItem = (cartItemId, sellerId) => {
    setSelectedItems((prev) => {
      const currentSellerId = getCurrentSelectedSellerId();
      if (prev.includes(cartItemId)) {
        return prev.filter((id) => id !== cartItemId);
      } else {
        if (currentSellerId && currentSellerId !== sellerId) {
          return [cartItemId];
        }
        return [...prev, cartItemId];
      }
    });
  };

  const handleSelectSellerAll = (arrayCartItemIds) => {
    const allSelected = arrayCartItemIds.every((id) =>
      selectedItems.includes(id),
    );
    if (allSelected) {
      setSelectedItems((prev) =>
        prev.filter((id) => !arrayCartItemIds.includes(id)),
      );
    } else {
      setSelectedItems(arrayCartItemIds);
    }
  };

  const { totalPrice, totalSaved } = useMemo(() => {
    let price = 0;
    let saved = 0;
    groupedCarts.forEach((group) => {
      group.items.forEach((item) => {
        if (selectedItems.includes(item.id)) {
          const originalPrice = item.product.price;
          const negotiatedPrice = item.offer
            ? item.offer.harga_deal
            : originalPrice;
          price += negotiatedPrice;
          saved += originalPrice - negotiatedPrice;
        }
      });
    });
    return { totalPrice: price, totalSaved: saved };
  }, [selectedItems, groupedCarts]);

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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Keranjang Pembelian
          </h1>

          {groupedCarts.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-10 text-center shadow-sm">
              <svg
                className="w-12 h-12 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="text-gray-500">Keranjangmu masih kosong.</p>
              <Link
                to="/products"
                className="inline-block mt-4 text-primary font-medium hover:underline"
              >
                Cari Barang Sekarang
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Daftar keranjang per penjual */}
              {groupedCarts.map((group) => {
                const sellerItemIds = group.items.map((i) => i.id);
                const isAllSellerItemsSelected =
                  sellerItemIds.length > 0 &&
                  sellerItemIds.every((id) => selectedItems.includes(id));

                return (
                  <div
                    key={group.seller.id}
                    className="bg-white rounded-2xl p-5 shadow-sm"
                  >
                    {/* Header Penjual */}
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {group.seller.name
                            ? group.seller.name.substring(0, 2).toUpperCase()
                            : "SE"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {group.seller.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {group.seller.universitas ||
                              "Lokasi tidak diketahui"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSelectSellerAll(sellerItemIds)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                          isAllSellerItemsSelected
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {isAllSellerItemsSelected
                          ? `Terpilih (${sellerItemIds.length})`
                          : `Pilih Semua (${sellerItemIds.length})`}
                      </button>
                    </div>

                    {/* Daftar Item */}
                    <div className="space-y-4">
                      {group.items.map((item) => {
                        const isSelected = selectedItems.includes(item.id);
                        const hasOffer =
                          item.offer !== null && item.offer !== undefined;

                        return (
                          <div key={item.id} className="flex items-start gap-4">
                            {/* Custom Checkbox */}
                            <div className="pt-0.5 flex-shrink-0">
                              <ThemedCheckbox
                                checked={isSelected}
                                onChange={() =>
                                  handleSelectItem(item.id, group.seller.id)
                                }
                              />
                            </div>

                            {/* Gambar Produk */}
                            {item.product?.image ? (
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                                <svg
                                  className="w-6 h-6 text-slate-300"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            )}

                            {/* Info Produk */}
                            <div className="flex-1 min-w-0">
                              {/* Nama + badge deal */}
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-semibold text-gray-900 text-sm line-clamp-2">
                                  {item.product?.name}
                                </p>
                                {hasOffer && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                                    <svg
                                      className="w-3 h-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2.5"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    Disetujui
                                  </span>
                                )}
                              </div>

                              {hasOffer ? (
                                <>
                                  {/* Harga asli → harga deal */}
                                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                    <span className="text-xs text-gray-400 line-through">
                                      {formatRupiah(item.product?.price)}
                                    </span>
                                    <span className="text-gray-300 text-xs">
                                      →
                                    </span>
                                    <span className="text-sm font-bold text-emerald-600">
                                      {formatRupiah(item.offer.harga_deal)}
                                    </span>
                                    {item.product?.price >
                                      item.offer.harga_deal && (
                                      <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                        Hemat{" "}
                                        {formatRupiah(
                                          item.product.price -
                                            item.offer.harga_deal,
                                        )}
                                      </span>
                                    )}
                                  </div>
                                  {/* Countdown */}
                                  <div className="mt-1.5">
                                    <CountdownTimer
                                      expiresAt={item.offer.expires_at}
                                    />
                                  </div>
                                </>
                              ) : (
                                <p className="mt-1.5 text-sm font-bold text-gray-900">
                                  {formatRupiah(item.product?.price)}
                                </p>
                              )}
                            </div>

                            {/* Hapus */}
                            <button
                              onClick={() =>
                                api
                                  .delete(`/carts/${item.id}`)
                                  .then(() => fetchCarts())
                              }
                              className="text-gray-300 hover:text-red-400 p-1 transition-colors flex-shrink-0 mt-0.5"
                              title="Hapus dari keranjang"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Summary Card — muncul saat ada item dipilih */}
              {selectedItems.length > 0 && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100 transition-all duration-300">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 mb-0.5">
                        {selectedItems.length} item dipilih
                      </p>
                      {totalSaved > 0 && (
                        <p className="text-xs text-gray-400 line-through">
                          {formatRupiah(totalPrice + totalSaved)}
                        </p>
                      )}
                      <p className="text-xl font-black text-gray-900">
                        {formatRupiah(totalPrice)}
                      </p>
                      {totalSaved > 0 && (
                        <p className="text-xs text-green-600 font-medium mt-0.5">
                          Hemat {formatRupiah(totalSaved)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        navigate("/checkout", { state: { selectedItems } })
                      }
                      className="flex-shrink-0 bg-[#40534C] hover:bg-[#2e3c36] text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
                    >
                      Bayar Sekarang
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
