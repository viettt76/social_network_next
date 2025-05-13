import { LikeIcon, LoveIcon, LoveLoveIcon, HaHaIcon, WowIcon, SadIcon, AngryIcon } from '@/app/components/Icons';
import { ConversationType } from '@/lib/slices/conversationSlice';

export const ReactionTypeIcon = {
    LIKE: LikeIcon,
    LOVE: LoveIcon,
    LOVE_LOVE: LoveLoveIcon,
    HAHA: HaHaIcon,
    WOW: WowIcon,
    SAD: SadIcon,
    ANGRY: AngryIcon,
} as const;

export const ReactionTypeName = {
    LIKE: 'Thích',
    LOVE: 'Yêu thích',
    LOVE_LOVE: 'Thương thương',
    HAHA: 'Haha',
    WOW: 'Wow',
    SAD: 'Buồn',
    ANGRY: 'Phẫn nộ',
} as const;

export const ReactionTypeColor = {
    LIKE: '#0677fe',
    LOVE: '#fe484f',
    LOVE_LOVE: '#fed674',
    HAHA: '#fed674',
    WOW: '#fed674',
    SAD: '#fed674',
    ANGRY: '#ee6451',
} as const;

export type ReactionNameType = keyof typeof ReactionTypeIcon;

export type UserInfoType = {
    userId: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
};

export type ReactionTypeBase = {
    reactionType: ReactionNameType;
    user: UserInfoType;
};

export type PostReactionType = ReactionTypeBase & {
    postReactionId: string;
};

export type CommentReactionType = ReactionTypeBase & {
    commentReactionId: string;
};

export type PostInfoType = {
    postId: string;
    creatorInfo: UserInfoType;
    isBookmarked?: boolean;
    content?: string;
    currentReactionType?: ReactionNameType | null;
    images?: string[];
    reactions: PostReactionType[];
    commentsCount: number;
    createdAt: Date | string;
};

export type PostManagementType = {
    postId: string;
    creatorInfo: UserInfoType;
    content?: string;
    images?: string[];
    createdAt: Date | string;
};

export type CommentType = {
    commentId: string;
    parentCommentId?: string;
    commentatorInfo: UserInfoType;
    content?: string;
    image?: string;
    commentChild?: CommentType[];
    currentReactionType?: ReactionNameType;
    repliesCount: number;
    reactions: CommentReactionType[];
};

export enum MessageType {
    TEXT = 'TEXT',
    IMAGE = 'IMAGE',
    FILE = 'FILE',
    VIDEO = 'VIDEO',
    NOTIFICATION = 'NOTIFICATION',
}

export type MessageData = {
    messageId: string;
    conversationId: string;
    content: string;
    fileName?: string;
    messageType: MessageType;
    sender: UserInfoType;
    currentReaction: ReactionNameType | null;
    reactions: ReactionTypeBase[];
    createdAt: Date | string;
};

export enum ConversationRole {
    MEMBER = 'MEMBER',
    ADMIN = 'ADMIN',
}

export type GroupConversationType = {
    conversationId: string;
    type: ConversationType;
    name: string;
    avatar?: string;
};

export type MessengerType = {
    conversationId: string;
    conversationName: string;
    conversationType: ConversationType;
    conversationAvatar?: string;
    lastMessage: MessageData;
    lastUpdated: string;
    friendId?: string;
};

export enum MovieType {
    MOVIE = 'MOVIE',
    TV = 'TV',
}

export interface BaseMovieData {
    movieId: string;
    name: string;
    originName: string;
    slug: string;
    thumbUrl: string;
    type: MovieType;
}

export interface MovieDetails {
    trailerUrl: string;
    posterUrl: string;
    content: string;
    time: string;
    voteAverage: number;
    actors: string[];
    genres: string[];
    releaseYear: number | string;
}

export interface MovieSource {
    name: string;
    source: string;
    posterUrl: string;
    numberOfEpisodes: number;
    type: MovieType;
    genres: [];
    content: string;
}

export interface MovieCountry {
    id: string;
    name: string;
    slug: string;
}

export interface MovieCollection {
    title: string;
    movies: BaseMovieData[];
    totalMovies: number;
    totalPages: number;
}
