'use client';

import { CommentType, PostInfoType, ReactionNameType, PostReactionType } from '@/app/dataType';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import PostContent from './PostContent';
import { Modal } from 'flowbite-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { groupBy, sortBy } from 'lodash';
import { useSocket } from '@/app/components/SocketProvider';
import { getCommentsService, sendCommentService } from '@/lib/services/postService';
import { ImageUp, SendHorizonal, X } from 'lucide-react';
import Textarea from '@/app/components/Textarea';
import { uploadToCloudinary } from '@/lib/utils';
import Comment from '@/app/components/Post/Comment';
import { useAppSelector } from '@/lib/hooks';
import { selectUserInfo } from '@/lib/slices/userSlice';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';

export default function Post({ postInfo }: { postInfo: PostInfoType }) {
    const t = useTranslations();
    const socket = useSocket();
    const userInfo = useAppSelector(selectUserInfo);

    const [isShowPostDialog, setIsShowPostDialog] = useState(false);

    const [comments, setComments] = useState<CommentType[]>([]);
    const [commentsPage, setCommentsPage] = useState(1);
    const [commentLoading, setCommentLoading] = useState(false);

    const [contentWriteComment, setContentWriteComment] = useState('');
    const [imageWriteComment, setImageWriteComment] = useState<string | null>();
    const [imageUploadWriteComment, setImageUploadWriteComment] = useState<File | null>();

    const [postReactions, setPostReactions] = useState<PostReactionType[]>(postInfo.reactions);
    const [mostReactions, setMostReactions] = useState<ReactionNameType[]>([]);
    const [currentReaction, setCurrentReaction] = useState<ReactionNameType | null>(null);
    const [commentsCount, setCommentsCount] = useState<number>(0);

    // Set most reactions when reactions of post change
    useEffect(() => {
        const _reactions = groupBy(postReactions, 'reactionType');
        const _mostReactions = sortBy(_reactions, 'length').reverse();

        if (_mostReactions.length > 0) {
            setMostReactions([_mostReactions[0][0].reactionType]);
            if (_mostReactions.length > 1) {
                setMostReactions((prev) => [_mostReactions[1][0].reactionType, ...prev]);
            }
        } else {
            setMostReactions([]);
        }
    }, [postReactions]);

    // Set current reaction, comments count
    useEffect(() => {
        if (postInfo.currentReactionType) setCurrentReaction(postInfo.currentReactionType);
        setCommentsCount(postInfo.commentsCount);
    }, [postInfo]);

    // Socket handle add, update, delete react to post
    useEffect(() => {
        const handleAddReactionToPost = ({ postId, newReaction }: { postId: string; newReaction: any }) => {
            if (postInfo.postId === postId) {
                setPostReactions((prev) => [
                    ...prev,
                    {
                        postReactionId: newReaction.postReactionId,
                        reactionType: newReaction.reactionType,
                        user: {
                            userId: newReaction.user.id,
                            firstName: newReaction.user.firstName,
                            lastName: newReaction.user.lastName,
                            avatar: newReaction.user.avatar,
                        },
                    },
                ]);
            }
        };

        const handleUpdateReactionToPost = ({
            postId,
            postReactionId,
            reactionType,
        }: {
            postId: string;
            postReactionId: string;
            reactionType: ReactionNameType;
        }) => {
            if (postInfo.postId === postId) {
                setPostReactions((prev) => {
                    const reactionPostUpdated = prev.find(
                        (postReaction) => postReaction.postReactionId === postReactionId,
                    );
                    if (reactionPostUpdated) {
                        reactionPostUpdated.reactionType = reactionType;
                    }
                    return [...prev];
                });
            }
        };

        const handleRemoveReactionToPost = ({
            postId,
            postReactionId,
        }: {
            postId: string;
            postReactionId: string;
            reactionType: ReactionNameType;
        }) => {
            if (postInfo.postId === postId) {
                setPostReactions((prev) =>
                    prev.filter((postReaction) => postReaction.postReactionId !== postReactionId),
                );
            }
        };

        socket.on('reactToPost', handleAddReactionToPost);
        socket.on('updateReactToPost', handleUpdateReactionToPost);
        socket.on('deleteReactToPost', handleRemoveReactionToPost);

        return () => {
            socket.off('reactToPost', handleAddReactionToPost);
            socket.off('updateReactToPost', handleUpdateReactionToPost);
            socket.off('deleteReactToPost', handleRemoveReactionToPost);
        };
    }, [postInfo.postId, socket]);

    // Get comments when show post dialog
    // Get more comments when scroll near bottom
    useEffect(() => {
        const getComments = async () => {
            setCommentLoading(true);
            try {
                const res = await getCommentsService({
                    postId: postInfo.postId,
                    page: commentsPage,
                });
                if (res.data.length > 0) {
                    setComments((prev) => [
                        ...prev,
                        ...res.data.map((comment: any) => {
                            return {
                                commentId: comment.commentId,
                                commentatorInfo: {
                                    userId: comment.commentatorId,
                                    firstName: comment.commentatorFirstName,
                                    lastName: comment.commentatorLastName,
                                    avatar: comment.commentatorAvatar,
                                },
                                content: comment.content,
                                image: comment.image,
                                currentReactionType: comment.currentReactionType,
                                repliesCount: comment.repliesCount,
                                reactions: comment.reactions.map((reaction: any) => ({
                                    commentReactionId: reaction.id,
                                    reactionType: reaction.reactionType,
                                    userInfo: {
                                        userId: reaction.user.id,
                                        firstName: reaction.user.firstName,
                                        lastName: reaction.user.lastName,
                                        avatar: reaction.user.avatar,
                                    },
                                })),
                            };
                        }),
                    ]);
                    setCommentLoading(false);
                }
            } catch (error) {
                console.error(error);
            }
        };

        if (isShowPostDialog) {
            getComments();
        }
    }, [isShowPostDialog, postInfo.postId, commentsPage]);

    // Socket handle new comment and new comment reply
    useEffect(() => {
        const handleNewComment = (newComment: any) => {
            if (postInfo.postId === newComment.postId) {
                setComments((prev) => [
                    {
                        commentId: newComment.id,
                        commentatorInfo: {
                            userId: newComment.commentatorId,
                            firstName: newComment.commentatorFirstName,
                            lastName: newComment.commentatorLastName,
                            avatar: newComment.commentatorAvatar,
                        },
                        content: newComment.content,
                        image: newComment.image,
                        repliesCount: 0,
                        reactions: [],
                    },
                    ...prev,
                ]);
                setCommentsCount((prev) => prev + 1);
            }
        };

        const handleNewReply = () => setCommentsCount((prev) => prev + 1);
        socket.on('newComment', handleNewComment);
        socket.on('newReply', handleNewReply);

        return () => {
            socket.off('newComment', handleNewComment);
            socket.off('newReply', handleNewReply);
        };
    }, [comments, postInfo.postId, socket, userInfo]);

    const increasePage = () => setCommentsPage((prev) => prev + 1);

    // Hook for infinite scrolling: Calls `increasePage` when the user scrolls near the bottom
    const { observerTarget } = useInfiniteScroll({
        callback: increasePage,
        threshold: 0.5,
        loading: commentLoading,
    });

    const handleShowDialogPost = () => {
        socket.emit('joinPost', postInfo.postId);
        setIsShowPostDialog(true);
    };
    const handleHideDialogPost = () => {
        socket.emit('leavePost', postInfo.postId);
        setIsShowPostDialog(false);
        setCommentsPage(1);
        setComments([]);
    };

    const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
        setContentWriteComment(e.target.value);
    }, []);

    const handleChooseFile = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const objectURL = URL.createObjectURL(file);
        setImageWriteComment(objectURL);
        setImageUploadWriteComment(file);

        return () => URL.revokeObjectURL(objectURL);
    };

    const handleClearFile = () => {
        setImageWriteComment(null);
        setImageUploadWriteComment(null);
    };

    const handleSendComment = async () => {
        try {
            let imageUrl;
            if (imageUploadWriteComment) {
                imageUrl = (await uploadToCloudinary(imageUploadWriteComment))?.fileUrl;
            }
            handleClearFile();
            setContentWriteComment('');
            await sendCommentService({
                postId: postInfo.postId,
                content: contentWriteComment.trim(),
                image: imageUrl,
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="bg-background rounded-xl px-2 py-2 mb-4">
            <PostContent
                postInfo={postInfo}
                postReactions={postReactions}
                mostReactions={mostReactions}
                currentReaction={currentReaction}
                commentsCount={commentsCount}
                setCurrentReaction={setCurrentReaction}
                handleShowDialogPost={handleShowDialogPost}
            />
            <Modal className="bg-foreground/50" dismissible show={isShowPostDialog} onClose={handleHideDialogPost}>
                <Modal.Body className="p-4">
                    <PostContent
                        postInfo={postInfo}
                        postReactions={postReactions}
                        mostReactions={mostReactions}
                        currentReaction={currentReaction}
                        commentsCount={commentsCount}
                        setCurrentReaction={setCurrentReaction}
                        handleShowDialogPost={handleShowDialogPost}
                    />
                    <div className="border-t pt-1">
                        {comments?.map((comment: CommentType) => (
                            <Comment postId={postInfo.postId} comment={comment} key={`comment-${comment.commentId}`} />
                        ))}
                        <div ref={observerTarget} className="h-1"></div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="px-4 py-2">
                    <div className="w-full">
                        <Textarea
                            text={contentWriteComment}
                            className="border py-1 px-4 rounded-2xl max-h-48 outline-gray"
                            placeholder={`${t('Post.writeComment')}...`}
                            handleChange={handleChange}
                        />
                        <div className="flex justify-between">
                            <div>
                                <label htmlFor="write-post-select-file" className="mt-2 block w-fit cursor-pointer">
                                    <ImageUp className="text-[#41b35d]" />
                                </label>
                                <input type="file" hidden id="write-post-select-file" onChange={handleChooseFile} />
                                {imageWriteComment && (
                                    <div className="relative">
                                        <Image
                                            className="w-20 mt-2 border rounded-sm"
                                            src={imageWriteComment}
                                            alt=""
                                            width={800}
                                            height={800}
                                        />
                                        <div
                                            className="absolute top-0 -right-8 px-1 bg-background/80 rounded-full border cursor-pointer"
                                            onClick={handleClearFile}
                                        >
                                            <X className="w-4" />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <SendHorizonal
                                className={`mt-1 ${
                                    (contentWriteComment.trim() || imageUploadWriteComment) &&
                                    'fill-primary/40 text-primary'
                                }`}
                                onClick={handleSendComment}
                            />
                        </div>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
