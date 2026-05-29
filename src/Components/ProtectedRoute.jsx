import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * A wrapper component for protecting routes based on authentication status and user role.
 * Usage: <Route element={<ProtectedRoute adminOnly />}> <Route path="..." /> </Route>
 */
export default function ProtectedRoute({ children, adminOnly = false, sellerOnly = false }) {
    const { user, loading, isAdmin, isSeller } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#4A5D23]/20 border-t-[#4A5D23]" />
            </div>
        );
    }

    // 1. Must be logged in at all
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. If it requires Admin, user role must be 'admin'
    if (adminOnly && !isAdmin) {
        // Redirect to standard user dashboard or home if not admin
        return <Navigate to="/dashboard" replace />;
    }

    // 3. If it requires Seller, user role must be 'seller' (some legacy checks check is_seller flag too)
    if (sellerOnly && !isSeller) {
        // User is not seller, bump them back
        return <Navigate to="/seller/register" replace />;
    }

    // All good
    return children;
}
