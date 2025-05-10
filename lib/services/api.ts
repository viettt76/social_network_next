import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

export const SetupInterceptors = (router) => {
    instance.interceptors.request.use(
        function (config) {
            return config;
        },
        function (error) {
            return Promise.reject(error);
        },
    );

    instance.interceptors.response.use(
        function (response) {
            return response;
        },
        function (error) {
            if (
                error instanceof AxiosError &&
                error.status === 403 &&
                error.response?.data?.code === 'ACCOUNT_LOCKED'
            ) {
                router.push(`/login`);
                toast.error(error.response?.data.message, {
                    duration: 2500,
                });
            }
            return Promise.reject(error);
        },
    );

    return instance;
};

export default instance;
