'use client';

import Image from 'next/image';
import { ImageSquare, Newspaper, Users } from '@phosphor-icons/react';
import { ChangeEvent, useEffect, useState } from 'react';
import { Ellipsis, Pencil, Trash2 } from 'lucide-react';
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
import { changeInformationService, getUserInfoService } from '@/lib/services/userService';
import { cn, getCroppedImg, uploadToCloudinary } from '@/lib/utils';
import Cropper from 'react-easy-crop';
import { startLoadingApp, stopLoadingApp } from '@/lib/slices/loadingSlice';
import { Link, usePathname } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Crop {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface UserInfoType {
    firstName: string;
    lastName: string;
    avatar: string | null;
    isPrivate: boolean | null;
}

export default function ProfileHeader() {
    const pathname = usePathname();
    const { userId } = useParams();

    const PROFILE_TABS = [
        { href: `/profile/${userId ?? ''}`, icon: Newspaper, label: 'Dòng thời gian' },
        { href: `/profile/friends/${userId ?? ''}`, icon: Users, label: 'Bạn bè' },
        { href: `/profile/images/${userId ?? ''}`, icon: ImageSquare, label: 'Ảnh' },
    ];

    const dispatch = useAppDispatch();
    const currentUserInfo = useAppSelector(selectUserInfo);

    const [userInfo, setUserInfo] = useState<UserInfoType>();

    const [updateAvatar, setUpdateAvatar] = useState<string>('');
    const [showModalUpdateAvatar, setShowModalUpdateAvatar] = useState(false);

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Crop | null>(null);

    useEffect(() => {
        if (!userId) {
            const { firstName, lastName, avatar, isPrivate } = currentUserInfo;
            setUserInfo({ firstName, lastName, avatar, isPrivate });
        } else if (typeof userId === 'string') {
            (async () => {
                const { data } = await getUserInfoService(userId);
                setUserInfo({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    avatar: data.avatar,
                    isPrivate: data.isPrivate,
                });
            })();
        }
    }, [userId, currentUserInfo]);

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
            const imageUrl = (await uploadToCloudinary(file))?.fileUrl;
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
                        src={userInfo?.avatar || '/images/default-avatar.png'}
                        width={800}
                        height={800}
                        alt="avatar"
                    />
                    <div className="text-3xl -translate-y-4 font-semibold text-background drop-shadow-2xl">
                        {userInfo?.lastName} {userInfo?.firstName}
                    </div>
                </div>
                {!userId && (
                    <>
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
                                                background: `linear-gradient(to right, #3b82f6 ${
                                                    (zoom - 1) * 50
                                                }%, #d1d5db ${(zoom - 1) * 50}%)`,
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
                    </>
                )}
            </div>
            <div className="flex w-full justify-between mt-10 bg-background rounded-xl items-center">
                <div className="flex-1 flex items-center">
                    {PROFILE_TABS.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <Link
                                href={tab.href}
                                className={cn(
                                    'py-2 px-6 flex items-center cursor-pointer hover:bg-primary rounded-lg hover:text-background',
                                    pathname === tab.href && 'bg-primary text-background',
                                )}
                                key={`profile-tab-${tab.label}`}
                            >
                                <Icon className="me-2" />
                                {tab.label}
                            </Link>
                        );
                    })}
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Ellipsis className="me-4 cursor-pointer" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuGroup>
                            <Link href="/profile/deleted-posts">
                                <DropdownMenuItem>
                                    Bài viết đã xoá
                                    <DropdownMenuShortcut>
                                        <Trash2 />
                                    </DropdownMenuShortcut>
                                </DropdownMenuItem>
                            </Link>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
