/**
 * Generates a full URL for an image path.
 * Handles both remote backend images and local public assets.
 * 
 * @param {string} path - The image path from API or local.
 * @param {string} fallback - Fallback image if path is missing.
 * @returns {string} - The full image URL.
 */
export function getImageUrl(path, fallback = "/product-placeholder.png") {
    if (!path) return fallback;

    // 1. Handle absolute, blob, or data URLs
    if (path.startsWith('blob:') || path.startsWith('data:')) {
        return path;
    }

    if (path.startsWith('http://') || path.startsWith('https://')) {
        let normalizedPath = path;
        // If loaded over HTTPS or pointing to ngwindsongk domain with http, upgrade to https to prevent mixed-content & next/image pattern errors
        if (path.startsWith('http://') && (path.includes('ngwindsongk.com') || (typeof window !== 'undefined' && window.location.protocol === 'https:'))) {
            normalizedPath = path.replace('http://', 'https://');
        }

        const envBase = process.env.NEXT_PUBLIC_BASE_URL || '';
        const envApi = process.env.NEXT_PUBLIC_API_URL || '';
        
        try {
            const url = new URL(normalizedPath);
            const isBackend = (envBase && url.origin.includes(new URL(envBase).hostname)) || 
                              (envApi && url.origin.includes(new URL(envApi).hostname)) ||
                              url.hostname === 'localhost' ||
                              url.hostname === '127.0.0.1' ||
                              url.hostname.endsWith('ngwindsongk.com');

            // If it's not a known backend or local host, treat it as an external mock/remnant
            // and fallback to the placeholder to keep the UI premium and avoid next/image errors.
            if (!isBackend && !normalizedPath.includes('gstatic.com')) {
                return fallback;
            }
        } catch (e) {
            return fallback;
        }
        
        return normalizedPath;
    }

    // 2. Derive Base URL (strip /api if needed)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    process.env.NEXT_PUBLIC_API_URL?.split('/api')[0] || 
                    '';

    // 3. If the path starts with a slash, it's relative to the frontend public folder
    if (path.startsWith('/')) {
        if (path.startsWith('/storage/')) {
            return `${baseUrl}${path}`;
        }
        return path;
    }

    // 4. Otherwise, assume it's a relative path from the backend storage
    const cleanPath = path.startsWith('storage/') ? path.replace('storage/', '') : path;
    
    return `${baseUrl}/storage/${cleanPath}`;
}
