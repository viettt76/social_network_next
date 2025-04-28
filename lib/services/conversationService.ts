import { ConversationType } from '@/lib/slices/conversationSlice';
import axios from './api';
import { MessageType, ReactionNameType, UserInfoType } from '@/app/dataType';

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
    fileUrl,
    fileName,
}: {
    conversationId: string;
    content?: string;
    type: MessageType;
    fileUrl?: string;
    fileName?: string;
}) => {
    return axios.post('/conversations/messages', { conversationId, content, type, image: fileUrl, fileName });
};

export const getMessagesService = ({ conversationId, page }: { conversationId: string; page: number }) => {
    return axios.get(`/conversations/messages/${conversationId}?page=${[page]}`);
};

export const getRecentConversationsService = (page: number) => {
    return axios.get(`/conversations/recent?page=${page}`);
};

export const getConversationsUnreadService = () => {
    return axios.get('/conversations/unread');
};

export const getGroupMembersService = ({ conversationId, page }: { conversationId: string; page: number }) => {
    return axios.get(`/conversations/groups/members/${conversationId}?page=${page}`);
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

export const addGroupMembersService = ({
    conversationId,
    participants,
}: {
    conversationId: string;
    participants: UserInfoType[];
}) => {
    return axios.post(`/conversations/members/${conversationId}`, {
        participants,
    });
};

export const readMessageService = (conversationId: string) => {
    return axios.post(`/conversations/messages/read/${conversationId}`);
};
