import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                                <ShoppingBag className="w-4 h-4" />
                            </div>
                            <span className="text-lg font-bold text-primary">
                                Re
                                <span className="text-primary-light">
                                    Circle
                                </span>
                            </span>
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Marketplace mahasiswa untuk jual beli barang bekas
                            berkualitas. Hemat, aman, dan berkelanjutan.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-800 mb-4">
                            Layanan
                        </h3>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li>
                                <Link to="#" className="hover:text-primary">
                                    Cara Jual
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="hover:text-primary">
                                    Cara Beli
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="hover:text-primary">
                                    Verifikasi Mahasiswa
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-800 mb-4">
                            Dukungan
                        </h3>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li>
                                <Link to="#" className="hover:text-primary">
                                    Pusat Bantuan
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="hover:text-primary">
                                    Syarat & Ketentuan
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="hover:text-primary">
                                    Kebijakan Privasi
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-800 mb-4">
                            Hubungi Kami
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                            recircle@gmail.com
                        </p>
                        <p className="text-sm text-gray-500">
                            Bogor, Jawa Barat
                        </p>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-400">
                        © 2026 PrelovedKost. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
