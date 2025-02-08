'use client';

import { useEffect, useRef, useState } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '@/lib/store';
import { getMyInfoService } from '@/lib/services/userService';
import { setInfo } from '@/lib/slices/usersSlice';
import { getPostReactionTypesService } from '@/lib/services/postService';
import { setPostReactionType } from '@/lib/slices/reactionTypeSlice';
import { getNotificationsService } from '@/lib/services/notificationService';
import { addFriendRequestNotification } from '@/lib/slices/notificationSlice';
import { getFriendRequestCountService } from '@/lib/services/relationshipService';

export default function AppProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const storeRef = useRef<AppStore | null>(null);
    if (!storeRef.current) {
        storeRef.current = makeStore();
    }

    useEffect(() => {
        (async () => {
            try {
                const [userInfoRes, postReactionsRes, notificationsRes, friendRequestCountRes] = await Promise.all([
                    getMyInfoService(),
                    getPostReactionTypesService(),
                    getNotificationsService(),
                    getFriendRequestCountService(),
                ]);

                storeRef.current?.dispatch(setInfo(userInfoRes.data));
                storeRef.current?.dispatch(setPostReactionType(postReactionsRes.data));

                const { FRIEND_REQUEST } = notificationsRes.data;
                storeRef.current?.dispatch(addFriendRequestNotification(FRIEND_REQUEST));

                storeRef.current?.dispatch(
                    setInfo({
                        friendRequestCount: friendRequestCountRes.data,
                    }),
                );
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    if (isLoading) return null;

    return <Provider store={storeRef.current}>{children}</Provider>;
}
