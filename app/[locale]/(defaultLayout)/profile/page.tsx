'use client';

import Image from 'next/image';
import { ImageSquare, Newspaper, Student, Users } from '@phosphor-icons/react';
import Post from '@/app/components/Post';
import { PostInfoType } from '@/app/dataType';
import { useEffect, useState } from 'react';
import { BriefcaseBusiness, House, Images, Pencil } from 'lucide-react';
import WritePost from '@/app/components/WritePost';
import { useAppSelector } from '@/lib/hooks';
import { selectUserInfo } from '@/lib/slices/userSlice';
import { getMyPostsService } from '@/lib/services/postService';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';

export default function Profile() {
    const userInfo = useAppSelector(selectUserInfo);
    const [posts, setPosts] = useState<PostInfoType[]>([]);
    const [postsPage, setPostsPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const { observerTarget } = useInfiniteScroll({
        callback: () => setPostsPage((prev) => prev + 1),
        threshold: 0.5,
        loading,
    });

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const { data } = await getMyPostsService(postsPage);
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
        })();
    }, [postsPage]);

    return (
        <div
            className="min-h-[calc(100vh-4rem)] bg-fixed"
            style={{
                backgroundImage: 'url("/images/background.png")',
            }}
        >
            <div className="max-w-[1024px] mx-auto">
                <div
                    className="bg-norepeat bg-center relative h-36 rounded-ee-lg rounded-es-lg drop-shadow-xl"
                    style={{
                        background: 'url("/images/logo.png")',
                    }}
                >
                    <div className="flex items-center absolute -bottom-6 left-6">
                        <Image
                            className="w-32 h-32 rounded-full me-3 border"
                            src="/images/default-avatar.png"
                            width={800}
                            height={800}
                            alt="avatar"
                        />
                        <div className="text-3xl -translate-y-4 font-semibold text-background drop-shadow-2xl">
                            {userInfo.lastName} {userInfo.firstName}
                        </div>
                    </div>
                    <div className="bg-background w-fit rounded-full p-2 absolute bottom-4 right-2 cursor-pointer">
                        <Pencil className="w-4 h-4" />
                    </div>
                </div>
                <div className="w-full flex items-center bg-background mt-10 rounded-xl">
                    <div className="py-2 px-6 flex items-center cursor-pointer hover:bg-primary rounded-xl hover:text-background">
                        <Newspaper className="me-2" />
                        Dòng thời gian
                    </div>
                    <div className="py-2 px-6 flex items-center cursor-pointer hover:bg-primary rounded-xl hover:text-background">
                        <Users className="me-2" />
                        Bạn bè
                    </div>
                    <div className="py-2 px-6 flex items-center cursor-pointer hover:bg-primary rounded-xl hover:text-background">
                        <ImageSquare className="me-2" />
                        Ảnh
                    </div>
                </div>
            </div>

            <div className="max-w-[1024px] mx-auto flex gap-10 mt-6">
                <div className="w-[26rem] bg-background py-2 px-4 h-fit rounded-xl">
                    <div className="font-semibold text-xl">Giới thiệu</div>
                    <div className="flex items-center mt-3">
                        <Newspaper className="text-primary w-6 h-6 me-2" />6 Bài viết
                    </div>
                    <div className="flex items-center mt-3">
                        <Images className="text-primary w-6 h-6 me-2" />8 ảnh
                    </div>
                    <div className="flex items-center mt-3">
                        <House className="text-primary w-6 h-6 me-2" />
                        Sống tại Hà Nội
                    </div>
                    <div className="flex items-center mt-3">
                        <BriefcaseBusiness className="text-primary w-6 h-6 me-2" />
                        Làm việc tại Usol
                    </div>
                    <div className="flex items-center mt-3">
                        <Student className="text-primary w-6 h-6 me-2" />
                        Học tại HaUI
                    </div>
                </div>
                <div className="flex-1 justify-end">
                    <WritePost />
                    <div className="mt-4">
                        {posts.map((post: PostInfoType) => (
                            <Post key={`post-${post.postId}`} postInfo={post} />
                        ))}
                    </div>
                    <div ref={observerTarget} className="h-10"></div>
                </div>
            </div>
        </div>
    );
}
