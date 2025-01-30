export type UserInfoType = {
    userId: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
};

export type PostInfoType = {
    postId: string;
    creatorInfo: UserInfoType;
    content?: string;
    images?: string[];
    createdAt: Date;
};

export type CommentType = {
    commentId: string;
    commenterInfo: UserInfoType;
    content?: string;
    image?: string;
    commentChild?: CommentType[];
};
