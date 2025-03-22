import { BaseMovieData, MovieType } from '@/app/dataType';
import axios from 'axios';
import axiosBackend from './api';
import * as ophimService from './ophimService';
import * as kkphimService from './kkphimService';

export enum Source {
    OPHIM = 1,
    KKPHIM = 2,
}

export interface GenreType {
    name: string;
    slug: string;
}

const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_OPHIM_API_URL,
});

export const getMovieDetailByIdService = ({
    source,
    movieId,
    slug,
}: {
    source: Source;
    movieId: string;
    slug: string;
}) => {
    if (source === Source.KKPHIM) {
        return kkphimService.getMovieDetailByIdService(slug);
    } else {
        return ophimService.getMovieDetailByIdService(movieId);
    }
};

export const getMovieDetailBySlugService = (source: Source, slug: string) => {
    if (source === Source.KKPHIM) {
        return kkphimService.getMovieDetailBySlugService(slug);
    } else {
        return ophimService.getMovieDetailBySlugService(slug);
    }
};

export const getNewlyUpdatedMovieListService = (source: Source, pageNumber?: number): Promise<BaseMovieData[]> => {
    if (source === Source.KKPHIM) {
        return kkphimService.getNewlyUpdatedMovieListService(pageNumber);
    } else {
        return ophimService.getNewlyUpdatedMovieListService(pageNumber);
    }
};

export const getMovieListService = (type: string, pageNumber?: number) => {
    return instance.get(`/v1/api/danh-sach/${type}`, {
        params: { page: pageNumber },
    });
};

export const getGenreListService = (source: Source) => {
    if (source === Source.KKPHIM) {
        return kkphimService.getGenreListService();
    } else {
        return ophimService.getGenreListService();
    }
};

export const getMovieListByGenreService = (source: Source, genre: string, pageNumber?: number) => {
    if (source === Source.KKPHIM) {
        return kkphimService.getMovieListByGenreService(genre, pageNumber);
    } else {
        return ophimService.getMovieListByGenreService(genre, pageNumber);
    }
};

export const getCountryListService = (source: Source) => {
    if (source === Source.KKPHIM) {
        return kkphimService.getCountryListService();
    } else {
        return ophimService.getCountryListService();
    }
};

export const getMovieListByCountryService = (source: Source, country: string, pageNumber?: number) => {
    if (source === Source.KKPHIM) {
        return kkphimService.getMovieListByCountryService(country, pageNumber);
    } else {
        return ophimService.getMovieListByCountryService(country, pageNumber);
    }
};

export const searchMovieService = (source: Source, keyword: string, pageNumber?: number) => {
    if (source === Source.KKPHIM) {
        return kkphimService.searchMovieService(keyword, pageNumber);
    } else {
        return ophimService.searchMovieService(keyword, pageNumber);
    }
};

export const addFavoriteMovieService = ({
    movieId,
    name,
    slug,
    thumbUrl,
    type,
    source,
}: {
    movieId: string;
    name: string;
    slug: string;
    thumbUrl: string;
    type: MovieType;
    source: Source;
}) => {
    return axiosBackend.post('/movies/favorites', {
        movieId,
        name,
        slug,
        thumbUrl,
        type,
        source,
    });
};

export const removeFavoriteMovieService = ({ movieId, source }: { movieId: string; source: Source }) => {
    return axiosBackend.delete(`/movies/favorites/${movieId}?source=${source}`);
};

export const getFavoriteMoviesService = () => {
    return axiosBackend.get('/movies/favorites');
};
