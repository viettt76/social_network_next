'use client';

import { Images, Minus, SendHorizonal, X } from 'lucide-react';
import Textarea from '@/app/components/Textarea';
import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useRef, useState, WheelEvent } from 'react';
import Image from 'next/image';
import {
    addOldMessages,
    addNewMessage,
    assignConversationId,
    closeConversation,
    ConversationType,
    focusConversationPopup,
    minimizeConversation,
    selectMessagesByConversationId,
    selectOpenConversations,
    updateMessageReactions,
    unfocusConversationPopup,
} from '@/lib/slices/conversationSlice';
import { createConversationService, getMessagesService, sendMessageService } from '@/lib/services/conversationService';
import { MessageType } from '@/app/dataType';
import { cn, getTimeFromISO, padNumber, uploadToCloudinary } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { useSocket } from '@/app/components/SocketProvider';
import useClickOutside from '@/hooks/useClickOutside';
import React from 'react';
import Message from '@/app/components/Message';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import MessengerPopupSettings from './MessengerPopupSettings';

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

    const openConversations = useAppSelector(selectOpenConversations);
    const messages = useAppSelector(selectMessagesByConversationId(conversationId));

    const [messagesPage, setMessagesPage] = useState(1);
    const [messageLoading, setMessageLoading] = useState(false);

    const { observerTarget: observerMessagesTarget } = useInfiniteScroll({
        callback: () => setMessagesPage((prev) => prev + 1),
        threshold: 0.5,
        loading: messageLoading,
    });

    const messengerPopupRef = useRef<HTMLDivElement>(null);
    useClickOutside(messengerPopupRef, () => dispatch(unfocusConversationPopup(conversationId || friendId || '')));

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);

    const [text, setText] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [imagesUpload, setImagesUpload] = useState<File[]>([]);
    const [sendingMessage, setSendingMessage] = useState(false);

    const imageWrapperRef = useRef<HTMLDivElement>(null);

    // Get messages
    useEffect(() => {
        if (conversationId) {
            (async () => {
                setMessageLoading(true);
                try {
                    // Save the position before calling API
                    const prevScrollHeight = chatContainerRef.current?.scrollHeight || 0;

                    const res = await getMessagesService({ conversationId, page: messagesPage });
                    if (res.data.length > 0) {
                        dispatch(
                            addOldMessages(
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
                                    createdAt: message.createdAt,
                                })),
                            ),
                        );
                        setMessageLoading(false);

                        // Maintain the coil position after adding the message
                        setTimeout(() => {
                            if (chatContainerRef.current) {
                                const newScrollHeight = chatContainerRef.current.scrollHeight;
                                chatContainerRef.current.scrollTop = newScrollHeight - prevScrollHeight;
                            }
                        }, 0);
                    }
                } catch (error) {
                    console.error(error);
                }
            })();
        }
    }, [conversationId, dispatch, messagesPage]);

    // Socket handle new message and react to message
    useEffect(() => {
        const handleNewMessage = (newMessage: any) => {
            if (conversationId === newMessage.conversationId) {
                dispatch(
                    addNewMessage({
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
                        createdAt: newMessage.lastUpdated,
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
            if (chatContainerRef.current && isAtBottom) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
        }, 0);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [isMinimized, isAtBottom, messages.length]);

    // Listens for the scroll event on the chat container
    // Updates the `isAtBottom` state if the user is within 60px of the bottom.
    useEffect(() => {
        if (!chatContainerRef.current) return;

        const handleScroll = () => {
            const container = chatContainerRef.current!;
            const isBottom = container.scrollTop + container.offsetHeight >= container.scrollHeight - 60;
            setIsAtBottom(isBottom);
        };

        const chatContainer = chatContainerRef.current;
        chatContainer?.addEventListener('scroll', handleScroll);

        return () => {
            chatContainer?.removeEventListener('scroll', handleScroll);
        };
    }, [messages.length]);

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

    const handleClosePopup = useCallback(() => {
        dispatch(closeConversation(conversationId || friendId || ''));
    }, [conversationId, friendId, dispatch]);

    // Close popup when press the 'Esc' key and popup is being focused
    useEffect(() => {
        const handleEscKeydown = (e: globalThis.KeyboardEvent) => {
            if (e.key === 'Escape' && isFocus) {
                handleClosePopup();
            }
        };

        document.addEventListener('keydown', handleEscKeydown);

        return () => {
            document.removeEventListener('keydown', handleEscKeydown);
        };
    }, [isFocus, handleClosePopup]);

    const isDifferentTime = (current: number, previous: number) => {
        return !previous || current - previous > 10 * 60 * 1000; // More than 10 minutes apart
    };

    const formatTimeDisplay = (time: any) => {
        const now = new Date();
        if (time.day === now.getDate() && time.month === now.getMonth() + 1) {
            return `${padNumber(time.hours)}:${padNumber(time.minutes)}`;
        }
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (time.day === yesterday.getDate() && time.month === yesterday.getMonth() + 1) {
            return `Hôm qua ${padNumber(time.hours)}:${padNumber(time.minutes)}`;
        }
        return `${padNumber(time.day)}/${padNumber(time.month)}${
            time.year !== now.getFullYear() ? `/${time.year}` : ''
        } ${padNumber(time.hours)}:${padNumber(time.minutes)}`;
    };

    return (
        <div
            ref={messengerPopupRef}
            className={cn(
                'fixed flex flex-col bottom-0 bg-background w-[18rem] h-[26rem] rounded-t-xl border border-b-0',
                className,
            )}
            style={{ right: `${3.5 + index * 18.5}rem`, zIndex: 10000 - index }}
            onClick={() => dispatch(focusConversationPopup(conversationId || friendId || ''))}
        >
            <div
                className={`flex justify-between items-center bg-primary text-background rounded-t-xl py-1 px-2 shadow-md ${
                    isFocus ? 'bg-background' : 'bg-white'
                }`}
            >
                <div className="flex items-center gap-x-1">
                    <Image
                        className="w-9 h-9 rounded-full border"
                        src={avatar || '/images/default-avatar.png'}
                        alt="avatar"
                        width={800}
                        height={800}
                    />
                    <span className={`font-semibold ${isFocus ? 'text-background' : 'text-foreground'}`}>
                        {/* {(type === ConversationType.PRIVATE &&
                            groupMembers.find((m) => m.userId !== userInfo.id)?.nickname) ||
                            name} */}
                        {name}
                    </span>

                    <MessengerPopupSettings
                        isFocus={isFocus}
                        conversationId={conversationId}
                        friendId={friendId}
                        type={type}
                    />
                </div>
                <div className="flex items-center gap-x-1">
                    <Minus
                        className={`${isFocus ? 'text-background' : 'text-foreground'}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleMinimizePopup();
                        }}
                    />
                    <X className={`${isFocus ? 'text-background' : 'text-foreground'}`} onClick={handleClosePopup} />
                </div>
            </div>
            <div ref={chatContainerRef} className="flex-1 flex flex-col gap-y-1 overflow-y-auto py-2 px-2">
                <div ref={observerMessagesTarget} className="h-1"></div>
                {messages.length > 0 ? (
                    <>
                        {messages.map((message, index) => {
                            const time = getTimeFromISO(message.createdAt);
                            const prevMessage = messages[index - 1];
                            const isShowTime = isDifferentTime(
                                new Date(message.createdAt).getTime(),
                                new Date(prevMessage?.createdAt).getTime(),
                            );

                            return (
                                <div key={`message-${message.messageId}`}>
                                    {isShowTime && (
                                        <div className="text-xs text-gray font-semibold text-center my-1">
                                            {formatTimeDisplay(time)}
                                        </div>
                                    )}
                                    <Message
                                        message={message}
                                        conversationId={conversationId}
                                        conversationType={type}
                                        currentReaction={message.currentReaction}
                                        prevSenderId={prevMessage?.sender.userId ?? ''}
                                        index={index}
                                    />
                                </div>
                            );
                        })}
                    </>
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
