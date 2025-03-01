'use client';

import { useAppSelector } from '@/lib/hooks';
import { getUserImagesService } from '@/lib/services/userService';
import { selectUserInfo } from '@/lib/slices/userSlice';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';

export default function ProfileImages() {
    const userInfo = useAppSelector(selectUserInfo);

    const [images, setImages] = useState<
        {
            postId: string;
            imageUrl: string;
        }[]
    >([]);

    useEffect(() => {
        (async () => {
            try {
                if (userInfo.id) {
                    const { data } = await getUserImagesService(userInfo.id);
                    setImages(data);
                }
            } catch (error) {
                console.error(error);
            }
        })();
    }, [userInfo.id]);

    return (
        <PhotoProvider>
            <div className="grid grid-cols-4 gap-2 mt-4 pb-4">
                {images?.map((image) => {
                    return (
                        <PhotoView key={`image-${image.imageUrl}`} src={image.imageUrl}>
                            <Image
                                className="object-cover w-full h-full rounded-lg h-80 cursor-pointer"
                                src={image.imageUrl}
                                alt="image"
                                width={800}
                                height={800}
                                key={`image-${image.imageUrl}`}
                            />
                        </PhotoView>
                    );
                })}
            </div>
        </PhotoProvider>
    );
}
