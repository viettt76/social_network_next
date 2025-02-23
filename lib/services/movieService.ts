import axios from 'axios';

const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_OPHIM_API_URL,
});

export const getMovieDetailByIdService = (movieId: string) => {
    return instance.get(`/phim/id/${movieId}`);
};

export const getMovieDetailBySlugService = (slug: string) => {
    return instance.get(`/phim/${slug}`);
};

export const getNewlyUpdatedMovieListService = (pageNumber?: number) => {
    return instance.get('/danh-sach/phim-moi-cap-nhat', {
        params: { page: pageNumber },
    });
};

export const getMovieListService = (type: string, pageNumber?: number) => {
    return instance.get(`/v1/api/danh-sach/${type}`, {
        params: { page: pageNumber },
    });
};

export const getGenreListService = () => {
    return instance.get('/v1/api/the-loai');
};

export const getMovieListByGenreService = (genre: string, pageNumber?: number) => {
    return instance.get(`/v1/api/the-loai/${genre}`, {
        params: { page: pageNumber },
    });
};

export const getCountryListService = () => {
    return instance.get('/v1/api/quoc-gia');
};

export const getMovieListByCountryService = (country: string, pageNumber?: number) => {
    return instance.get(`/v1/api/quoc-gia/${country}`, {
        params: { page: pageNumber },
    });
};

export const searchMovieService = (keyword: string, pageNumber?: number) => {
    return instance.get('/v1/api/tim-kiem', {
        params: { keyword, page: pageNumber },
    });
};
