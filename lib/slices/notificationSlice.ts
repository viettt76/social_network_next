import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/lib/store';

export interface FriendRequestType {
    friendRequestId: string;
    senderId: string;
    content: string;
    createdAt: Date | string;
}

export enum NotificationType {
    LIKE_POST = 'LIKE_POST',
    LIKE_COMMENT = 'LIKE_COMMENT',
    COMMENT = 'COMMENT',
    FRIEND_REQUEST = 'FRIEND_REQUEST',
}

interface NotificationData {
    notificationId: string;
    actorId: string;
    actorFirstName: string;
    actorLastName: string;
    actorAvatar: string;
    type: NotificationType;
    referenceId: string;
    content: string;
    isRead: boolean;
    createdAt: Date | string;
}

const initialState: NotificationData[] = [];

export const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        addNotification(state, action: PayloadAction<NotificationData | NotificationData[]>) {
            state.push(...(Array.isArray(action.payload) ? action.payload : [action.payload]));
        },
        removeNotification(state, action: PayloadAction<string>) {
            return state.filter((n) => n.notificationId !== action.payload);
        },
    },
});

export const { addNotification, removeNotification } = notificationSlice.actions;

export const selectNotifications = (state: RootState) => state.notification;

export default notificationSlice.reducer;
