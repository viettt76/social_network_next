'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown, Play, Plus, ThumbsDown, ThumbsUp } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Modal } from 'flowbite-react';
import { addFavoriteMovieService, getMovieDetailByIdService } from '@/lib/services/movieService';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { MovieType } from '@/app/dataType';
import { toast } from 'sonner';

interface MovieInfo {
    trailerUrl: string;
    posterUrl: string;
    content: string;
    time: string;
    voteAverage: number;
    actors: string[];
    genres: string[];
    releaseYear: number | string;
}

interface MovieItemProps {
    movieId: string;
    name: string;
    slug: string;
    thumbUrl: string;
    type: MovieType;
    isFirst: boolean;
    isLast: boolean;
}

export function MovieItem({ movieId, name, slug, thumbUrl, type, isFirst, isLast }: MovieItemProps) {
    const [movieInfo, setMovieInfo] = useState<MovieInfo | null>(null);
    const [showTrailer, setShowTrailer] = useState(false);
    const [showDetail, setShowDetail] = useState(false);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    useEffect(() => {
        const getMovieInfo = async () => {
            try {
                const storedMovieDetail = JSON.parse(sessionStorage.getItem('movieDetail') || '{}');

                if (storedMovieDetail[movieId]) {
                    setMovieInfo(storedMovieDetail[movieId]);
                } else {
                    const { data } = await getMovieDetailByIdService(movieId);

                    const movieDetail = {
                        trailerUrl: data.movie.trailer_url,
                        posterUrl: data.movie.poster_url,
                        content: data.movie.content,
                        time: data.movie.time,
                        voteAverage: data.movie.tmdb.vote_average,
                        actors: data.movie.actor,
                        genres: data.movie.category.map((c) => c.name),
                        releaseYear: data.movie.year,
                    };
                    setMovieInfo(movieDetail);
                    storedMovieDetail[movieId] = movieDetail;
                    sessionStorage.setItem('movieDetail', JSON.stringify(storedMovieDetail));
                }
            } catch (error) {
                console.error(error);
            }
        };
        if (showTrailer) {
            getMovieInfo();
        }
    }, [movieId, showTrailer]);

    const handleAddFavoriteMovie = async () => {
        try {
            await addFavoriteMovieService({ movieId, name, slug, thumbUrl, type });
            toast.success('Thêm vào phim yêu thích thành công');
        } catch (error) {
            console.error(error);
            toast.error('Thêm vào phim yêu thích thất bại');
        }
    };

    const handleLongPress = () => {
        let timer;

        const startPress = () => {
            timer = setTimeout(() => setShowTrailer(true), 500);
        };

        const endPress = () => {
            clearTimeout(timer);
        };

        const handleClick = () => {
            setShowTrailer(false);
        };

        return {
            onMouseDown: startPress,
            onMouseUp: endPress,
            onTouchStart: startPress,
            onTouchEnd: endPress,
            onClick: handleClick,
        };
    };

    return (
        <>
            <TooltipProvider>
                <Tooltip open={isMobile ? showTrailer : undefined} onOpenChange={setShowTrailer}>
                    <TooltipTrigger asChild>
                        <Link
                            href={
                                type === MovieType.MOVIE
                                    ? `/movie/${slug}`
                                    : type === MovieType.TV
                                    ? `/movie/${slug}/1`
                                    : ''
                            }
                            {...(isMobile ? handleLongPress() : {})}
                        >
                            <Image
                                className="w-full h-full object-cover cursor-pointer rounded-sm"
                                src={thumbUrl}
                                alt="thumb"
                                width={2000}
                                height={2000}
                            />
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent
                        className={cn(
                            'bg-black absolute -translate-x-1/2 w-96 h-[17rem]',
                            isFirst && '-translate-x-1/4',
                            isLast && '-translate-x-3/4',
                        )}
                    >
                        <iframe
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            title={`${name} - Trailer`}
                            width="100%"
                            height="180"
                            src={`https://www.youtube.com/embed/${
                                movieInfo?.trailerUrl.split('?v=')[1]
                            }?autoplay=1&amp;controls=0&amp;&amp;modestbranding=1&amp;enablejsapi=1&amp;origin=https%3A%2F%2Fnotflex.vercel.app&amp;widgetid=5`}
                            id="widget6"
                        ></iframe>
                        <div className="absolute left-0 right-0 bottom-2 px-3 bg-gradient-to-t from-[#141414] via-[#141414f8] to-[#14141400] shadow-[3px_18px_14px_#0009]">
                            <div className="text-lg text-white">{name}</div>
                            <div className="flex justify-between items-center w-full mt-1">
                                <div className="flex gap-x-2">
                                    <Link
                                        href={`/movie/${slug}${type === MovieType.MOVIE ? '' : '/1'}`}
                                        className="w-12 h-12 border-2 border-white flex items-center justify-center rounded-full"
                                    >
                                        <Play className="w-8 h-8 text-white" />
                                    </Link>
                                    <div
                                        className="w-12 h-12 border-2 border-white flex items-center justify-center rounded-full"
                                        onClick={handleAddFavoriteMovie}
                                    >
                                        <Plus className="w-8 h-8 text-white" />
                                    </div>
                                    {/* <div className="w-12 h-12 border-2 border-white flex items-center justify-center rounded-full">
                                        <ThumbsUp className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="w-12 h-12 border-2 border-white flex items-center justify-center rounded-full">
                                        <ThumbsDown className="w-8 h-8 text-white" />
                                    </div> */}
                                </div>
                                <div
                                    className="w-12 h-12 border-2 border-white flex items-center justify-center rounded-full"
                                    onClick={() => setShowDetail(true)}
                                >
                                    <ChevronDown className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <div className="flex gap-x-4 mt-1">
                                <div className="text-[#46d369] text-lg">IMDb: {movieInfo?.voteAverage}</div>
                                <div className="text-lg text-white">{movieInfo?.time}</div>
                            </div>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <Modal
                dismissible
                show={showDetail}
                position="center"
                size="4xl"
                onClose={() => setShowDetail(false)}
                className="modal-outline-none"
            >
                <Modal.Body className="p-2 movie-item-detail-body bg-white">
                    <div className="relative">
                        <div className="absolute left-0 right-0 top-0 w-full h-[28rem] bg-gradient-to-t from-[#181818] to-transparent opacity-60 bg-repeat-x bg-[0_top] bg-[length:100%_100%]"></div>
                        {movieInfo?.posterUrl && (
                            <Image
                                className="w-full h-[28rem] object-cover"
                                src={movieInfo.posterUrl}
                                alt="thumb"
                                width={2000}
                                height={2000}
                            />
                        )}
                        <div className="absolute bottom-2 left-2">
                            <div className="text-xl text-white">{name}</div>
                            <div className="flex gap-x-2 mt-2">
                                <div className="w-12 h-12 border-2 border-white flex items-center justify-center rounded-full">
                                    <Play className="w-8 h-8 text-white" />
                                </div>
                                <div className="w-12 h-12 border-2 border-white flex items-center justify-center rounded-full">
                                    <Plus className="w-8 h-8 text-white" />
                                </div>
                                <div className="w-12 h-12 border-2 border-white flex items-center justify-center rounded-full">
                                    <ThumbsUp className="w-8 h-8 text-white" />
                                </div>
                                <div className="w-12 h-12 border-2 border-white flex items-center justify-center rounded-full">
                                    <ThumbsDown className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="bg-white">
                    <div className="flex gap-x-12">
                        <div className="w-3/4">
                            <div className="flex gap-x-8">
                                <div className="text-[#46d369]">IMDb: {movieInfo?.voteAverage}</div>
                                <div className="text-black">{movieInfo?.releaseYear}</div>
                                <div className="text-black">{movieInfo?.time}</div>
                            </div>
                            {movieInfo?.content && (
                                <div
                                    className="mt-2 text-black"
                                    dangerouslySetInnerHTML={{ __html: movieInfo.content }}
                                ></div>
                            )}
                        </div>
                        <div className="w-1/4">
                            <div>
                                <span className="text-gray">Actors: </span>
                                <span className="text-black">{movieInfo?.actors.join(', ')}</span>
                            </div>
                            <div>
                                <span className="text-gray">Genres: </span>
                                <span className="text-black">{movieInfo?.genres.join(', ')}</span>
                            </div>
                        </div>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
}
