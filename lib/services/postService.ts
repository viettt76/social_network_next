import { PostReactionNameType } from '@/app/dataType';
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
    return axios.put('/posts/reactions', {
        postId,
        reactionType,
    });
};
