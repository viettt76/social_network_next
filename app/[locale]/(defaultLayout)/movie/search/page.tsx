'use client';

import { MovieItem } from '@/app/components/MovieItem';
import { BaseMovieData } from '@/app/dataType';
import { searchMovieService } from '@/lib/services/movieService';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';
import { useRouter } from '@/i18n/routing';
import useMoviesPerSlide from '@/hooks/useMoviesPerSlide';

export default function SearchMovie() {
    const searchParams = useSearchParams();
    const keyword = searchParams.get('keyword');
    const page = Number(searchParams.get('page'));
    const source = Number(searchParams.get('source'));
    const router = useRouter();

    const moviesPerSlide = useMoviesPerSlide();

    const [results, setResults] = useState<{
        movies: BaseMovieData[];
        totalPages: number;
    }>({
        movies: [],
        totalPages: 0,
    });

    const [pageRange, setPageRange] = useState(5);

    useEffect(() => {
        const updatePageRange = () => {
            setPageRange(window.innerWidth < 640 ? 2 : 5);
        };
        updatePageRange();
        window.addEventListener('resize', updatePageRange);
        return () => window.removeEventListener('resize', updatePageRange);
    }, []);

    useEffect(() => {
        (async () => {
            try {
                if (keyword) {
                    const data = await searchMovieService(source, keyword, page);
                    setResults(data);
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
    }, [keyword, page, source]);

    return (
        <div className="px-10 pt-6">
            <div className="text-orange-400 text-2xl">Tìm kiếm &quot;{keyword}&quot;</div>
            <div className={`grid grid-cols-${moviesPerSlide} gap-x-2 gap-y-4 mt-2`}>
                {results.movies.map((m, index) => {
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
                            key={`movie-${m.movieId}`}
                        />
                    );
                })}
            </div>
            <ReactPaginate
                breakLabel="..."
                nextLabel=">"
                onPageChange={(p) => router.push(`/movie/search?keyword=${keyword}&page=${p.selected + 1}`)}
                pageRangeDisplayed={pageRange}
                pageCount={results.totalPages}
                previousLabel="<"
                renderOnZeroPageCount={null}
                forcePage={page ? page - 1 : 0}
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
