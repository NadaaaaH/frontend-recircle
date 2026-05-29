import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Konfirmasi',
    subtitle = 'Apakah Anda yakin ingin melakukan tindakan ini?',
    confirmText = 'Konfirmasi',
    cancelText = 'Batal',
    type = 'danger', // 'danger', 'success', 'info'
    isLoading = false
}) {
    const [isRendered, setIsRendered] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Handle animation sequencing
    useEffect(() => {
        if (isOpen) {
            setIsRendered(true);
            // Small delay to allow element to render before adding opacity/scale classes
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setIsVisible(true));
            });
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => setIsRendered(false), 300); // match transition duration
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isRendered) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger':
                return (
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                );
            case 'success':
                return (
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                        <CheckCircle className="w-8 h-8 text-emerald-600" />
                    </div>
                );
            case 'info':
            default:
                return (
                    <div className="w-16 h-16 bg-[#43552c]/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                        <Info className="w-8 h-8 text-[#43552c]" />
                    </div>
                );
        }
    };

    const getConfirmButtonClass = () => {
        if (type === 'danger') {
            return "bg-[#d4a373] hover:bg-[#c29161] text-white";
        }
        return "bg-[#43552c] hover:bg-[#364423] text-white";
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={!isLoading ? onClose : undefined}
            />

            {/* Modal Card */}
            <div 
                className={`relative bg-white rounded-[2rem] p-8 max-w-sm sm:max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] transform transition-all duration-300 origin-center ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
            >
                {getIcon()}
                
                <div className="text-center mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        {subtitle}
                    </p>
                </div>

                <div className="flex gap-4 w-full">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-6 py-3 font-medium transition-all focus:ring-2 focus:ring-gray-200 outline-none disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 rounded-xl px-6 py-3 font-medium transition-all active:scale-95 focus:ring-2 focus:ring-offset-2 outline-none disabled:opacity-70 disabled:active:scale-100 flex justify-center items-center ${getConfirmButtonClass()}`}
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
