'use client';

import { useAppDispatch } from '@/lib/hooks';
import { addFriendRequestNotification, FriendRequestType } from '@/lib/slices/notificationSlice';
import { socket } from '@/lib/socket';
import { createContext, ReactNode, useContext, useEffect } from 'react';
import CallProvider from './CallProvider';

const SocketContext = createContext(socket);

export default function SocketProvider({ children }: { children: ReactNode }) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        socket.connect();

        const handleNewFriendRequest = (newFriendRequestNotification: FriendRequestType) => {
            dispatch(addFriendRequestNotification(newFriendRequestNotification));
        };

        socket.on('newFriendRequestNotification', handleNewFriendRequest);

        return () => {
            socket.off('newFriendRequestNotification', handleNewFriendRequest);
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
