'use client';

import { MovieItem } from '@/app/components/MovieItem';
import { BaseMovieData, MovieType } from '@/app/dataType';
import { searchMovieService } from '@/lib/services/movieService';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';
import { MOVIES_PER_SLIDE } from '@/lib/constants';
import { useRouter } from '@/i18n/routing';

export default function SearchMovie() {
    const searchParams = useSearchParams();
    const keyword = searchParams.get('keyword');
    const page = Number(searchParams.get('page'));
    const router = useRouter();

    const [results, setResults] = useState<{
        movies: BaseMovieData[];
        totalPages: number;
    }>({
        movies: [],
        totalPages: 0,
    });

    useEffect(() => {
        (async () => {
            try {
                if (keyword) {
                    const { data } = await searchMovieService(keyword, page);
                    setResults({
                        movies: data.data.items.map((i) => ({
                            movieId: i._id,
                            name: i.name,
                            slug: i.slug,
                            thumbUrl: `${process.env.NEXT_PUBLIC_BASE_MOVIE_IMAGE}${i.thumb_url}`,
                            type: i.type === 'series' ? MovieType.TV : MovieType.MOVIE,
                        })),
                        totalPages: Math.ceil(
                            data.data.params.pagination.totalItems / data.data.params.pagination.totalItemsPerPage,
                        ),
                    });
                } else {
                    setResults({
                        movies: [],
                        totalPages: 0,
                    });
                }
            } catch (error) {
                console.error(error);
            }
        })();
    }, [keyword, page]);

    return (
        <div className="px-10 pt-6">
            <div className="text-orange-400 text-2xl">Tìm kiếm &quot;{keyword}&quot;</div>
            <div className={`grid grid-cols-${MOVIES_PER_SLIDE} gap-x-2 gap-y-4 mt-2`}>
                {results.movies.map((m, index) => {
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
            <ReactPaginate
                breakLabel="..."
                nextLabel=">"
                onPageChange={(p) => router.push(`/movie/search?keyword=${keyword}&page=${p.selected + 1}`)}
                pageRangeDisplayed={5}
                pageCount={results.totalPages}
                previousLabel="<"
                renderOnZeroPageCount={null}
                containerClassName="mt-4 mb-4 flex justify-center text-white gap-x-2"
                breakClassName="w-8 h-8 flex items-center justify-center bg-gray/40"
                pageClassName="w-8 h-8 flex items-center justify-center bg-gray/40"
                previousClassName="w-8 h-8 flex items-center justify-center bg-gray/40"
                nextClassName="w-8 h-8 flex items-center justify-center bg-gray/40"
                activeClassName="text-primary"
                disabledClassName="hidden"
            />
        </div>
    );
}
