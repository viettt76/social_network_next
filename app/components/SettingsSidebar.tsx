'use client';

import { UserPen } from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';

const MENU_SETTINGS = [
    { href: '/settings/profile', icon: UserPen, label: 'Chỉnh sửa hồ sơ' },
    { href: '/settings/account', icon: UserPen, label: 'Tài khoản' },
];

export default function SettingsSidebar() {
    const pathname = usePathname();

    return (
        <div className="bg-background h-fit sticky top-[72px] px-2 py-2 rounded-lg w-64 space-y-1">
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
