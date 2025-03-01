'use client';

import { MovieItem } from '@/app/components/MovieItem';
import { BaseMovieData } from '@/app/dataType';
import useMoviesPerSlide from '@/hooks/useMoviesPerSlide';
import { getFavoriteMoviesService } from '@/lib/services/movieService';
import { useEffect, useState } from 'react';

export default function FavoriteMovies() {
    const moviesPerSlide = useMoviesPerSlide();

    const [favoriteMovies, setFavoriteMovies] = useState<BaseMovieData[]>([]);

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
                    })),
                );
            } catch (error) {
                console.error(error);
            }
        })();
    }, []);

    return (
        <div className="px-10 pt-6">
            <div className="text-orange-400 text-2xl">Phim yêu thích</div>
            {favoriteMovies.length > 0 ? (
                <div className={`grid grid-cols-${moviesPerSlide} gap-x-2 gap-y-4 mt-2`}>
                    {favoriteMovies.map((m, index) => {
                        return (
                            <MovieItem
                                movieId={m.movieId}
                                name={m.name}
                                slug={m.slug}
                                thumbUrl={m.thumbUrl}
                                type={m.type}
                                isFirst={index % moviesPerSlide === 0}
                                isLast={(index + 1) % moviesPerSlide === 0}
                                key={`movie-${m.movieId}`}
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
