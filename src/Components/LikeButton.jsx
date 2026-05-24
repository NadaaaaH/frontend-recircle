import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';

export default function LikeButton({ productId, className = "" }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const isGuest = !user;
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        if (user && user.wishlist_ids) {
            setIsLiked(user.wishlist_ids.includes(productId));
        } else {
            setIsLiked(false);
        }
    }, [user, productId]);

    const handleToggle = async (e) => {
        e.preventDefault(); // Prevent Link navigation if wrapped inside Link
        e.stopPropagation();

        if (isGuest) {
            navigate('/login');
            return;
        }

        // Optimistic UI update
        const previousState = isLiked;
        setIsLiked(!isLiked);

        try {
            await api.post(`/wishlists/${productId}/toggle`);
            
            // Optional: You could update AuthContext user here if needed, 
            // but relying on the optimistic UI is fine for immediate feedback.
        } catch (err) {
            console.error('Toggle wishlist error:', err);
            // Revert on error
            setIsLiked(previousState);
        }
    };

    return (
        <button
            onClick={handleToggle}
            className={`p-3 bg-white/80 backdrop-blur rounded-full hover:bg-white text-gray-400 hover:text-red-500 transition-all shadow-sm group ${className}`}
            aria-label={isLiked ? "Hapus dari wishlist" : "Tambah ke wishlist"}
        >
            <Heart 
                className={`w-5 h-5 transition-transform group-hover:scale-110 group-active:scale-95 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} 
            />
        </button>
    );
}
