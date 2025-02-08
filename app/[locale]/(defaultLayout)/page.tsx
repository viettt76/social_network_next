'use client';

import Post from '@/app/components/Post';
import Sidebar from '@/app/components/Sidebar';
import SuggestionsPanel from '@/app/components/SuggestionsPanel';
import { PostInfoType } from '@/app/dataType';
import WritePost from '@/app/components/WritePost';
import { getPostsService } from '@/lib/services/postService';
import { Link } from '@/i18n/routing';
import { useEffect, useRef, useState } from 'react';

export default function Home() {
    const [posts, setPosts] = useState<PostInfoType[]>([]);
    const observerTarget = useRef(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isNoNewPost, setIsNoNewPost] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await getPostsService(page);
                if (res.data.length > 0) {
                    setPosts((prev) => [
                        ...prev,
                        ...res.data.map((post: any) => ({
                            postId: post.postId,
                            creatorInfo: post.posterInfo,
                            content: post.content,
                            currentReactionType: post.currentReactionType,
                            images: post.pictures.map((picture: any) => picture.pictureUrl),
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
                            createdAt: post.createdAt,
                        })),
                    ]);
                    setLoading(false);
                } else {
                    setIsNoNewPost(true);
                }
            } catch (error) {
                console.log(error);
            }
        })();
    }, [page]);

    // Sets up an IntersectionObserver to load more content when the target element is visible and not loading
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading) {
                    setPage((prev) => prev + 1);
                }
            },
            { threshold: 0.5 },
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [loading]);

    return (
        <div className="bg-secondary">
            <div className="flex max-w-[1024px] mx-auto relative gap-x-6 pt-2">
                <Sidebar />
                <div className="flex-1">
                    <WritePost />
                    <div className="mt-3">
                        {posts.length > 0 ? (
                            <>
                                {posts.map((post: PostInfoType) => (
                                    <Post key={`post-${post.postId}`} postInfo={post} />
                                ))}
                                {isNoNewPost && (
                                    <Link
                                        href="/friends/suggestions"
                                        className="text-sm text-primary block text-center underline"
                                    >
                                        Hãy kết bạn thêm để xem nhiều bài viết hơn
                                    </Link>
                                )}
                                <div ref={observerTarget} className="h-20"></div>
                            </>
                        ) : (
                            !loading && (
                                <Link
                                    href="/friends/suggestions"
                                    className="text-sm text-primary block text-center underline"
                                >
                                    Hãy kết bạn thêm để xem nhiều bài viết hơn
                                </Link>
                            )
                        )}
                    </div>
                </div>
                <SuggestionsPanel />
            </div>
        </div>
    );
}
