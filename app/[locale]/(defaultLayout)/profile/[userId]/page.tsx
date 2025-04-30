'use client';

import { Student } from '@phosphor-icons/react';
import Post from '@/app/components/Post';
import { PostInfoType } from '@/app/dataType';
import { useEffect, useState } from 'react';
import { BriefcaseBusiness, Cake, House } from 'lucide-react';
import { BasicUserInformation } from '@/lib/slices/userSlice';
import { getPostsByUserIdService } from '@/lib/services/postService';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import { format } from 'date-fns';
import { useParams } from 'next/navigation';
import { getUserInfoService } from '@/lib/services/userService';

export default function ProfileOther() {
    const { userId } = useParams<{ userId: string }>();

    const [userInfo, setUserInfo] = useState<BasicUserInformation>();
    const [posts, setPosts] = useState<PostInfoType[]>([]);
    const [postsPage, setPostsPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const formatDate = (date: string | Date | null, dateFormat = 'dd/MM/yyyy') => {
        if (!date) return null;
        return format(new Date(date), dateFormat);
    };

    const userOverview = [
        { icon: House, value: userInfo?.hometown },
        { icon: BriefcaseBusiness, value: userInfo?.workplace },
        { icon: Student, value: userInfo?.school },
        {
            icon: Cake,
            value: formatDate(userInfo?.birthday || null),
        },
    ];

    const { observerTarget } = useInfiniteScroll({
        callback: () => setPostsPage((prev) => prev + 1),
        threshold: 0.5,
        loading,
    });

    // Get user information
    useEffect(() => {
        const getUserInformation = async () => {
            try {
                const { data } = await getUserInfoService(userId);
                setUserInfo({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    birthday: data.birthday,
                    gender: data.gender,
                    hometown: data.hometown,
                    school: data.school,
                    workplace: data.workplace,
                    avatar: data.avatar,
                    isPrivate: data.isPrivate,
                });
            } catch (error) {
                console.error(error);
            }
        };

        if (userId) getUserInformation();
    }, [userId]);

    // Get user posts
    useEffect(() => {
        const getPosts = async () => {
            setLoading(true);
            try {
                const { data } = await getPostsByUserIdService({ userId, page: postsPage });
                if (data.length > 0) {
                    setPosts((prev) => [
                        ...prev,
                        ...data.map((post: any) => ({
                            postId: post.postId,
                            creatorInfo: post.posterInfo,
                            isBookmarked: post.isBookmarked,
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
        if (userId) {
            getPosts();
        }
    }, [postsPage, userId]);

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
                {posts.length > 0 && (
                    <>
                        <div>
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
