import { useEffect } from 'react';
import { useSocket } from './SocketProvider';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { ConversationType, setCallData, selectCallData, clearCallData } from '@/lib/slices/conversationSlice';
import { UserInfoType } from '@/app/dataType';
import { PhoneCall, PhoneOff } from 'lucide-react';
import { useLocale } from 'next-intl';
import { selectUserInfo } from '@/lib/slices/userSlice';

export default function CallProvider() {
    const socket = useSocket();
    const dispatch = useAppDispatch();
    const locale = useLocale();

    const callData = useAppSelector(selectCallData);
    const userInfo = useAppSelector(selectUserInfo);

    // For the caller and receiver
    useEffect(() => {
        if (callData?.token) {
            const callingWindow = window.open(`/${locale}/calling`, '_blank', 'width=800,height=600');

            if (callingWindow) {
                callingWindow.onload = function () {
                    setTimeout(() => {
                        const token = callData.token;
                        callingWindow.postMessage({ token, userId: userInfo.id }, '*');
                    }, 100);
                };
            }
        }
    }, [locale, callData?.token, userInfo.id]);

    useEffect(() => {
        const handleEndCall = () => {
            dispatch(clearCallData());
        };

        socket.on('call:end', handleEndCall);

        return () => {
            socket.off('call:end', handleEndCall);
        };
    }, [socket, dispatch]);

    // For the caller
    useEffect(() => {
        const handleGetCallerToken = ({ roomId, token }: { roomId: string; token: string }) => {
            dispatch(setCallData({ token, roomId }));
        };

        socket.on('callerToken', handleGetCallerToken);

        return () => {
            socket.off('callerToken', handleGetCallerToken);
        };
    }, [socket, dispatch]);

    // For the receiver
    useEffect(() => {
        const handleCallIncoming = ({
            roomId,
            conversationType,
            callerInfo,
            conversationName,
        }: {
            roomId: string;
            conversationType: ConversationType;
            callerInfo: UserInfoType;
            conversationName: string;
        }) => {
            // Participated in other calls
            if (callData?.token) {
                socket.emit('call:busy', callerInfo.userId);
            } else {
                dispatch(setCallData({ roomId, conversationType, callerInfo, conversationName }));
            }
        };

        const handleJoinCall = (token: string) => {
            dispatch(setCallData({ token }));
        };

        socket.on('call:incoming', handleCallIncoming);
        socket.on('call:join', handleJoinCall);

        return () => {
            socket.off('call:incoming', handleCallIncoming);
            socket.on('call:join', handleJoinCall);
        };
    }, [socket, dispatch, callData?.token]);

    const handleAnswerCall = () => {
        socket.emit('call:answer', callData?.roomId);
    };

    const handleRefuseCall = () => {
        if (callData?.conversationType === ConversationType.PRIVATE) {
            socket.emit('call:refuse', callData?.callerInfo?.userId);
        }

        dispatch(clearCallData());
    };

    return (
        !callData?.token &&
        callData?.callerInfo && (
            <div className="fixed top-0 left-1/2 -translate-x-1/2 bg-foreground z-[999999999999] text-white p-2 rounded-md min-w-80">
                <div className="text-center">
                    <b className="text-primary text-lg">
                        {callData?.callerInfo?.lastName} {callData?.callerInfo?.firstName}
                    </b>{' '}
                    đang gọi{' '}
                    {callData?.conversationType === ConversationType.PRIVATE
                        ? 'cho bạn'
                        : `nhóm ${callData?.conversationName}`}
                </div>
                <div className="flex justify-center items-center gap-x-3 mt-1">
                    <div
                        className="bg-[#33d457] w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
                        onClick={handleAnswerCall}
                    >
                        <PhoneCall />
                    </div>
                    <div
                        className="bg-destructive w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
                        onClick={handleRefuseCall}
                    >
                        <PhoneOff />
                    </div>
                </div>
            </div>
        )
    );
}
