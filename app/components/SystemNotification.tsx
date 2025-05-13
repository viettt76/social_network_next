import { Button } from '@/components/ui/button';
import useClickOutside from '@/hooks/useClickOutside';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { acceptFriendRequestService, deleteFriendRequestService } from '@/lib/services/relationshipService';
import { NotificationType, removeNotification, selectNotifications } from '@/lib/slices/notificationSlice';
import { minusFriendRequestCount } from '@/lib/slices/userSlice';
import { cn } from '@/lib/utils';
import { BellRinging } from '@phosphor-icons/react';
import { AxiosError } from 'axios';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

export default function SystemNotification({ className }: { className: string }) {
    const dispatch = useAppDispatch();
    const notifications = useAppSelector(selectNotifications);

    const [showNotifications, setShowNotifications] = useState(false);

    const systemNotificationRef = useRef<HTMLDivElement>(null);

    useClickOutside(systemNotificationRef, () => setShowNotifications(false));

    const handleAcceptFriendRequest = async ({
        notificationId,
        friendRequestId,
        senderId,
    }: {
        notificationId: string;
        friendRequestId: string;
        senderId: string;
    }) => {
        try {
            dispatch(removeNotification(notificationId));
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

    const handleRefuseFriendRequest = async ({
        notificationId,
        friendRequestId,
    }: {
        notificationId: string;
        friendRequestId: string;
    }) => {
        try {
            dispatch(minusFriendRequestCount());
            dispatch(removeNotification(notificationId));
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

    return (
        <div ref={systemNotificationRef} className={cn('relative', className)}>
            <BellRinging className="text-ring cursor-pointer" onClick={() => setShowNotifications(true)} />
            {notifications.length > 0 && (
                <div className="absolute -top-2 -right-2 text-background bg-destructive rounded-full text-sm w-4 h-4 flex justify-center items-center">
                    {notifications.length}
                </div>
            )}
            {showNotifications && (
                <div className="absolute top-[calc(100%+0.5rem)] right-1/2 translate-x-1/2 bg-white border shadow-all-sides w-80 rounded-lg">
                    <div className="font-semibold p-2 border-b">Thông báo</div>
                    {notifications.length > 0 ? (
                        <div className="flex flex-col">
                            {notifications.map((noti) => {
                                let content;

                                switch (noti.type) {
                                    case NotificationType.FRIEND_REQUEST:
                                        content = (
                                            <div className="flex gap-x-3">
                                                <Image
                                                    className="w-10 h-10 rounded-full border"
                                                    src={noti.actorAvatar || '/images/default-avatar.png'}
                                                    alt={`${noti.actorLastName} ${noti.actorFirstName}`}
                                                    width={2000}
                                                    height={2000}
                                                />
                                                <div>
                                                    <div dangerouslySetInnerHTML={{ __html: noti.content }}></div>
                                                    <div className="flex gap-x-3 mt-1">
                                                        <Button
                                                            onClick={() =>
                                                                handleAcceptFriendRequest({
                                                                    notificationId: noti.notificationId,
                                                                    friendRequestId: noti.referenceId,
                                                                    senderId: noti.actorId,
                                                                })
                                                            }
                                                        >
                                                            Chấp nhận
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            onClick={() =>
                                                                handleRefuseFriendRequest({
                                                                    notificationId: noti.notificationId,
                                                                    friendRequestId: noti.referenceId,
                                                                })
                                                            }
                                                        >
                                                            Từ chối
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                        break;
                                    default:
                                        content = <div dangerouslySetInnerHTML={{ __html: noti.content }}></div>;
                                }

                                return (
                                    <div
                                        className="px-2 py-2 cursor-pointer hover:bg-foreground/5"
                                        key={`notification-${noti.notificationId}`}
                                    >
                                        {content}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center p-4">Bạn không có thông báo nào</div>
                    )}
                </div>
            )}
        </div>
    );
}
