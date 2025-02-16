import { configureStore } from '@reduxjs/toolkit';
import userReducer from '@/lib/slices/userSlice';
import loadingReducer from '@/lib/slices/loadingSlice';
import reactionTypeReducer from '@/lib/slices/reactionTypeSlice';
import notificationReducer from '@/lib/slices/notificationSlice';
import conversationReducer from '@/lib/slices/conversationSlice';
import relationshipReducer from '@/lib/slices/relationshipSlice';

export const makeStore = () => {
    return configureStore({
        reducer: {
            user: userReducer,
            loading: loadingReducer,
            reactionType: reactionTypeReducer,
            notification: notificationReducer,
            conversation: conversationReducer,
            relationship: relationshipReducer,
        },
    });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
