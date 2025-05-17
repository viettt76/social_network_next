import { ChevronDown, ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { closeConversation, ConversationType } from '@/lib/slices/conversationSlice';
import { addGroupMembersService, getGroupMembersService, outGroupService } from '@/lib/services/conversationService';
import { ConversationRole, UserInfoType } from '@/app/dataType';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectUserInfo } from '@/lib/slices/userSlice';
import { useSocket } from '@/app/components/SocketProvider';
import React from 'react';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import { selectFriends } from '@/lib/slices/relationshipSlice';
import { Checkbox } from '@/components/ui/checkbox';
import { DrilldownMenuContent, DrilldownMenuItem, DrilldownMenuProvider, DrilldownMenuTrigger } from './DrilldownMenu';
import { Link } from '@/i18n/routing';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type GroupMemberType = UserInfoType & {
    role: ConversationRole;
    nickname?: string | null;
};

interface MessengerPopupSettingsProps {
    isFocus: boolean;
    conversationId: string;
    friendId?: string;
    type: ConversationType;
}

export default function MessengerPopupSettings({
    isFocus,
    conversationId,
    friendId,
    type,
}: MessengerPopupSettingsProps) {
    const socket = useSocket();

    const dispatch = useAppDispatch();
    const userInfo = useAppSelector(selectUserInfo);
    const friends = useAppSelector(selectFriends);

    const [groupMembers, setGroupMembers] = useState<GroupMemberType[]>([]);
    const [groupMembersPage, setGroupMembersonsPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const [groupMembersToAdd, setGroupMembersToAdd] = useState<UserInfoType[]>([]);

    const [showDialogOutGroup, setShowDialogOutGroup] = useState(false);

    const { observerTarget: observerGroupMembersTarget } = useInfiniteScroll({
        callback: () => setGroupMembersonsPage((prev) => prev + 1),
        threshold: 0.5,
        loading,
    });

    // Get group members
    useEffect(() => {
        const getGroupMembers = async () => {
            setLoading(true);
            try {
                const { data } = await getGroupMembersService({ conversationId, page: groupMembersPage });
                if (data.length > 0) {
                    setGroupMembers(
                        data.map((m) => ({
                            userId: m.userId,
                            firstName: m.userFirstName,
                            lastName: m.userLastName,
                            avatar: m.userAvatar,
                            role: m.role,
                            nickname: m.nickname,
                        })),
                    );

                    setLoading(false);
                }
            } catch (error) {
                console.error(error);
            }
        };

        if (conversationId && type === ConversationType.GROUP) {
            getGroupMembers();
        }
    }, [conversationId, groupMembersPage, type]);

    // Check is admin of group conversation
    useEffect(() => {
        setIsAdmin(groupMembers.find((m) => m.userId === userInfo.id)?.role === ConversationRole.ADMIN);
    }, [groupMembers, userInfo.id]);

    // Socket handle more and reduce member to conversation group
    useEffect(() => {
        const handleMoreMemberToGroup = (newMembers: GroupMemberType[]) => {
            setGroupMembers((prev) => [...prev, ...newMembers]);
        };

        const handleReduceMemberToGroup = (memberId: string) => {
            setGroupMembers((prev) => prev.filter((m) => m.userId !== memberId));
        };

        socket.on('moreMemberToGroup', handleMoreMemberToGroup);
        socket.on('reduceMemberToGroup', handleReduceMemberToGroup);

        return () => {
            socket.off('moreMemberToGroup', handleMoreMemberToGroup);
            socket.off('reduceMemberToGroup', handleReduceMemberToGroup);
        };
    }, [socket, type]);

    const handleChangeGroupMembersToAdd = useCallback((friendInfo: UserInfoType) => {
        setGroupMembersToAdd((prev) => {
            if (prev.find((m) => m.userId === friendInfo.userId)) {
                return prev.filter((m) => m.userId !== friendInfo.userId);
            } else {
                return [...prev, friendInfo];
            }
        });
    }, []);

    const handleAddGroupMembers = useCallback(async () => {
        try {
            if (groupMembersToAdd.length > 0) {
                await addGroupMembersService({
                    conversationId,
                    participants: groupMembersToAdd,
                });
                setGroupMembersToAdd([]);
            }
        } catch (error) {
            console.error(error);
        }
    }, [conversationId, groupMembersToAdd]);

    const handleOutGroup = async () => {
        try {
            await outGroupService(conversationId);
            setShowDialogOutGroup(false);
            dispatch(closeConversation(conversationId));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <DrilldownMenuProvider>
            <DrilldownMenuTrigger>
                <ChevronDown className={`${isFocus ? 'text-background' : 'text-foreground'}`} />
            </DrilldownMenuTrigger>

            <DrilldownMenuContent id="root" position="bottom-left">
                {type === ConversationType.PRIVATE ? (
                    <>
                        <DrilldownMenuItem>
                            <Link href={`/profile/${friendId}`}>Xem trang cá nhân</Link>
                        </DrilldownMenuItem>
                    </>
                ) : (
                    <>
                        <DrilldownMenuItem submenu="group-members">Thành viên nhóm</DrilldownMenuItem>
                        {isAdmin && <DrilldownMenuItem submenu="add-members">Thêm thành viên</DrilldownMenuItem>}
                        <DrilldownMenuItem onClick={() => setShowDialogOutGroup(true)}>Rời nhóm</DrilldownMenuItem>
                    </>
                )}
            </DrilldownMenuContent>

            <DrilldownMenuContent id="group-members" position="bottom-left">
                <DrilldownMenuItem submenu="root">←</DrilldownMenuItem>
                <DrilldownMenuItem>
                    <div className="max-h-64 overflow-y-auto">
                        <div className="flex flex-col gap-y-1">
                            {groupMembers.map((m) => {
                                return (
                                    <div
                                        className="flex items-center justify-between min-w-40"
                                        key={`group-member-${m.userId}`}
                                    >
                                        <div className="flex items-center">
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
                                        </div>
                                        {m.role === ConversationRole.ADMIN && (
                                            <ShieldCheck className="text-destructive" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div ref={observerGroupMembersTarget} className="h-1 -mt-1"></div>
                    </div>
                </DrilldownMenuItem>
            </DrilldownMenuContent>

            {isAdmin && (
                <DrilldownMenuContent id="add-members" position="bottom-left">
                    <span
                        className={`absolute top-2 right-2 ${
                            groupMembersToAdd.length > 0
                                ? 'text-primary cursor-pointer'
                                : 'text-gray cursor-not-allowed'
                        }`}
                        onClick={() => groupMembersToAdd.length > 0 && handleAddGroupMembers()}
                    >
                        Thêm
                    </span>
                    <DrilldownMenuItem submenu="root">←</DrilldownMenuItem>
                    <DrilldownMenuItem>
                        <div>
                            <input
                                className="border px-2 py-1 text-sm placeholder:text-sm rounded-3xl w-full"
                                placeholder="Tìm kiếm thành viên"
                            />
                            <div className="mt-2 flex flex-col gap-y-2">
                                {friends
                                    .filter((f) => !groupMembers.find((m) => m.userId === f.userId))
                                    .map((friend) => {
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
                                                    onCheckedChange={() => handleChangeGroupMembersToAdd(friend)}
                                                />
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    </DrilldownMenuItem>
                </DrilldownMenuContent>
            )}

            <Dialog open={showDialogOutGroup} onOpenChange={setShowDialogOutGroup}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Bạn có chắc chắn muốn rời nhóm không</DialogTitle>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="destructive" onClick={handleOutGroup}>
                            Rời nhóm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DrilldownMenuProvider>
    );
}
