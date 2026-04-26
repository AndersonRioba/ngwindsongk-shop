'use client'

import { createContext, useContext, useMemo, useState } from "react";

const SearchContext = createContext(undefined);

export function SearchProvider({ children }) {
    const [search, setSearch] = useState('');

    const value = useMemo(() => ({
        search,
        setSearch,
    }), [search]);

    return (
        <SearchContext.Provider value={value}>
            {children}
        </SearchContext.Provider>
    );
}

export function useSearch() {
    const context = useContext(SearchContext);

    if (!context) {
        throw new Error('useSearch must be used within a SearchProvider');
    }

    return context;
}
