'use client';

import { useEffect, useState } from 'react';
import MovieRow from '@/app/components/MovieRow';
import {
    getGenreListService,
    getMovieListByGenreService,
    getNewlyUpdatedMovieListService,
} from '@/lib/services/movieService';
import { BaseMovieData, MovieCollection } from '@/app/dataType';
import { useSearchParams } from 'next/navigation';
import { HOME_GENRE_DISPLAY_LIMIT } from '@/lib/constants';

export default function Movies() {
    const searchParams = useSearchParams();
    const source = Number(searchParams.get('source'));

    const [newlyUpdateMovies, setNewlyUpdatedMovies] = useState<BaseMovieData[]>([]);
    const [moviesByGenres, setMoviesByGenres] = useState<MovieCollection[]>([]);

    useEffect(() => {
        const fetchMovites = async () => {
            try {
                const storedNewlyUpdatedMovies = sessionStorage.getItem('newlyUpdatedMovies');
                if (storedNewlyUpdatedMovies) {
                    setNewlyUpdatedMovies(JSON.parse(storedNewlyUpdatedMovies));
                } else {
                    const newlyUpdatedData = await getNewlyUpdatedMovieListService(source);
                    setNewlyUpdatedMovies(newlyUpdatedData);
                    sessionStorage.setItem('newlyUpdatedMovies', JSON.stringify(newlyUpdatedData));
                }

                const storedMoviesByGenres = sessionStorage.getItem('moviesByGenres');
                if (storedMoviesByGenres) {
                    setMoviesByGenres(JSON.parse(storedMoviesByGenres));
                } else {
                    let storedGenreList = JSON.parse(sessionStorage.getItem('genreList') || '[]');
                    if (storedGenreList.length === 0) {
                        storedGenreList = await getGenreListService(source);
                    }

                    let i = 0;

                    const moviesByGenresData: MovieCollection[] = [];

                    while (moviesByGenresData.length < HOME_GENRE_DISPLAY_LIMIT && i < storedGenreList.length) {
                        const g = storedGenreList[i];
                        const movie = await getMovieListByGenreService(source, g.slug);

                        if (movie.movies.length > 0) {
                            moviesByGenresData.push(movie);
                        }

                        i++;
                    }

                    setMoviesByGenres(moviesByGenresData);
                    sessionStorage.setItem('moviesByGenres', JSON.stringify(moviesByGenresData));
                }
            } catch (error) {
                console.error(error);
            }
        };
        const timeoutId = setTimeout(() => fetchMovites(), 0);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [source]);

    return (
        <div className="pt-6 pb-6">
            <MovieRow title="Phim mới cập nhật" movieList={newlyUpdateMovies} />
            {moviesByGenres.map((m, index) => {
                return <MovieRow className="mt-10" title={m.title} movieList={m.movies} key={`list-${index}`} />;
            })}
        </div>
    );
}
