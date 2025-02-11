import { ReactionNameType } from '@/app/dataType';
import { RootState } from '@/lib/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ReactionTypeState {
    postReactionType: Record<string, ReactionNameType>;
}

const initialState: ReactionTypeState = {
    postReactionType: {},
};

export const reactionTypeSlice = createSlice({
    name: 'reactionType',
    initialState,
    reducers: {
        setPostReactionType(state, action: PayloadAction<Record<string, ReactionNameType>>) {
            state.postReactionType = action.payload;
        },
    },
});

export const { setPostReactionType } = reactionTypeSlice.actions;

export const selectPostReactionType = (state: RootState) => state.reactionType.postReactionType;

export default reactionTypeSlice.reducer;
