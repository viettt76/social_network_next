'use client';

import '@vidstack/react/player/styles/base.css';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { useEffect } from 'react';
import { getCountryListService } from '@/lib/services/movieService';

export default function MoviesLayout({ children }) {
    useEffect(() => {
        (async () => {
            try {
                const storedCountryList = sessionStorage.getItem('countryList');
                if (!storedCountryList) {
                    const res = await getCountryListService();
                    const countryListData = res.data.data.items.map((c) => ({
                        id: c._id,
                        name: c.name,
                        slug: c.slug,
                    }));
                    sessionStorage.setItem('countryList', JSON.stringify(countryListData));
                }
            } catch (error) {
                console.error(error);
            }
        })();
    }, []);

    return <div className="bg-[#191919] h-full">{children}</div>;
}
