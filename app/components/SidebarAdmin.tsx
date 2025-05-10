'use client';

import { CircleX, LayoutList, UserRoundCog } from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';

const MENU_SETTINGS = [
    { href: '/admin/manage-posts', icon: LayoutList, label: 'Quản lý bài viết' },
    { href: '/admin/rejected-posts', icon: CircleX, label: 'Bài viết đã từ chối' },
    { href: '/admin/manage-users', icon: UserRoundCog, label: 'Quản lý người dùng' },
];

export default function SidebarAdmin() {
    const pathname = usePathname();

    return (
        <div className="bg-background h-fit sticky top-[86px] px-2 py-2 rounded-lg w-80 space-y-1">
            <div className="text-lg font-semibold mb-3 text-center uppercase">Trang quản trị</div>

            {/* <label
                className="fixed left-2 none ms-2 mt-2 w-12 h-12 bg-gray items-center justify-center rounded-full shadow-lg"
                htmlFor="checkbox-show-sidebar-friend"
            >
                <AlignJustifyIcon className="text-lg" />
            </label>
            <input className="" type="checkbox" id="checkbox-show-sidebar-friend" />
            <div className="">
                <Link
                    href="/admin/manage-posts"
                    // className={clsx(styles['sidebar-item'], {
                    //     [[styles['active']]]: location.pathname.toLowerCase() === '/admin/manage-post',
                    // })}
                >
                    Quản lý bài viết
                </Link>
            </div> */}
            {MENU_SETTINGS.map((item) => {
                const Icon = item.icon;

                return (
                    <Link
                        href={item.href}
                        className={cn(
                            'flex items-center py-2 px-4 hover:bg-secondary rounded-lg hover:text-primary cursor-pointer',
                            pathname === item.href && 'bg-gray/10',
                        )}
                        key={`setting-item-${item.label}`}
                    >
                        <Icon className="me-3 w-6 h-6 text-primary" />
                        <div className={`${pathname === item.href && 'text-primary'}`}>{item.label}</div>
                    </Link>
                );
            })}
        </div>
    );
}
