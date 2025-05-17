'use client';

import { UserInfoType } from '@/app/dataType';
import { Link } from '@/i18n/routing';
import { useAppDispatch } from '@/lib/hooks';
import {
    acceptFriendRequestService,
    deleteFriendRequestService,
    sendFriendRequestService,
} from '@/lib/services/relationshipService';
import { searchService } from '@/lib/services/userService';
import { addFriends } from '@/lib/slices/relationshipSlice';
import { minusFriendRequestCount } from '@/lib/slices/userSlice';
import { AxiosError } from 'axios';
import { Reply, UserCheck, UserRoundPlus, X } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type SearchResultType = UserInfoType & {
    relationshipId: string | null;
    friendRequestAsSenderId: string | null;
    friendRequestAsReceiverId: string | null;
};

export default function SearchResult() {
    const { keyword } = useParams<{ keyword: string }>();
    const dispatch = useAppDispatch();

    const [searchResult, setSearchResult] = useState<SearchResultType[]>([]);

    useEffect(() => {
        (async () => {
            try {
                if (keyword) {
                    const { data } = await searchService(keyword);
                    setSearchResult(data);
                } else {
                    setSearchResult([]);
                }
            } catch (error) {
                console.error(error);
            }
        })();
    }, [keyword]);

    const handleSendFriendRequest = async (receiverId: string) => {
        try {
            const { data } = await sendFriendRequestService(receiverId);
            setSearchResult((prev) =>
                prev.map((r) => ({
                    ...r,
                    friendRequestAsSenderId: r.userId === receiverId ? data.friendRequestId : r.friendRequestAsSenderId,
                })),
            );
        } catch (error) {
            console.error(error);
        }
    };

    const handleAcceptFriendRequest = async ({
        friendRequestId,
        senderId,
        senderFirstName,
        senderLastName,
        senderAvatar,
    }: {
        friendRequestId: string;
        senderId: string;
        senderFirstName: string;
        senderLastName: string;
        senderAvatar?: string | null;
    }) => {
        try {
            const { data } = await acceptFriendRequestService({
                friendRequestId,
                senderId,
            });
            dispatch(
                addFriends({
                    userId: senderId,
                    firstName: senderFirstName,
                    lastName: senderLastName,
                    avatar: senderAvatar,
                }),
            );
            setSearchResult((prev) =>
                prev.map((r) => ({
                    ...r,
                    relationshipId: r.userId === senderId ? data.relationshipId : r.relationshipId,
                    friendRequestAsReceiverId: r.userId === senderId ? null : r.friendRequestAsReceiverId,
                })),
            );
        } catch (error) {
            if (error instanceof AxiosError && error.status === 404) {
                toast.error(error.response?.data.message, {
                    duration: 2500,
                });
            }
            console.error(error);
        }
    };

    const handleRefuseFriendRequest = async (friendRequestId: string) => {
        try {
            dispatch(minusFriendRequestCount());
            await deleteFriendRequestService(friendRequestId);
            setSearchResult((prev) =>
                prev.map((r) => ({
                    ...r,
                    friendRequestAsReceiverId:
                        r.friendRequestAsReceiverId === friendRequestId ? null : r.friendRequestAsReceiverId,
                })),
            );
        } catch (error) {
            if (error instanceof AxiosError && error.status === 404) {
                toast.error(error.response?.data.message, {
                    duration: 2500,
                });
            }
            console.error(error);
        }
    };

    const handleRevokeRequest = async (friendRequestId: string) => {
        try {
            await deleteFriendRequestService(friendRequestId);
            setSearchResult((prev) =>
                prev.map((r) => ({
                    ...r,
                    friendRequestAsSenderId:
                        r.friendRequestAsSenderId === friendRequestId ? null : r.friendRequestAsSenderId,
                })),
            );
        } catch (error) {
            if (error instanceof AxiosError && error.status === 404) {
                toast.info(error.response?.data.message, {
                    duration: 2500,
                });
            }
            console.error(error);
        }
    };

    return (
        <div className="flex justify-center py-3">
            <div className="flex flex-col w-[30rem] gap-y-2">
                {searchResult.map((r, index) => (
                    <div
                        className="flex items-center gap-x-2 py-1 rounded-lg hover:bg-gray/10 w-full"
                        key={`result-${index}`}
                    >
                        <div className="flex-1">
                            <Link href={`/profile/${r.userId}`} className="flex items-center gap-x-2 w-fit px-2">
                                <Image
                                    className="rounded-full border w-12 h-12"
                                    src={r.avatar || '/images/default-avatar.png'}
                                    width={2000}
                                    height={2000}
                                    alt="avatar"
                                />
                                <div className="font-semibold">
                                    {r.lastName} {r.firstName}
                                </div>
                            </Link>
                        </div>
                        <div className="me-2">
                            {r.friendRequestAsReceiverId && (
                                <div className="flex">
                                    <UserCheck
                                        className="float-end w-4 h-5 text-primary cursor-pointer"
                                        onClick={() =>
                                            handleAcceptFriendRequest({
                                                friendRequestId: r.friendRequestAsReceiverId!,
                                                senderId: r.userId,
                                                senderFirstName: r.firstName,
                                                senderLastName: r.lastName,
                                                senderAvatar: r.avatar,
                                            })
                                        }
                                    />
                                    <X
                                        className="ms-2 float-end w-5 h-5 text-destructive cursor-pointer"
                                        onClick={() => handleRefuseFriendRequest(r.friendRequestAsReceiverId!)}
                                    />
                                </div>
                            )}
                            {r.friendRequestAsSenderId && (
                                <Reply
                                    className="ms-2 float-end w-5 h-5 text-destructive cursor-pointer"
                                    onClick={() => handleRevokeRequest(r.friendRequestAsSenderId!)}
                                />
                            )}
                            {!r.relationshipId && !r.friendRequestAsReceiverId && !r.friendRequestAsSenderId && (
                                <UserRoundPlus
                                    className="float-end w-4 h-4 text-primary cursor-pointer"
                                    onClick={() => handleSendFriendRequest(r.userId)}
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
