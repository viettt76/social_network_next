import axios from './api';

export const signUpService = ({
    username,
    password,
    firstName,
    lastName,
    gender,
}: {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    gender: string;
}) => {
    return axios.post('/auth/signup', {
        username,
        password,
        firstName,
        lastName,
        gender,
    });
};

export const loginService = ({ username, password }: { username: string; password: string }) => {
    return axios.post('/auth/login', {
        username,
        password,
    });
};

export const logoutService = () => {
    return axios.post('/auth/logout');
};
