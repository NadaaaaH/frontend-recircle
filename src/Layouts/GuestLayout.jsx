import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, ArrowLeft } from "lucide-react";

export default function GuestLayout({ children, title, subtitle, image }) {
    return (
        <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans text-gray-900">
            {/* --- LEFT SIDE: VISUAL (Desktop Only) --- */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden">
                <img
                    src={
                        image ||
                        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1600&auto=format&fit=crop"
                    }
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-multiply"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                <div className="relative z-10 p-16 flex flex-col justify-between h-full text-white">
                    <Link
                        to="/"
                        className="flex items-center gap-2 group w-fit"
                    >
                        <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-white border border-white/30 group-hover:bg-white group-hover:text-primary transition-all">
                            <ArrowLeft className="w-5 h-5" />
                        </div>
                        <span className="font-bold tracking-wide">
                            Kembali ke Beranda
                        </span>
                    </Link>

                    <div>
                        <h2 className="text-5xl font-black tracking-tighter leading-tight mb-4">
                            ReCircle <br />
                            <span className="font-serif italic font-light">
                                Community.
                            </span>
                        </h2>
                        <p className="text-lg text-gray-200 max-w-md font-medium leading-relaxed">
                            Bergabung dengan ribuan mahasiswa lainnya. Jual
                            barang tak terpakai, temukan harta karun, dan hemat
                            uang saku.
                        </p>
                    </div>
                </div>
            </div>

            {/* --- RIGHT SIDE: FORM --- */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 py-12 bg-white relative">
                {/* Mobile Header Image */}
                <div className="lg:hidden absolute top-0 left-0 w-full h-48 bg-primary overflow-hidden">
                    <img
                        src={image}
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white"></div>
                </div>

                <div className="w-full max-w-sm mx-auto relative z-10">
                    <div className="mb-10">
                        <Link
                            to="/"
                            className="inline-flex lg:hidden items-center gap-2 text-gray-500 mb-6 text-sm font-bold"
                        >
                            <ArrowLeft className="w-4 h-4" /> Kembali
                        </Link>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
                                <ShoppingBag className="w-6 h-6" />
                            </div>
                        </div>

                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                            {title}
                        </h2>
                        <p className="mt-2 text-sm text-gray-500 font-medium">
                            {subtitle}
                        </p>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
