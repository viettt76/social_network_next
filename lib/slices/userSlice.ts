import { RootState } from '@/lib/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER',
}

export enum Role {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

export interface UserState {
    id: string;
    firstName: string;
    lastName: string;
    birthday: Date | null;
    gender: Gender | null;
    homeTown: string;
    school: string;
    workplace: string;
    avatar: string;
    isPrivate: boolean | null;
    role: Role | null;
    friendRequestCount: number | null;
}

const initialState: UserState = {
    id: '',
    firstName: '',
    lastName: '',
    birthday: null,
    gender: null,
    homeTown: '',
    school: '',
    workplace: '',
    avatar: '',
    isPrivate: null,
    role: null,
    friendRequestCount: null,
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setInfo(state, action: PayloadAction<Partial<UserState>>) {
            Object.assign(state, action.payload);
        },
        resetInfo: () => initialState,
    },
});

export const { setInfo, resetInfo } = userSlice.actions;

export const selectUserInfo = (state: RootState) => state.user;

export default userSlice.reducer;
