import { BaseMovieData, MovieCollection, MovieCountry, MovieDetails, MovieSource, MovieType } from '@/app/dataType';
import axios from 'axios';
import { GenreType } from './movieService';
import { MOVIES_LIMIT_IN_ROW } from '@/lib/constants';

const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_KKPHIM_API_URL,
});

// APIs do not support IDs should search by Slug
// movieId = slug
export const getMovieDetailByIdService = async (movieId: string): Promise<MovieDetails> => {
    const { data } = await instance.get(`/phim/${movieId}`);

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
        type: data.movie.tmdb.type,
    };
};

export const getNewlyUpdatedMovieListService = async (pageNumber?: number): Promise<BaseMovieData[]> => {
    const { data } = await instance.get('/danh-sach/phim-moi-cap-nhat-v3', {
        params: { page: pageNumber },
    });

    return data.items.map((m) => ({
        movieId: m._id,
        name: m.name,
        originName: m.origin_name,
        slug: m.slug,
        thumbUrl: m.thumb_url,
        type: m.type === 'single' ? MovieType.MOVIE : MovieType.TV,
    }));
};

export const getMovieListService = (type: string, pageNumber?: number) => {
    return instance.get(`/v1/api/danh-sach/${type}`, {
        params: { page: pageNumber },
    });
};

export const getGenreListService = async (): Promise<GenreType> => {
    const { data } = await instance.get('/the-loai');

    return data.map((g) => ({
        name: g.name,
        slug: g.slug,
    }));
};

export const getMovieListByGenreService = async (
    genre: string,
    pageNumber?: number,
    pageSize: number = MOVIES_LIMIT_IN_ROW,
): Promise<MovieCollection> => {
    const { data } = await instance.get(`/v1/api/the-loai/${genre}`, {
        params: { page: pageNumber, limit: pageSize },
    });

    return {
        title: data.data.titlePage,
        movies: data.data.items.map((m) => ({
            movieId: m._id,
            name: m.name,
            originName: m.origin_name,
            slug: m.slug,
            thumbUrl: `${process.env.NEXT_PUBLIC_BASE_KKPHIM_MOVIE_IMAGE}${m.thumb_url}`,
            type: m.time.toString().toLowerCase().includes('tập') ? MovieType.TV : MovieType.MOVIE,
        })),
        totalMovies: data.data.params.pagination.totalItems,
        totalPages: Math.ceil(data.data.params.pagination.totalItems / data.data.params.pagination.totalItemsPerPage),
    };
};

export const getCountryListService = async (): Promise<MovieCountry> => {
    const { data } = await instance.get('/quoc-gia');

    return data.map((c) => ({
        id: c._id,
        name: c.name,
        slug: c.slug,
    }));
};

export const getMovieListByCountryService = async (
    country: string,
    pageNumber?: number,
    pageSize: number = MOVIES_LIMIT_IN_ROW,
): Promise<MovieCollection> => {
    const { data } = await instance.get(`/v1/api/quoc-gia/${country}`, {
        params: { page: pageNumber, limit: pageSize },
    });

    return {
        title: data.data.titlePage,
        movies: data.data.items.map((m) => ({
            movieId: m._id,
            name: m.name,
            originName: m.origin_name,
            slug: m.slug,
            thumbUrl: `${process.env.NEXT_PUBLIC_BASE_KKPHIM_MOVIE_IMAGE}${m.thumb_url}`,
            type: m.time.toString().toLowerCase().includes('tập') ? MovieType.TV : MovieType.MOVIE,
        })),
        totalMovies: data.data.params.pagination.totalItems,
        totalPages: data.data.params.pagination.totalPages,
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
            thumbUrl: `${process.env.NEXT_PUBLIC_BASE_KKPHIM_MOVIE_IMAGE}${i.thumb_url}`,
            type: i.type === 'series' ? MovieType.TV : MovieType.MOVIE,
        })),
        totalItems: data.data.params.pagination.totalItems,
        totalPages: Math.ceil(data.data.params.pagination.totalItems / data.data.params.pagination.totalItemsPerPage),
    };
};
