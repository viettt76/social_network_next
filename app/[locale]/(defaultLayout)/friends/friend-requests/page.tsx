'use client';

import { useSocket } from '@/app/components/SocketProvider';
import { UserInfoType } from '@/app/dataType';
import useFetch from '@/hooks/useFetch';
import { useAppDispatch } from '@/lib/hooks';
import {
    acceptFriendRequestService,
    getFriendRequestsService,
    deleteFriendRequestService,
} from '@/lib/services/relationshipService';
import { minusFriendRequestCount } from '@/lib/slices/userSlice';
import { AxiosError } from 'axios';
import { UserCheck, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type FriendRequestType = UserInfoType & {
    friendRequestId: string;
};

export default function FriendRequests() {
    const socket = useSocket();
    const dispatch = useAppDispatch();

    const [friendRequests, setFriendRequests] = useState<FriendRequestType[]>([]);
    const [page, setPage] = useState(1);

    const { data, loading } = useFetch(getFriendRequestsService(page));

    useEffect(() => {
        setFriendRequests(data || []);
    }, [data]);

    useEffect(() => {
        const handleNewFriendRequest = (newFriendRequest) => {
            setFriendRequests((prev) => [newFriendRequest, ...prev]);
        };

        socket.on('newFriendRequest', handleNewFriendRequest);

        return () => {
            socket.off('newFriendRequest', handleNewFriendRequest);
        };
    }, [socket, dispatch]);

    const handleAcceptFriendRequest = async ({
        friendRequestId,
        senderId,
    }: {
        friendRequestId: string;
        senderId: string;
    }) => {
        try {
            setFriendRequests((prev) => prev.filter((fr) => fr.friendRequestId != friendRequestId));
            await acceptFriendRequestService({
                friendRequestId,
                senderId,
            });
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
            setFriendRequests((prev) => prev.filter((fr) => fr.friendRequestId != friendRequestId));
            dispatch(minusFriendRequestCount());
            await deleteFriendRequestService(friendRequestId);
        } catch (error) {
            if (error instanceof AxiosError && error.status === 404) {
                toast.error(error.response?.data.message, {
                    duration: 2500,
                });
            }
            console.error(error);
        }
    };

    if (loading) return null;

    return (
        <>
            {friendRequests.length > 0 ? (
                <div className="mt-4 grid grid-cols-2 gap-x-10 gap-y-2">
                    {friendRequests.map((friendRequest: FriendRequestType) => {
                        return (
                            <div
                                className="flex shadow-sm p-2 border-t rounded-lg"
                                key={`friend-request-${friendRequest.userId}`}
                            >
                                <Image
                                    className="rounded-full w-10 h-10 border"
                                    src={friendRequest.avatar || '/images/default-avatar.png'}
                                    alt="avatar"
                                    width={800}
                                    height={800}
                                />
                                <div className="ms-2 font-semibold flex-1">
                                    {friendRequest.lastName} {friendRequest.firstName}
                                </div>
                                <UserCheck
                                    className="float-end w-4 h-5 text-primary cursor-pointer"
                                    onClick={() =>
                                        handleAcceptFriendRequest({
                                            friendRequestId: friendRequest.friendRequestId,
                                            senderId: friendRequest.userId,
                                        })
                                    }
                                />
                                <X
                                    className="ms-2 float-end w-5 h-5 text-destructive cursor-pointer"
                                    onClick={() => handleRefuseFriendRequest(friendRequest.friendRequestId)}
                                />
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center text-primary text-sm mt-4 w-full">Bạn không có lời mời kết bạn nào</div>
            )}
        </>
    );
}
