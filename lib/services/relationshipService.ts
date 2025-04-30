import axios from './api';

export const getSuggestionsService = (page: number) => {
    return axios.get(`/relationships/suggestions?page=${page}`);
};

export const sendFriendRequestService = (receiverId: string) => {
    return axios.post('/relationships/friend-requests', { receiverId });
};

export const getFriendRequestsService = (page: number) => {
    return axios.get(`/relationships/friend-requests?page=${page}`);
};

export const getFriendRequestCountService = () => {
    return axios.get('/relationships/friend-requests/count');
};

export const getSentFriendRequestsService = (page: number) => {
    return axios.get(`/relationships/sent-requests?page=${page}`);
};

export const acceptFriendRequestService = ({
    friendRequestId,
    senderId,
}: {
    friendRequestId: string;
    senderId: string;
}) => {
    return axios.post(`/relationships/friend-requests/${friendRequestId}/acceptance`, {
        senderId,
    });
};

export const deleteFriendRequestService = (friendRequestId: string) => {
    return axios.delete(`/relationships/friend-requests/${friendRequestId}`);
};

export const deleteFriendRequestByUserIdService = (userId: string) => {
    return axios.delete(`/relationships/friend-requests/${userId}/user`);
};

export const getFriendsService = (userId?: string) => {
    return axios.get('/relationships/friends', { params: { userId } });
};

export const unfriendService = (friendId: string) => {
    return axios.delete(`/relationships/friends/${friendId}`);
};
