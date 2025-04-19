import { Gender } from '@/lib/slices/userSlice';
import axios from './api';

export const getMyInfoService = () => {
    return axios.get('/users/me');
};

export const getUserInfoService = (userId: string) => {
    return axios.get(`/users/information/${userId}`);
};

export const changeInformationService = (userInfo: {
    firstName?: string;
    lastName?: string;
    birthday?: Date | string | null;
    gender?: Gender | null;
    hometown?: string;
    school?: string;
    workplace?: string;
    avatar?: string | null;
    isPrivate?: boolean | null;
}) => {
    return axios.put('/users/information', userInfo);
};

export const getUserImagesService = (userId: string) => {
    return axios.get(`/users/images/${userId}`);
};

export const searchService = (keyword: string) => {
    return axios.get(`/users/search?keyword=${keyword}`);
};
