export const getAdminUrl = () => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3001';
        }
        return 'https://admin.ngwindsongk.com';
    }
    return process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001';
};

export const getStoreUrl = () => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3000';
        }
        return 'https://www.ngwindsongk.com';
    }
    return process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000';
};
