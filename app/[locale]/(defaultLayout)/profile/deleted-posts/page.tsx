'use client';

import DeletedPostManagement from '@/app/components/DeletedPostManagement';
import { PostManagementType } from '@/app/dataType';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import { getDeletedPostsService, recoverPostService } from '@/lib/services/postService';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function DeletedPosts() {
    const [posts, setPosts] = useState<PostManagementType[]>([]);

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
                const res = await getDeletedPostsService(page);
                if (res.data.length > 0) {
                    setPosts((prev) => [
                        ...prev,
                        ...res.data
                            .filter((post: any) => !prev.find((p) => p.postId === post.postId))
                            .map((post: any) => ({
                                postId: post.postId,
                                creatorInfo: post.posterInfo,
                                content: post.content,
                                images: post.images.map((image: any) => image.imageUrl),
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

    const handleRecoverPost = async (postId: string) => {
        try {
            await recoverPostService(postId);
            toast.success('Khôi phục bài viết thành công', {
                duration: 2500,
            });
            setPosts((prev) => prev.filter((p) => p.postId !== postId));
        } catch (error) {
            console.error(error);
            toast.error('Khôi phục bài viết thất bại', {
                duration: 2500,
            });
        }
    };

    return (
        <div className="flex mt-6 gap-x-12">
            <div className="w-80 text-foreground text-xl font-semibold bg-background px-3 py-1 h-fit rounded-md">
                Bài viết đã xoá
            </div>
            <div className="flex-1">
                {posts.map((post) => (
                    <DeletedPostManagement
                        postInfo={post}
                        key={`post-${post.postId}`}
                        handleRecoverPost={handleRecoverPost}
                    />
                ))}
                <div ref={observerTarget} className="h-20"></div>
            </div>
        </div>
    );
}
