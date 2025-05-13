import { useEffect, useState } from 'react';
import { BaseMovieData } from '@/app/dataType';
import { getMovieListByGenreService } from '@/lib/services/movieService';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { MovieItem } from '@/app/components/MovieItem';

export default function SuggestedMovies({ className, genres }: { className?: string; genres: string[] }) {
    const searchParams = useSearchParams();
    const source = Number(searchParams.get('source'));
    const [suggestedMovies, setSuggestedMovies] = useState<BaseMovieData[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const data = await getMovieListByGenreService(source, genres[0]);
                setSuggestedMovies(data.movies);
            } catch (error) {
                console.error(error);
            }
        })();
    }, [genres, source]);

    return (
        <div className={cn('ms-10', className)}>
            <div className="text-white text-xl font-semibold text-center">Phim đề xuất cho bạn</div>
            <div className="flex flex-col items-center gap-y-3 mt-3">
                {suggestedMovies.slice(0, 8).map((m) => (
                    <MovieItem
                        className="w-48 h-60"
                        movieId={m.movieId}
                        name={m.name}
                        originName={m.originName}
                        slug={m.slug}
                        thumbUrl={m.thumbUrl}
                        type={m.type}
                        isFirst={false}
                        isLast={true}
                        key={`movie-${m.movieId}`}
                    />
                ))}
            </div>
        </div>
    );
}
