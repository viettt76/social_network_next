'use client';

import { useEffect } from 'react';

export default function ScrollToTop() {
    useEffect(() => {
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }

        const handleLoad = () => {
            window.scrollTo(0, 0);
        };

        window.addEventListener('load', handleLoad);

        return () => {
            if ('scrollRestoration' in window.history) {
                window.history.scrollRestoration = 'auto';
            }
            window.removeEventListener('load', handleLoad);
        };
    }, []);

    return null;
}
