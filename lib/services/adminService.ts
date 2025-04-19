import axios from './api';

export const getPostsNotCensoredService = (page: number) => {
    return axios.get(`/admin/posts-not-censored?page=${page}`);
};

export const getRejectedPostsService = (page: number) => {
    return axios.get(`/admin/rejected-posts?page=${page}`);
};

export const approvePostService = (postId: string) => {
    return axios.patch(`/admin/approve-post/${postId}`);
};

export const rejectPostService = (postId: string) => {
    return axios.patch(`/admin/reject-post/${postId}`);
};
