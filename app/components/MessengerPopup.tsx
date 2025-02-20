'use client';

import { ChevronDown, Images, Minus, SendHorizonal, ShieldCheck, X } from 'lucide-react';
import Textarea from '@/app/components/Textarea';
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState, WheelEvent } from 'react';
import Image from 'next/image';
import {
    addMessage,
    assignConversationId,
    closeConversation,
    ConversationType,
    focusConversationPopup,
    minimizeConversation,
    selectMessagesByConversationId,
    selectOpenConversations,
    updateMessageReactions,
} from '@/lib/slices/conversationSlice';
import {
    createConversationService,
    getGroupMembersService,
    getMessagesService,
    sendMessageService,
} from '@/lib/services/conversationService';
import { ConversationRole, MessageType, UserInfoType } from '@/app/dataType';
import { uploadToCloudinary } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectUserInfo } from '@/lib/slices/userSlice';
import { useSocket } from '@/app/components/SocketProvider';
import useClickOutside from '@/hooks/useClickOutside';
import React from 'react';
import DrilldownMenu, { DrilldownMenuItem } from './DrilldownMenu';
import Message from '@/app/components/Message';

interface MessengerPopupProps {
    index: number;
    conversationId: string;
    type: ConversationType;
    friendId?: string;
    name: string;
    avatar?: string;
    isMinimized: boolean;
    isFocus: boolean;
    className?: string;
}

type GroupMemberType = UserInfoType & {
    role: ConversationRole;
    nickname?: string | null;
};

