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

export const changePasswordService = ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) => {
    return axios.patch('/auth/password', {
        oldPassword,
        newPassword,
    });
};

export const deleteAccountService = (password: string) => {
    return axios.delete('/auth/account', { data: { password } });
};

export const recoverAccountService = ({ username, password }: { username: string; password: string }) => {
    return axios.post('/auth/recover-account', { username, password });
};
