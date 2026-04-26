/**
 * Generates a full URL for an image path.
 * Handles both remote backend images and local public assets.
 * 
 * @param {string} path - The image path from API or local.
 * @param {string} fallback - Fallback image if path is missing.
 * @returns {string} - The full image URL.
 */
export function getImageUrl(path, fallback = "/logo.png") {
    if (!path) return fallback;

    // 1. Handle absolute URLs
    if (path.startsWith('http')) {
        // Derive allowed backend hostnames
        const envBase = process.env.NEXT_PUBLIC_BASE_URL || '';
        const envApi = process.env.NEXT_PUBLIC_API_URL || '';
        
        try {
            const url = new URL(path);
            const isBackend = (envBase && url.origin.includes(new URL(envBase).hostname)) || 
                              (envApi && url.origin.includes(new URL(envApi).hostname)) ||
                              url.hostname === 'localhost' ||
                              url.hostname === 'api.ngwindsongk.com';

            // If it's not a known backend or local host, treat it as an external mock/remnant
            // and fallback to the placeholder to keep the UI premium and avoid next/image errors.
            if (!isBackend && !path.includes('gstatic.com')) {
                return fallback;
            }
        } catch (e) {
            return fallback;
        }
        
        return path;
    }

    // 2. Derive Base URL (strip /api if needed)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    process.env.NEXT_PUBLIC_API_URL?.split('/api')[0] || 
                    '';

    // 3. If the path starts with a slash, it's relative to the frontend public folder
    if (path.startsWith('/')) {
        return path;
    }

    // 4. Otherwise, assume it's a relative path from the backend storage
    const cleanPath = path.startsWith('storage/') ? path.replace('storage/', '') : path;
    
    return `${baseUrl}/storage/${cleanPath}`;
}
