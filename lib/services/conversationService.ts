import { ConversationType } from '@/lib/slices/conversationSlice';
import axios from './api';
import { MessageType, ReactionNameType } from '@/app/dataType';

export const getConversationWithFriendService = (friendId: string) => {
    return axios.get(`/conversations/friends/${friendId}`);
};

export const getGroupConversationsService = () => {
    return axios.get('conversations/groups');
};

export const createConversationService = ({
    type,
    name,
    avatar,
    participants,
}: {
    type: ConversationType;
    name?: string;
    avatar?: string;
    participants: string[];
}) => {
    return axios.post('/conversations', {
        type,
        name,
        avatar,
        participants,
    });
};

export const sendMessageService = ({
    conversationId,
    content,
    type,
    image,
}: {
    conversationId: string;
    content?: string;
    type: MessageType;
    image?: string;
}) => {
    return axios.post('/conversations/messages', { conversationId, content, type, image });
};

export const getMessagesService = ({ conversationId, page }: { conversationId: string; page: number }) => {
    return axios.get(`/conversations/messages/${conversationId}?page=${[page]}`);
};

export const getRecentConversationsService = () => {
    return axios.get('/conversations/recent');
};

export const getGroupMembersService = (conversationId: string) => {
    return axios.get(`/conversations/groups/members/${conversationId}`);
};

export const reactToMessageService = ({
    messageId,
    conversationId,
    reactionType,
}: {
    messageId: string;
    conversationId: string;
    reactionType: ReactionNameType | null;
}) => {
    return axios.put(`/conversations/reactions/${messageId}`, {
        conversationId,
        reactionType,
    });
};
