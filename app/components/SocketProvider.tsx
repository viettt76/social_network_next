'use client';

import { useAppDispatch } from '@/lib/hooks';
import { addFriendRequestNotification } from '@/lib/slices/notificationSlice';
import { socket } from '@/lib/socket';
import { createContext, ReactNode, useContext, useEffect } from 'react';

const SocketContext = createContext(socket);

export default function SocketProvider({ children }: { children: ReactNode }) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        socket.connect();

        socket.on('newFriendRequestNotification', (newFriendRequestNotification) => {
            dispatch(addFriendRequestNotification(newFriendRequestNotification));
        });

        return () => {
            socket.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export const useSocket = () => useContext(SocketContext);
