'use client';

import { ChatCenteredDots } from '@phosphor-icons/react';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectUserInfo } from '@/lib/slices/userSlice';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, CircleCheck, Plus } from 'lucide-react';
import { createConversationService, getRecentConversationsService } from '@/lib/services/conversationService';
import { MessageType, MessengerType } from '@/app/dataType';
import useClickOutside from '@/hooks/useClickOutside';
import { ConversationType, openConversation } from '@/lib/slices/conversationSlice';
import { selectFriends } from '@/lib/slices/relationshipSlice';
import { useSocket } from './SocketProvider';
import { cn } from '@/lib/utils';

export default function RecentConversations({ className }: { className?: string }) {
    const dispatch = useAppDispatch();
    const socket = useSocket();

    const friends = useAppSelector(selectFriends);
    const userInfo = useAppSelector(selectUserInfo);

    const recentConversationsRef = useRef<HTMLDivElement>(null);
    const [showRecentConversations, setShowRecentConversations] = useState(false);
    const [recentConversations, setRecentConversations] = useState<MessengerType[]>([]);

    const [showAddGroup, setShowAddGroup] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [groupMembers, setGroupMembers] = useState<string[]>([]);

    // Get recent conversations
    useEffect(() => {
        const getRecentConversations = async () => {
            try {
                const res = await getRecentConversationsService();

                setRecentConversations(
                    res.data.map((c) => ({
                        conversationId: c.conversationId,
                        conversationName: c.conversationName,
                        conversationType: c.conversationType,
                        conversationAvatar: c.conversationAvatar,
                        lastMessage: {
                            messageId: c.lastMessageId,
                            conversationId: c.conversationId,
                            content: c.lastMessageContent,
                            messageType: c.lastMessageType,
                            sender: {
                                userId: c.senderId,
                                firstName: c.senderFirstName,
                                lastName: c.senderLastName,
                                avatar: c.senderAvatar,
                            },
                        },
                        lastUpdated: c.lastUpdated,
                        ...(c.conversationType === ConversationType.PRIVATE && {
                            friendId: c.friendId,
                        }),
                    })),
                );
            } catch (error) {
                console.error(error);
            }
        };
        if (showRecentConversations) {
            getRecentConversations();
        }
    }, [showRecentConversations]);

    // Socket handle new message to update recent conversation
    useEffect(() => {
        const handleNewMessage = (newMessage: any) => {
            const {
                messageId,
                conversationType,
                conversationName,
                conversationAvatar,
                conversationId,
                content,
                messageType,
                sender,
                lastUpdated,
            } = newMessage;

            setRecentConversations((prev) => {
                const conversationIndex = prev.findIndex((c) => c.conversationId === conversationId);
                const lastMessage = {
                    messageId,
                    conversationId,
                    content,
                    messageType,
                    sender,
                    currentReaction: null,
                    reactions: [],
                };

                if (conversationIndex !== -1) {
                    const updatedConversations = [...prev];
                    updatedConversations[conversationIndex] = {
                        ...updatedConversations[conversationIndex],
                        lastMessage,
                        lastUpdated,
                    };
                    return updatedConversations;
                } else {
                    return [
                        {
                            conversationId,
                            conversationName,
                            conversationType,
                            lastMessage,
                            lastUpdated,
                            ...(conversationType === ConversationType.PRIVATE
                                ? {
                                      conversationAvatar: sender.avatar,
                                      friendId: sender.userId,
                                  }
                                : {
                                      conversationAvatar,
                                  }),
                        },
                        ...prev,
                    ];
                }
            });
        };

        socket.on('newMessage', handleNewMessage);

        return () => {
            socket.off('newMessage', handleNewMessage);
        };
    }, [socket]);

    const handleShowRecentConversations = () => setShowRecentConversations(true);
    const handleHideRecentConversations = () => setShowRecentConversations(false);

    useClickOutside(recentConversationsRef, handleHideRecentConversations);

    const handleOpenMessengerPopup = (conversationInfo: {
        conversationId: string;
        type: ConversationType;
        friendId?: string;
        name: string;
        avatar?: string;
    }) => {
        const { conversationId, type, friendId, name, avatar } = conversationInfo;
        handleHideRecentConversations();
        dispatch(
            openConversation({
                conversationId,
                type,
                friendId,
                name,
                avatar,
                unreadCount: 0,
                messages: [],
                isMinimized: false,
                isFocus: true,
            }),
        );
    };

    const handleOpenAddGroup = () => setShowAddGroup(true);
    const handleCloseAddGroup = () => setShowAddGroup(false);

    const handleChangeGroupMembers = (friendId: string) => {
        setGroupMembers((prev) => {
            if (prev.some((m) => m === friendId)) {
                return prev.filter((m) => m !== friendId);
            } else {
                return [...prev, friendId];
            }
        });
    };

    const handleCreateGroup = async () => {
        try {
            await createConversationService({
                type: ConversationType.GROUP,
                name: groupName,
                participants: groupMembers,
            });
            handleCloseAddGroup();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="relative">
            <ChatCenteredDots
                className={cn('text-ring cursor-pointer', className)}
                onClick={handleShowRecentConversations}
            />
            {showRecentConversations && (
                <div
                    ref={recentConversationsRef}
                    className="absolute top-6 left-0 w-80 bg-background border shadow-md rounded-xl p-2"
                >
                    {showAddGroup ? (
                        <>
                            <div className="flex justify-between">
                                <ArrowLeft />
                                <span
                                    className={`${
                                        groupName && groupMembers.length >= 2
                                            ? 'text-primary cursor-pointer'
                                            : 'text-gray cursor-not-allowed'
                                    }`}
                                    onClick={() => groupName && groupMembers.length >= 2 && handleCreateGroup()}
                                >
                                    Tạo
                                </span>
                            </div>
                            <input
                                className="border px-2 py-1 rounded-3xl w-full mt-2"
                                placeholder="Tên nhóm"
                                onChange={(e) => setGroupName(e.target.value)}
                            />
                            <div className="mt-2">
                                <span className="font-semibold text-sm">Thành viên</span>
                                <input
                                    className="border px-2 py-1 text-sm placeholder:text-sm rounded-3xl w-full mt-2"
                                    placeholder="Tìm kiếm thành viên"
                                />
                                <div className="mt-2 flex flex-col gap-y-2">
                                    {friends.map((friend) => {
                                        return (
                                            <div className="flex items-center gap-x-2" key={`friend-${friend.userId}`}>
                                                <Image
                                                    className="w-8 h-8 rounded-full"
                                                    src={friend.avatar || '/images/default-avatar.png'}
                                                    alt="avatar"
                                                    width={800}
                                                    height={800}
                                                />
                                                <span className="font-semibold flex-1 line-clamp-1 break-all">
                                                    {friend.lastName} {friend.firstName}
                                                </span>
                                                <input
                                                    type="checkbox"
                                                    name="add-group-member"
                                                    onChange={() => handleChangeGroupMembers(friend.userId)}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-x-2 mb-4">
                                <input className="border px-2 py-1 rounded-3xl flex-1" placeholder="Tìm kiếm..." />
                                <Plus onClick={handleOpenAddGroup} />
                            </div>
                            <div className="flex flex-col gap-y-2">
                                {recentConversations.map((conversation) => {
                                    return (
                                        <div
                                            className="flex items-center gap-x-2"
                                            key={`recent-conversation-${conversation.conversationId}`}
                                            onClick={() =>
                                                handleOpenMessengerPopup({
                                                    conversationId: conversation.conversationId,
                                                    type: conversation.conversationType,
                                                    friendId: conversation.friendId,
                                                    name: conversation.conversationName,
                                                    avatar: conversation.conversationAvatar,
                                                })
                                            }
                                        >
                                            <Image
                                                className="w-10 h-10 object-cover rounded-full border"
                                                src={conversation.conversationAvatar || '/images/default-avatar.png'}
                                                alt="avatar"
                                                width={800}
                                                height={800}
                                            />
                                            <div className="flex-1">
                                                <div className="font-semibold text-sm">
                                                    {conversation.conversationName}
                                                </div>
                                                <div className="text-gray text-xs line-clamp-1 break-all overflow-x-hidden">
                                                    {conversation.conversationType === ConversationType.GROUP &&
                                                        conversation.lastMessage.sender.userId !== userInfo.id &&
                                                        `${conversation.lastMessage.sender.lastName} ${conversation.lastMessage.sender.firstName}: `}
                                                    {conversation.lastMessage.messageType === MessageType.TEXT
                                                        ? conversation.lastMessage.content
                                                        : `${
                                                              conversation.lastMessage.sender.userId === userInfo.id
                                                                  ? 'Bạn'
                                                                  : ''
                                                          } đã gửi 1 ảnh`}
                                                </div>
                                            </div>
                                            <div className="ms-6">
                                                <CircleCheck className="w-6 h-6 text-background fill-primary" />
                                                {/* <CircleCheck className="text-primary w-5 h-5" /> */}
                                                {/* <Image
                                className="w-5 h-5 object-cover rounded-full border"
                                src={
                                    conversation.conversationAvatar || '/images/default-avatar.png'
                                }
                                alt="avatar"
                                width={800}
                                height={800}
                            /> */}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
