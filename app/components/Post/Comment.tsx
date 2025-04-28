'use client';

import {
    CommentReactionType,
    CommentType,
    ReactionNameType,
    ReactionTypeColor,
    ReactionTypeIcon,
    ReactionTypeName,
} from '@/app/dataType';
import { ChangeEvent, createElement, useEffect, useState } from 'react';
import Image from 'next/image';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { cn, uploadToCloudinary } from '@/lib/utils';
import { useAppSelector } from '@/lib/hooks';
import { selectPostReactionType } from '@/lib/slices/reactionTypeSlice';
import styles from './Post.module.css';
import { getCommentRepliesService, reactToCommentService, sendCommentService } from '@/lib/services/postService';
import Textarea from '@/app/components/Textarea';
import { ImageUp, SendHorizonal, X } from 'lucide-react';
import { useSocket } from '@/app/components/SocketProvider';
import { groupBy, sortBy } from 'lodash';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import { Spinner } from 'flowbite-react';

export default function Comment({ postId, comment }: { postId: string; comment: CommentType }) {
    const socket = useSocket();

    const [showListReactions, setShowListReactions] = useState(false);
    const postReactionType = useAppSelector(selectPostReactionType);

    const [commentReactions, setCommentReactions] = useState<CommentReactionType[]>([]);
    const [mostReactions, setMostReactions] = useState<ReactionNameType[]>([]);
    const [currentReaction, setCurrentReaction] = useState<ReactionNameType | null>(null);

    const [showInputReply, setShowInputReply] = useState(false);
    const [contentReply, setContentReply] = useState('');
    const [imageWriteComment, setImageWriteComment] = useState<string | null>();
    const [imageUploadWriteComment, setImageUploadWriteComment] = useState<File | null>();
    const [sendingReply, setSendingReply] = useState(false);

    const [showReplies, setShowReplies] = useState(false);
    const [repliesPage, setRepliesPage] = useState(1);
    const [replies, setReplies] = useState<CommentType[]>([]);
    const [repliesCount, setRepliesCount] = useState<number>(0);
    const [repliesLoading, setRepliesLoading] = useState(false);

    // Set most reactions when reactions list the comment change
    useEffect(() => {
        const _reactions = groupBy(commentReactions, 'reactionType');
        const _mostReactions = sortBy(_reactions, 'length').reverse();

        if (_mostReactions.length > 0) {
            setMostReactions([_mostReactions[0][0].reactionType]);
            if (_mostReactions.length > 1) {
                setMostReactions((prev) => [_mostReactions[1][0].reactionType, ...prev]);
            }
        } else {
            setMostReactions([]);
        }
    }, [commentReactions]);

    // Update the current reaction, replies count, and reactions list when the comment changes
    useEffect(() => {
        setCurrentReaction(comment.currentReactionType || null);
        setRepliesCount(comment.repliesCount);
        setCommentReactions(comment.reactions);
    }, [comment]);

    // Get comment replies
    // Add more replies when scroll near bottom
    useEffect(() => {
        const handleGetCommentReplies = async () => {
            try {
                setRepliesLoading(true);
                const res = await getCommentRepliesService({
                    commentId: comment.commentId,
                    page: repliesPage,
                });
                if (res.data.length > 0) {
                    setReplies((prev) => [
                        ...prev,
                        ...res.data.map((comment: any) => {
                            return {
                                commentId: comment.commentId,
                                parentCommentId: comment.parentCommentId,
                                commentatorInfo: {
                                    userId: comment.commentatorId,
                                    firstName: comment.commentatorFirstName,
                                    lastName: comment.commentatorLastName,
                                    avatar: comment.commentatorAvatar,
                                },
                                content: comment.content,
                                image: comment.image,
                                currentReactionType: comment.currentReactionType,
                                reactions: comment.reactions,
                                repliesCount: comment.repliesCount,
                            };
                        }),
                    ]);
                    setRepliesLoading(false);
                }
            } catch (error) {
                console.error(error);
            }
        };

        if (showReplies) {
            handleGetCommentReplies();
        }
    }, [showReplies, comment.commentId, repliesPage]);

    // Socket handle new reply
    useEffect(() => {
        const handleNewReply = (newReply: any) => {
            if (comment.commentId === newReply.parentCommentId) {
                if (showReplies) {
                    setReplies((prev) => [
                        {
                            commentId: newReply.id,
                            parentCommentId: newReply.parentCommentId,
                            commentatorInfo: {
                                userId: newReply.commentatorId,
                                firstName: newReply.commentatorFirstName,
                                lastName: newReply.commentatorLastName,
                                avatar: newReply.commentatorAvatar,
                            },
                            content: newReply.content,
                            image: newReply.image,
                            repliesCount: 0,
                            reactions: [],
                        },
                        ...prev,
                    ]);
                }

                setRepliesCount((prev) => prev + 1);
            }
        };
        socket.on('newReply', handleNewReply);

        return () => {
            socket.off('newReply', handleNewReply);
        };
    }, [socket, showReplies, comment.commentId, comment.repliesCount]);

    // Socket handle add, update, delete comment reaction
    useEffect(() => {
        const handleNewCommentReaction = (newReaction: any) => {
            if (comment.commentId === newReaction.commentId) {
                setCommentReactions((prev) => [
                    ...prev,
                    {
                        commentReactionId: newReaction.commentReactionId,
                        reactionType: newReaction.reactionType,
                        user: {
                            userId: newReaction.user.userId,
                            firstName: newReaction.user.firstName,
                            lastName: newReaction.user.lastName,
                            avatar: newReaction.user.avatar,
                        },
                    },
                ]);
            }
        };

        const handleUpdateCommentReaction = ({
            commentId,
            commentReactionId,
            reactionType,
        }: {
            commentId: string;
            commentReactionId: string;
            reactionType: ReactionNameType;
        }) => {
            if (comment.commentId === commentId) {
                setCommentReactions((prev) => {
                    const commentReactionUpdated = prev.find(
                        (commentReaction) => commentReaction.commentReactionId === commentReactionId,
                    );
                    if (commentReactionUpdated) {
                        commentReactionUpdated.reactionType = reactionType;
                    }
                    return [...prev];
                });
            }
        };

        const handleDeleteCommentReaction = ({
            commentId,
            commentReactionId,
        }: {
            commentId: string;
            commentReactionId: string;
        }) => {
            if (comment.commentId === commentId) {
                setCommentReactions((prev) =>
                    prev.filter((commentReaction) => commentReaction.commentReactionId !== commentReactionId),
                );
            }
        };

        socket.on('reactToComment', handleNewCommentReaction);
        socket.on('updateReactToComment', handleUpdateCommentReaction);
        socket.on('deleteReactToComment', handleDeleteCommentReaction);
    }, [socket, comment.commentId]);

    const increasePage = () => setRepliesPage((prev) => prev + 1);

    // Hook for infinite scrolling: Calls `increasePage` when the user scrolls near the bottom
    const { observerTarget } = useInfiniteScroll({
        callback: increasePage,
        threshold: 0.5,
        loading: repliesLoading,
    });

    const handleChangeContentReply = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setContentReply(e.target.value);
    };

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

    const handleReactToComment = async (reactionType: ReactionNameType | null) => {
        try {
            setCurrentReaction(reactionType);
            setShowListReactions(false);
            await reactToCommentService({ commentId: comment.commentId, postId, reactionType });
        } catch (error) {
            console.error(error);
        }
    };

    const handleSendReply = async (parentCommentId: string) => {
        try {
            setSendingReply(true);
            let imageUrl;
            if (imageUploadWriteComment) {
                imageUrl = (await uploadToCloudinary(imageUploadWriteComment))?.fileUrl;
            }
            handleClearFile();
            setContentReply('');
            setShowInputReply(false);
            await sendCommentService({
                postId: postId,
                parentCommentId,
                content: contentReply.trim(),
                image: imageUrl,
            });
        } catch (error) {
            console.error(error);
        } finally {
            setSendingReply(false);
        }
    };

    const handleShowReplies = () => setShowReplies(true);

    const handleHideReplies = () => {
        setShowReplies(false);
        setReplies([]);
        setRepliesPage(1);
    };

    return (
        <div className="flex mt-2" key={`comment-${comment.commentId}`}>
            <Image
                className="rounded-full w-10 h-10 me-2 object-cover"
                src={comment.commentatorInfo.avatar || '/images/default-avatar.png'}
                width={800}
                height={800}
                alt=""
            />
            <div className="flex-1">
                <div className="bg-input/60 py-1 px-3 rounded-xl w-fit">
                    <div className="text-sm font-bold">
                        {comment.commentatorInfo.lastName} {comment.commentatorInfo.firstName}
                    </div>
                    {comment.content && (
                        <div className="text-sm whitespace-pre-line break-all max-w-full">{comment.content}</div>
                    )}
                </div>
                {comment.image && (
                    <PhotoProvider>
                        <PhotoView src={comment.image}>
                            <Image
                                className="object-cover h-40 w-fit rounded-xl border mt-1 cursor-pointer"
                                src={comment.image}
                                width={800}
                                height={800}
                                alt=""
                            />
                        </PhotoView>
                    </PhotoProvider>
                )}
                <div className="flex text-sm gap-x-3">
                    <span className="text-gray">3 giờ</span>
                    <div
                        className="relative cursor-pointer"
                        onMouseEnter={() => setShowListReactions(true)}
                        onMouseLeave={() => setShowListReactions(false)}
                    >
                        <div
                            className={cn('relative', {
                                [styles['comment-list-reactions']]: showListReactions,
                            })}
                        >
                            {currentReaction ? (
                                <div
                                    style={{ color: ReactionTypeColor[currentReaction] }}
                                    onClick={() => handleReactToComment(null)}
                                >
                                    {ReactionTypeName[currentReaction]}
                                </div>
                            ) : (
                                <span className="text-gray" onClick={() => handleReactToComment('LIKE')}>
                                    Thích
                                </span>
                            )}
                        </div>
                        <div
                            className={cn(
                                `absolute flex -top-9 left-0 bg-background py-1 px-2 gap-x-2 border shadow-md rounded-full transition-opacity duration-300 ease-in-out ${
                                    showListReactions
                                        ? 'opacity-100 visibility-visible'
                                        : 'visibility-hidden opacity-0 pointer-events-none'
                                }`,
                            )}
                        >
                            {Object.keys(postReactionType).map((reactionType) => {
                                const Icon = ReactionTypeIcon[reactionType];
                                return (
                                    <div
                                        className="w-7"
                                        key={reactionType}
                                        onClick={() => handleReactToComment(reactionType as ReactionNameType)}
                                    >
                                        <Icon width={28} height={28} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div
                        className={`cursor-pointer ${showInputReply ? 'text-destructive' : 'text-gray'}`}
                        onClick={() => setShowInputReply(!showInputReply)}
                    >
                        {showInputReply ? 'Huỷ' : 'Trả lời'}
                    </div>
                    <div className="flex items-center">
                        {commentReactions.length > 0 && (
                            <>
                                {mostReactions.length > 0 && createElement(ReactionTypeIcon[mostReactions[0]])}
                                {mostReactions.length > 1 && createElement(ReactionTypeIcon[mostReactions[1]])}
                                <span className="text-gray ms-1 text-sm">{commentReactions.length}</span>
                            </>
                        )}
                    </div>
                </div>
                {repliesCount > 0 &&
                    (showReplies ? (
                        <div
                            className="text-secondary-foreground/50 font-semibold text-sm mt-1 cursor-pointer"
                            onClick={handleHideReplies}
                        >
                            Ẩn bớt câu trả lời
                        </div>
                    ) : (
                        <div
                            className="text-secondary-foreground/50 font-semibold text-sm mt-1 cursor-pointer"
                            onClick={handleShowReplies}
                        >
                            Xem {repliesCount} câu trả lời
                        </div>
                    ))}
                {showInputReply && (
                    <div className="flex mt-1">
                        <Textarea
                            className="flex-1 rounded-2xl px-2 py-1 max-h-28"
                            text={contentReply}
                            placeholder="Trả lời..."
                            handleChange={handleChangeContentReply}
                        />
                        <div className="ms-2">
                            <div className="relative">
                                <SendHorizonal
                                    className={`w-4 ${
                                        (contentReply.trim() || imageUploadWriteComment) &&
                                        'fill-primary/40 text-primary'
                                    }`}
                                    onClick={() => !sendingReply && handleSendReply(comment.commentId)}
                                />
                                {sendingReply && <Spinner className="absolute top-2 -right-1 w-3 !stroke-[6px]" />}
                            </div>

                            <div>
                                <label htmlFor="write-post-select-file" className="block w-fit cursor-pointer">
                                    <ImageUp className="text-[#41b35d] w-4" />
                                </label>
                                <input type="file" hidden id="write-post-select-file" onChange={handleChooseFile} />
                            </div>
                        </div>
                    </div>
                )}
                {showInputReply && imageWriteComment && (
                    <div className="relative w-fit">
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
                {showReplies && (
                    <div>
                        {replies.map((reply: CommentType) => {
                            return <Comment key={`comment-${reply.commentId}`} postId={postId} comment={reply} />;
                        })}
                        <div ref={observerTarget} className="h-1"></div>
                    </div>
                )}
            </div>
        </div>
    );
}
