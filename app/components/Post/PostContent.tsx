'use client';

import Image from 'next/image';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { LikeIcon, LoveIcon, LoveLoveIcon, HaHaIcon, WowIcon, SadIcon, AngryIcon } from '@/app/components/Icons';
import { MessageCircle, MessageSquareMore, Share, SquareArrowOutUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import styles from './Post.module.css';
import clsx from 'clsx';
import Link from 'next/link';
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
    if (postInfo.pictures && postInfo.pictures.length > maxVisibleImages) {
        visibleImages = postInfo.pictures.slice(0, maxVisibleImages - 1);
        remainingImages = postInfo.pictures.length - maxVisibleImages + 1;
    } else if (postInfo.pictures) {
        visibleImages = [...postInfo.pictures];
    }

    return (
        <div className="overflow-auto">
            <div className="flex items-center">
                <Image
                    className="rounded-full w-10 h-10 me-2"
                    src="/images/default-avatar.png"
                    alt="avatar"
                    width={32}
                    height={32}
                />
                <div>
                    <div className="text-primary">
                        {postInfo.creatorInfo.lastName} {postInfo.creatorInfo.firstName}
                    </div>
                    <div className="text-gray text-xs">6 ngày trước</div>
                </div>
            </div>
            <div className="mt-2">{postInfo.content}</div>
            {visibleImages && (
                <PhotoProvider>
                    <div
                        className={clsx(styles['images-layout'], {
                            [styles[`layout-${visibleImages?.length}`]]: remainingImages <= 0,
                            [styles[`layout-remaining`]]: remainingImages > 0,
                        })}
                    >
                        {visibleImages?.map((img, i) => {
                            return (
                                <PhotoView key={`picture-${i}`} src={img}>
                                    <div className={clsx(styles['image-wrapper'])}>
                                        <Image
                                            className={clsx(styles['image'])}
                                            src={img}
                                            alt="image"
                                            width={8000}
                                            height={8000}
                                        />
                                    </div>
                                </PhotoView>
                            );
                        })}
                        {remainingImages > 0 && (
                            <Link href={''} tabIndex={-1} className={clsx(styles['overlay'])}>
                                +{remainingImages}
                            </Link>
                        )}
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
                        <MessageCircle className="w-4 h-4" />
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
                    <MessageSquareMore className="w-5 h-5" />
                    <span className="text-gray ms-1 text-md">{t('Post.comment')}</span>
                </div>
                <div className="flex-1 flex justify-center items-center py-2 hover:bg-input rounded-2xl cursor-pointer">
                    <SquareArrowOutUpRight className="w-5 h-5" />
                    <span className="text-gray ms-1 text-md">{t('Post.share')}</span>
                </div>
            </div>
        </div>
    );
}
