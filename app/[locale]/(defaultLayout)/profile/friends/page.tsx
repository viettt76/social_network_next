'use client';

import { UserInfoType } from '@/app/dataType';
import { unfriendService } from '@/lib/services/relationshipService';
import { UserRoundMinus } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from 'flowbite-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { removeFriend, selectFriends } from '@/lib/slices/relationshipSlice';

export default function ProfileFriends() {
    const dispatch = useAppDispatch();
    const friends = useAppSelector(selectFriends);

    const [friendInfoToUnfriend, setFriendInfoToUnfriend] = useState<UserInfoType>();
    const [showModalUnfriend, setShowModalUnfriend] = useState(false);

    const handleUnfriend = async () => {
        try {
            if (friendInfoToUnfriend?.userId) {
                dispatch(removeFriend(friendInfoToUnfriend.userId));
                setShowModalUnfriend(false);
                await unfriendService(friendInfoToUnfriend.userId);
            }
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
                        <Dialog open={showModalUnfriend} onOpenChange={setShowModalUnfriend}>
                            <DialogTrigger asChild>
                                <UserRoundMinus
                                    className="float-end w-4 h-5 text-primary cursor-pointer"
                                    onClick={() => setFriendInfoToUnfriend(friend)}
                                />
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                                <DialogTitle></DialogTitle>
                                <span className="whitespace-nowrap">
                                    Bạn có chắc chắn muốn huỷ kết bạn với{' '}
                                    <b>
                                        {friendInfoToUnfriend?.lastName} {friendInfoToUnfriend?.firstName}
                                    </b>
                                </span>
                                <DialogFooter>
                                    <Button color="failure" onClick={() => setShowModalUnfriend(false)}>
                                        Huỷ
                                    </Button>
                                    <Button color="blue" onClick={handleUnfriend}>
                                        Xác nhận
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                );
            })}
        </div>
    );
}
