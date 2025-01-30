'use client';

import {
    BellRinging,
    CaretDown,
    Moon,
    MagnifyingGlass,
    Sun,
    UserPlus,
    ChatCenteredDots,
    SignOut,
} from '@phosphor-icons/react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { Link, useRouter } from '@/i18n/routing';
import { useAppDispatch } from '@/lib/hooks';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { resetInfo } from '@/lib/features/users/usersSlice';
import { logoutService } from '@/lib/services/authService';
import { useEffect, useRef, useState } from 'react';

export default function Header() {
    const { theme, setTheme } = useTheme();
    const dispatch = useAppDispatch();
    const { toast } = useToast();
    const router = useRouter();

    const [width, setWidth] = useState(0);
    const parentRef = useRef<HTMLDivElement | null>(null);
    const headerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const updateWidth = () => {
            if (parentRef.current && headerRef.current) {
                setWidth(parentRef.current.offsetWidth);
            }
        };

        window.addEventListener('resize', updateWidth);
        updateWidth();

        return () => {
            window.removeEventListener('resize', updateWidth);
        };
    }, []);

    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

    const handleLogout = async () => {
        try {
            await logoutService();
            dispatch(resetInfo());
            router.push('/login');
        } catch (error) {
            toast({
                title: 'Logout fail!',
            });
            console.log(error);
        }
    };

    return (
        <div ref={parentRef} className="w-full relative">
            <div ref={headerRef} className="h-16 bg-background shadow-sm fixed top-0 left-0 z-50" style={{ width }}>
                <div className="max-w-[1024px] h-full mx-auto flex items-center gap-x-6">
                    <div className="w-64">
                        <Link href="/">
                            <Image src="/images/logo.png" width={50} height={50} alt="logo" />
                        </Link>
                    </div>
                    <div className="flex-1 flex border rounded-3xl items-center pe-4 h-fit bg-input">
                        <input
                            className="w-full rounded-3xl px-4 py-2 border-none outline-none bg-transparent"
                            placeholder="Tìm kiếm"
                        />
                        <MagnifyingGlass />
                    </div>
                    <div className="flex items-center justify-around w-64">
                        <UserPlus className="text-ring" />
                        <ChatCenteredDots className="text-ring" />
                        <BellRinging className="text-ring" />
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center cursor-pointer">
                                    <Image
                                        className="rounded-full w-7 h-7"
                                        src="/images/default-avatar.png"
                                        alt="avatar"
                                        width={800}
                                        height={800}
                                    />
                                    <CaretDown className="w-4 h-4" />
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                <DropdownMenuLabel>
                                    <Link href="/profile">My Account</Link>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                                    <SignOut />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <button
                            onClick={toggleTheme}
                            className="relative w-12 h-6 bg-muted rounded-full transition-all duration-300 flex items-center justify-between px-1"
                        >
                            {theme === 'dark' ? (
                                <Moon className="absolute top-1 right-1 w-4 h-4" />
                            ) : (
                                <Sun className="absolute color-red top-1 left-1 w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
            <div className="h-16"></div>
        </div>
    );
}
