'use client';

import Image from 'next/image';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { LikeIcon, LoveIcon, LoveLoveIcon, HaHaIcon, WowIcon, SadIcon, AngryIcon } from '@/app/components/Icons';
import { ChatCircle, ChatCircleDots, Share, ShareFat } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import styles from './Post.module.css';
import clsx from 'clsx';
import { PostInfoType } from '@/app/dataType';

export default function PostContent({
    postInfo,
    handleShowDialogPost,
}: {
    postInfo: PostInfoType;
    handleShowDialogPost: () => void;
}) {
    const t = useTranslations();

    const maxVisibleImages = 4;
    let visibleImages;
    let remainingImages = 0;
    if (postInfo.images && postInfo.images.length > maxVisibleImages) {
        visibleImages = postInfo.images.slice(0, maxVisibleImages);
        remainingImages = postInfo.images.length - maxVisibleImages + 1;
    } else if (postInfo.images) {
        visibleImages = [...postInfo.images];
    }

    return (
        <div className="overflow-auto">
            <div className="flex items-center">
                <Image
                    className="rounded-full w-10 h-10 me-2"
                    src="/images/default-avatar.png"
                    alt="avatar"
                    width={800}
                    height={800}
                />
                <div>
                    <div className="text-foreground">
                        {postInfo.creatorInfo.lastName} {postInfo.creatorInfo.firstName}
                    </div>
                    <div className="text-gray text-xs">6 ngày trước</div>
                </div>
            </div>
            {postInfo.content && <div className="mt-2" dangerouslySetInnerHTML={{ __html: postInfo.content }}></div>}
            {visibleImages && (
                <PhotoProvider>
                    <div
                        className={clsx('mt-2', styles['images-layout'], {
                            [styles[`layout-${visibleImages?.length}`]]: remainingImages <= 0,
                            [styles[`layout-remaining`]]: remainingImages > 0,
                        })}
                    >
                        {postInfo.images?.map((img: string, index: number) => {
                            return (
                                <PhotoView key={`image-${index}`} src={img}>
                                    <div className={clsx(styles['image-wrapper'])}>
                                        {index <= 3 &&
                                            (remainingImages > 0 && index === 3 ? (
                                                <div className={clsx(styles['overlay'])}>+{remainingImages}</div>
                                            ) : (
                                                <Image
                                                    className={clsx(styles['image'])}
                                                    src={img}
                                                    alt="image"
                                                    width={8000}
                                                    height={8000}
                                                />
                                            ))}
                                    </div>
                                </PhotoView>
                            );
                        })}
                    </div>
                </PhotoProvider>
            )}
            <div className="flex justify-between mt-3">
                <div className="flex items-center">
                    <LoveIcon />
                    <span className="text-gray ms-1 text-sm">1</span>
                </div>
                <div className="flex items-center">
                    <div className="flex items-center group cursor-pointer" onClick={handleShowDialogPost}>
                        <ChatCircleDots className="w-4 h-4" />
                        <span className="text-gray ms-1 text-sm group-hover:underline">0 {t('Post.comments')}</span>
                    </div>
                    <div className="flex items-center ms-4 group cursor-pointer">
                        <Share className="w-4 h-4" />
                        <span className="text-gray ms-1 text-sm group-hover:underline">0 {t('Post.shares')}</span>
                    </div>
                </div>
            </div>
            <div className="border-t mt-3 flex">
                <div className="group flex-1 flex justify-center items-center py-2 hover:bg-input rounded-2xl cursor-pointer relative">
                    <LoveIcon width={20} height={20} />
                    <span className="text-gray ms-1 text-md">Haha</span>
                    <div className="absolute flex -top-9 left-0 bg-background py-1 px-2 gap-x-2 border shadow-md rounded-full opacity-0 group-hover:opacity-100 group-hover:flex transition-opacity duration-300 ease-in-out ">
                        <div className="w-7">
                            <LikeIcon width={28} height={28} />
                        </div>
                        <div className="w-7">
                            <LoveIcon width={28} height={28} />
                        </div>
                        <div className="w-7">
                            <LoveLoveIcon width={28} height={28} />
                        </div>
                        <div className="w-7">
                            <HaHaIcon width={28} height={28} />
                        </div>
                        <div className="w-7">
                            <WowIcon width={28} height={28} />
                        </div>
                        <div className="w-7">
                            <SadIcon width={28} height={28} />
                        </div>
                        <div className="w-7">
                            <AngryIcon width={28} height={28} />
                        </div>
                    </div>
                </div>

                <div
                    className="flex-1 flex justify-center items-center py-2 hover:bg-input rounded-2xl cursor-pointer"
                    onClick={handleShowDialogPost}
                >
                    <ChatCircle className="w-5 h-5" />
                    <span className="text-gray ms-1 text-md">{t('Post.comment')}</span>
                </div>
                <div className="flex-1 flex justify-center items-center py-2 hover:bg-input rounded-2xl cursor-pointer">
                    <ShareFat className="w-5 h-5" />
                    <span className="text-gray ms-1 text-md">{t('Post.share')}</span>
                </div>
            </div>
        </div>
    );
}
