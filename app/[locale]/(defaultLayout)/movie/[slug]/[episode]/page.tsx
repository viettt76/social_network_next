'use client';

import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { getMovieDetailBySlugService } from '@/lib/services/movieService';
import { MediaPlayer, MediaPlayerInstance, MediaProvider, Poster } from '@vidstack/react';
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { getShowHistory, removeWatchProgress, updateWatchHistory } from '../page';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { convertSecondsToTime } from '@/lib/utils';
import { MovieType } from '@/app/dataType';

interface MovieInfoType {
    name: string;
    source: string;
    posterUrl: string;
    numberOfEpisodes: number;
    type: MovieType;
}

export default function WatchTVShow() {
    const { slug, episode } = useParams<{ slug: string; episode: string }>();
    const [movieInfo, setMovieInfo] = useState<MovieInfoType | null>(null);
    const playerRef = useRef<MediaPlayerInstance | null>(null);

    const currentEpisode = Number(episode);
    const watchHistory = getShowHistory(slug);
    const [showContinueModal, setShowContinueModal] = useState(false);

    // Get detailed information of the movie
    useEffect(() => {
        const getMovieDetail = async () => {
            try {
                if (typeof slug === 'string') {
                    const { data } = await getMovieDetailBySlugService(slug);

                    const episodeIndex = currentEpisode - 1;
                    if (!data.episodes[0].server_data[episodeIndex]) {
                        console.error('Tập không tồn tại!');
                        return;
                    }

                    setMovieInfo({
                        name: data.movie.name,
                        source: data.episodes[0].server_data[currentEpisode - 1].link_m3u8,
                        posterUrl: data.movie.poster_url,
                        numberOfEpisodes: data.episodes[0].server_data.length,
                        type: data.movie.tmdb.type,
                    });

                    if (
                        watchHistory?.type === MovieType.TV &&
                        watchHistory.episodes &&
                        watchHistory.episodes[currentEpisode].progress > 1
                    ) {
                        setShowContinueModal(true);
                    }
                }
            } catch (error) {
                console.error(error);
            }
        };

        getMovieDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug, currentEpisode]);

    // Save the time to see Localstorage
    useEffect(() => {
        const saveProgress = () => {
            if (playerRef.current && playerRef.current.currentTime > 0) {
                updateWatchHistory(slug, playerRef.current.currentTime, MovieType.TV, currentEpisode);
            }
        };

        const interval = setInterval(saveProgress, 5000);

        return () => {
            saveProgress();
            clearInterval(interval);
        };
    }, [slug, currentEpisode]);

    const handleContinueWatching = () => {
        if (playerRef.current && watchHistory?.episodes) {
            playerRef.current.currentTime = watchHistory.episodes[currentEpisode].progress ?? 0;
        }
        setShowContinueModal(false);
    };

    const handleStartFromBeginning = () => {
        removeWatchProgress(slug, currentEpisode);
        setShowContinueModal(false);
    };

    return (
        <div className="max-w-[1024px] mx-auto px-2 sm:px-4">
            {movieInfo && (
                <>
                    {showContinueModal && (
                        <AlertDialog open={showContinueModal} onOpenChange={setShowContinueModal}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        <div className="text-base font-normal">
                                            Bạn đang xem đến{' '}
                                            <span className="text-orange-400">
                                                {watchHistory?.episodes &&
                                                    convertSecondsToTime(
                                                        watchHistory.episodes[currentEpisode].progress || 0,
                                                    )}
                                            </span>
                                        </div>
                                        <div className="text-base font-normal">Bạn có muốn tiếp tục xem không?</div>
                                    </AlertDialogTitle>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <Button variant="outline" onClick={handleStartFromBeginning}>
                                        Bắt đầu mới
                                    </Button>
                                    <Button onClick={handleContinueWatching}>Tiếp tục xem</Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    <MediaPlayer
                        ref={playerRef}
                        className="mt-2 max-w-full w-full aspect-video"
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
                    <div className="text-white mt-6 mb-4">
                        <div className="text-2xl text-orange-400">TẬP PHIM</div>
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4 mt-3">
                            {[...Array(movieInfo?.numberOfEpisodes).keys()].map((i) => {
                                return (
                                    <Link
                                        href={`/movie/${slug}/${i + 1}`}
                                        className={cn(
                                            'bg-white text-black h-10 flex justify-center items-center rounded-md',
                                            i === currentEpisode - 1 && 'bg-red-600 text-white',
                                        )}
                                        key={`${slug}-episode-${i}`}
                                    >
                                        {i + 1}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
