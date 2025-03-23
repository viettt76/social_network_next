'use client';

import { useSocket } from '@/app/components/SocketProvider';
import { useAppDispatch } from '@/lib/hooks';
import {
    ControlBar,
    GridLayout,
    LiveKitRoom,
    ParticipantTile,
    RoomAudioRenderer,
    useRoomContext,
    useTracks,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useEffect, useState } from 'react';

const CallingWindow = () => {
    const [callData, setCallData] = useState({
        token: '',
        userId: '',
    });

    useEffect(() => {
        window.addEventListener('message', (event) => {
            const { token, userId } = event.data;
            setCallData({ token, userId });
        });
    }, []);

    return (
        <div className="fixed inset-0" style={{ zIndex: 9999999999 }}>
            <LiveKitRoom
                video={false}
                audio={false}
                token={callData.token}
                serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                data-lk-theme="default"
                style={{ height: '100vh' }}
            >
                <MyVideoConference userId={callData.userId} />
                <RoomAudioRenderer />
                <ControlBar />
            </LiveKitRoom>
        </div>
    );
};

function MyVideoConference({ userId }) {
    const dispatch = useAppDispatch();
    const socket = useSocket();

    const room = useRoomContext();

    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: true },
            { source: Track.Source.ScreenShare, withPlaceholder: false },
        ],
        { onlySubscribed: false },
    );

    useEffect(() => {
        const handleClose = () => {
            socket.emit('call:end', userId);

            if (window.opener) {
                window.close();
            }
        };

        socket.on('call:end', handleClose);

        room.on('disconnected', handleClose);

        return () => {
            room.off('disconnected', handleClose);
            socket.off('call:end', handleClose);
        };
    }, [room, socket, dispatch, userId]);

    return (
        <GridLayout tracks={tracks} style={{ height: 'calc(100vh - 10rem)' }}>
            <ParticipantTile />
        </GridLayout>
    );
}

export default CallingWindow;
