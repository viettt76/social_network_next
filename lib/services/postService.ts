import { PostReactionNameType } from '@/app/dataType';
import axios from './api';

export const createPostService = ({
    content,
    images,
}: { content: string; images?: string[] } | { content?: string; images: string[] }) => {
    return axios.post('/posts', { content, images });
};

export const getPostsService = (page: number) => {
    return axios.get(`/posts?page=${page}`);
};

export const getPostReactionTypesService = () => {
    return axios.get('/posts/reactionTypes');
};

export const reactToPostService = ({
    postId,
    reactionType,
}: {
    postId: string;
    reactionType: PostReactionNameType | null;
}) => {
    return axios.put('/posts/reactions', { postId, reactionType });
};

export const sendCommentService = ({
    postId,
    parentCommentId,
    content,
    image,
}: {
    postId: string;
    parentCommentId?: string;
    content?: string;
    image?: string;
}) => {
    return axios.post('/posts/comments', { postId, parentCommentId, content, image });
};

export const getCommentsService = ({
    postId,
    page,
    sortField = 'createdAt',
    sortType = 'DESC',
}: {
    postId: string;
    page: number;
    sortField?: string;
    sortType?: 'DESC' | 'ASC';
}) => {
    return axios.get(`/posts/comments/${postId}`, {
        params: {
            page,
            sortField,
            sortType,
        },
    });
};
