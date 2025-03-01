'use client';

import { UserInfoType } from '@/app/dataType';
import { getFriendsService, sendFriendRequestService } from '@/lib/services/relationshipService';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { UserRoundPlus } from 'lucide-react';
import { useAppSelector } from '@/lib/hooks';
import { selectFriends } from '@/lib/slices/relationshipSlice';
import { selectUserInfo } from '@/lib/slices/userSlice';

export default function ProfileOtherFriends() {
    const { userId } = useParams<{ userId: string }>();

    const myFriends = useAppSelector(selectFriends);
    const userInfo = useAppSelector(selectUserInfo);

    const [friends, setFriends] = useState<UserInfoType[]>([]);

    useEffect(() => {
        const getFriends = async () => {
            try {
                const { data } = await getFriendsService(userId);
                setFriends(
                    data.map((f) => ({
                        userId: f.id,
                        firstName: f.firstName,
                        lastName: f.lastName,
                        avatar: f.avatar,
                    })),
                );
            } catch (error) {
                console.error(error);
            }
        };
        if (userId) getFriends();
    }, [userId]);

    const handleSendFriendRequest = async (receiverId: string) => {
        try {
            await sendFriendRequestService(receiverId);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="mt-4 grid grid-cols-3 gap-x-10 gap-y-2">
            {friends.map((friend: UserInfoType) => {
                return (
                    <div
                        className="flex bg-background shadow-sm p-2 border-t rounded-lg"
                        key={`friend-request-${friend.userId}`}
                    >
                        <Image
                            className="rounded-full w-10 h-10 border"
                            src={friend.avatar || '/images/default-avatar.png'}
                            alt="avatar"
                            width={800}
                            height={800}
                        />
                        <div className="ms-2 font-semibold flex-1">
                            {friend.lastName} {friend.firstName}
                        </div>
                        {!(myFriends.find((f) => f.userId === friend.userId) || friend.userId === userInfo.id) && (
                            <UserRoundPlus
                                className="float-end w-4 h-4 text-primary cursor-pointer"
                                onClick={() => handleSendFriendRequest(friend.userId)}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
