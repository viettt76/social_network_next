'use client';

import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { getConversationWithFriendService, getGroupConversationsService } from '@/lib/services/conversationService';
import {
    ConversationType,
    focusConversationPopup,
    maximizeConversation,
    openChatWithMessage,
    openConversation,
    selectOpenConversations,
} from '@/lib/slices/conversationSlice';
import { selectFriends } from '@/lib/slices/relationshipSlice';
import { Minus, Plus } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { GroupConversationType, UserInfoType } from '@/app/dataType';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import MessengerPopup from './MessengerPopup';
import { useSocket } from './SocketProvider';
import { selectUserInfo } from '@/lib/slices/userSlice';
import useClickOutside from '@/hooks/useClickOutside';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MAX_OPEN_POPUPS = 2;

export default function ConversationBubbles() {
    const dispatch = useAppDispatch();
    const openConversations = useAppSelector(selectOpenConversations);
    const userInfo = useAppSelector(selectUserInfo);
    const friends = useAppSelector(selectFriends);
    const socket = useSocket();

    const [groups, setGroups] = useState<GroupConversationType[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const res = await getGroupConversationsService();
                setGroups(
                    res.data.map((g) => ({
                        conversationId: g.conversationId,
                        type: g.type,
                        name: g.name,
                        avatar: g.avatar,
                    })),
                );
            } catch (error) {
                console.error(error);
            }
        })();
    }, []);

    const friendListRef = useRef<HTMLDivElement>(null);

    const [showFriendList, setShowFriendList] = useState(false);

    const [openConversationIndexs, setOpenConversationIndexs] = useState<number[]>([]);

    // Socket handle new message
    useEffect(() => {
        const handleNewMessage = (newMessage: any) => {
            const { conversationId, conversationName, conversationType, sender } = newMessage;
            if (sender.userId !== userInfo.id) {
                dispatch(
                    openChatWithMessage({
                        conversationId,
                        type: conversationType,
                        friendId: sender.userId,
                        name:
                            conversationType === ConversationType.PRIVATE
                                ? `${sender.lastName} ${sender.firstName}`
                                : conversationName,
                        avatar: sender.avatar,
                        unreadCount: 1,
                        isMinimized: false,
                        isFocus: false,
                        messages: [],
                    }),
                );
            }
        };

        socket.on('newMessage', handleNewMessage);

        return () => {
            socket.off('newMessage', handleNewMessage);
        };
    }, [socket, openConversations, dispatch, userInfo.id]);

    // Filter non-minimized conversations, limit to MAX_OPEN_POPUPS
    useEffect(() => {
        const items = openConversations.filter((c) => !c.isMinimized).slice(0, MAX_OPEN_POPUPS);
        setOpenConversationIndexs(items.map((item) => openConversations.findIndex((c) => c === item)));
    }, [openConversations]);

    const handleShowFriendList = () => setShowFriendList(true);
    const handleHideFriendList = () => setShowFriendList(false);

    useClickOutside(friendListRef, handleHideFriendList);

    const handleAddOpenConversation = async (friendInfo: UserInfoType) => {
        try {
            const res = await getConversationWithFriendService(friendInfo.userId);
            dispatch(
                openConversation({
                    conversationId: res.data?.conversationId,
                    name: `${friendInfo.lastName} ${friendInfo.firstName}`,
                    friendId: friendInfo.userId,
                    type: ConversationType.PRIVATE,
                    avatar: friendInfo.avatar,
                    unreadCount: 0,
                    isMinimized: false,
                    isFocus: true,
                    messages: [],
                }),
            );
            handleHideFriendList();
        } catch (error) {
            console.error(error);
        }
    };

    const handleOpenPopup = (conversationId: string) => {
        dispatch(focusConversationPopup(conversationId));
        dispatch(maximizeConversation(conversationId));
    };

    return (
        <div className="fixed top-20 right-2 z-[15]">
            <div
                className="p-2 bg-white text-black rounded-full border cursor-pointer"
                onClick={showFriendList ? handleHideFriendList : handleShowFriendList}
            >
                {showFriendList ? <Minus /> : <Plus />}
            </div>
            {showFriendList && (
                <div
                    ref={friendListRef}
                    className="z-[15] absolute top-12 right-0 bg-background border w-52 max-h-[26rem] overflow-y-auto p-2 rounded-xl shadow-md cursor-pointer"
                >
                    <Tabs defaultValue="friends" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="friends">Friends</TabsTrigger>
                            <TabsTrigger value="groups">Groups</TabsTrigger>
                        </TabsList>
                        <TabsContent value="friends">
                            <div className="flex flex-col gap-y-2">
                                {friends.length > 0 ? (
                                    friends.map((friend) => {
                                        return (
                                            <div
                                                className="flex items-center"
                                                key={`conversation-${friend.userId}`}
                                                onClick={() => handleAddOpenConversation(friend)}
                                            >
                                                <Image
                                                    className="rounded-full border w-8 h-8 object-cover border"
                                                    src={friend.avatar || '/images/default-avatar.png'}
                                                    alt="avatar"
                                                    width={800}
                                                    height={800}
                                                />
                                                <div className="ms-1 text-sm font-semibold flex-1 line-clamp-1 break-all">
                                                    {friend.lastName} {friend.firstName}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center text-sm font-semibold">Không có bạn</div>
                                )}
                            </div>
                        </TabsContent>
                        <TabsContent value="groups">
                            <div className="flex flex-col gap-y-2">
                                {groups.length > 0 ? (
                                    groups.map((group) => {
                                        return (
                                            <div
                                                className="flex items-center"
                                                key={`conversation-${group.conversationId}`}
                                                // onClick={() => handleAddOpenConversation(group)}
                                            >
                                                <Image
                                                    className="rounded-full border w-8 h-8 object-cover border"
                                                    src={group.avatar || '/images/default-avatar.png'}
                                                    alt="avatar"
                                                    width={800}
                                                    height={800}
                                                />
                                                <div className="ms-1 text-sm font-semibold flex-1 line-clamp-1 break-all">
                                                    {group.name}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center text-sm font-semibold">Không có nhóm</div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            )}
            {openConversations.map((conversation) => {
                return (
                    <div className="mt-2" key={`conversation-${conversation.conversationId || conversation.friendId}`}>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="relative">
                                        <Image
                                            className="rounded-full border w-10 h-10 object-cover"
                                            src={conversation.avatar || '/images/default-avatar.png'}
                                            alt="avatar"
                                            width={800}
                                            height={800}
                                            onClick={() =>
                                                handleOpenPopup(
                                                    conversation.conversationId || conversation.friendId || '',
                                                )
                                            }
                                        />
                                        {conversation.unreadCount > 0 && (
                                            <div className="absolute -bottom-1 right-0 text-white text-xs bg-red-400 rounded-full w-4 h-4 flex items-center justify-center">
                                                {conversation.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>{conversation.name}</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                );
            })}
            {openConversations.map((conversation, index) => {
                const key = `conversation-${conversation.conversationId || conversation.friendId}`;
                return (
                    <MessengerPopup
                        key={key}
                        index={openConversationIndexs.findIndex((c) => c === index)}
                        conversationId={conversation.conversationId}
                        type={conversation.type}
                        friendId={conversation.friendId}
                        name={conversation.name}
                        isMinimized={conversation.isMinimized}
                        isFocus={conversation.isFocus}
                        className={`${!openConversationIndexs.includes(index) && 'hidden'}`}
                    />
                );
            })}
        </div>
    );
}
