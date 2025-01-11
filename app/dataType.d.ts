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
    pictures?: string[];
};

export type CommentType = {
    commentId: string;
    commenterInfo: UserInfoType;
    content?: string;
    picture?: string;
    commentChild?: CommentType[];
};
