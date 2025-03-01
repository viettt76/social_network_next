'use client';

import { getUserImagesService } from '@/lib/services/userService';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';

export default function ProfileOtherImages() {
    const { userId } = useParams<{ userId: string }>();

    const [images, setImages] = useState<
        {
            postId: string;
            imageUrl: string;
        }[]
    >([]);

    useEffect(() => {
        (async () => {
            try {
                if (userId) {
                    const { data } = await getUserImagesService(userId);
                    setImages(data);
                }
            } catch (error) {
                console.error(error);
            }
        })();
    }, [userId]);

    return (
        <PhotoProvider>
            <div className="grid grid-cols-4 gap-2 mt-4 pb-4">
                {images?.map((image) => {
                    return (
                        <PhotoView key={`image-${image.imageUrl}`} src={image.imageUrl}>
                            <Image
                                className="object-cover w-full h-full rounded-lg border h-80 cursor-pointer"
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
