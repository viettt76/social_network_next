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
    return axios.post('/auth/users', {
        username,
        password,
        firstName,
        lastName,
        gender,
    });
};

export const loginService = ({ username, password }: { username: string; password: string }) => {
    return axios.post('/auth/token', {
        username,
        password,
    });
};

export const logoutService = () => {
    return axios.delete('/auth/token');
};
