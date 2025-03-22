import { Carousel } from 'flowbite-react';
import { MovieItem } from './MovieItem';
import { cn } from '@/lib/utils';
import { BaseMovieData } from '@/app/dataType';
import useMoviesPerSlide from '@/hooks/useMoviesPerSlide';

interface MovieRowProps {
    title: string;
    movieList: BaseMovieData[];
    className?: string;
}

export default function MovieRow({ title, movieList, className }: MovieRowProps) {
    const moviesPerSlide = useMoviesPerSlide();

    return (
        <div className={cn('px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10', className)}>
            <div className="text-2xl font-bold text-white">{title}</div>
            <div className="h-64 2xl:h-96 mt-2">
                <Carousel indicators={false} slide={false} draggable={false}>
                    {[...Array(Math.ceil(movieList.length / moviesPerSlide)).keys()].map((i) => {
                        return (
                            <div
                                className="grid gap-x-2"
                                key={`slide-${i}`}
                                style={{
                                    gridTemplateColumns: `repeat(${moviesPerSlide}, minmax(0, 1fr))`,
                                }}
                            >
                                {movieList.slice(i * moviesPerSlide, (i + 1) * moviesPerSlide).map((movie, index) => {
                                    return (
                                        <MovieItem
                                            movieId={movie.movieId}
                                            name={movie.name}
                                            originName={movie.originName}
                                            slug={movie.slug}
                                            thumbUrl={movie.thumbUrl}
                                            type={movie.type}
                                            isFirst={index === 0}
                                            isLast={index === moviesPerSlide - 1}
                                            key={`movie-${movie.movieId}-${index}`}
                                        />
                                    );
                                })}
                            </div>
                        );
                    })}
                </Carousel>
            </div>
        </div>
    );
}
