'use client';

import { Heart } from 'lucide-react';
import { createElement, useState } from 'react';
import Image from 'next/image';
import { ConversationType, updateCurrentMessageReaction } from '@/lib/slices/conversationSlice';
import { reactToMessageService } from '@/lib/services/conversationService';
import { MessageData, MessageType, ReactionNameType, ReactionTypeIcon } from '@/app/dataType';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectUserInfo } from '@/lib/slices/userSlice';
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { selectPostReactionType } from '@/lib/slices/reactionTypeSlice';
import { groupBy, sortBy } from 'lodash';

interface MessageProps {
    message: MessageData;
    conversationId: string;
    conversationType: ConversationType;
    currentReaction: ReactionNameType | null;
    prevSenderId?: string;
    index: number;
}

export default function Message({
    message,
    conversationId,
    conversationType,
    currentReaction,
    prevSenderId,
    index,
}: MessageProps) {
    const dispatch = useAppDispatch();
    const userInfo = useAppSelector(selectUserInfo);
    const postReactionType = useAppSelector(selectPostReactionType);

    const senderId = message.sender.userId;
    const isSender = senderId === userInfo.id;
    let content;
    switch (message.messageType) {
        case MessageType.TEXT:
            content = (
                <div
                    className={`px-2 py-1 rounded-2xl whitespace-pre-line ${
                        isSender ? 'bg-blue-600 text-background' : 'bg-input/60 text-foreground'
                    }`}
                >
                    {message.content}
                </div>
            );
            break;
        case MessageType.IMAGE:
            content = (
                <PhotoProvider>
                    <PhotoView src={message.content}>
                        <Image
                            className="object-cover h-64 w-40 rounded-md border mt-1 cursor-pointer"
                            src={message.content}
                            width={800}
                            height={800}
                            alt=""
                        />
                    </PhotoView>
                </PhotoProvider>
            );
            break;
        default:
            content = (
                <div
                    className={`px-2 py-1 rounded-2xl whitespace-pre-line ${
                        isSender ? 'bg-blue-600 text-background' : 'bg-input/60 text-foreground'
                    }`}
                >
                    {message.content}
                </div>
            );
    }

    const _reactions = groupBy(message.reactions, 'reactionType');
    const _mostReactions = sortBy(_reactions, 'length').reverse();
    const mostReactions: ReactionNameType[] = [];

    if (_mostReactions.length > 0) {
        mostReactions.unshift(_mostReactions[0][0].reactionType);
        if (_mostReactions.length > 1) {
            mostReactions.unshift(_mostReactions[1][0].reactionType);
        }
    }

    const [isTooltipVisible, setIsTooltipVisible] = useState(false);

    const handleReactToMessage = async ({
        messageId,
        reactionType,
    }: {
        messageId: string;
        reactionType: ReactionNameType | null;
    }) => {
        try {
            setIsTooltipVisible(false);
            dispatch(
                updateCurrentMessageReaction({
                    conversationId,
                    messageId,
                    currentReaction: reactionType,
                }),
            );
            await reactToMessageService({
                messageId,
                conversationId,
                reactionType,
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div key={`message-${message.messageId}`} className={`${index > 1 && senderId !== prevSenderId && 'mt-2'}`}>
            {conversationType === ConversationType.GROUP &&
                senderId !== userInfo.id &&
                (index === 0 || senderId !== prevSenderId) && (
                    <div className="flex">
                        <div className="w-10"></div>
                        <div className={'line-clamp-1 break-all text-xs'}>
                            {message.sender.lastName} {message.sender.firstName}
                        </div>
                    </div>
                )}
            <div className="flex">
                {senderId !== userInfo.id && (
                    <div className="w-10">
                        {(index === 0 || senderId !== prevSenderId) && (
                            <Image
                                className="w-8 h-8 rounded-full border"
                                src={message.sender.avatar || '/images/default-avatar.png'}
                                alt="avatar"
                                width={800}
                                height={800}
                            />
                        )}
                    </div>
                )}
                <div
                    className={`flex-1 flex ${isSender && 'justify-end'}`}
                    onMouseEnter={() => setIsTooltipVisible(true)}
                    onMouseLeave={() => setIsTooltipVisible(false)}
                >
                    <div className="relative">
                        {content}
                        {mostReactions.length > 0 && (
                            <div
                                className={`absolute cursor-pointer bg-white w-fit px-0.5 py-[2px] rounded-full border flex items-center justify-center -bottom-2 ${
                                    isSender ? '-left-3' : '-right-3'
                                }`}
                            >
                                {createElement(ReactionTypeIcon[mostReactions[0]], {
                                    width: 15,
                                    height: 15,
                                })}
                                {mostReactions.length > 1 &&
                                    createElement(ReactionTypeIcon[mostReactions[1]], {
                                        width: 15,
                                        height: 15,
                                        className: 'ms-[1px]',
                                    })}
                                {message.reactions.length > 1 && (
                                    <span className="text-black ms-1 text-[10px]">{message.reactions.length}</span>
                                )}
                            </div>
                        )}
                        {isTooltipVisible && (
                            <span className={`absolute top-1/2 -translate-y-1/2 ${isSender ? '-left-8' : '-right-8'}`}>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="cursor-pointer bg-white w-5 h-5 rounded-full border flex items-center justify-center">
                                                <Heart className="text-gray w-3 h-3" />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="p-0 flex bg-background px-1 border shadow-md rounded-full shadow-all-sides">
                                            {Object.keys(postReactionType).map((reactionType) => {
                                                const Icon = ReactionTypeIcon[reactionType];
                                                return (
                                                    <div
                                                        className={`w-9 cursor-pointer py-1 px-1 rounded-full ${
                                                            currentReaction === reactionType && 'bg-gray/50'
                                                        }`}
                                                        key={reactionType}
                                                        onClick={() =>
                                                            handleReactToMessage({
                                                                messageId: message.messageId,
                                                                reactionType:
                                                                    currentReaction === reactionType
                                                                        ? null
                                                                        : (reactionType as ReactionNameType),
                                                            })
                                                        }
                                                    >
                                                        <Icon width={28} height={28} />
                                                    </div>
                                                );
                                            })}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
