'use client';

import Post from '@/app/components/Post';
import { PostInfoType } from '@/app/dataType';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import { getBookmarkPostsService } from '@/lib/services/postService';
import { useEffect, useState } from 'react';

export default function Saved() {
    const [posts, setPosts] = useState<PostInfoType[]>([]);

    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);

    // Hook for infinite scrolling: Calls `increasePage` when the user scrolls near the bottom
    const { observerTarget } = useInfiniteScroll({
        callback: () => setPage((prev) => prev + 1),
        threshold: 0.5,
        loading,
    });

    // Get more posts when change page
    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await getBookmarkPostsService(page);
                if (res.data.length > 0) {
                    setPosts((prev) => [
                        ...prev,
                        ...res.data
                            .filter((post: any) => !prev.find((p) => p.postId === post.postId))
                            .map((post: any) => ({
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
        })();
    }, [page]);

    return (
        <div className="bg-secondary min-h-[calc(100vh-4rem)] bg-fixed">
            <div className="flex max-w-[1024px] mx-auto relative gap-x-6 pt-4 max-lg:gap-x-3">
                <div className="w-96 text-xl font-semibold">Bài viết đã lưu</div>
                <div className="flex-1 max-md:me-3">
                    {posts.map((post) => (
                        <Post postInfo={post} key={`post-${post.postId}`} />
                    ))}
                    <div ref={observerTarget} className="h-20"></div>
                </div>
            </div>
        </div>
    );
}
