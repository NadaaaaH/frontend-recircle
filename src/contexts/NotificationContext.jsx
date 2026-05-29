import React, { createContext, useContext } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const showToast = (message, type = 'success') => {
        const options = {
            duration: 4000,
            position: 'top-right',
            style: {
                borderRadius: '12px',
                background: '#333',
                color: '#fff',
                fontSize: '14px',
            },
        };

        if (type === 'success') {
            toast.success(message, {
                ...options,
                style: {
                    ...options.style,
                    background: '#ecfdf5',
                    color: '#065f46',
                    border: '1px solid #a7f3d0',
                },
                iconTheme: {
                    primary: '#059669',
                    secondary: '#fff',
                },
            });
        } else if (type === 'error') {
            toast.error(message, {
                ...options,
                style: {
                    ...options.style,
                    background: '#fef2f2',
                    color: '#991b1b',
                    border: '1px solid #fca5a5',
                },
                iconTheme: {
                    primary: '#dc2626',
                    secondary: '#fff',
                },
            });
        } else if (type === 'warning') {
            toast(message, {
                ...options,
                icon: '⚠️',
                style: {
                    ...options.style,
                    background: '#fffbeb',
                    color: '#92400e',
                    border: '1px solid #fde68a',
                },
            });
        } else {
            toast(message, options);
        }
    };

    return (
        <NotificationContext.Provider value={{ showToast }}>
            {children}
            <Toaster />
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
