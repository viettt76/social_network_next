import { configureStore } from '@reduxjs/toolkit';
import userReducer from '@/lib/features/users/usersSlice';
import loadingReducer from '@/lib/features/loading/loadingSlice';
import reactionTypeReducer from '@/lib/features/reactionType/reactionTypeSlice';

export const makeStore = () => {
    return configureStore({
        reducer: {
            user: userReducer,
            loading: loadingReducer,
            reactionType: reactionTypeReducer,
        },
    });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
