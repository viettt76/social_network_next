'use client';

import '@vidstack/react/player/styles/base.css';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { useEffect } from 'react';
import { getCountryListService, getGenreListService } from '@/lib/services/movieService';
import { useSearchParams } from 'next/navigation';

export default function MoviesLayout({ children }) {
    const searchParams = useSearchParams();
    const source = Number(searchParams.get('source'));

    useEffect(() => {
        (async () => {
            try {
                const storedSource = sessionStorage.getItem('source');
                if (!storedSource || source.toString() !== storedSource) {
                    sessionStorage.setItem('source', source.toString());
                    sessionStorage.removeItem('countryList');
                    sessionStorage.removeItem('genreList');
                    sessionStorage.removeItem('movieDetail');
                    sessionStorage.removeItem('moviesByGenres');
                    sessionStorage.removeItem('newlyUpdatedMovies');
                }

                const storedCountryList = sessionStorage.getItem('countryList');
                if (!storedCountryList) {
                    const countryListData = await getCountryListService(source);
                    sessionStorage.setItem('countryList', JSON.stringify(countryListData));
                }

                const storedGenreList = sessionStorage.getItem('genreList');
                if (!storedGenreList) {
                    const genreListData = await getGenreListService(source);
                    sessionStorage.setItem('genreList', JSON.stringify(genreListData));
                }
            } catch (error) {
                console.error(error);
            }
        })();
    }, [source]);

    return <div className="bg-[#191919] h-full">{children}</div>;
}
