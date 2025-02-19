'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getMovieDetailBySlug } from '@/lib/services/movieService';
import { MediaPlayer, MediaProvider, Poster } from '@vidstack/react';
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';

interface MovieInfoType {
    name: string;
    source: string;
    posterUrl: string;
    numberOfEpisodes: number;
    type: 'movie' | 'tv';
}

export default function WatchTVShow() {
    const { slug, episode } = useParams();
    const [movieInfo, setMovieInfo] = useState<MovieInfoType | null>(null);

    useEffect(() => {
        const getMovieDetail = async () => {
            try {
                if (typeof slug === 'string') {
                    const { data } = await getMovieDetailBySlug(slug);
                    setMovieInfo({
                        name: data.movie.name,
                        source: data.episodes[0].server_data[Number(episode) - 1].link_m3u8,
                        posterUrl: data.movie.poster_url,
                        numberOfEpisodes: data.episodes[0].server_data.length,
                        type: data.movie.tmdb.type,
                    });
                }
            } catch (error) {
                console.error(error);
            }
        };

        getMovieDetail();
    }, [slug, episode]);

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
                <DefaultVideoLayout
                    thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt"
                    icons={defaultLayoutIcons}
                />
            </MediaPlayer>
            {movieInfo?.type === 'tv' && (
                <div className="text-white mt-6 mb-4">
                    <div className="text-2xl text-orange-400">TẬP PHIM</div>
                    <div className="grid grid-cols-10 gap-4 mt-3">
                        {[...Array(movieInfo?.numberOfEpisodes).keys()].map((i) => {
                            return (
                                <Link
                                    href={`/movie/${slug}/${i + 1}`}
                                    className={cn(
                                        'bg-white text-black h-10 flex justify-center items-center rounded-md',
                                        i === Number(episode) - 1 && 'bg-red-600 text-white',
                                    )}
                                    key={`${slug}-episode-${i}`}
                                >
                                    {i + 1}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
