'use client';

import Image from 'next/image';
import { ImageSquare, Newspaper, Users } from '@phosphor-icons/react';
import { ChangeEvent, useState } from 'react';
import { Pencil } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectUserInfo, setInfo } from '@/lib/slices/userSlice';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { changeInformationService } from '@/lib/services/userService';
import { getCroppedImg, uploadToCloudinary } from '@/lib/utils';
import Cropper from 'react-easy-crop';
import { startLoadingApp, stopLoadingApp } from '@/lib/slices/loadingSlice';
import { Link } from '@/i18n/routing';

interface Crop {
    x: number;
    y: number;
    width: number;
    height: number;
}

export default function ProfileHeader() {
    const dispatch = useAppDispatch();
    const userInfo = useAppSelector(selectUserInfo);

    const [updateAvatar, setUpdateAvatar] = useState<string>('');
    const [showModalUpdateAvatar, setShowModalUpdateAvatar] = useState(false);

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Crop | null>(null);

    const handleChooseFile = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = (event) => {
                if (typeof event.target?.result === 'string') {
                    setUpdateAvatar(event.target.result);
                    setShowModalUpdateAvatar(true);
                }
            };

            reader.readAsDataURL(file);
        }
    };

    const handleHideModalUpdateAvatar = () => setShowModalUpdateAvatar(false);

    const onCropComplete = (croppedArea, croppedAreaPixels: Crop) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleChangeAvatar = async () => {
        try {
            if (!croppedAreaPixels) return;

            dispatch(startLoadingApp());
            const croppedImage = await getCroppedImg(updateAvatar, croppedAreaPixels);
            const file = await fetch(croppedImage)
                .then((res) => res.blob())
                .then((blob) => new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' }));
            const imageUrl = await uploadToCloudinary(file);
            await changeInformationService({ avatar: imageUrl });

            dispatch(setInfo({ avatar: imageUrl }));
            handleHideModalUpdateAvatar();
        } catch (error) {
            console.error('Failed to crop image', error);
        } finally {
            dispatch(stopLoadingApp());
        }
    };

    return (
        <div className="max-w-[1024px] mx-auto">
            <div
                className="bg-norepeat bg-center relative h-36 rounded-ee-lg rounded-es-lg drop-shadow-xl"
                style={{
                    background: 'url("/images/logo.png")',
                }}
            >
                <div className="flex items-center absolute -bottom-6 left-6">
                    <Image
                        className="w-32 h-32 rounded-full me-3 border"
                        src={userInfo.avatar || '/images/default-avatar.png'}
                        width={800}
                        height={800}
                        alt="avatar"
                    />
                    <div className="text-3xl -translate-y-4 font-semibold text-background drop-shadow-2xl">
                        {userInfo.lastName} {userInfo.firstName}
                    </div>
                </div>
                <label
                    htmlFor="change-avatar-input"
                    className="bg-background w-fit rounded-full p-2 absolute bottom-4 right-2 cursor-pointer"
                >
                    <Pencil className="w-4 h-4" />
                </label>
                <input type="file" id="change-avatar-input" hidden onChange={handleChooseFile} />
                <AlertDialog open={showModalUpdateAvatar} onOpenChange={setShowModalUpdateAvatar}>
                    <AlertDialogContent className="p-2">
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                <div className="text-center">Chỉnh sửa ảnh đại diện</div>
                            </AlertDialogTitle>
                        </AlertDialogHeader>
                        <div className="h-[28rem] relative">
                            <div className="absolute inset-0 bottom-20">
                                <Cropper
                                    image={updateAvatar}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={setZoom}
                                    cropShape="round"
                                    showGrid={false}
                                />
                            </div>
                            <div className="absolute bottom-9 left-1/2 w-1/2 -translate-x-1/2 h-10 flex items-center">
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full h-1 appearance-none bg-gray-300 [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent 
                                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full
                                            [&::-webkit-slider-thumb]:bg-primary"
                                    style={{
                                        background: `linear-gradient(to right, #3b82f6 ${(zoom - 1) * 50}%, #d1d5db ${
                                            (zoom - 1) * 50
                                        }%)`,
                                    }}
                                />
                            </div>
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleChangeAvatar}>Save</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
            <div className="w-full flex items-center bg-background mt-10 rounded-xl">
                <Link
                    href="/profile"
                    className="py-2 px-6 flex items-center cursor-pointer hover:bg-primary rounded-xl hover:text-background"
                >
                    <Newspaper className="me-2" />
                    Dòng thời gian
                </Link>
                <Link
                    href="/profile/friends"
                    className="py-2 px-6 flex items-center cursor-pointer hover:bg-primary rounded-xl hover:text-background"
                >
                    <Users className="me-2" />
                    Bạn bè
                </Link>
                <Link
                    href="/profile/images"
                    className="py-2 px-6 flex items-center cursor-pointer hover:bg-primary rounded-xl hover:text-background"
                >
                    <ImageSquare className="me-2" />
                    Ảnh
                </Link>
            </div>
        </div>
    );
}
