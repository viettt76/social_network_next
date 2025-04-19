import { PostManagementType } from '@/app/dataType';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import styles from '@/app/components/Post/Post.module.css';
import { Button } from '@/components/ui/button';

export default function PostManagement({
    postInfo,
    handleApprovePost,
    handleRejectPost,
}: {
    postInfo: PostManagementType;
    handleApprovePost: (postId: string) => void;
    handleRejectPost?: (postId: string) => void;
}) {
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
        <div className="bg-background rounded-xl px-2 py-2 mb-4">
            <div className="overflow-auto">
                <div className="flex items-center">
                    <Link href={`/profile/${postInfo.creatorInfo.userId}`}>
                        <Image
                            className="rounded-full w-10 h-10 me-2 border"
                            src="/images/default-avatar.png"
                            alt="avatar"
                            width={800}
                            height={800}
                        />
                    </Link>
                    <div>
                        <Link className="text-foreground" href={`/profile/${postInfo.creatorInfo.userId}`}>
                            {postInfo.creatorInfo.lastName} {postInfo.creatorInfo.firstName}
                        </Link>
                        <div className="text-gray text-xs">6 ngày trước</div>
                    </div>
                </div>
                {postInfo.content && <div className="mt-2 whitespace-pre-line">{postInfo.content}</div>}
                {visibleImages && (
                    <PhotoProvider>
                        <div
                            className={cn('mt-2', styles['images-layout'], {
                                [styles[`layout-${visibleImages?.length}`]]: remainingImages <= 0,
                                [styles[`layout-remaining`]]: remainingImages > 0,
                            })}
                        >
                            {postInfo.images?.map((img: string, index: number) => {
                                return (
                                    <PhotoView key={`image-${index}`} src={img}>
                                        <div className={cn(styles['image-wrapper'])}>
                                            {index <= 3 &&
                                                (remainingImages > 0 && index === 3 ? (
                                                    <div className={cn(styles['overlay'])}>+{remainingImages}</div>
                                                ) : (
                                                    <Image
                                                        className={cn(styles['image'])}
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
            </div>
            <div className="flex gap-x-4 mt-6 pt-2 border-t">
                {handleRejectPost && (
                    <Button className="flex-1" variant="destructive" onClick={() => handleRejectPost(postInfo.postId)}>
                        Từ chối
                    </Button>
                )}
                <Button className="flex-1" onClick={() => handleApprovePost(postInfo.postId)}>
                    Phê duyệt
                </Button>
            </div>
        </div>
    );
}
