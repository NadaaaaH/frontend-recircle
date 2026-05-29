import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  Package,
  MessageSquare,
  Wallet,
  BadgeCheck,
  FileText,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Menu,
  X,
  User,
  Settings,
  ShoppingBag,
  ShoppingCart,
  ShieldCheck,
  Activity,
} from "lucide-react";
import api from "@/lib/axios";

export default function AdminLayout({ children, title }) {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifLoading, setIsNotifLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const notifRef = useRef(null);

  // Fetch unread count on mount
  useEffect(() => {
    api.get("/notifications?role=buyer")
      .then((res) => {
        const raw = res.data?.data;
        if (Array.isArray(raw)) {
          setUnreadCount(raw.filter((n) => !n.is_read).length);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch notifications list when dropdown is opened
  useEffect(() => {
    if (showNotifications) {
      setIsNotifLoading(true);
      api.get("/notifications?role=buyer")
        .then((res) => {
          const raw = res.data?.data;
          const list = Array.isArray(raw) ? raw : [];
          setNotifications(list.slice(0, 5));
          setUnreadCount(list.filter((n) => !n.is_read).length);
        })
        .catch(() => {
          setNotifications([]);
        })
        .finally(() => setIsNotifLoading(false));
    }
  }, [showNotifications]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
    navigate("/login");
  };

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Pengguna", href: "/admin/users", icon: Users },
    { name: "Produk", href: "/admin/products", icon: ShoppingBag },
    { name: "Transaksi", href: "/admin/transactions", icon: ShoppingCart },
    { name: "Penawaran", href: "/admin/offers", icon: MessageSquare },
    { name: "Verifikasi", href: "/admin/verifications", icon: ShieldCheck },
    { name: "Aktivitas", href: "/admin/activities", icon: Activity },
  ];

  const getIcon = (type) => {
    switch (type) {
      case "new_offer":
      case "offer":
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case "order_update":
      case "order":
        return <ShoppingCart className="w-4 h-4 text-emerald-600" />;
      case "user":
        return <Users className="w-4 h-4 text-indigo-600" />;
      default:
        return <Bell className="w-4 h-4 text-amber-600" />;
    }
  };

  const getBg = (type) => {
    switch (type) {
      case "new_offer":
      case "offer":
        return "bg-blue-50 border-blue-100";
      case "order_update":
      case "order":
        return "bg-emerald-50 border-emerald-100";
      case "user":
        return "bg-indigo-50 border-indigo-100";
      default:
        return "bg-amber-50 border-amber-100";
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex text-slate-900 font-sans">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-[260px] bg-white border-r border-slate-200/70 transform transition-transform duration-300 ease-in-out flex flex-col
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo Area */}
        <div className="pt-6 px-6 pb-4">
          <Link to="/" className="flex items-center gap-2 group mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white bg-[#43552c] transition-colors">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Re<span className="text-[#43552c]">Circle</span>
              </span>
              <p className="text-[9px] font-bold text-[#d4a373] uppercase tracking-widest -mt-0.5">
                Admin Panel
              </p>
            </div>
          </Link>

          {/* Role Indicator Card */}
          <div className="w-full flex items-center justify-between px-3 py-2 border border-slate-200/70 rounded-xl mb-4 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#43552c]" />
              <span className="text-sm font-semibold text-slate-900">Administrator</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari menu..." 
              className="w-full pl-9 pr-10 py-2 bg-slate-100 border-transparent rounded-lg text-sm focus:bg-white focus:border-slate-300 focus:ring-0 transition-colors placeholder:text-slate-500 font-medium"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-60">
              <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-white border border-slate-200 rounded text-slate-500 shadow-sm">⌘</kbd>
              <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-white border border-slate-200 rounded text-slate-500 shadow-sm">K</kbd>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <div className="mb-2 px-2">
            <p className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">Menu Admin</p>
          </div>
          <nav className="space-y-0.5">
            {navigation.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2 text-sm transition-all duration-200 rounded-lg
                    ${active 
                      ? 'font-semibold text-slate-900 bg-slate-50/80' 
                      : 'font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }
                  `}
                >
                  <Icon className={`w-[18px] h-[18px] ${active ? 'text-[#43552c]' : 'text-slate-500'}`} strokeWidth={active ? 2.5 : 2} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile Card Bottom */}
        <div className="p-4 border-t border-slate-200/70">
          <div className="bg-white border border-slate-200/70 rounded-xl p-3 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
            <button className="flex items-center gap-3 w-full text-left mb-3 group">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                {user?.name ? (
                  <span className="text-sm font-bold text-slate-600">{user?.name?.charAt(0)}</span>
                ) : (
                  <User className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{user?.name || 'Admin'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
            </button>
            
            <div className="space-y-1">
              <Link to="/profile" className="flex items-center gap-3 px-2 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                <Settings className="w-[18px] h-[18px] text-slate-400" />
                Pengaturan
              </Link>
              <button onClick={handleLogout} className="flex w-full items-center gap-3 px-2 py-1.5 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left">
                <LogOut className="w-[18px] h-[18px] text-slate-400" />
                Keluar
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-[260px] flex flex-col min-w-0">
        {/* Sleek Top Navbar */}
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur px-6 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            {title && (
              <h1 className="text-base font-bold text-slate-800 hidden sm:block">
                {title}
              </h1>
            )}
          </div>
          
          <div className="flex items-center gap-3 ml-auto">
            {/* Notification Bell with Dropdown Popover */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-xl hover:bg-slate-100/70 relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                    <p className="text-xs font-bold text-slate-800 tracking-wide uppercase">Notifikasi Sistem</p>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                    {isNotifLoading ? (
                      <div className="p-4 text-center text-xs text-slate-400">Memuat...</div>
                    ) : notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div key={notif._id} className="p-4 flex gap-3 hover:bg-slate-50 transition-colors">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${getBg(notif.type)}`}>
                            {getIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs ${notif.is_read ? 'text-slate-500' : 'font-bold text-slate-900'}`}>
                              {notif.message}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {new Date(notif.created_at).toLocaleDateString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-xs text-slate-400 font-medium">Tidak ada notifikasi baru</p>
                      </div>
                    )}
                  </div>
                  <Link 
                    to="/notifications" 
                    onClick={() => setShowNotifications(false)}
                    className="block text-center py-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-[#43552c] transition-all border-t border-slate-100"
                  >
                    Lihat Semua
                  </Link>
                </div>
              )}
            </div>

            <div className="w-px h-8 bg-slate-200/60 hidden sm:block"></div>

            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-xl transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#43552c]/10 text-[#43552c] flex items-center justify-center border border-[#43552c]/20 font-bold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              </button>

              {isProfileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-slate-100 py-2 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Pengaturan Profil
                    </Link>
                    <Link
                      to="/"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      Kembali ke Beranda
                    </Link>
                    <hr className="my-1 border-slate-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
