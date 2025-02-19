'use client';

import {
    BellRinging,
    CaretDown,
    Moon,
    MagnifyingGlass,
    Sun,
    UserPlus,
    ChatCenteredDots,
    SignOut,
} from '@phosphor-icons/react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { Link, useRouter } from '@/i18n/routing';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { resetInfo, selectUserInfo } from '@/lib/slices/userSlice';
import { logoutService } from '@/lib/services/authService';
import { useEffect, useRef, useState } from 'react';
import { AlignJustify, ArrowLeft, ChevronRight, CircleCheck, Plus } from 'lucide-react';
import { createConversationService, getRecentConversationsService } from '@/lib/services/conversationService';
import { MessageType, MessengerType } from '@/app/dataType';
import useClickOutside from '@/hooks/useClickOutside';
import { ConversationType, openConversation } from '@/lib/slices/conversationSlice';
import { selectFriends } from '@/lib/slices/relationshipSlice';
import { useSocket } from './SocketProvider';
import { Drawer } from 'flowbite-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function MovieHeader() {
    const { theme, setTheme } = useTheme();
    const dispatch = useAppDispatch();
    const { toast } = useToast();
    const router = useRouter();
    const socket = useSocket();

    const [isOpenSidebarModal, setIsOpenSidebarModal] = useState(false);

    const handleShowSidebarModal = () => setIsOpenSidebarModal(true);
    const handleCloseSidebarModal = () => setIsOpenSidebarModal(false);

    const friends = useAppSelector(selectFriends);
    const userInfo = useAppSelector(selectUserInfo);

    const [width, setWidth] = useState(0);
    const parentRef = useRef<HTMLDivElement | null>(null);
    const headerRef = useRef<HTMLDivElement | null>(null);

    const recentConversationsRef = useRef<HTMLDivElement>(null);
    const [showRecentConversations, setShowRecentConversations] = useState(false);
    const [recentConversations, setRecentConversations] = useState<MessengerType[]>([]);

    const [showAddGroup, setShowAddGroup] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [groupMembers, setGroupMembers] = useState<string[]>([]);

    useEffect(() => {
        const updateWidth = () => {
            if (parentRef.current && headerRef.current) {
                setWidth(parentRef.current.offsetWidth);
            }
        };

        window.addEventListener('resize', updateWidth);
        updateWidth();

        return () => {
            window.removeEventListener('resize', updateWidth);
        };
    }, []);

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

                if (conversationIndex !== -1) {
                    const updatedConversations = [...prev];
                    updatedConversations[conversationIndex] = {
                        ...updatedConversations[conversationIndex],
                        lastMessage: {
                            messageId,
                            conversationId,
                            content,
                            messageType,
                            sender,
                        },
                        lastUpdated,
                    };
                    return updatedConversations;
                } else {
                    return [
                        {
                            conversationId,
                            conversationName,
                            conversationType,
                            lastMessage: {
                                messageId,
                                conversationId,
                                content,
                                messageType,
                                sender,
                            },
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

    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

    const handleLogout = async () => {
        try {
            await logoutService();
            dispatch(resetInfo());
            router.push('/login');
        } catch (error) {
            toast({
                title: 'Logout fail!',
            });
            console.error(error);
        }
    };

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
        <div ref={parentRef} className="w-full">
            <div ref={headerRef} className="h-16 bg-[#0a0a0a] shadow-sm fixed top-0 left-0 z-50" style={{ width }}>
                <div className="absolute top-0 left-5 h-full flex items-center justify-center">
                    <AlignJustify className="text-white" onClick={handleShowSidebarModal} />
                </div>
                <Drawer
                    open={isOpenSidebarModal}
                    onClose={handleCloseSidebarModal}
                    className="bg-[#0a0a0a] border-r border-[#2d2d2d]"
                >
                    <Drawer.Items>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="text-white flex items-center w-fit">
                                        Thể loại <ChevronRight />
                                    </div>
                                </TooltipTrigger>

                                <TooltipContent
                                    side="right"
                                    align="start"
                                    className="bg-[#2d2d2d] border-[#2d2d2d] border"
                                >
                                    <div className="px-2 py-1 grid grid-cols-6 gap-4">
                                        {JSON.parse(sessionStorage.getItem('genreList') ?? '[]').map((g) => (
                                            <Link
                                                href={`/movie/genre/${g.slug}`}
                                                className="text-white hover:text-orange-400"
                                                key={`genre-${g.slug}`}
                                                onClick={handleCloseSidebarModal}
                                            >
                                                {g.name}
                                            </Link>
                                        ))}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </Drawer.Items>
                </Drawer>
                <div className="max-w-[1024px] h-full mx-auto flex items-center gap-x-6">
                    <div className="w-64 flex items-center gap-x-4">
                        <Link href="/" className="block w-fit">
                            <Image src="/images/logo.png" width={50} height={50} alt="logo" />
                        </Link>
                        <Link
                            href="/movie"
                            className="block w-fit px-2 text-white hover:text-orange-400 hover:underline"
                        >
                            Trang chủ
                        </Link>
                    </div>
                    <div className="flex-1 flex rounded-3xl items-center pe-4 h-fit bg-white">
                        <input
                            className="w-full rounded-3xl px-4 py-2 border-none outline-none bg-transparent text-black"
                            placeholder="Tìm kiếm phim"
                        />
                        <MagnifyingGlass className="text-black" />
                    </div>
                    <div className="flex items-center justify-around w-64">
                        <Link href="/friends/suggestions">
                            <UserPlus className="text-white" />
                        </Link>
                        <div className="relative">
                            <ChatCenteredDots className="text-white" onClick={handleShowRecentConversations} />
                            {showRecentConversations && (
                                <div
                                    ref={recentConversationsRef}
                                    className="absolute top-6 left-0 w-96 bg-background border shadow-md rounded-xl p-2"
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
                                                    onClick={() =>
                                                        groupName && groupMembers.length >= 2 && handleCreateGroup()
                                                    }
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
                                                            <div
                                                                className="flex items-center gap-x-2"
                                                                key={`friend-${friend.userId}`}
                                                            >
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
                                                                    onChange={() =>
                                                                        handleChangeGroupMembers(friend.userId)
                                                                    }
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
                                                <input
                                                    className="border px-2 py-1 rounded-3xl flex-1"
                                                    placeholder="Tìm kiếm..."
                                                />
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
                                                                    {conversation.conversationType ===
                                                                        ConversationType.GROUP &&
                                                                        conversation.lastMessage.sender.userId !==
                                                                            userInfo.id &&
                                                                        `${conversation.lastMessage.sender.lastName} ${conversation.lastMessage.sender.firstName}: `}
                                                                    {conversation.lastMessage.messageType ===
                                                                    MessageType.TEXT
                                                                        ? conversation.lastMessage.content
                                                                        : `${
                                                                              conversation.lastMessage.sender.userId ===
                                                                              userInfo.id
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
                        <BellRinging className="text-white" />
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center cursor-pointer">
                                    <Image
                                        className="rounded-full w-7 h-7 border border-white"
                                        src="/images/default-avatar.png"
                                        alt="avatar"
                                        width={800}
                                        height={800}
                                    />
                                    <CaretDown className="w-4 h-4 text-white" />
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                <DropdownMenuLabel>
                                    <Link href="/profile">My Account</Link>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                                    <SignOut />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <button
                            onClick={toggleTheme}
                            className="relative w-12 h-6 bg-muted rounded-full transition-all duration-300 flex items-center justify-between px-1"
                        >
                            {theme === 'dark' ? (
                                <Moon className="absolute top-1 right-1 w-4 h-4" />
                            ) : (
                                <Sun className="absolute color-red top-1 left-1 w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
            <div className="h-16"></div>
        </div>
    );
}
