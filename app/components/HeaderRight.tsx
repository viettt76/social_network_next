'use client';

import { CaretDown, UserPlus, SignOut, Gear } from '@phosphor-icons/react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { Link, useRouter } from '@/i18n/routing';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { resetInfo, Role, selectUserInfo } from '@/lib/slices/userSlice';
import { logoutService } from '@/lib/services/authService';
import { useState } from 'react';
import RecentConversations from './RecentConversations';
import SystemNotification from './SystemNotification';
import { toast } from 'sonner';
import { BadgeCheck } from 'lucide-react';

export default function HeaderRight({ isDarkMode }: { isDarkMode?: boolean }) {
    const { theme, setTheme } = useTheme();

    const dispatch = useAppDispatch();
    const router = useRouter();

    const userInfo = useAppSelector(selectUserInfo);

    const [showUserDashboard, setShowUserDashboard] = useState(false);

    const [showConfirmLogout, setShowConfirmLogout] = useState(false);

    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

    const handleHideUserDashboard = () => setShowUserDashboard(false);

    const handleLogout = async () => {
        try {
            await logoutService();
            dispatch(resetInfo());
            router.push('/login');
        } catch (error) {
            toast.error('Có lỗi xảy ra. Vui lòng thực hiện lại!', {
                duration: 2500,
            });
            console.error(error);
        }
    };
    return (
        <div className="flex items-center justify-end gap-x-6 w-64">
            <Link href="/friends/suggestions">
                <UserPlus className={isDarkMode ? 'text-white' : 'text-ring'} />
            </Link>
            <RecentConversations className={isDarkMode ? 'text-white' : ''} />
            <SystemNotification className={isDarkMode ? 'text-white' : ''} />
            <DropdownMenu modal={false} open={showUserDashboard} onOpenChange={setShowUserDashboard}>
                <DropdownMenuTrigger asChild>
                    <div className="flex items-center cursor-pointer">
                        <Image
                            className={`rounded-full w-7 h-7 border ${isDarkMode && 'border-white'}`}
                            src="/images/default-avatar.png"
                            alt="avatar"
                            width={800}
                            height={800}
                        />
                        <CaretDown className={`w-4 h-4 ${isDarkMode ? 'text-white' : 'text-ring'}`} />
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel onClick={handleHideUserDashboard}>
                        <Link className="flex items-center" href="/profile">
                            <Image
                                className="w-8 h-8 rounded-full border me-2"
                                src={userInfo.avatar || '/images/default-avatar.png'}
                                alt="avatar"
                                width={800}
                                height={800}
                            />
                            Trang cá nhân
                        </Link>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem>
                        <Link href="/settings/profile" className="flex items-center" onClick={handleHideUserDashboard}>
                            <div className="w-6">
                                <Gear className="w-5 h-5" />
                            </div>
                            Cài đặt
                        </Link>
                    </DropdownMenuItem>

                    {userInfo.role === Role.ADMIN && (
                        <DropdownMenuItem>
                            <Link
                                href="/admin/manage-posts"
                                className="flex items-center"
                                onClick={handleHideUserDashboard}
                            >
                                <div className="w-6">
                                    <BadgeCheck className="w-5 h-5" />
                                </div>
                                Trang admin
                            </Link>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                        <div className="flex items-center">
                            <div className="w-6">
                                <SignOut className="w-5 h-5" />
                            </div>
                            Đăng xuất
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            {/* <Dialog open={showConfirmLogout} onOpenChange={setShowConfirmLogout}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Bạn có chắc muốn đăng xuất</DialogTitle>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowConfirmLogout(false)}>
                            Huỷ
                        </Button>
                        <Button variant="destructive" onClick={handleLogout}>
                            Đăng xuất
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog> */}
            {/* <button
                onClick={toggleTheme}
                className="relative w-12 h-6 bg-muted rounded-full transition-all duration-300 flex items-center justify-between px-1"
            >
                {theme === 'dark' ? (
                    <Moon className="absolute top-1 right-1 w-4 h-4" />
                ) : (
                    <Sun className="absolute color-red top-1 left-1 w-4 h-4" />
                )}
            </button> */}
        </div>
    );
}
