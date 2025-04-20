'use client';

import { Film, Newspaper } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Source } from '@/lib/services/movieService';

const MENU_ITEMS = [
    { href: '/', icon: Newspaper, label: 'Bản tin' },
    { href: '/saved', icon: Newspaper, label: 'Bài viết đã lưu' },
];

const EXPLORE_ITEMS = [{ href: `/movie?source=${Source.OPHIM}`, icon: Film, label: 'Phim' }];

export default function Sidebar() {
    return (
        <div className="bg-background h-fit sticky top-[72px] px-2 py-2 rounded-lg w-64">
            {MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                    <Link
                        href={item.href}
                        className="flex items-center py-2 px-4 hover:bg-secondary rounded-lg hover:text-primary cursor-pointer"
                        key={`menu-item-${item.label}`}
                    >
                        <Icon className="me-3 w-6 h-6 text-primary" />
                        <div>{item.label}</div>
                    </Link>
                );
            })}
            <div className="text-gray mt-2">Khám phá</div>
            {EXPLORE_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                    <Link
                        href={item.href}
                        className="flex items-center py-2 px-4 hover:bg-secondary rounded-lg hover:text-primary cursor-pointer"
                        key={`menu-item-${item.label}`}
                    >
                        <Icon className="me-3 w-6 h-6 text-primary" />
                        <div>{item.label}</div>
                    </Link>
                );
            })}
        </div>
    );
}
