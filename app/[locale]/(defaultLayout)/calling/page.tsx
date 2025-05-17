'use client';

import {
    ControlBar,
    GridLayout,
    LiveKitRoom,
    ParticipantTile,
    RoomAudioRenderer,
    useRoomContext,
    useTracks,
    VideoTrack,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useEffect, useRef, useState } from 'react';
import { useSocket } from '@/app/components/SocketProvider';
import { useAppDispatch } from '@/lib/hooks';
import type { TrackReference, TrackReferenceOrPlaceholder } from '@livekit/components-core';

function isTrackReference(t: TrackReference | TrackReferenceOrPlaceholder): t is TrackReference {
    return !!t.publication && !!t.publication.track;
}

export default function CallingWindow() {
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
}

function MyVideoConference({ userId }) {
    const dispatch = useAppDispatch();
    const socket = useSocket();
    const room = useRoomContext();

    const [isScreenFull, setIsScreenFull] = useState(false);
    const screenRef = useRef<HTMLVideoElement | null>(null);

    const cameraTracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }], { onlySubscribed: false });

    const screenTracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }], {
        onlySubscribed: true,
    });

    const screenTrack = screenTracks.find(isTrackReference);

    const handleToggleFullscreen = () => {
        setIsScreenFull((prev) => !prev);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsScreenFull(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        const handleClose = () => {
            if (window.opener) window.close();
        };

        const handleUnload = () => {
            socket.emit('call:end', userId);
        };

        socket.on('call:end', handleClose);
        room.on('disconnected', handleClose);
        window.addEventListener('beforeunload', handleUnload);

        return () => {
            socket.off('call:end', handleClose);
            room.off('disconnected', handleClose);
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, [room, socket, dispatch, userId]);

    return (
        <>
            {screenTrack && isScreenFull && (
                <div className="fixed inset-0 z-50 bg-black">
                    <VideoTrack
                        trackRef={screenTrack}
                        className="w-full h-full object-contain"
                        ref={screenRef}
                        onDoubleClick={handleToggleFullscreen}
                    />
                    <button
                        onClick={handleToggleFullscreen}
                        className="absolute top-4 right-4 z-50 bg-white text-black px-3 py-1 rounded"
                    >
                        Thoát full màn hình
                    </button>
                </div>
            )}
            {!isScreenFull && (
                <div className="flex">
                    {screenTrack && (
                        <div className="w-[70vw] bg-black">
                            <VideoTrack
                                trackRef={screenTrack}
                                className="w-full h-full object-contain"
                                ref={screenRef}
                                onDoubleClick={handleToggleFullscreen}
                            />
                        </div>
                    )}

                    <GridLayout
                        tracks={cameraTracks}
                        className={`${screenTrack ? 'w-[30vw]' : 'w-[100vw]'}`}
                        style={{ height: 'calc(100vh - 5rem)' }}
                    >
                        <ParticipantTile />
                    </GridLayout>
                </div>
            )}
        </>
    );
}
