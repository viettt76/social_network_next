'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { getMovieDetailBySlugService } from '@/lib/services/movieService';
import { MediaPlayer, MediaPlayerInstance, MediaProvider, Poster } from '@vidstack/react';
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default';
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
}

interface WatchHistory {
    slug: string;
    type: MovieType;
    currentEpisode?: number;
    progress?: number;
    episodes?: Record<
        number,
        {
            episode: number;
            progress: number;
        }
    >;
}

export const HISTORY_KEY = 'watchHistory';

// Get history from localstorage
export const getWatchHistory = (): Record<string, WatchHistory> => {
    if (typeof window === 'undefined') return {};
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
    } catch {
        return {};
    }
};

// Update history view
export const updateWatchHistory = (slug: string, progress: number, type: MovieType, currentEpisode?: number) => {
    const history = getWatchHistory();
    history[slug] = {
        slug,
        type,
        ...(type === MovieType.MOVIE && { progress }),
        ...(type === MovieType.TV &&
            currentEpisode && {
                episodes: {
                    ...history[slug]?.episodes,
                    [currentEpisode]: {
                        progress,
                        episode: currentEpisode,
                    },
                },
            }),
    };

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

// Get the history of a movie
export const getShowHistory = (slug: string): WatchHistory | null => {
    const history = getWatchHistory();
    return history[slug] || null;
};

// Delete the viewing process
export const removeWatchProgress = (slug: string, episode?: number) => {
    const history = getWatchHistory();
    if (history[slug].type === MovieType.MOVIE) {
        delete history[slug];
    } else if (history[slug].episodes && episode) {
        delete history[slug].episodes[episode];
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

export default function WatchMovie() {
    const { slug } = useParams<{ slug: string }>();
    const [movieInfo, setMovieInfo] = useState<MovieInfoType | null>(null);
    const playerRef = useRef<MediaPlayerInstance | null>(null);
    const watchHistory = getShowHistory(slug);
    const [showContinueModal, setShowContinueModal] = useState(
        watchHistory && watchHistory.progress && watchHistory.progress > 1,
    );

    // Get detailed information of the movie
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
                console.error('Error fetching movie details:', error);
            }
        };

        getMovieDetail();
    }, [slug]);

    // Save the time to see Localstorage
    useEffect(() => {
        const saveProgress = () => {
            if (playerRef.current && playerRef.current.currentTime > 0) {
                updateWatchHistory(slug, playerRef.current.currentTime, MovieType.MOVIE);
            }
        };

        const interval = setInterval(saveProgress, 5000);

        return () => {
            saveProgress();
            clearInterval(interval);
        };
    }, [slug]);

    const handleContinueWatching = () => {
        if (watchHistory?.progress && playerRef.current) {
            playerRef.current.currentTime = watchHistory.progress;
        }
        setShowContinueModal(false);
    };

    const handleStartFromBeginning = () => {
        removeWatchProgress(slug);
        setShowContinueModal(false);
    };

    return (
        <div className="max-w-[1024px] mx-auto">
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
                                                {convertSecondsToTime(watchHistory?.progress || 0)}
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
                        className="mt-2 h-[calc(100vh-6rem)] !w-[1024px]"
                        src={movieInfo.source}
                        viewType="video"
                        streamType="on-demand"
                        logLevel="warn"
                        crossOrigin
                        playsInline
                        poster={movieInfo.posterUrl}
                    >
                        <MediaProvider>
                            <Poster className="vds-poster" />
                        </MediaProvider>
                        <DefaultVideoLayout icons={defaultLayoutIcons} />
                    </MediaPlayer>
                </>
            )}
        </div>
    );
}