export default function MessengerPopup({
    index,
    conversationId,
    type,
    friendId,
    name,
    avatar,
    isMinimized,
    isFocus,
    className,
}: MessengerPopupProps) {
    const socket = useSocket();
    const dispatch = useAppDispatch();

    const userInfo = useAppSelector(selectUserInfo);
    const openConversations = useAppSelector(selectOpenConversations);
    const messages = useAppSelector(selectMessagesByConversationId(conversationId));

    const messengerPopupRef = useRef<HTMLDivElement>(null);
    useClickOutside(messengerPopupRef, () => {
        dispatch(focusConversationPopup(null));
    });

    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    const [groupMembers, setGroupMembers] = useState<GroupMemberType[]>([
        {
            userId: '1',
            lastName: '2',
            firstName: '2',
            avatar: null,
            role: ConversationRole.ADMIN,
            nickname: '2',
        },
    ]);

    const [text, setText] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [imagesUpload, setImagesUpload] = useState<File[]>([]);
    const [sendingMessage, setSendingMessage] = useState(false);

    const imageWrapperRef = useRef<HTMLDivElement>(null);

    const groupConversationSettings: DrilldownMenuItem[] = [
        {
            label: 'Thành viên nhóm',
            children: [
                {
                    label: (
                        <div className="flex flex-col gap-y-1">
                            {groupMembers.map((m) => {
                                return (
                                    <div className="flex items-center" key={`group-member-${m.userId}`}>
                                        <Image
                                            className="rounded-full border w-8 h-8 object-cover border"
                                            src={m.avatar || '/images/default-avatar.png'}
                                            alt="avatar"
                                            width={800}
                                            height={800}
                                        />
                                        <div className="ms-1 text-sm font-semibold flex-1 line-clamp-1 break-all">
                                            {m.lastName} {m.firstName}
                                        </div>
                                        {m.role === ConversationRole.ADMIN && (
                                            <ShieldCheck className="text-destructive" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ),
                },
            ],
        },
    ];

    // Get group members
    useEffect(() => {
        const getGroupMembers = async () => {
            try {
                const res = await getGroupMembersService(conversationId);
                setGroupMembers(
                    res.data.map((m) => ({
                        userId: m.userId,
                        firstName: m.userFirstName,
                        lastName: m.userLastName,
                        avatar: m.userAvatar,
                        role: m.role,
                        nickname: m.nickname,
                    })),
                );
            } catch (error) {
                console.error(error);
            }
        };

        if (conversationId) {
            getGroupMembers();
        }
    }, [conversationId]);

    // Get messages
    useEffect(() => {
        if (conversationId) {
            (async () => {
                try {
                    const res = await getMessagesService(conversationId);
                    if (res.data.length > 0) {
                        dispatch(
                            addMessage(
                                res.data.map((message: any) => ({
                                    messageId: message.id,
                                    conversationId: message.conversationId,
                                    content: message.content,
                                    messageType: message.messageType,
                                    sender: {
                                        userId: message.sender.id,
                                        firstName: message.sender.firstName,
                                        lastName: message.sender.lastName,
                                        avatar: message.sender.avatar,
                                    },
                                    currentReaction: message.currentReaction,
                                    reactions: message.reactions.map((r) => ({
                                        reactionType: r.reactionType,
                                        user: {
                                            userId: r.user.id,
                                            firstName: r.user.firstName,
                                            lastName: r.user.lastName,
                                            avatar: r.user.avatar,
                                        },
                                    })),
                                })),
                            ),
                        );
                    }
                } catch (error) {
                    console.error(error);
                }
            })();
        }
    }, [conversationId, dispatch]);

    // Socket handle new message and react to message
    useEffect(() => {
        const handleNewMessage = (newMessage: any) => {
            if (conversationId === newMessage.conversationId) {
                dispatch(
                    addMessage({
                        messageId: newMessage.messageId,
                        conversationId: newMessage.conversationId,
                        content: newMessage.content,
                        messageType: newMessage.messageType,
                        sender: {
                            userId: newMessage.sender.userId,
                            firstName: newMessage.sender.firstName,
                            lastName: newMessage.sender.lastName,
                            avatar: newMessage.sender.avatar,
                        },
                        currentReaction: null,
                        reactions: [],
                    }),
                );
            }
        };

        const handleReactMessage = (messageReaction) => {
            const {
                messageId,
                reactionType,
                sender: { userId, firstName, lastName, avatar },
            } = messageReaction;

            dispatch(
                updateMessageReactions({
                    conversationId,
                    messageId,
                    user: {
                        userId,
                        firstName,
                        lastName,
                        avatar,
                    },
                    reactionType,
                }),
            );
        };

        const handleRemoveReactMessage = ({ messageId, userId }: { messageId: string; userId: string }) => {
            dispatch(
                updateMessageReactions({
                    conversationId,
                    messageId,
                    user: {
                        userId,
                        firstName: '',
                        lastName: '',
                        avatar: null,
                    },
                    reactionType: null,
                }),
            );
        };

        socket.on('newMessage', handleNewMessage);
        socket.on('reactToMessage', handleReactMessage);
        socket.on('removeReactToMessage', handleRemoveReactMessage);

        return () => {
            socket.off('newMessage', handleNewMessage);
            socket.off('reactToMessage', handleReactMessage);
            socket.off('removeReactToMessage', handleRemoveReactMessage);
        };
    }, [socket, messages, name, conversationId, dispatch, openConversations]);

    // Scroll bottom of conversation
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (endOfMessagesRef.current) {
                endOfMessagesRef.current.scrollTop = endOfMessagesRef.current.scrollHeight;
            }
        }, 0);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [isMinimized, messages.length]);

    const handleChooseFile = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (files) {
            const imagesArray = Array.from(files).map((file) => {
                return URL.createObjectURL(file);
            });

            setImages([...images, ...imagesArray]);
            setImagesUpload([...imagesUpload, ...files]);
        }
    };

    const handleDeleteImage = (index: number) => {
        setImages((prev) => {
            return [...prev.slice(0, index), ...prev.slice(index + 1)];
        });
        setImagesUpload((prev) => {
            return [...prev.slice(0, index), ...prev.slice(index + 1)];
        });
    };

    const handleChangeText = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
    };

    // Scroll horizontal
    const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
        if (e.shiftKey && imageWrapperRef.current) {
            e.preventDefault();
            imageWrapperRef.current.scrollBy({
                left: e.deltaY * 0.4,
                behavior: 'smooth',
            });
        }
    };

    const handleSendMessage = async () => {
        try {
            if ((!text && images.length === 0) || sendingMessage) return;
            setSendingMessage(true);
            let _conversationId = conversationId;
            if (!_conversationId && friendId) {
                const res = await createConversationService({
                    type,
                    avatar,
                    participants: [friendId],
                });
                _conversationId = res.data.id;
                dispatch(
                    assignConversationId({
                        conversationId: _conversationId,
                        friendId,
                    }),
                );
            }

            if (text) {
                await sendMessageService({
                    conversationId: _conversationId,
                    content: text,
                    type: MessageType.TEXT,
                });
            }
            setText('');
            setImages([]);
            if (imagesUpload.length > 0) {
                await Promise.all(
                    imagesUpload.map(async (image) => {
                        const imageUrl = await uploadToCloudinary(image);
                        await sendMessageService({
                            conversationId: _conversationId,
                            image: imageUrl,
                            type: MessageType.IMAGE,
                        });
                    }),
                );
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSendingMessage(false);
        }
    };

    const handleEnterKeydown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleMinimizePopup = () => {
        dispatch(minimizeConversation(conversationId || friendId || ''));
    };

    const handleClosePopup = () => {
        dispatch(closeConversation(conversationId || friendId || ''));
    };

    return (
        <div
            ref={messengerPopupRef}
            className={`fixed flex flex-col bottom-0 bg-background w-[18rem] h-[26rem] rounded-t-xl border border-b-0 ${className}`}
            style={{ right: `${3.5 + index * 18.5}rem` }}
            onClick={() => dispatch(focusConversationPopup(conversationId || friendId || ''))}
        >
            <div className="flex justify-between items-center bg-primary text-background rounded-t-xl py-1 px-2 shadow-md">
                <div className="flex items-center gap-x-1">
                    <Image
                        className="w-9 h-9 rounded-full border"
                        src={avatar || '/images/default-avatar.png'}
                        alt="avatar"
                        width={800}
                        height={800}
                    />
                    <span className="font-semibold">
                        {(type === ConversationType.PRIVATE &&
                            groupMembers.find((m) => m.userId !== userInfo.id)?.nickname) ||
                            name}
                    </span>
                    <DrilldownMenu items={groupConversationSettings} position="bottom-left">
                        <ChevronDown />
                    </DrilldownMenu>
                </div>
                <div className="flex items-center gap-x-1">
                    <Minus onClick={handleMinimizePopup} />
                    <X onClick={handleClosePopup} />
                </div>
            </div>
            <div ref={endOfMessagesRef} className="flex-1 flex flex-col gap-y-1 overflow-y-auto py-2 px-2">
                {messages.length > 0 ? (
                    messages.map((message, index) => {
                        return (
                            <Message
                                message={message}
                                conversationId={conversationId}
                                conversationType={type}
                                currentReaction={message.currentReaction}
                                prevSenderId={messages[index - 1]?.sender.userId ?? ''}
                                index={index}
                                key={`message-${message.messageId}`}
                            />
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center mt-6">
                        <Image
                            className="w-20 h-20 rounded-full border"
                            src={avatar || '/images/default-avatar.png'}
                            alt="avatar"
                            width={800}
                            height={800}
                        />
                        <div className="mt-2">{name}</div>
                        <div className="text-sm mt-4">Hãy bắt đầu trò chuyện</div>
                    </div>
                )}
            </div>
            <div className="flex gap-x-2 items-end py-2 border-t px-2">
                <label htmlFor="write-post-select-file" className="mb-2 block w-fit cursor-pointer">
                    <Images className="text-[#41b35d]" />
                </label>
                <input type="file" multiple hidden id="write-post-select-file" onChange={handleChooseFile} />
                <div className="flex-1 overflow-hidden">
                    <div className="flex overflow-x-auto gap-2 pt-1" ref={imageWrapperRef} onWheel={handleWheel}>
                        {images.map((image, index) => (
                            <div key={`image-${index}`} className="min-w-10 w-10 h-12 mb-1 relative rounded-xl">
                                <Image
                                    className="w-10 h-12 object-cover rounded-sm border"
                                    src={image}
                                    alt="image"
                                    width={800}
                                    height={800}
                                    draggable={false}
                                />
                                <div
                                    className="absolute -top-1 -right-1 bg-muted-foreground/70 rounded-full p-1 cursor-pointer"
                                    onClick={() => handleDeleteImage(index)}
                                >
                                    <X className="text-background w-3 h-3" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <Textarea
                        className="border-none outline-none focus:shadow-none focus:ring-0 bg-input rounded-3xl px-2 py-2 min-h-9 max-h-40"
                        text={text}
                        isFocus={isFocus}
                        placeholder="Aa"
                        handleChange={handleChangeText}
                        onKeyDown={handleEnterKeydown}
                    />
                </div>

                <SendHorizonal
                    className={`mb-2 ${(text || images.length > 0) && 'fill-primary/40 text-primary'}`}
                    onClick={() => (text || images.length > 0) && handleSendMessage()}
                />
            </div>
        </div>
    );
}
