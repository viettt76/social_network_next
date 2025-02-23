'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getMovieDetailBySlugService } from '@/lib/services/movieService';
import { MediaPlayer, MediaProvider, Poster } from '@vidstack/react';
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default';

interface MovieInfoType {
    name: string;
    source: string;
    posterUrl: string;
}

export default function WatchMovie() {
    const { slug } = useParams();
    const [movieInfo, setMovieInfo] = useState<MovieInfoType | null>(null);

    useEffect(() => {
        const getMovieDetail = async () => {
            try {
                if (typeof slug === 'string') {
                    const { data } = await getMovieDetailBySlugService(slug);
                    setMovieInfo({
                        name: data.movie.name,
                        source: data.episodes[0].server_data[0].link_m3u8,
                        posterUrl: data.movie.poster_url,
                    });
                }
            } catch (error) {
                console.error(error);
            }
        };

        getMovieDetail();
    }, [slug]);

    return (
        <div className="max-w-[1024px] mx-auto">
            <MediaPlayer
                className="mt-2 h-[calc(100vh-6rem)] !w-[1024px]"
                src={movieInfo?.source}
                viewType="video"
                streamType="on-demand"
                logLevel="warn"
                crossOrigin
                playsInline
                poster={movieInfo?.posterUrl}
            >
                <MediaProvider>
                    <Poster className="vds-poster" />
                </MediaProvider>
                <DefaultVideoLayout icons={defaultLayoutIcons} />
            </MediaPlayer>
        </div>
    );
}
