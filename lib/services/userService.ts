import axios from './api';

export const getMyInfoService = () => {
    return axios.get('/user/my-info');
};
