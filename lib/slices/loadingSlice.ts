import { RootState } from '@/lib/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
            state.app = true;
        },
        stopLoadingApp(state) {
            state.app = false;
        },
        startLoadingComponent(state, action: PayloadAction<string>) {
            state[action.payload] = true;
        },
        stopLoadingComponent(state, action: PayloadAction<string>) {
            delete state[action.payload];
        },
    },
});

export const { startLoadingApp, stopLoadingApp, startLoadingComponent, stopLoadingComponent } = loadingSlice.actions;

export const selectLoadingApp = (state: RootState) => state.loading.app;

export default loadingSlice.reducer;
