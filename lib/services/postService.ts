import axios from './api';

export const createPostService = ({ content, images }: { content: string; images: string[] }) => {
    return axios.post('/posts', {
        content,
        images,
    });
};

export const getPostsService = (page: number) => {
    return axios.get(`/posts?page=${page}`);
};
