import { configureStore } from '@reduxjs/toolkit';
import userReducer from '@/lib/features/users/usersSlice';
import loadingReducer from '@/lib/features/loading/loadingSlice';

export const makeStore = () => {
    return configureStore({
        reducer: {
            user: userReducer,
            loading: loadingReducer,
        },
    });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
