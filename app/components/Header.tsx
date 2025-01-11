'use client';

import { BellRing, ChevronDown, MessagesSquare, Moon, Search, Sun, UserRoundPlus } from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { CaretIcon } from './Icons';

export default function Header() {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

    return (
        <div>
            <div className="h-16 bg-background shadow-sm fixed top-0 left-0 right-0 z-50">
                <div className="max-w-[1024px] h-full mx-auto flex items-center gap-x-6">
                    <div className="w-60">
                        <Link href="/">
                            <Image src="/images/logo.png" width={50} height={50} alt="logo" />
                        </Link>
                    </div>
                    <div className="flex-1 flex border rounded-3xl items-center pe-4 h-fit bg-input">
                        <input
                            className="w-full rounded-3xl px-4 py-2 border-none outline-none bg-transparent"
                            placeholder="Tìm kiếm"
                        />
                        <Search />
                    </div>
                    <div className="flex items-center justify-around w-60">
                        <UserRoundPlus className="text-ring" />
                        <MessagesSquare className="text-ring" />
                        <BellRing className="text-ring" />
                        <div className="flex items-center">
                            <Image
                                className="rounded-full"
                                src="/images/default-avatar.png"
                                alt="avatar"
                                width={25}
                                height={25}
                            />
                            <CaretIcon className="w-4 h-4" />
                        </div>
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
