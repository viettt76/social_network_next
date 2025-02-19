import { Carousel } from 'flowbite-react';
import { MovieItem } from './MovieItem';
import { cn } from '@/lib/utils';
import { BaseMovieData } from '@/app/dataType';

interface MovieRowProps {
    title: string;
    movieList: BaseMovieData[];
    className?: string;
}

const MOVIES_PER_SLIDE = 6;

export default function MovieRow({ title, movieList, className }: MovieRowProps) {
    return (
        <div className={cn('px-10', className)}>
            <div className="text-2xl font-bold text-white">{title}</div>
            <div className="h-56 sm:h-64 xl:h-80 2xl:h-96 mt-2">
                <Carousel indicators={false} slide={false} draggable={false}>
                    {[...Array(Math.ceil(movieList.length / MOVIES_PER_SLIDE)).keys()].map((i) => {
                        return (
                            <div className={`grid grid-cols-6 gap-x-2`} key={`slide-${i}`}>
                                {movieList
                                    .slice(i * MOVIES_PER_SLIDE, (i + 1) * MOVIES_PER_SLIDE)
                                    .map((movie, index) => {
                                        return (
                                            <MovieItem
                                                movieId={movie.movieId}
                                                name={movie.name}
                                                slug={movie.slug}
                                                thumbUrl={movie.thumbUrl}
                                                type={movie.type}
                                                isFirst={index === 0}
                                                isLast={index === MOVIES_PER_SLIDE - 1}
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
