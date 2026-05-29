import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';

export default function SearchFilterBar({ filterOptions = [], filterKey = 'status', placeholder = 'Cari...' }) {
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Get search and filter values from URL
    const searchVal = searchParams.get('search') || '';
    const filterVal = searchParams.get(filterKey) || '';

    // Local state for the text input to ensure instant typing response
    const [tempSearch, setTempSearch] = useState(searchVal);

    // Sync input when URL parameter changes (e.g. back navigation)
    useEffect(() => {
        setTempSearch(searchVal);
    }, [searchVal]);

    // Debounce the search input update to 500ms
    useEffect(() => {
        const handler = setTimeout(() => {
            const newParams = new URLSearchParams(searchParams);
            if (tempSearch.trim()) {
                newParams.set('search', tempSearch);
            } else {
                newParams.delete('search');
            }
            // Reset page on search
            newParams.delete('page');
            setSearchParams(newParams);
        }, 500);

        return () => clearTimeout(handler);
    }, [tempSearch, setSearchParams]);

    // Handle filter select change
    const handleFilterChange = (e) => {
        const val = e.target.value;
        const newParams = new URLSearchParams(searchParams);
        if (val) {
            newParams.set(filterKey, val);
        } else {
            newParams.delete(filterKey);
        }
        // Reset page on filter
        newParams.delete('page');
        setSearchParams(newParams);
    };

    // Helper to keep the placeholder concise and elegant
    const displayPlaceholder = placeholder && placeholder.length > 28
        ? "Cari..."
        : placeholder;

    return (
        <div className="flex flex-col sm:flex-row gap-2.5 w-full items-center justify-between">
            {/* Search Input (Shopify-inspired Minimalist Layout) */}
            <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400/80" />
                <input
                    type="text"
                    value={tempSearch}
                    onChange={(e) => setTempSearch(e.target.value)}
                    placeholder={displayPlaceholder}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200/85 focus:border-[#43552c] rounded-lg outline-none text-xs bg-[#FCFCFD]/60 focus:bg-white focus:ring-1 focus:ring-[#43552c]/20 transition-all font-normal text-slate-600 placeholder-slate-400/60 shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
                />
            </div>

            {/* Filter Dropdown */}
            {filterOptions && filterOptions.length > 0 && (
                <div className="w-full sm:w-40 flex-shrink-0">
                    <select
                        value={filterVal}
                        onChange={handleFilterChange}
                        className="w-full px-3.5 py-2 border border-slate-200/85 focus:border-[#43552c] rounded-lg outline-none text-xs bg-[#FCFCFD]/60 focus:bg-white font-normal text-slate-600 focus:ring-1 focus:ring-[#43552c]/20 transition-all cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.01)] appearance-none"
                        style={{
                            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 12px center',
                            backgroundSize: '12px'
                        }}
                    >
                        <option value="">Semua Status</option>
                        {filterOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
}
