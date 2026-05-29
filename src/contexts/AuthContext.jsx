import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('auth_user');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(true);
    const [unreadChatCount, setUnreadChatCount] = useState(0);

    const fetchUnreadChatCount = useCallback(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) return;
        
        api.get('/chat')
            .then(res => {
                const contacts = res.data?.data || [];
                const total = contacts.reduce((sum, c) => sum + (c.unread_count || 0), 0);
                setUnreadChatCount(total);
            })
            .catch(() => {});
    }, []);

    // Verifikasi token ke server sekali saat app mount
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            setLoading(false);
            return;
        }

        api.get('/profile') // Pakai /profile yang sudah dilindungi auth:sanctum
            .then((res) => {
                const userData = res.data?.data ?? null;
                if (userData) {
                    setUser(userData);
                    localStorage.setItem('auth_user', JSON.stringify(userData));
                    fetchUnreadChatCount();
                }
            })
            .catch((err) => {
                if (err.response?.status === 401) {
                    setUser(null);
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('auth_user');
                }
            })
            .finally(() => setLoading(false));
    }, [fetchUnreadChatCount]);

    // Polling unread chat count secara berkala agar terasa realtime
    useEffect(() => {
        let interval;
        if (user) {
            interval = setInterval(() => {
                fetchUnreadChatCount();
            }, 10000); // Polling setiap 10 detik
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [user, fetchUnreadChatCount]);

    /**
     * Simpan token & user setelah login berhasil.
     */
    const loginSuccess = useCallback((token, userData) => {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        setUser(userData);
        fetchUnreadChatCount();
    }, [fetchUnreadChatCount]);

    /**
     * Logout
     */
    const logout = useCallback(async () => {
        try {
            await api.post('/logout');
        } catch {
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            setUser(null);
            setUnreadChatCount(0);
            window.location.href = '/login';
        }
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const res = await api.get('/profile');
            const userData = res.data?.data ?? null;
            if (userData) {
                setUser(userData);
                localStorage.setItem('auth_user', JSON.stringify(userData));
                fetchUnreadChatCount();
            }
        } catch {
        }
    }, [fetchUnreadChatCount]);

    const isAdmin = user?.role === 'admin';
    const isSeller = user?.role === 'seller' || user?.is_seller === true;
    const isLoggedIn = !!user;

    return (
        <AuthContext.Provider value={{ user, loading, loginSuccess, logout, refreshUser, isAdmin, isSeller, isLoggedIn, unreadChatCount, setUnreadChatCount, fetchUnreadChatCount }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

export default AuthContext;
