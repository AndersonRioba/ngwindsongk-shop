'use client'

import { createContext, useContext, useMemo, useState } from "react";

const CategorySearchContext = createContext(undefined);

export function CategorySearchProvider({ children }) {
    const [categorySearch, setCategorySearch] = useState('');

    const value = useMemo(() => ({
        categorySearch,
        setCategorySearch,
    }), [categorySearch]);

    return (
        <CategorySearchContext.Provider value={value}>
            {children}
        </CategorySearchContext.Provider>
    );
}

export function useCategorySearch() {
    const context = useContext(CategorySearchContext);
    if (!context) {
        throw new Error('useCategorySearch must be used within a CategorySearchProvider');
    }
    return context;
}
