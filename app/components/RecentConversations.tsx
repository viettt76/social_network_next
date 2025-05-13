'use client';

import { ChatCenteredDots } from '@phosphor-icons/react';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectUserInfo } from '@/lib/slices/userSlice';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import {
    createConversationService,
    getGroupConversationsService,
    getRecentConversationsService,
    readMessageService,
} from '@/lib/services/conversationService';
import { GroupConversationType, MessageType, MessengerType, UserInfoType } from '@/app/dataType';
import useClickOutside from '@/hooks/useClickOutside';
import {
    ConversationType,
    openConversation,
    selectConversationsUnread,
    addConversationsUnread,
    removeConversationsUnread,
} from '@/lib/slices/conversationSlice';
import { selectFriends } from '@/lib/slices/relationshipSlice';
import { useSocket } from './SocketProvider';
import { cn } from '@/lib/utils';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import { Checkbox } from '@/components/ui/checkbox';

export default function RecentConversations({ className }: { className?: string }) {
    const dispatch = useAppDispatch();
    const socket = useSocket();

    const friends = useAppSelector(selectFriends);
    const userInfo = useAppSelector(selectUserInfo);
    const conversationsUnread = useAppSelector(selectConversationsUnread);

    const recentConversationsRef = useRef<HTMLDivElement>(null);
    const [showRecentConversations, setShowRecentConversations] = useState(false);
    const [recentConversations, setRecentConversations] = useState<MessengerType[]>([]);
    const [recentConversationsPage, setRecentConversationsPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const { observerTarget } = useInfiniteScroll({
        callback: () => setRecentConversationsPage((prev) => prev + 1),
        threshold: 0.5,
        loading,
    });

    const [searchFriendsToChat, setSearchFriendsToChat] = useState<UserInfoType[]>([]);
    const [keywordSearchFriendsToChat, setKeywordSearchFriendsToChat] = useState('');

    const [groups, setGroups] = useState<GroupConversationType[]>([]);

    const [showAddGroup, setShowAddGroup] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [groupMembers, setGroupMembers] = useState<string[]>([]);

    const [searchFriendsToCreateGroup, setSearchFriendsToCreateGroup] = useState<UserInfoType[]>([]);
    const [keywordSearchFriendsToCreateGroup, setKeywordSearchFriendsToCreateGroup] = useState('');

    const normalize = useCallback((str) => {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }, []);

    const includesInsensitive = useCallback(
        (source, keyword) => {
            return normalize(source).toLowerCase().includes(normalize(keyword).toLowerCase());
        },
        [normalize],
    );

    useEffect(() => {
        if (keywordSearchFriendsToChat.trim() === '') {
            setSearchFriendsToChat([]);
        } else {
            setSearchFriendsToChat([
                ...friends.filter((f) =>
                    includesInsensitive(`${f.lastName} ${f.firstName}`, keywordSearchFriendsToChat.trim()),
                ),
            ]);
        }
    }, [friends, keywordSearchFriendsToChat, includesInsensitive]);

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

    useEffect(() => {
        if (keywordSearchFriendsToCreateGroup.trim() === '') {
            setSearchFriendsToCreateGroup(friends);
        } else {
            setSearchFriendsToCreateGroup(
                friends.filter((f) =>
                    includesInsensitive(`${f.lastName} ${f.firstName}`, keywordSearchFriendsToCreateGroup.trim()),
                ),
            );
        }
    }, [friends, keywordSearchFriendsToCreateGroup, includesInsensitive]);

    // Get recent conversations
    useEffect(() => {
        const getRecentConversations = async () => {
            setLoading(true);
            try {
                const { data } = await getRecentConversationsService(recentConversationsPage);

                if (data.length > 0) {
                    setRecentConversations((prev) => [
                        ...prev,
                        ...data
                            .filter((c) => !prev.find((p) => p.conversationId === c.conversationId))
                            .map((c) => ({
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
                    ]);

                    setLoading(false);
                }
            } catch (error) {
                console.error(error);
            }
        };
        if (showRecentConversations) {
            getRecentConversations();
        }
    }, [showRecentConversations, recentConversationsPage]);

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
                friend,
            } = newMessage;

            setRecentConversations((prev) => {
                const existingIndex = prev.findIndex((c) => c.conversationId === conversationId);

                const lastMessage = {
                    messageId,
                    conversationId,
                    content,
                    messageType,
                    sender,
                    currentReaction: null,
                    reactions: [],
                    createdAt: lastUpdated,
                };

                if (existingIndex !== -1) {
                    return [
                        {
                            ...prev[existingIndex],
                            lastMessage,
                            lastUpdated,
                        },
                        ...prev.filter((_, i) => i !== existingIndex),
                    ];
                } else {
                    return [
                        {
                            conversationId,
                            conversationName:
                                conversationType === ConversationType.PRIVATE
                                    ? userInfo.id === sender.userId
                                        ? `${friend.lastName} ${friend.firstName}`
                                        : `${sender.lastName} ${sender.firstName}`
                                    : conversationName,
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

            if (sender.userId !== userInfo.id) {
                const existingConversationUnread = conversationsUnread.includes(conversationId);

                if (!existingConversationUnread) {
                    dispatch(addConversationsUnread(conversationId));
                }
            }
        };

        socket.on('newMessage', handleNewMessage);

        return () => {
            socket.off('newMessage', handleNewMessage);
        };
    }, [socket, userInfo.id, conversationsUnread, dispatch]);

    // Socket handle a conversation group created to update recent conversation
    useEffect(() => {
        const handleNewConversationGroup = (newConversationGroup: any) => {
            const {
                conversationId,
                conversationName,
                conversationAvatar,
                creator,
                lastUpdated,
                lastMessage: { messageId, content, messageType, createdAt },
            } = newConversationGroup;

            setRecentConversations((prev) => {
                return [
                    {
                        conversationId,
                        conversationName,
                        conversationType: ConversationType.GROUP,
                        conversationAvatar,
                        lastMessage: {
                            messageId,
                            conversationId,
                            content,
                            messageType,
                            sender: {
                                userId: creator.userId,
                                firstName: creator.firstName,
                                lastName: creator.lastName,
                                avatar: creator.avatar,
                            },
                            currentReaction: null,
                            reactions: [],
                            createdAt,
                        },
                        lastUpdated,
                    },
                    ...prev,
                ];
            });
        };

        socket.on('newConversationGroup', handleNewConversationGroup);

        return () => {
            socket.off('newConversationGroup', handleNewConversationGroup);
        };
    }, [socket]);

    // Socket handle added to the group
    useEffect(() => {
        const handleAddedToGroup = () => {
            setRecentConversationsPage(1);
        };

        socket.on('addedToGroup', handleAddedToGroup);

        return () => {
            socket.off('addedToGroup', handleAddedToGroup);
        };
    }, [socket]);

    const handleShowRecentConversations = () => setShowRecentConversations(true);
    const handleHideRecentConversations = () => {
        setShowRecentConversations(false);
        handleCloseAddGroup();
    };

    useClickOutside(recentConversationsRef, handleHideRecentConversations);

    const handleOpenMessengerPopup = async (conversationInfo: {
        conversationId: string;
        type: ConversationType;
        friendId?: string;
        name: string;
        avatar?: string;
        lastMessageSenderId: string;
    }) => {
        const { conversationId, type, friendId, name, avatar, lastMessageSenderId } = conversationInfo;
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
        dispatch(removeConversationsUnread(conversationId));

        if (lastMessageSenderId !== userInfo.id) {
            await readMessageService(conversationId);
        }
    };

    const handleOpenAddGroup = () => setShowAddGroup(true);
    const handleCloseAddGroup = () => {
        setShowAddGroup(false);
        setKeywordSearchFriendsToCreateGroup('');
    };

    const handleChangeGroupMembers = (friendId: string) => {
        setGroupMembers((prev) => {
            if (prev.find((m) => m === friendId)) {
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
        <div ref={recentConversationsRef} className="relative">
            <ChatCenteredDots
                className={cn('text-ring cursor-pointer', className)}
                onClick={handleShowRecentConversations}
            />
            {conversationsUnread.length > 0 && (
                <div className="absolute -top-2 -right-2 text-background bg-destructive rounded-full text-sm w-4 h-4 flex justify-center items-center">
                    {conversationsUnread.length}
                </div>
            )}
            {showRecentConversations && (
                <div className="absolute top-[calc(100%+0.5rem)] -right-10 w-80 bg-background border shadow-all-sides rounded-xl pt-2">
                    {showAddGroup ? (
                        <div className="px-2">
                            <div className="flex justify-between">
                                <ArrowLeft className="cursor-pointer" onClick={handleCloseAddGroup} />
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
                                    onChange={(e) => setKeywordSearchFriendsToCreateGroup(e.target.value)}
                                />
                                <div className="mt-2 flex flex-col gap-y-2">
                                    {searchFriendsToCreateGroup.map((friend) => {
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
                                                <Checkbox
                                                    name="add-group-member"
                                                    className="focus:ring-0"
                                                    onCheckedChange={() => handleChangeGroupMembers(friend.userId)}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between gap-x-2 mb-2 border-b px-4 pb-2">
                                {/* <div className="font-semibold ">Tin nhắn</div> */}
                                {keywordSearchFriendsToChat && (
                                    <ArrowLeft
                                        className="cursor-pointer"
                                        onClick={() => setKeywordSearchFriendsToChat('')}
                                    />
                                )}
                                <input
                                    className="border px-2 py-1 rounded-3xl flex-1"
                                    value={keywordSearchFriendsToChat}
                                    placeholder="Tìm kiếm..."
                                    onChange={(e) => setKeywordSearchFriendsToChat(e.target.value)}
                                />
                                <Plus className="text-primary cursor-pointer" onClick={handleOpenAddGroup} />
                                {/* <div className="text-primary cursor-pointer" onClick={handleOpenAddGroup}>
                                    <Plus className="w-10" />
                                </div> */}
                            </div>
                            <div className="max-h-[22rem] overflow-y-auto px-2">
                                {keywordSearchFriendsToChat ? (
                                    searchFriendsToChat.length > 0 ? (
                                        <div className="flex flex-col">
                                            {searchFriendsToChat.map((f) => (
                                                <div
                                                    className="flex items-center px-2 py-1 gap-x-2"
                                                    key={`friend-${f.userId}`}
                                                >
                                                    <Image
                                                        className="h-8 w-8 rounded-full"
                                                        src={f.avatar || '/images/default-avatar.png'}
                                                        alt="avatar"
                                                        width={800}
                                                        height={800}
                                                    />
                                                    <div className="font-semibold line-clamp-1 break-alls">
                                                        {f.lastName} {f.firstName}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-2">Không tìm thấy kết quả nào</div>
                                    )
                                ) : (
                                    <>
                                        <div className="flex flex-col">
                                            {recentConversations.map((conversation) => {
                                                const lastMessageContent = conversation.lastMessage.content;
                                                let content = '';
                                                const isPrivate =
                                                    conversation.conversationType === ConversationType.PRIVATE;
                                                const isGroup =
                                                    conversation.conversationType === ConversationType.GROUP;
                                                const isSender = conversation.lastMessage.sender.userId === userInfo.id;

                                                switch (conversation.lastMessage.messageType) {
                                                    case MessageType.TEXT:
                                                        if (isPrivate) {
                                                            if (isSender) content = `Bạn: ${lastMessageContent}`;
                                                            else content = lastMessageContent;
                                                        } else if (isGroup) {
                                                            if (isSender) content = `Bạn: ${lastMessageContent}`;
                                                            else
                                                                content = `${conversation.lastMessage.sender.lastName} ${conversation.lastMessage.sender.firstName}: ${lastMessageContent}`;
                                                        }
                                                        break;
                                                    case MessageType.IMAGE:
                                                        if (isSender) content = `Bạn vừa gửi 1 ảnh`;
                                                        else
                                                            content = `${conversation.lastMessage.sender.lastName} ${conversation.lastMessage.sender.firstName} vừa gửi 1 ảnh`;

                                                        break;
                                                    case MessageType.NOTIFICATION:
                                                        content = lastMessageContent;
                                                        break;
                                                    default:
                                                        content = '';
                                                }

                                                return (
                                                    <div
                                                        className={`flex items-center gap-x-2 p-2 rounded-xl hover:bg-foreground/5 ${
                                                            conversationsUnread.includes(conversation.conversationId) &&
                                                            'bg-foreground/5'
                                                        }`}
                                                        key={`recent-conversation-${conversation.conversationId}`}
                                                        onClick={() =>
                                                            handleOpenMessengerPopup({
                                                                conversationId: conversation.conversationId,
                                                                type: conversation.conversationType,
                                                                friendId: conversation.friendId,
                                                                name: conversation.conversationName,
                                                                avatar: conversation.conversationAvatar,
                                                                lastMessageSenderId:
                                                                    conversation.lastMessage.sender.userId,
                                                            })
                                                        }
                                                    >
                                                        <Image
                                                            className="w-10 h-10 object-cover rounded-full border"
                                                            src={
                                                                conversation.conversationAvatar ||
                                                                '/images/default-avatar.png'
                                                            }
                                                            alt="avatar"
                                                            width={800}
                                                            height={800}
                                                        />
                                                        <div className="flex-1">
                                                            <div className="font-semibold text-sm">
                                                                {conversation.conversationName}
                                                            </div>
                                                            <div className="text-gray text-xs line-clamp-1 break-all overflow-x-hidden">
                                                                {content}
                                                            </div>
                                                        </div>
                                                        <div className="ms-6">
                                                            {/* <CircleCheck className="w-6 h-6 text-background fill-primary" /> */}
                                                            {/* <CircleCheck className="text-primary w-5 h-5" />
                                                    <Image
                                                        className="w-5 h-5 object-cover rounded-full border"
                                                        src={
                                                            conversation.conversationAvatar ||
                                                            '/images/default-avatar.png'
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
                                        <div ref={observerTarget} className="h-2"></div>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
