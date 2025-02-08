'use client';

import {
    CommentType,
    PostInfoType,
    PostReactionNameType,
    PostReactionType,
    PostReactionTypeIcon,
} from '@/app/dataType';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import PostContent from './PostContent';
import { Modal } from 'flowbite-react';
import Image from 'next/image';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { useTranslations } from 'next-intl';
import { groupBy, sortBy } from 'lodash';
import { useSocket } from '@/app/components/SocketProvider';
import { getCommentsService, sendCommentService } from '@/lib/services/postService';
import { ImageUp, SendHorizonal, X } from 'lucide-react';
import Textarea from '@/app/components/Textarea';
import { cn, uploadToCloudinary } from '@/lib/utils';
import { useAppSelector } from '@/lib/hooks';
import { selectPostReactionType } from '@/lib/slices/reactionTypeSlice';
import styles from './Post.module.css';

const Comment = ({ comment }: { comment: CommentType }) => {
    const [showListReactions, setShowListReactions] = useState(false);
    const postReactionType = useAppSelector(selectPostReactionType);

    const handleReactToComment = async (reactionType: PostReactionNameType | null) => {
        try {
            // setCurrentReaction(reactionType);
            // setShowListReactions(false);
            // await reactToPostService({ postId: postInfo.postId, reactionType });
        } catch (error) {
            console.log(error);
        }
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
            <div>
                <div className="bg-input/60 py-1 px-3 rounded-xl">
                    <div className="text-sm font-bold">
                        {comment.commentatorInfo.lastName} {comment.commentatorInfo.firstName}
                    </div>
                    {comment.content && (
                        <div className="text-sm whitespace-pre-line break-all max-w-[32rem]">{comment.content}</div>
                    )}
                </div>
                {comment.image && (
                    <PhotoProvider>
                        <PhotoView src={comment.image}>
                            <Image
                                className="object-container h-40 w-fit rounded-xl border mt-1"
                                src={comment.image}
                                width={800}
                                height={800}
                                alt=""
                            />
                        </PhotoView>
                    </PhotoProvider>
                )}
                <div className="flex text-sm text-gray">
                    <span>3 giờ</span>
                    <div
                        className="relative ms-3 cursor-pointer"
                        onMouseEnter={() => setShowListReactions(true)}
                        onMouseLeave={() => setShowListReactions(false)}
                    >
                        Thích
                        <div
                            className={cn(
                                `absolute flex -top-9 left-0 bg-background py-1 px-2 gap-x-2 border shadow-md rounded-full transition-opacity duration-300 ease-in-out ${
                                    showListReactions
                                        ? 'opacity-100 visibility-visible'
                                        : 'visibility-hidden opacity-0 pointer-events-none'
                                }`,
                                styles['comment-list-reactions'],
                            )}
                        >
                            {Object.keys(postReactionType).map((reactionType) => {
                                const Icon = PostReactionTypeIcon[reactionType];
                                return (
                                    <div
                                        className="w-7"
                                        key={reactionType}
                                        onClick={() => handleReactToComment(reactionType as PostReactionNameType)}
                                    >
                                        <Icon width={28} height={28} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                {comment.commentChild && comment.commentChild.length > 0 && (
                    <div>
                        {comment.commentChild.map((commentChild: CommentType) => (
                            <Comment comment={commentChild} key={`comment-${commentChild.commentId}`} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default function Post({ postInfo }: { postInfo: PostInfoType }) {
    const t = useTranslations();
    const socket = useSocket();

    const [isShowPostDialog, setIsShowPostDialog] = useState(false);
    const handleShowDialogPost = () => setIsShowPostDialog(true);
    const handleHideDialogPost = () => setIsShowPostDialog(false);

    const [comments, setComments] = useState<CommentType[]>([]);
    const [pageComment, setPageComment] = useState(1);
    const [contentWriteComment, setContentWriteComment] = useState('');
    const [imageWriteComment, setImageWriteComment] = useState<string | null>();
    const [imageUploadWriteComment, setImageUploadWriteComment] = useState<File | null>();

    const [postReactions, setPostReactions] = useState<PostReactionType[]>(postInfo.reactions);
    const [mostReactions, setMostReactions] = useState<PostReactionNameType[]>([]);
    const [currentReaction, setCurrentReaction] = useState<PostReactionNameType | null>(null);

    useEffect(() => {
        const _reactions = groupBy(postReactions, 'reactionType');
        const mostReactions = sortBy(_reactions, 'length').reverse();

        if (mostReactions.length > 0) {
            setMostReactions([mostReactions[0][0].reactionType]);
            if (mostReactions.length > 1) {
                setMostReactions((prev) => [...prev, mostReactions[1][0].reactionType]);
            }
        } else {
            setMostReactions([]);
        }
    }, [postReactions]);

    useEffect(() => {
        if (postInfo.currentReactionType) setCurrentReaction(postInfo.currentReactionType);
    }, [postInfo.currentReactionType]);

    useEffect(() => {
        const handleNewReactions = ({ postId, newReactions }: { postId: string; newReactions: PostReactionType[] }) => {
            if (postInfo.postId === postId) {
                setPostReactions(newReactions);
            }
        };

        socket.on('reactToPost', handleNewReactions);

        return () => {
            socket.off('reactToPost', handleNewReactions);
        };
    }, [postInfo.postId, socket]);

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
                imageUrl = await uploadToCloudinary(imageUploadWriteComment);
            }
            handleClearFile();
            setContentWriteComment('');
            await sendCommentService({
                postId: postInfo.postId,
                content: contentWriteComment.trim(),
                image: imageUrl,
            });
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const getComments = async () => {
            try {
                const res = await getCommentsService({
                    postId: postInfo.postId,
                    page: pageComment,
                });
                setComments(
                    res.data.map((comment) => {
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
                        };
                    }),
                );
            } catch (error) {
                console.log(error);
            }
        };

        if (isShowPostDialog) {
            getComments();
        }
    }, [isShowPostDialog, postInfo.postId, pageComment]);

    return (
        <div className="bg-background rounded-xl px-2 py-2 mb-4">
            <PostContent
                postInfo={postInfo}
                postReactions={postReactions}
                mostReactions={mostReactions}
                currentReaction={currentReaction}
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
                        setCurrentReaction={setCurrentReaction}
                        handleShowDialogPost={handleShowDialogPost}
                    />
                    <div className="border-t pt-1">
                        {comments?.map((comment: CommentType) => (
                            <Comment comment={comment} key={`comment-${comment.commentId}`} />
                        ))}
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
                                className={`mt-1 ${contentWriteComment.trim() && 'fill-primary text-primary'}`}
                                onClick={handleSendComment}
                            />
                        </div>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
