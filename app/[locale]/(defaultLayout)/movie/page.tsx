'use client';

import { useEffect, useState } from 'react';
import MovieRow from '@/app/components/MovieRow';
import {
    getGenreListService,
    getMovieListByGenreService,
    getNewlyUpdatedMovieListService,
} from '@/lib/services/movieService';
import { BaseMovieData, MovieType } from '@/app/dataType';

export default function Movies() {
    const [newlyUpdateMovies, setNewlyUpdatedMovies] = useState<BaseMovieData[]>([]);
    const [moviesByGenres, setMoviesByGenres] = useState<
        {
            genre: string;
            movies: BaseMovieData[];
        }[]
    >([]);

    useEffect(() => {
        const fetchMovites = async () => {
            try {
                const storedNewlyUpdatedMovies = sessionStorage.getItem('newlyUpdatedMovies');
                if (storedNewlyUpdatedMovies) {
                    setNewlyUpdatedMovies(JSON.parse(storedNewlyUpdatedMovies));
                } else {
                    const newlyUpdatedRes = await getNewlyUpdatedMovieListService();
                    const newlyUpdatedData = newlyUpdatedRes.data.items.map((m) => ({
                        movieId: m._id,
                        name: m.name,
                        slug: m.slug,
                        thumbUrl: `${process.env.NEXT_PUBLIC_BASE_MOVIE_IMAGE}${m.thumb_url}`,
                        type: m.tmdb.type === 'movie' ? MovieType.MOVIE : MovieType.TV,
                    }));
                    setNewlyUpdatedMovies(newlyUpdatedData);

                    sessionStorage.setItem('newlyUpdatedMovies', JSON.stringify(newlyUpdatedData));
                }

                let storedGenreList = JSON.parse(sessionStorage.getItem('genreList') || '[]');
                if (storedGenreList.length <= 0) {
                    const genreListRes = await getGenreListService();
                    storedGenreList = genreListRes.data.data.items.map((g) => ({
                        name: g.name,
                        slug: g.slug,
                    }));
                    sessionStorage.setItem('genreList', JSON.stringify(storedGenreList));
                }

                const storedMoviesByGenres = sessionStorage.getItem('moviesByGenres');
                if (storedMoviesByGenres) {
                    setMoviesByGenres(JSON.parse(storedMoviesByGenres));
                } else if (storedGenreList.length > 0) {
                    const moviesByGenresRes = await Promise.all(
                        storedGenreList.slice(0, 3).map(async (g) => {
                            return await getMovieListByGenreService(g.slug);
                        }),
                    );
                    const moviesByGenresData = moviesByGenresRes.map((l) => {
                        return {
                            genre: l.data.data.titlePage,
                            movies: l.data.data.items.map((item) => ({
                                movieId: item._id,
                                name: item.name,
                                slug: item.slug,
                                thumbUrl: `${process.env.NEXT_PUBLIC_BASE_MOVIE_IMAGE}${item.thumb_url}`,
                                type: item.tmdb.type === 'movie' ? MovieType.MOVIE : MovieType.TV,
                            })),
                        };
                    });
                    setMoviesByGenres(moviesByGenresData);
                    sessionStorage.setItem('moviesByGenres', JSON.stringify(moviesByGenresData));
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchMovites();
    }, []);

    return (
        <div className="pt-6">
            <MovieRow title="Phim mới cập nhật" movieList={newlyUpdateMovies} />
            {moviesByGenres.map((l, index) => {
                return <MovieRow className="mt-10" title={l.genre} movieList={l.movies} key={`list-${index}`} />;
            })}
        </div>
    );
}
