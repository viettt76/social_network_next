'use client';

import Post from '@/app/components/Post';
import Sidebar from '@/app/components/Sidebar';
import SuggestionsPanel from '@/app/components/SuggestionsPanel';
import { PostInfoType } from '@/app/dataType';
import { useState } from 'react';

export default function Home() {
    const [posts, setPosts] = useState<PostInfoType[]>([
        {
            postId: '1',
            creatorInfo: {
                userId: '1',
                firstName: 'Vân',
                lastName: 'Vũ',
                avatar: 'https://kynguyenlamdep.com/wp-content/uploads/2022/08/anh-anime-toc-hong-cute.jpg',
            },
            content: `Lưu ý: Bật unoptimized sẽ tắt toàn bộ tối ưu hóa hình ảnh của Next.js, khiến ứng dụng không sử dụng CDN
                của Next.js cho hình ảnh. Với cách sử dụng fill, bạn có thể vừa giữ được tính năng tối ưu của Next.js,
                vừa tránh phải đặt thủ công width và height.`,
            pictures: [
                'https://kynguyenlamdep.com/wp-content/uploads/2022/08/anh-anime-toc-hong-cute.jpg',
                '/images/logo.png',
                '/images/default-avatar.png',
                '/images/default-avatar.png',
                '/images/default-avatar.png',
            ],
        },
        {
            postId: '2',
            creatorInfo: {
                userId: '1',
                firstName: 'Vân',
                lastName: 'Vũ',
                avatar: 'https://kynguyenlamdep.com/wp-content/uploads/2022/08/anh-anime-toc-hong-cute.jpg',
            },
            content: `Lưu ý: Bật unoptimized sẽ tắt toàn bộ tối ưu hóa hình ảnh của Next.js, khiến ứng dụng không sử dụng CDN
                của Next.js cho hình ảnh. Với cách sử dụng fill, bạn có thể vừa giữ được tính năng tối ưu của Next.js,
                vừa tránh phải đặt thủ công width và height.`,
            pictures: [
                'https://kynguyenlamdep.com/wp-content/uploads/2022/08/anh-anime-toc-hong-cute.jpg',
                '/images/logo.png',
                '/images/default-avatar.png',
                '/images/default-avatar.png',
                '/images/default-avatar.png',
            ],
        },
    ]);

    return (
        <div className="bg-secondary">
            <div className="flex max-w-[1024px] mx-auto relative gap-x-6 pt-2">
                <Sidebar />
                <div className="h-[3000px] flex-1">
                    {posts.map((post: PostInfoType) => (
                        <Post key={`post-${post.postId}`} postInfo={post} />
                    ))}
                </div>
                <SuggestionsPanel />
            </div>
        </div>
    );
}
