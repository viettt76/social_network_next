import { Gender } from '@/lib/slices/userSlice';
import axios from './api';

export const getMyInfoService = () => {
    return axios.get('/users/me');
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
