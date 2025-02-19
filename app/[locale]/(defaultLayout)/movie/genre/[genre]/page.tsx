'use client';

import { MovieItem } from '@/app/components/MovieItem';
import { BaseMovieData } from '@/app/dataType';
import { getMovieListByGenreService } from '@/lib/services/movieService';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface DataType {
    title: string;
    movies: BaseMovieData[];
    totalMovies: number;
    totalPage: number;
}

const MOVIES_PER_SLIDE = 6;

export default function MoviesByGenre() {
    const { genre } = useParams();

    const [data, setData] = useState<DataType>({
        title: '',
        movies: [],
        totalMovies: 0,
        totalPage: 0,
    });

    useEffect(() => {
        (async () => {
            try {
                if (typeof genre === 'string') {
                    const { data } = await getMovieListByGenreService(genre);
                    setData({
                        title: data.data.titlePage,
                        movies: data.data.items.map((m) => ({
                            movieId: m._id,
                            name: m.name,
                            slug: m.slug,
                            thumbUrl: `https://img.ophim.live/uploads/movies/${m.thumb_url}`,
                            type: m.tmdb.type,
                        })),
                        totalMovies: data.data.params.pagination.totalItems,
                        totalPage: Math.ceil(
                            data.data.params.pagination.totalItems / data.data.params.pagination.totalItemsPerPage,
                        ),
                    });
                }
            } catch (error) {
                console.error(error);
            }
        })();
    }, [genre]);

    return (
        <div className="px-10 pt-6">
            <div className="text-orange-400 text-2xl">Phim thể loại {data.title}</div>
            <div className={`grid grid-cols-${MOVIES_PER_SLIDE} gap-x-2 gap-y-4 mt-2`}>
                {data.movies.map((m, index) => {
                    return (
                        <MovieItem
                            movieId={m.movieId}
                            name={m.name}
                            slug={m.slug}
                            thumbUrl={m.thumbUrl}
                            type={m.type}
                            isFirst={index % MOVIES_PER_SLIDE === 0}
                            isLast={(index + 1) % MOVIES_PER_SLIDE === 0}
                            key={`movie-${m.movieId}`}
                        />
                    );
                })}
            </div>
        </div>
    );
}
