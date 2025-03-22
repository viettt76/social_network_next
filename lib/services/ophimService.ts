import { BaseMovieData, MovieCollection, MovieCountry, MovieDetails, MovieSource, MovieType } from '@/app/dataType';
import axios from 'axios';
import { GenreType } from './movieService';

const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_OPHIM_API_URL,
});

export const getMovieDetailByIdService = async (movieId: string): Promise<MovieDetails> => {
    const { data } = await instance.get(`/phim/id/${movieId}`);

    return {
        trailerUrl: data.movie.trailer_url,
        posterUrl: data.movie.poster_url,
        content: data.movie.content,
        time: data.movie.time,
        voteAverage: data.movie.tmdb.vote_average,
        actors: data.movie.actor,
        genres: data.movie.category.map((c) => c.name),
        releaseYear: data.movie.year,
    };
};

export const getMovieDetailBySlugService = async (slug: string): Promise<MovieSource> => {
    const { data } = await instance.get(`/phim/${slug}`);

    return {
        name: data.movie.name,
        source: data.episodes[0].server_data[0].link_m3u8,
        posterUrl: data.movie.poster_url,
        numberOfEpisodes: data.episodes[0].server_data.length,
        type: data.movie.tmdb.type === 'tv' ? MovieType.TV : MovieType.MOVIE,
    };
};

export const getNewlyUpdatedMovieListService = async (pageNumber?: number): Promise<BaseMovieData[]> => {
    const { data } = await instance.get('/danh-sach/phim-moi-cap-nhat', {
        params: { page: pageNumber },
    });

    return data.items.map((m) => ({
        movieId: m._id,
        name: m.name,
        originName: m.origin_name,
        slug: m.slug,
        thumbUrl: `${process.env.NEXT_PUBLIC_BASE_OPHIM_MOVIE_IMAGE}${m.thumb_url}`,
        type: m.tmdb.type === 'movie' ? MovieType.MOVIE : MovieType.TV,
    }));
};

export const getMovieListService = (type: string, pageNumber?: number) => {
    return instance.get(`/v1/api/danh-sach/${type}`, {
        params: { page: pageNumber },
    });
};

export const getGenreListService = async (): Promise<GenreType> => {
    const { data } = await instance.get('/v1/api/the-loai');

    return data.data.items.map((g) => ({
        name: g.name,
        slug: g.slug,
    }));
};

export const getMovieListByGenreService = async (genre: string, pageNumber?: number): Promise<MovieCollection> => {
    const { data } = await instance.get(`/v1/api/the-loai/${genre}`, {
        params: { page: pageNumber },
    });

    return {
        title: data.data.titlePage,
        movies: data.data.items.map((m) => ({
            movieId: m._id,
            name: m.name,
            originName: m.origin_name,
            slug: m.slug,
            thumbUrl: `${process.env.NEXT_PUBLIC_BASE_OPHIM_MOVIE_IMAGE}${m.thumb_url}`,
            type: m.tmdb.type === 'tv' ? MovieType.TV : MovieType.MOVIE,
        })),
        totalMovies: data.data.params.pagination.totalItems,
        totalPages: Math.ceil(data.data.params.pagination.totalItems / data.data.params.pagination.totalItemsPerPage),
    };
};

export const getCountryListService = async (): Promise<MovieCountry> => {
    const { data } = await instance.get('/v1/api/quoc-gia');

    return data.data.items.map((c) => ({
        id: c._id,
        name: c.name,
        slug: c.slug,
    }));
};

export const getMovieListByCountryService = async (country: string, pageNumber?: number): Promise<MovieCollection> => {
    const { data } = await instance.get(`/v1/api/quoc-gia/${country}`, {
        params: { page: pageNumber },
    });

    return {
        title: data.data.titlePage,
        movies: data.data.items.map((m) => ({
            movieId: m._id,
            name: m.name,
            originName: m.origin_name,
            slug: m.slug,
            thumbUrl: `${process.env.NEXT_PUBLIC_BASE_OPHIM_MOVIE_IMAGE}${m.thumb_url}`,
            type: m.tmdb.type === 'tv' ? MovieType.TV : MovieType.MOVIE,
        })),
        totalMovies: data.data.params.pagination.totalItems,
        totalPages: Math.ceil(data.data.params.pagination.totalItems / data.data.params.pagination.totalItemsPerPage),
    };
};

export const searchMovieService = async (
    keyword: string,
    pageNumber?: number,
): Promise<{
    movies: BaseMovieData[];
    totalItems: number;
    totalPages: number;
}> => {
    const { data } = await instance.get('/v1/api/tim-kiem', {
        params: { keyword, page: pageNumber },
    });

    return {
        movies: data.data.items.map((i) => ({
            movieId: i._id,
            name: i.name,
            originName: i.origin_name,
            slug: i.slug,
            thumbUrl: `${process.env.NEXT_PUBLIC_BASE_OPHIM_MOVIE_IMAGE}${i.thumb_url}`,
            type: i.type === 'series' ? MovieType.TV : MovieType.MOVIE,
        })),
        totalItems: data.data.params.pagination.totalItems,
        totalPages: Math.ceil(data.data.params.pagination.totalItems / data.data.params.pagination.totalItemsPerPage),
    };
};
