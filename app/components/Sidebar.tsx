'use client';

import { Newspaper } from 'lucide-react';
import Link from 'next/link';

export default function Sidebar() {
    return (
        <div className="bg-background h-fit sticky top-[72px] px-2 py-2 rounded-lg w-60">
            <Link
                href=""
                className="flex items-center py-2 px-4 hover:bg-secondary rounded-lg hover:text-primary cursor-pointer"
            >
                <Newspaper className="me-3 text-primary" />
                <div>Bản tin</div>
            </Link>
            <Link
                href=""
                className="flex items-center py-2 px-4 hover:bg-secondary rounded-lg hover:text-primary cursor-pointer"
            >
                <Newspaper className="me-3 text-primary" />
                <div>Blog của tôi</div>
            </Link>
            <Link
                href=""
                className="flex items-center py-2 px-4 hover:bg-secondary rounded-lg hover:text-primary cursor-pointer"
            >
                <Newspaper className="me-3 text-primary" />
                <div>Bài viết đã lưu</div>
            </Link>
            <Link href="" className="text-gray mt-2">
                Khám phá
            </Link>
            <Link
                href=""
                className="flex items-center py-2 px-4 hover:bg-secondary rounded-lg hover:text-primary cursor-pointer"
            >
                <Newspaper className="me-3 text-primary" />
                <div>Người dùng</div>
            </Link>
            <Link
                href=""
                className="flex items-center py-2 px-4 hover:bg-secondary rounded-lg hover:text-primary cursor-pointer"
            >
                <Newspaper className="me-3 text-primary" />
                <div>Trang</div>
            </Link>
            <Link
                href=""
                className="flex items-center py-2 px-4 hover:bg-secondary rounded-lg hover:text-primary cursor-pointer"
            >
                <Newspaper className="me-3 text-primary" />
                <div>Nhóm</div>
            </Link>
            <Link
                href=""
                className="flex items-center py-2 px-4 hover:bg-secondary rounded-lg hover:text-primary cursor-pointer"
            >
                <Newspaper className="me-3 text-primary" />
                <div>Phim</div>
            </Link>
        </div>
    );
}
