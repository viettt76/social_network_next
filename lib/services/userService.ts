import axios from './api';

export const getMyInfoService = () => {
    return axios.get('/users/me');
};
