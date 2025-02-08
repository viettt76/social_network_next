import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/lib/store';

interface FriendRequestType {
    friendRequestId: string;
    senderId: string;
    content: string;
    createdAt: Date | string;
}

interface NotificationState {
    like: any[];
    comment: any[];
    conversation: any[];
    friendRequest: FriendRequestType[];
}

const initialState: NotificationState = {
    like: [],
    comment: [],
    conversation: [],
    friendRequest: [],
};

export const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        addFriendRequestNotification(state, action: PayloadAction<FriendRequestType | FriendRequestType[]>) {
            if (Array.isArray(action.payload)) {
                state.friendRequest.unshift(...action.payload);
            } else {
                state.friendRequest.unshift(action.payload);
            }
        },
    },
});

export const { addFriendRequestNotification } = notificationSlice.actions;

export const selectFriendRequestNotification = (state: RootState) => state.notification.friendRequest;

export default notificationSlice.reducer;
