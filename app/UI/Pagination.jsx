'use client'

import React from 'react'

/**
 * Premium Pagination Component
 * @param {Object} meta Larvel Pagination Meta (current_page, last_page, etc.)
 * @param {Function} onPageChange Callback function when page changes
 */
export default function Pagination({ meta, onPageChange }) {
    if (!meta || meta.last_page <= 1) return null;

    const { current_page, last_page } = meta;

    // Logic to show a limited number of page buttons
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        
        let start = Math.max(1, current_page - 2);
        let end = Math.min(last_page, start + maxVisible - 1);
        
        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className="flex flex-col items-center gap-6 mt-16 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                    onClick={() => onPageChange(current_page - 1)}
                    disabled={current_page === 1}
                    className="p-3 rounded-2xl border border-black/5 bg-white text-black/40 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black/40 disabled:hover:border-black/5 group"
                    aria-label="Previous Page"
                >
                    <span className="icon-[solar--alt-arrow-left-line-duotone] w-6 h-6 group-active:scale-90 transition-transform" />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1.5 px-2">
                    {getPageNumbers().map((page) => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`min-w-[48px] h-[48px] rounded-2xl text-sm font-black transition-all duration-300 ${
                                page === current_page
                                    ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-110'
                                    : 'bg-white text-black/40 border border-black/5 hover:border-primary/20 hover:text-primary hover:bg-primary/5'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                {/* Next Button */}
                <button
                    onClick={() => onPageChange(current_page + 1)}
                    disabled={current_page === last_page}
                    className="p-3 rounded-2xl border border-black/5 bg-white text-black/40 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black/40 disabled:hover:border-black/5 group"
                    aria-label="Next Page"
                >
                    <span className="icon-[solar--alt-arrow-right-line-duotone] w-6 h-6 group-active:scale-90 transition-transform" />
                </button>
            </div>
            
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/25">
                Page <span className="text-black/40">{current_page}</span> of <span className="text-black/40">{last_page}</span>
            </p>
        </div>
    )
}
