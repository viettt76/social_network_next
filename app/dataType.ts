import { LikeIcon, LoveIcon, LoveLoveIcon, HaHaIcon, WowIcon, SadIcon, AngryIcon } from '@/app/components/Icons';

export const PostReactionTypeIcon = {
    LIKE: LikeIcon,
    LOVE: LoveIcon,
    LOVE_LOVE: LoveLoveIcon,
    HAHA: HaHaIcon,
    WOW: WowIcon,
    SAD: SadIcon,
    ANGRY: AngryIcon,
} as const;

export const PostReactionTypeName = {
    LIKE: 'Thích',
    LOVE: 'Yêu thích',
    LOVE_LOVE: 'Thương thương',
    HAHA: 'Haha',
    WOW: 'Wow',
    SAD: 'Buồn',
    ANGRY: 'Phẫn nộ',
} as const;

export const PostReactionTypeColor = {
    LIKE: '#0677fe',
    LOVE: '#fe484f',
    LOVE_LOVE: '#fed674',
    HAHA: '#fed674',
    WOW: '#fed674',
    SAD: '#fed674',
    ANGRY: '#ee6451',
} as const;

export type PostReactionNameType = keyof typeof PostReactionTypeIcon;

export type UserInfoType = {
    userId: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
};

export type PostReactionType = {
    postReactionId: string;
    reactionType: PostReactionNameType;
    user: UserInfoType;
};

export type PostInfoType = {
    postId: string;
    creatorInfo: UserInfoType;
    content?: string;
    currentReactionType?: PostReactionNameType;
    images?: string[];
    reactions: PostReactionType[];
    createdAt: Date | string;
};

export type CommentType = {
    commentId: string;
    commenterInfo: UserInfoType;
    content?: string;
    image?: string;
    commentChild?: CommentType[];
};
