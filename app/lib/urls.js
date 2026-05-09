export const getAdminUrl = () => {
    const publicUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001';
    
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        
        // If we are on production shop domain but admin URL is localhost
        if (hostname.includes('ngwindsongk.com') && publicUrl.includes('localhost')) {
            return 'https://admin.ngwindsongk.com';
        }
        
        // General production fallback
        if (!hostname.includes('localhost') && publicUrl.includes('localhost')) {
            return 'https://admin.ngwindsongk.com';
        }
    }
    
    return publicUrl;
};

export const getStoreUrl = () => {
    const publicUrl = process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000';
    
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        
        if (hostname.includes('ngwindsongk.com') && publicUrl.includes('localhost')) {
            return 'https://ngwindsongk.com';
        }
    }
    
    return publicUrl;
};
