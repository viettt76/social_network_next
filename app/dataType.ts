import { LikeIcon, LoveIcon, LoveLoveIcon, HaHaIcon, WowIcon, SadIcon, AngryIcon } from '@/app/components/Icons';

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
    content?: string;
    currentReactionType?: ReactionNameType;
    images?: string[];
    reactions: PostReactionType[];
    commentsCount: number;
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
