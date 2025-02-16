'use client';

import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '@/lib/store';
import { getMyInfoService } from '@/lib/services/userService';
import { setInfo } from '@/lib/slices/userSlice';
import { getPostReactionTypesService } from '@/lib/services/postService';
import { setPostReactionType } from '@/lib/slices/reactionTypeSlice';
import { getNotificationsService } from '@/lib/services/notificationService';
import { addFriendRequestNotification } from '@/lib/slices/notificationSlice';
import { getFriendRequestCountService, getFriendsService } from '@/lib/services/relationshipService';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectLoadingApp } from '@/lib/slices/loadingSlice';
import { Spinner } from 'flowbite-react';
import { addFriends } from '@/lib/slices/relationshipSlice';

const LoadingScreen = () => {
    const isLoadingApp = useAppSelector(selectLoadingApp);

    if (!isLoadingApp) return null;

    return (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-[999999]">
            <Spinner size="xl" />
        </div>
    );
};

const AppInitializer = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        (async () => {
            try {
                const [userInfoRes, postReactionsRes, notificationsRes, friendRequestCountRes, friendsRes] =
                    await Promise.all([
                        getMyInfoService(),
                        getPostReactionTypesService(),
                        getNotificationsService(),
                        getFriendRequestCountService(),
                        getFriendsService(),
                    ]);

                dispatch(setInfo(userInfoRes.data));
                dispatch(setPostReactionType(postReactionsRes.data));

                const { FRIEND_REQUEST } = notificationsRes.data;
                dispatch(addFriendRequestNotification(FRIEND_REQUEST));

                dispatch(
                    setInfo({
                        friendRequestCount: friendRequestCountRes.data,
                    }),
                );
                dispatch(
                    addFriends(
                        friendsRes.data.map((friend: any) => ({
                            userId: friend.id,
                            firstName: friend.firstName,
                            lastName: friend.lastName,
                            avatar: friend.avatar,
                        })),
                    ),
                );
            } catch (error) {
                console.log(error);
            }
        })();
    }, [dispatch]);

    return null;
};

export default function AppProvider({ children }: { children: React.ReactNode }) {
    const storeRef = useRef<AppStore | null>(null);
    if (!storeRef.current) {
        storeRef.current = makeStore();
    }

    return (
        <Provider store={storeRef.current}>
            <AppInitializer />
            <LoadingScreen />
            {children}
        </Provider>
    );
}
