import { PlusCircle, UserCirclePlus } from '@phosphor-icons/react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useEffect, useState } from 'react';
import { UserInfoType } from '@/app/dataType';
import { getSuggestionsService, sendFriendRequestService } from '@/lib/services/relationshipService';
import useFetch from '@/hooks/useFetch';

export default function SuggestionsPanel() {
    const [suggestions, setSuggestions] = useState<UserInfoType[]>([]);
    const [page, setPage] = useState(1);

    const { data, loading } = useFetch(getSuggestionsService(page));

    useEffect(() => {
        setSuggestions(data || []);
    }, [data]);

    const handleSendFriendRequest = async (receiverId: string) => {
        try {
            setSuggestions((prev) => prev.filter((s) => s.userId != receiverId));
            await sendFriendRequestService(receiverId);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="w-64 sticky top-[72px] h-screen overflow-auto max-md:hidden">
            <div className="bg-background rounded-xl py-2 px-2">
                <div className="flex justify-between items-center">
                    <div className="text-sm">Bạn bè được đề xuất</div>
                    <Link href="/friends/suggestions" tabIndex={-1} className="text-sm text-primary font-medium">
                        Xem tất cả
                    </Link>
                </div>
                <div>
                    {suggestions.slice(0, 4).map((s) => (
                        <div className="flex justify-between items-center mt-2 gap-4" key={`suggestion-${s.userId}`}>
                            <Link tabIndex={-1} href={`/profile/${s.userId}`} className="flex items-center">
                                <Image
                                    className="min-w-10 w-10 min-h-10 h-10 rounded-full me-2 border"
                                    src={s.avatar || '/images/default-avatar.png'}
                                    width={800}
                                    height={800}
                                    alt="avatar"
                                />
                                <div className="text-sm text-primary font-semibold mt-1">
                                    {s.lastName} {s.firstName}
                                </div>
                            </Link>
                            <div className="cursor-pointer p-1" onClick={() => handleSendFriendRequest(s.userId)}>
                                <UserCirclePlus />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* <div className="bg-background rounded-xl py-2 px-2 mt-2">
                <div className="flex justify-between items-center">
                    <div className="text-sm">Trang được đề xuất</div>
                    <Link href="/page/suggestions" tabIndex={-1} className="text-sm text-primary font-medium">
                        Xem tất cả
                    </Link>
                </div>
                <div>
                    <div className="flex justify-between items-center mt-2 gap-4">
                        <Link tabIndex={-1} href="profile" className="flex">
                            <Image
                                className="min-w-10 w-10 min-h-10 h-10 rounded-full me-2"
                                src="https://kynguyenlamdep.com/wp-content/uploads/2022/08/anh-anime-toc-hong-cute.jpg"
                                width={800}
                                height={800}
                                alt="avatar"
                            />
                            <div className="text-sm text-primary font-semibold mt-1">Duyên Thuỳ</div>
                        </Link>
                        <div className="cursor-pointer p-1">
                            <PlusCircle />
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-2 gap-4">
                        <Link tabIndex={-1} href="profile" className="flex">
                            <Image
                                className="min-w-10 w-10 min-h-10 h-10 rounded-full me-2"
                                src="https://kynguyenlamdep.com/wp-content/uploads/2022/08/anh-anime-toc-hong-cute.jpg"
                                width={800}
                                height={800}
                                alt="avatar"
                            />
                            <div className="text-sm text-primary font-semibold mt-1">Duyên Thuỳ</div>
                        </Link>
                        <div className="cursor-pointer p-1">
                            <PlusCircle />
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-2 gap-4">
                        <Link tabIndex={-1} href="profile" className="flex">
                            <Image
                                className="min-w-10 w-10 min-h-10 h-10 rounded-full me-2"
                                src="https://kynguyenlamdep.com/wp-content/uploads/2022/08/anh-anime-toc-hong-cute.jpg"
                                width={800}
                                height={800}
                                alt="avatar"
                            />
                            <div className="text-sm text-primary font-semibold mt-1">Duyên Thuỳ</div>
                        </Link>
                        <div className="cursor-pointer p-1">
                            <PlusCircle />
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-2 gap-4">
                        <Link tabIndex={-1} href="profile" className="flex">
                            <Image
                                className="min-w-10 w-10 min-h-10 h-10 rounded-full me-2"
                                src="https://kynguyenlamdep.com/wp-content/uploads/2022/08/anh-anime-toc-hong-cute.jpg"
                                width={800}
                                height={800}
                                alt="avatar"
                            />
                            <div className="text-sm text-primary font-semibold mt-1">Duyên Thuỳ</div>
                        </Link>
                        <div className="cursor-pointer p-1">
                            <PlusCircle />
                        </div>
                    </div>
                </div>
            </div> */}
        </div>
    );
}
