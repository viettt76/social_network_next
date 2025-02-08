import axios from './api';

export const getNotificationsService = () => {
    return axios.get('/notifications');
};
