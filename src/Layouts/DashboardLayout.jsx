import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
    LayoutDashboard, 
    PackageSearch, 
    MessageSquareText, 
    ShoppingCart, 
    Wallet,
    Bell,
    Search,
    ChevronDown,
    LogOut,
    Menu,
    X,
    User
} from 'lucide-react';

export default function DashboardLayout({ children }) {
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    
    const location = useLocation();
    const navigate = useNavigate();

    // Helper to determine if a route is active
    const isActive = (path) => {
        const currentUrl = location.pathname || '';
        if (path === '/seller/dashboard') {
            return currentUrl === path || currentUrl === '/seller';
        }
        return currentUrl.startsWith(path);
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        await logout();
    };

    const navigation = [
        { name: 'Beranda', href: '/seller/dashboard', icon: LayoutDashboard },
        { name: 'Produk Saya', href: '/seller/products', icon: PackageSearch },
        { name: 'Penawaran', href: '/seller/offers', icon: MessageSquareText },
        { name: 'Pesanan', href: '/seller/orders', icon: ShoppingCart },
        { name: 'Saldo', href: '/seller/balance', icon: Wallet },
    ];

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/60 transform transition-transform duration-300 ease-in-out flex flex-col
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="h-20 flex items-center px-8 border-b border-slate-200/60">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-[#4A5D23] rounded-lg flex items-center justify-center text-white shadow-soft group-hover:bg-[#3d4d1d] transition-colors">
                            <PackageSearch className="w-4 h-4" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900">
                            Re<span className="text-[#4A5D23]">Circle</span>
                        </span>
                    </Link>
                    {/* Mobile Close Button */}
                    <button 
                        className="ml-auto lg:hidden text-slate-500 hover:text-slate-900"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 py-6 overflow-y-auto">
                    <div className="px-4 mb-4">
                        <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Menu Utama</p>
                    </div>
                    <nav className="space-y-1">
                        {navigation.map((item) => {
                            const active = isActive(item.href);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`
                                        flex items-center gap-3 px-8 py-3 text-sm font-medium transition-all duration-200
                                        ${active 
                                            ? 'bg-[#4A5D23]/10 text-[#4A5D23] border-l-4 border-[#4A5D23]' 
                                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-l-4 border-transparent'
                                        }
                                    `}
                                >
                                    <Icon className={`w-5 h-5 ${active ? 'text-[#4A5D23]' : 'text-slate-400'}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 border-t border-slate-200/60">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors w-full text-left"
                    >
                        <LogOut className="w-5 h-5" />
                        Keluar
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60 h-20 flex items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <button 
                            className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        
                        <div className="hidden sm:flex relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#4A5D23] transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Cari pesanan, produk..." 
                                className="pl-10 pr-4 py-2 bg-[#F8F9FA] border-transparent rounded-xl text-sm w-64 focus:bg-white focus:border-[#4A5D23]/30 focus:ring-4 focus:ring-[#4A5D23]/10 transition-all placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-6">
                        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="w-px h-8 bg-slate-200/60 hidden sm:block"></div>

                        <div className="relative">
                            <button 
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-xl transition-colors"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold text-slate-900 tracking-tight leading-none mb-1">{user?.name}</p>
                                    <p className="text-xs text-slate-500 font-medium">Toko Terverifikasi</p>
                                </div>
                                <div className="w-9 h-9 rounded-full bg-[#4A5D23]/10 text-[#4A5D23] flex items-center justify-center border border-[#4A5D23]/20">
                                    {user?.name?.charAt(0) || <User className="w-4 h-4" />}
                                </div>
                                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                            </button>

                            {isProfileDropdownOpen && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-40" 
                                        onClick={() => setIsProfileDropdownOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-slate-100 py-2 z-50">
                                        <Link to="/profile" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                                            Pengaturan Profil
                                        </Link>
                                        <Link to="/" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                                            Kembali ke Beranda
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
