import { MessageData, ReactionNameType, UserInfoType } from '@/app/dataType';
import { RootState } from '@/lib/store';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum ConversationType {
    PRIVATE = 'PRIVATE',
    GROUP = 'GROUP',
}

export interface ConversationBubble {
    conversationId: string;
    type: ConversationType;
    friendId?: string;
    name: string;
    avatar?: string | null;
    unreadCount: number;
    messages: MessageData[];
    isMinimized: boolean;
    isFocus: boolean;
}

interface ConversationState {
    openConversations: ConversationBubble[];
}

const initialState: ConversationState = {
    openConversations: [],
};

export const conversationSlice = createSlice({
    name: 'conversation',
    initialState,
    reducers: {
        openConversation(state, action: PayloadAction<ConversationBubble>) {
            const { conversationId, friendId } = action.payload;
            const existingIndex = state.openConversations.findIndex(
                (c) => (conversationId && c.conversationId === conversationId) || c.friendId === friendId,
            );
            let items;
            if (existingIndex !== -1) {
                items = state.openConversations.splice(existingIndex, 1);
            }
            state.openConversations.unshift({
                ...action.payload,
                ...(items &&
                    items.length > 0 &&
                    (action.payload.type === ConversationType.PRIVATE
                        ? {
                              messages: items[0].messages,
                          }
                        : items[0])),
            });
        },
        closeConversation: (state, action: PayloadAction<string>) => {
            state.openConversations = state.openConversations.filter(
                (c) => c.conversationId !== action.payload && c.friendId !== action.payload,
            );
        },
        maximizeConversation: (state, action: PayloadAction<string>) => {
            const existingIndex = state.openConversations.findIndex(
                (c) => c.conversationId === action.payload || c.friendId === action.payload,
            );
            if (existingIndex !== -1) {
                state.openConversations[existingIndex].isMinimized = false;
                state.openConversations[existingIndex].unreadCount = 0;

                const [item] = state.openConversations.splice(existingIndex, 1);
                state.openConversations.unshift(item);
            }
        },
        minimizeConversation: (state, action: PayloadAction<string>) => {
            const conversation = state.openConversations.find(
                (c) => c.conversationId === action.payload || c.friendId === action.payload,
            );
            if (conversation) {
                conversation.isMinimized = true;
            }
        },
        // Assign conversationId after creating a new conversation
        assignConversationId: (
            state,
            action: PayloadAction<{
                conversationId: string;
                friendId: string;
            }>,
        ) => {
            const conversation = state.openConversations.find((c) => c.friendId === action.payload.friendId);
            if (conversation) {
                conversation.conversationId = action.payload.conversationId;
            }
        },
        addMessage: (state, action: PayloadAction<MessageData | MessageData[]>) => {
            const conversation = state.openConversations.find((c) =>
                Array.isArray(action.payload)
                    ? c.conversationId === action.payload[0].conversationId
                    : c.conversationId === action.payload.conversationId,
            );

            if (conversation) {
                conversation.messages = [
                    ...conversation.messages,
                    ...(Array.isArray(action.payload) ? action.payload : [action.payload]),
                ];

                // If the bubble is minimize, increasing unreading
                if (conversation.isMinimized) {
                    conversation.unreadCount += 1;
                }
            }
        },
        focusConversationPopup: (state, action: PayloadAction<string | null>) => {
            state.openConversations.forEach((c) => {
                if (c.conversationId === action.payload || c.friendId === action.payload) c.isFocus = true;
                else c.isFocus = false;
            });
        },
        updateMessageReactions: (
            state,
            action: PayloadAction<{
                conversationId: string;
                messageId: string;
                user: UserInfoType;
                reactionType: ReactionNameType | null;
            }>,
        ) => {
            const { conversationId, messageId, user, reactionType } = action.payload;
            const message = state.openConversations
                .find((c) => c.conversationId === conversationId)
                ?.messages.find((m) => m.messageId === messageId);

            if (!message) return;

            message.reactions = message.reactions.filter((r) => r.user.userId !== user.userId);

            if (reactionType)
                message.reactions?.push({
                    reactionType,
                    user,
                });
        },
        updateCurrentMessageReaction: (
            state,
            action: PayloadAction<{
                conversationId: string;
                messageId: string;
                currentReaction: ReactionNameType | null;
            }>,
        ) => {
            const { conversationId, messageId, currentReaction } = action.payload;
            const message = state.openConversations
                .find((c) => c.conversationId === conversationId)
                ?.messages.find((m) => m.messageId === messageId);

            if (!message) return;
            message.currentReaction = currentReaction;
        },
    },
});

export const {
    openConversation,
    closeConversation,
    maximizeConversation,
    minimizeConversation,
    assignConversationId,
    addMessage,
    focusConversationPopup,
    updateMessageReactions,
    updateCurrentMessageReaction,
} = conversationSlice.actions;

export const selectOpenConversations = (state: RootState) => state.conversation.openConversations;
export const selectMessagesByConversationId = (conversationId: string) =>
    createSelector(
        (state: RootState) => state.conversation.openConversations,
        (openConversations) => openConversations.find((conv) => conv.conversationId === conversationId)?.messages || [],
    );

export default conversationSlice.reducer;
