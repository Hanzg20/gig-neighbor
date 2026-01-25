export const getShareUrl = (path: string = window.location.pathname) => {
    const baseUrl = import.meta.env.VITE_SITE_URL || window.location.origin;

    // Ensure path starts with slash
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    // Remove double slash if base has it (though origin usually doesn't end with slash)
    const url = new URL(cleanPath, baseUrl);
    return url.href;
};

export const getBaseUrl = () => {
    return import.meta.env.VITE_SITE_URL || window.location.origin;
};
