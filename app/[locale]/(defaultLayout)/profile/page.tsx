'use client';

import { Student } from '@phosphor-icons/react';
import Post from '@/app/components/Post';
import { PostInfoType } from '@/app/dataType';
import { useEffect, useState } from 'react';
import { BriefcaseBusiness, Cake, House } from 'lucide-react';
import WritePost from '@/app/components/WritePost';
import { useAppSelector } from '@/lib/hooks';
import { selectUserInfo } from '@/lib/slices/userSlice';
import { getPostsByUserIdService } from '@/lib/services/postService';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import { format } from 'date-fns';
import { useSocket } from '@/app/components/SocketProvider';

export default function Profile() {
    const userInfo = useAppSelector(selectUserInfo);

    const socket = useSocket();

    const [posts, setPosts] = useState<PostInfoType[]>([]);
    const [postsPage, setPostsPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const formatDate = (date: string | Date | null, dateFormat = 'dd/MM/yyyy') => {
        if (!date) return null;
        return format(new Date(date), dateFormat);
    };

    const userOverview = [
        { icon: House, value: userInfo.hometown },
        { icon: BriefcaseBusiness, value: userInfo.workplace },
        { icon: Student, value: userInfo.school },
        {
            icon: Cake,
            value: formatDate(userInfo.birthday),
        },
    ];

    const { observerTarget } = useInfiniteScroll({
        callback: () => setPostsPage((prev) => prev + 1),
        threshold: 0.5,
        loading,
    });

    // Get my posts
    useEffect(() => {
        const getMyPosts = async () => {
            setLoading(true);
            try {
                const { data } = await getPostsByUserIdService({ userId: userInfo.id, page: postsPage });
                if (data.length > 0) {
                    setPosts((prev) => [
                        ...prev,
                        ...data.map((post: any) => ({
                            postId: post.postId,
                            creatorInfo: post.posterInfo,
                            content: post.content,
                            currentReactionType: post.currentReactionType,
                            images: post.images.map((image: any) => image.imageUrl),
                            reactions: post.reactions.map((reaction: any) => ({
                                postReactionId: reaction.id,
                                reactionType: reaction.reactionType,
                                userInfo: {
                                    userId: reaction.user.id,
                                    firstName: reaction.user.firstName,
                                    lastName: reaction.user.lastName,
                                    avatar: reaction.user.avatar,
                                },
                            })),
                            commentsCount: Number(post.commentsCount),
                            createdAt: post.createdAt,
                        })),
                    ]);
                    setLoading(false);
                }
            } catch (error) {
                console.error(error);
            }
        };
        if (userInfo.id) {
            getMyPosts();
        }
    }, [postsPage, userInfo.id]);

    // Socket handle new post
    useEffect(() => {
        const handleNewPost = (newPost) => {
            const { postId, creatorId, creatorFirstName, creatorLastName, creatorAvatar, content, images, createdAt } =
                newPost;

            setPosts((prev) => {
                if (prev.find((p) => p.postId === postId)) return prev;

                return [
                    {
                        postId,
                        creatorInfo: {
                            userId: creatorId,
                            firstName: creatorFirstName,
                            lastName: creatorLastName,
                            avatar: creatorAvatar,
                        },
                        content,
                        currentReactionType: null,
                        images,
                        reactions: [],
                        commentsCount: 0,
                        createdAt,
                    },
                    ...prev,
                ];
            });
        };

        socket.on('myNewPost', handleNewPost);

        return () => {
            socket.off('myNewPost', handleNewPost);
        };
    }, [socket]);

    // Socket handle delete post
    useEffect(() => {
        const handleDeletePost = (postId: string) => {
            setPosts((prev) => prev.filter((p) => p.postId !== postId));
        };

        socket.on('deletePost', handleDeletePost);

        return () => {
            socket.off('deletePost', handleDeletePost);
        };
    }, [socket]);

    return (
        <div className="flex gap-10 mt-6">
            <div className="w-[26rem] bg-background py-2 px-4 h-fit rounded-xl">
                <div className="font-semibold text-xl">Giới thiệu</div>
                {userOverview.every((item) => item.value) ? (
                    userOverview.map((item, index) => {
                        const Icon = item.icon;
                        return item.value ? (
                            <div key={`item-${index}`} className="flex items-center mt-3">
                                <Icon className="text-primary w-6 h-6 me-2" />
                                {item.value}
                            </div>
                        ) : null;
                    })
                ) : (
                    <div className="text-primary text-center mt-2">Chưa có thông tin giới thiệu</div>
                )}
            </div>
            <div className="flex-1 justify-end">
                <WritePost />
                {posts.length > 0 && (
                    <>
                        <div className="mt-4">
                            {posts.map((post: PostInfoType) => (
                                <Post key={`post-${post.postId}`} postInfo={post} />
                            ))}
                        </div>
                        <div ref={observerTarget} className="h-10"></div>
                    </>
                )}
            </div>
        </div>
    );
}
