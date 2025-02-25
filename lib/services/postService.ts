import { ReactionNameType } from '@/app/dataType';
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

export const getMyPostsService = (page: number) => {
    return axios.get(`/posts/me?page=${page}`);
};

export const getPostReactionTypesService = () => {
    return axios.get('/posts/reactionTypes');
};

export const reactToPostService = ({
    postId,
    posterId,
    reactionType,
}: {
    postId: string;
    posterId: string;
    reactionType: ReactionNameType | null;
}) => {
    return axios.put(`/posts/reactions/${postId}`, { posterId, reactionType });
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

export const getCommentRepliesService = ({
    commentId,
    page,
    sortField = 'createdAt',
    sortType = 'DESC',
}: {
    commentId: string;
    page: number;
    sortField?: string;
    sortType?: 'DESC' | 'ASC';
}) => {
    return axios.get(`/posts/comments/${commentId}/replies`, {
        params: {
            page,
            sortField,
            sortType,
        },
    });
};

export const reactToCommentService = ({
    commentId,
    postId,
    reactionType,
}: {
    commentId: string;
    postId: string;
    reactionType: ReactionNameType | null;
}) => {
    return axios.put(`/posts/comments/reactions/${commentId}`, { postId, reactionType });
};
