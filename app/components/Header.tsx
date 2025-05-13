'use client';

import { MagnifyingGlass } from '@phosphor-icons/react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useEffect, useRef, useState } from 'react';
import useDebounce from '@/hooks/useDebounce';
import { searchService } from '@/lib/services/userService';
import { UserInfoType } from '@/app/dataType';
import useClickOutside from '@/hooks/useClickOutside';
import HeaderRight from './HeaderRight';

export default function Header() {
    const [width, setWidth] = useState(0);
    const parentRef = useRef<HTMLDivElement | null>(null);
    const headerRef = useRef<HTMLDivElement | null>(null);

    const [keyword, setKeyword] = useState('');
    const [showSearchResult, setShowSearchResult] = useState(false);
    const [searchResult, setSearchResult] = useState<UserInfoType[]>([]);

    const keywordDebounced = useDebounce(keyword, 400);

    const searchRef = useRef<HTMLDivElement | null>(null);
    useClickOutside(searchRef, () => setShowSearchResult(false));

    useEffect(() => {
        (async () => {
            try {
                if (keywordDebounced) {
                    const { data } = await searchService(keywordDebounced);
                    setSearchResult(data);
                } else {
                    setSearchResult([]);
                }
            } catch (error) {
                console.error(error);
            }
        })();
    }, [keywordDebounced]);

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

    const handleShowSearchResult = () => setShowSearchResult(true);

    return (
        <div ref={parentRef} className="w-full">
            <div ref={headerRef} className="h-16 bg-background shadow-sm fixed top-0 left-0 z-50" style={{ width }}>
                <div className="max-w-[1024px] h-full mx-auto flex items-center gap-x-6">
                    <div className="w-64">
                        <Link href="/" className="block w-fit">
                            <Image src="/images/logo.png" width={50} height={50} alt="logo" />
                        </Link>
                    </div>
                    <div
                        ref={searchRef}
                        className="relative flex-1 flex border rounded-3xl items-center pe-4 h-fit bg-input"
                    >
                        <input
                            className="w-full rounded-3xl px-4 py-2 border-none outline-none bg-transparent"
                            value={keyword}
                            placeholder="Tìm kiếm"
                            onChange={(e) => setKeyword(e.target.value)}
                            onFocus={handleShowSearchResult}
                        />
                        <MagnifyingGlass />
                        {searchResult.length > 0 && showSearchResult && (
                            <div className="absolute top-[calc(100%+0.4rem)] left-0 right-0 rounded-lg bg-background p-1 border shadow-all-sides">
                                {searchResult.map((r, index) => (
                                    <Link
                                        href={`/profile/${r.userId}`}
                                        className="flex items-center gap-x-2 px-2 py-1 rounded-lg hover:bg-gray/10"
                                        key={`result-${index}`}
                                        onClick={() => {
                                            setKeyword('');
                                            setShowSearchResult(false);
                                        }}
                                    >
                                        <Image
                                            className="rounded-full border w-9 h-9"
                                            src={r.avatar || '/images/default-avatar.png'}
                                            width={2000}
                                            height={2000}
                                            alt="avatar"
                                        />
                                        <div className="font-semibold">
                                            {r.lastName} {r.firstName}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <HeaderRight />
                </div>
            </div>
            <div className="h-16"></div>
        </div>
    );
}
