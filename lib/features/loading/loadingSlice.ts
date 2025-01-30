import { RootState } from '@/lib/store';
import { createSlice } from '@reduxjs/toolkit';

interface LoadingState {
    [key: string]: boolean;
}

const initialState: LoadingState = {
    app: false,
};

export const loadingSlice = createSlice({
    name: 'loading',
    initialState,
    reducers: {
        startLoadingApp(state) {
            return {
                ...state,
                app: true,
            };
        },
        stopLoadingApp(state) {
            return {
                ...state,
                app: false,
            };
        },
        startLoadingComponent(state, action) {
            return {
                ...state,
                [action.payload]: true,
            };
        },
        stopLoadingComponent(state, action) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [action.payload]: _, ...newState } = state;
            return newState;
        },
    },
});

export const { startLoadingApp, stopLoadingApp, startLoadingComponent, stopLoadingComponent } = loadingSlice.actions;

export const selectLoadingApp = (state: RootState) => state.loading.app;

export default loadingSlice.reducer;
