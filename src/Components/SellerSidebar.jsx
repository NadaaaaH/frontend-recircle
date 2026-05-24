import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Wallet,
    Settings,
    LogOut,
    Menu,
    X,
} from "lucide-react";
import axios from "@/lib/axios";

export default function SellerSidebar() {
    const { pathname } = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menus = [
        { name: "Ringkasan", icon: LayoutDashboard, href: "/seller/dashboard" },
        { name: "Produk Saya", icon: Package, href: "/seller/products" },
        { name: "Pesanan", icon: ShoppingBag, href: "/seller/orders" },
        { name: "Keuangan", icon: Wallet, href: "/seller/finance" },
        { name: "Pengaturan", icon: Settings, href: "/seller/settings" },
    ];

    const isActive = (href) => pathname === href || pathname.startsWith(href + "/");

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/logout');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            window.location.href = '/login';
        }
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="fixed top-4 left-4 z-50 lg:hidden bg-white p-2 rounded-lg shadow-md border border-gray-200"
            >
                <Menu className="w-6 h-6 text-gray-600" />
            </button>

            {/* Mobile Sidebar Drawer */}
            {isMobileMenuOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <aside className="fixed inset-y-0 left-0 w-64 bg-white z-50 shadow-xl flex flex-col lg:hidden">
                        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
                            <Link
                                to="/"
                                className="text-xl font-black text-primary tracking-tight"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Re<span className="text-gray-900">Circle</span>
                                <span className="ml-2 text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-md uppercase">
                                    Seller
                                </span>
                            </Link>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-gray-500 hover:text-gray-900"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                            {menus.map((menu) => (
                                <Link
                                    key={menu.name}
                                    to={menu.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                                        isActive(menu.href)
                                            ? "bg-primary text-white shadow-md shadow-primary/20"
                                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                                >
                                    <menu.icon className="w-5 h-5" />
                                    {menu.name}
                                </Link>
                            ))}
                        </nav>
                        <div className="p-4 border-t border-gray-100">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-semibold text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
                            >
                                <LogOut className="w-5 h-5" /> Keluar
                            </button>
                        </div>
                    </aside>
                </>
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 bg-white border-r border-gray-100">
                <div className="h-20 flex items-center px-6 border-b border-gray-100">
                    <Link
                        to="/"
                        className="text-xl font-black text-primary tracking-tight"
                    >
                        Re<span className="text-gray-900">Circle</span>
                        <span className="ml-2 text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-md uppercase">
                            Seller
                        </span>
                    </Link>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {menus.map((menu) => (
                        <Link
                            key={menu.name}
                            to={menu.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                                isActive(menu.href)
                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                        >
                            <menu.icon className="w-5 h-5" />
                            {menu.name}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-semibold text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
                    >
                        <LogOut className="w-5 h-5" /> Keluar
                    </button>
                </div>
            </aside>
        </>
    );
}
