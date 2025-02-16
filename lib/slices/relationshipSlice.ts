import { UserInfoType } from '@/app/dataType';
import { RootState } from '@/lib/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface RelationshipState {
    friends: UserInfoType[];
}

const initialState: RelationshipState = {
    friends: [],
};

export const relationshipSlice = createSlice({
    name: 'relationship',
    initialState,
    reducers: {
        addFriends(state, action: PayloadAction<UserInfoType | UserInfoType[]>) {
            if (Array.isArray(action.payload)) {
                state.friends.unshift(...action.payload);
            } else {
                state.friends.unshift(action.payload);
            }
        },
        removeFriend: (state, action: PayloadAction<string>) => {
            state.friends.filter((friend) => friend.userId !== action.payload);
        },
    },
});

export const { addFriends, removeFriend } = relationshipSlice.actions;

export const selectFriends = (state: RootState) => state.relationship.friends;

export default relationshipSlice.reducer;
