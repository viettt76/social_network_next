'use client';

import { useAppDispatch } from '@/lib/hooks';
import { socket } from '@/lib/socket';
import { createContext, ReactNode, useContext, useEffect } from 'react';
import CallProvider from './CallProvider';
import { addNotification, NotificationType } from '@/lib/slices/notificationSlice';
import { addFriendRequestCount } from '@/lib/slices/userSlice';

const SocketContext = createContext(socket);

export default function SocketProvider({ children }: { children: ReactNode }) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        socket.connect();

        const handleNewFriendRequest = (newFriendRequest) => {
            const { friendRequestId, userId, firstName, lastName, avatar, notificationId, content, createdAt } =
                newFriendRequest;
            dispatch(addFriendRequestCount());
            dispatch(
                addNotification({
                    notificationId,
                    actorId: userId,
                    actorFirstName: firstName,
                    actorLastName: lastName,
                    actorAvatar: avatar,
                    type: NotificationType.FRIEND_REQUEST,
                    referenceId: friendRequestId,
                    content,
                    isRead: false,
                    createdAt,
                }),
            );
        };

        socket.on('newFriendRequest', handleNewFriendRequest);

        return () => {
            socket.off('newFriendRequest', handleNewFriendRequest);
            socket.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            <CallProvider />
            {children}
        </SocketContext.Provider>
    );
}

export const useSocket = () => useContext(SocketContext);
