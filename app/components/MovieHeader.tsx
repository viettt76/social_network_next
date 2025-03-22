'use client';

import { BellRinging, CaretDown, Moon, MagnifyingGlass, Sun, UserPlus, SignOut } from '@phosphor-icons/react';
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
import { resetInfo } from '@/lib/slices/userSlice';
import { logoutService } from '@/lib/services/authService';
import { useEffect, useRef, useState } from 'react';
import { AlignJustify, ChevronRight } from 'lucide-react';
import { Drawer } from 'flowbite-react';
import RecentConversations from './RecentConversations';
import useDebounce from '@/hooks/useDebounce';
import { searchMovieService, Source } from '@/lib/services/movieService';
import { BaseMovieData } from '@/app/dataType';
import useClickOutside from '@/hooks/useClickOutside';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AutoLink from '@/app/components/AutoLink';
import { useSearchParams } from 'next/navigation';

export default function MovieHeader() {
    const { theme, setTheme } = useTheme();
    const dispatch = useAppDispatch();
    const { toast } = useToast();
    const router = useRouter();

    const searchParams = useSearchParams();
    const source = Number(searchParams.get('source'));

    const [isOpenSidebarModal, setIsOpenSidebarModal] = useState(false);

    const handleShowSidebarModal = () => setIsOpenSidebarModal(true);
    const handleCloseSidebarModal = () => setIsOpenSidebarModal(false);

    const [width, setWidth] = useState(0);
    const parentRef = useRef<HTMLDivElement | null>(null);
    const headerRef = useRef<HTMLDivElement | null>(null);

    const [showUserDashboard, setShowUserDashboard] = useState(false);

    const [searchValue, setSearchValue] = useState('');
    const [showSearchResult, setShowSearchResult] = useState(false);
    const [searchResult, setSearchResult] = useState<{
        movies: BaseMovieData[];
        totalItems: number;
    }>({ movies: [], totalItems: 0 });

    const keywordSearch = useDebounce(searchValue, 400);

    const searchRef = useRef<HTMLDivElement | null>(null);

    const [isMobile, setIsMobile] = useState(false);

    const [showGenreList, setShowGenreList] = useState(false);
    const [showCountryList, setShowCountryList] = useState(false);

    useEffect(() => {
        const updateSide = () => {
            if (parentRef.current && headerRef.current) {
                setWidth(parentRef.current.offsetWidth);
            }
            setIsMobile(window.innerWidth < 576 ? true : false);
        };

        updateSide();
        window.addEventListener('resize', updateSide);

        return () => {
            window.removeEventListener('resize', updateSide);
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
            console.error(error);
        }
    };

    const handleShowSearchResult = () => setShowSearchResult(true);
    const handleHideSearchResult = () => setShowSearchResult(false);

    useClickOutside(searchRef, handleHideSearchResult);

    useEffect(() => {
        (async () => {
            try {
                if (keywordSearch) {
                    const data = await searchMovieService(source, keywordSearch);
                    setSearchResult({
                        movies: data.movies,
                        totalItems: data.totalItems,
                    });
                } else {
                    setSearchResult({
                        movies: [],
                        totalItems: 0,
                    });
                }
            } catch (error) {
                console.error(error);
            }
        })();
    }, [keywordSearch, source]);

    return (
        <div ref={parentRef} className="w-full">
            <div ref={headerRef} className="h-16 bg-[#0a0a0a] shadow-sm fixed top-0 left-0 z-50" style={{ width }}>
                <div className="absolute top-0 left-5 h-full flex items-center justify-center">
                    <AlignJustify className="text-white" onClick={handleShowSidebarModal} />
                </div>
                {isOpenSidebarModal && (
                    <Drawer
                        open={isOpenSidebarModal}
                        onClose={handleCloseSidebarModal}
                        className="bg-[#0a0a0a] border-r border-[#2d2d2d]"
                    >
                        <Drawer.Items className="flex flex-col gap-y-3">
                            <div className="flex gap-x-4">
                                <Link
                                    className={`${source === Source.OPHIM ? 'text-[#ff7c22]' : 'text-white'}`}
                                    href={`/movie?source=${Source.OPHIM}`}
                                    onClick={handleCloseSidebarModal}
                                >
                                    Server 1
                                </Link>
                                <Link
                                    className={`${source === Source.KKPHIM ? 'text-[#ff7c22]' : 'text-white'}`}
                                    href={`/movie?source=${Source.KKPHIM}`}
                                    onClick={handleCloseSidebarModal}
                                >
                                    Server 2
                                </Link>
                            </div>

                            <AutoLink
                                href="/movie/favorites"
                                className="text-white block"
                                onClick={handleCloseSidebarModal}
                            >
                                Phim yêu thích
                            </AutoLink>
                            <TooltipProvider>
                                <Tooltip open={isMobile ? showGenreList : undefined} onOpenChange={setShowGenreList}>
                                    <TooltipTrigger
                                        asChild
                                        onClick={() => isMobile && setShowGenreList((prev) => !prev)}
                                    >
                                        <div className="text-white flex items-center w-fit">
                                            Thể loại <ChevronRight />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side={isMobile ? 'bottom' : 'right'}
                                        align="start"
                                        className="bg-[#2d2d2d] border-[#2d2d2d] border w-fit px-4 py-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4"
                                    >
                                        {JSON.parse(sessionStorage.getItem('genreList') ?? '[]').map((g: any) => (
                                            <AutoLink
                                                href={`/movie/genre/${g.slug}`}
                                                className="text-white hover:text-orange-400 text-sm"
                                                key={`genre-${g.slug}`}
                                                onClick={handleCloseSidebarModal}
                                            >
                                                {g.name}
                                            </AutoLink>
                                        ))}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip
                                    open={isMobile ? showCountryList : undefined}
                                    onOpenChange={setShowCountryList}
                                >
                                    <TooltipTrigger
                                        asChild
                                        onClick={() => isMobile && setShowCountryList((prev) => !prev)}
                                    >
                                        <div className="text-white flex items-center w-fit">
                                            Quốc gia <ChevronRight />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side={isMobile ? 'bottom' : 'right'}
                                        align="start"
                                        className="bg-[#2d2d2d] border-[#2d2d2d] border w-fit px-4 py-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4"
                                    >
                                        {JSON.parse(sessionStorage.getItem('countryList') ?? '[]').map((g: any) => (
                                            <AutoLink
                                                href={`/movie/country/${g.slug}`}
                                                className="text-white hover:text-orange-400 text-sm"
                                                key={`country-${g.slug}`}
                                                onClick={handleCloseSidebarModal}
                                            >
                                                {g.name}
                                            </AutoLink>
                                        ))}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </Drawer.Items>
                    </Drawer>
                )}
                <div className="max-w-[1024px] h-full mx-auto flex items-center gap-x-6">
                    <div className="w-64 flex items-center gap-x-4">
                        <AutoLink href="/" className="block w-fit">
                            <Image src="/images/logo.png" width={50} height={50} alt="logo" />
                        </AutoLink>
                        <AutoLink
                            href={`/movie`}
                            className="block w-fit px-2 text-white hover:text-orange-400 hover:underline"
                        >
                            Trang chủ
                        </AutoLink>
                    </div>
                    <div ref={searchRef} className="flex-1 flex rounded-3xl items-center pe-4 h-fit bg-white relative">
                        <input
                            value={searchValue}
                            className="w-full rounded-3xl px-4 py-2 border-none outline-none bg-transparent text-black"
                            placeholder="Tìm kiếm phim"
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') router.push(`/movie/search?keyword=${searchValue}`);
                            }}
                            onFocus={handleShowSearchResult}
                        />
                        <MagnifyingGlass className="text-black" />
                        {searchResult.movies.length > 0 && showSearchResult && (
                            <div
                                className={`py-1 flex flex-col bg-white rounded-sm shadow-all-sides ${
                                    isMobile
                                        ? 'fixed top-[calc(3.8rem)] left-2 right-2 '
                                        : 'absolute top-[calc(100%+0.3rem)] left-0 right-0'
                                }`}
                            >
                                {searchResult.totalItems > 0 && (
                                    <AutoLink
                                        href={`/movie/search?keyword=${searchValue}`}
                                        className="text-primary text-sm px-4 mb-1"
                                    >
                                        Xem tất cả
                                    </AutoLink>
                                )}
                                {searchResult.movies.slice(0, 10).map((r) => (
                                    <AutoLink
                                        href={`/movie/${r.slug}`}
                                        className="text-black px-4 line-clamp-1 break-all"
                                        key={`result-${r.movieId}`}
                                        onClick={() => {
                                            handleHideSearchResult();
                                            setSearchValue('');
                                        }}
                                    >
                                        {r.name}
                                    </AutoLink>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center justify-around w-64">
                        <AutoLink href="/friends/suggestions">
                            <UserPlus className="text-white" />
                        </AutoLink>
                        <RecentConversations className="text-white" />
                        <BellRinging className="text-white" />
                        <DropdownMenu modal={false} open={showUserDashboard} onOpenChange={setShowUserDashboard}>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center cursor-pointer">
                                    <Image
                                        className="rounded-full w-7 h-7 border border-white"
                                        src="/images/default-avatar.png"
                                        alt="avatar"
                                        width={800}
                                        height={800}
                                    />
                                    <CaretDown className="w-4 h-4 text-white" />
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                <DropdownMenuLabel onClick={() => setShowUserDashboard(false)}>
                                    <AutoLink href="/profile">My Account</AutoLink>
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
