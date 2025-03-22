'use client';

import { useSocket } from '@/app/components/SocketProvider';
import { useAppDispatch } from '@/lib/hooks';
import { clearCallData } from '@/lib/slices/conversationSlice';
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
    const [callToken, setCallToken] = useState('');

    useEffect(() => {
        window.addEventListener('message', (event) => {
            const { token } = event.data;
            setCallToken(token);
        });
    }, []);

    return (
        <div className="fixed inset-0" style={{ zIndex: 9999999999 }}>
            <LiveKitRoom
                video={false}
                audio={false}
                token={callToken}
                serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                data-lk-theme="default"
                style={{ height: '100vh' }}
            >
                <MyVideoConference />
                <RoomAudioRenderer />
                <ControlBar />
            </LiveKitRoom>
        </div>
    );
};

function MyVideoConference() {
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
            dispatch(clearCallData());
            if (window.opener) {
                window.close();
            }
        };
        room.on('disconnected', handleClose);

        return () => {
            room.off('disconnected', handleClose);
        };
    }, [room, socket, dispatch]);

    return (
        <GridLayout tracks={tracks} style={{ height: 'calc(100vh - 10rem)' }}>
            <ParticipantTile />
        </GridLayout>
    );
}

export default CallingWindow;
