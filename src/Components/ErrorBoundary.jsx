import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('[ErrorBoundary] Uncaught application error:', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl border border-gray-100 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-5 border border-red-100">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Terjadi Kesalahan Sistem</h2>
                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                            Mohon maaf, halaman ini mengalami kendala teknis saat memuat data.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={this.handleReload}
                                className="w-full flex items-center justify-center gap-2 bg-[#40534C] hover:bg-[#2e3c36] text-white font-semibold text-sm py-3 px-4 rounded-xl transition-colors shadow-sm"
                            >
                                <RefreshCw className="w-4 h-4" /> Muat Ulang Halaman
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm py-3 px-4 rounded-xl transition-colors"
                            >
                                <Home className="w-4 h-4" /> Kembali ke Beranda
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
