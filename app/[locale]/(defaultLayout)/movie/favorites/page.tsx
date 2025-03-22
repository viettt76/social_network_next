'use client';

import { MovieItem } from '@/app/components/MovieItem';
import { BaseMovieData } from '@/app/dataType';
import useMoviesPerSlide from '@/hooks/useMoviesPerSlide';
import { getFavoriteMoviesService, removeFavoriteMovieService, Source } from '@/lib/services/movieService';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface FavoriteMovieType extends BaseMovieData {
    source: Source;
}

export default function FavoriteMovies() {
    const moviesPerSlide = useMoviesPerSlide();

    const [favoriteMovies, setFavoriteMovies] = useState<FavoriteMovieType[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await getFavoriteMoviesService();
                setFavoriteMovies(
                    data.map((m) => ({
                        movieId: m.movieId,
                        name: m.name,
                        slug: m.slug,
                        thumbUrl: m.thumbUrl,
                        type: m.type,
                        source: m.source,
                    })),
                );
            } catch (error) {
                console.error(error);
            }
        })();
    }, []);

    const handleRemoveFavoriteMovie = async ({ movieId, favoriteSource }) => {
        try {
            await removeFavoriteMovieService({ movieId, source: favoriteSource });
            setFavoriteMovies((prev) => prev.filter((m) => !(m.movieId === movieId && m.source === favoriteSource)));
            toast.success('Xoá khỏi phim yêu thích thành công');
        } catch (error) {
            console.error(error);
            toast.error('Xoá khỏi phim yêu thích thất bại');
        }
    };

    return (
        <div className="px-10 pt-6">
            <div className="text-orange-400 text-2xl">Phim yêu thích</div>
            {favoriteMovies.length > 0 ? (
                <div className={`grid grid-cols-6 gap-x-2 gap-y-4 mt-2`}>
                    {favoriteMovies.map((m, index) => {
                        return (
                            <MovieItem
                                movieId={m.movieId}
                                name={m.name}
                                originName={m.originName}
                                slug={m.slug}
                                thumbUrl={m.thumbUrl}
                                type={m.type}
                                isFirst={index % moviesPerSlide === 0}
                                isLast={(index + 1) % moviesPerSlide === 0}
                                favoriteSource={m.source}
                                key={`movie-${m.movieId}`}
                                handleRemoveFavoriteMovie={handleRemoveFavoriteMovie}
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="text-white text-center mt-5">Bạn không có bộ phim yêu thích nào</div>
            )}
        </div>
    );
}
