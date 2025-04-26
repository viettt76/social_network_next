'use client';

import Image from 'next/image';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { ChatCircle, ChatCircleDots, ThumbsUp } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import styles from './Post.module.css';
import { cn } from '@/lib/utils';
import {
    PostInfoType,
    ReactionNameType,
    PostReactionType,
    ReactionTypeColor,
    ReactionTypeIcon,
    ReactionTypeName,
} from '@/app/dataType';
import {
    bookmarkPostService,
    deletePostService,
    reactToPostService,
    unbookmarkPostService,
} from '@/lib/services/postService';
import { useAppSelector } from '@/lib/hooks';
import { selectPostReactionType } from '@/lib/slices/reactionTypeSlice';
import { createElement, Dispatch, SetStateAction, useState } from 'react';
import { Link } from '@/i18n/routing';
import { Bookmark, BookmarkMinus, Ellipsis, Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { selectUserInfo } from '@/lib/slices/userSlice';
import { toast } from 'sonner';

export default function PostContent({
    postInfo,
    postReactions,
    mostReactions,
    currentReaction,
    commentsCount,
    setCurrentReaction,
    handleShowDialogPost,
}: {
    postInfo: PostInfoType;
    postReactions: PostReactionType[];
    mostReactions: ReactionNameType[];
    currentReaction: ReactionNameType | null;
    commentsCount: number;
    setCurrentReaction: Dispatch<SetStateAction<ReactionNameType | null>>;
    handleShowDialogPost: () => void;
}) {
    const t = useTranslations();
    const userInfo = useAppSelector(selectUserInfo);

    const maxVisibleImages = 4;
    let visibleImages;
    let remainingImages = 0;
    if (postInfo.images && postInfo.images.length > maxVisibleImages) {
        visibleImages = postInfo.images.slice(0, maxVisibleImages);
        remainingImages = postInfo.images.length - maxVisibleImages + 1;
    } else if (postInfo.images) {
        visibleImages = [...postInfo.images];
    }

    const [showListReactions, setShowListReactions] = useState(false);
    const postReactionType = useAppSelector(selectPostReactionType);

    const [showDialogDeletePost, setShowDialogDeletePost] = useState(false);

    const handleReactToPost = async (reactionType: ReactionNameType | null) => {
        try {
            setCurrentReaction(reactionType);
            setShowListReactions(false);
            await reactToPostService({ postId: postInfo.postId, posterId: postInfo.creatorInfo.userId, reactionType });
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeletePost = async () => {
        try {
            await deletePostService(postInfo.postId);
            setShowDialogDeletePost(false);
            toast.success('Xoá bài viết thành công', {
                duration: 2500,
            });
        } catch (error) {
            console.error(error);
            toast.error('Xoá bài viết thất bại', {
                duration: 2500,
            });
        }
    };

    const handleBookmarkPost = async () => {
        try {
            await bookmarkPostService(postInfo.postId);
            toast.success('Lưu bài viết thành công', {
                duration: 2500,
            });
        } catch (error) {
            console.error(error);
            toast.error('Lưu bài viết thất bại', {
                duration: 2500,
            });
        }
    };

    const handleUnbookmarkPost = async () => {
        try {
            await unbookmarkPostService(postInfo.postId);
            toast.success('Bỏ lưu bài viết thành công', {
                duration: 2500,
            });
        } catch (error) {
            console.error(error);
            toast.error('Bỏ lưu bài viết thất bại', {
                duration: 2500,
            });
        }
    };

    const MENU_MY_POST = [[{ icon: Trash2, label: 'Xoá bài viết', callback: () => setShowDialogDeletePost(true) }]];

    const MENU_OTHER_POST = [
        [
            postInfo.isBookmarked
                ? { icon: BookmarkMinus, label: 'Bỏ lưu bài viết', callback: handleUnbookmarkPost }
                : { icon: Bookmark, label: 'Lưu bài viết', callback: handleBookmarkPost },
        ],
    ];

    const MENU_POST: {
        icon?: React.FC<any>;
        label: string;
        callback?: () => void;
    }[][] = userInfo.id === postInfo.creatorInfo.userId ? MENU_MY_POST : MENU_OTHER_POST;

    return (
        <div className="overflow-auto">
            <div className="flex items-center relative">
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

                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <div className="absolute top-0 right-2 cursor-pointer">
                            <Ellipsis />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        {MENU_POST.map((submenu, subIndex) => {
                            return (
                                <div key={`post-${postInfo.postId}-menu-group-${subIndex}`}>
                                    <DropdownMenuGroup>
                                        {submenu.map((item, itemIndex) => {
                                            const Icon = item.icon;

                                            return (
                                                <DropdownMenuItem
                                                    key={`post-${postInfo.postId}-submenu-group-${subIndex}-${itemIndex}`}
                                                    onClick={item.callback}
                                                >
                                                    {item.label}
                                                    {Icon && (
                                                        <DropdownMenuShortcut>
                                                            <Icon />
                                                        </DropdownMenuShortcut>
                                                    )}
                                                </DropdownMenuItem>
                                            );
                                        })}
                                    </DropdownMenuGroup>
                                    {subIndex !== MENU_POST.length - 1 && <DropdownMenuSeparator />}
                                </div>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <Dialog open={showDialogDeletePost} onOpenChange={setShowDialogDeletePost}>
                <DialogTrigger asChild></DialogTrigger>
                <DialogContent className="w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="text-center mb-3">Xóa bài viết?</DialogTitle>
                        <DialogDescription>
                            Nếu bạn xóa bài viết này, mọi cảm xúc và bình luận trên đó cũng sẽ không còn nữa. Nếu bạn
                            cần lưu trữ nội dung này, hãy chụp ảnh màn hình trước khi xóa.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowDialogDeletePost(false)}>
                            Huỷ
                        </Button>
                        <Button className="w-28" onClick={handleDeletePost}>
                            Xoá
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
                                    {index <= 3 ? (
                                        <div className={cn(styles['image-wrapper'])}>
                                            {remainingImages > 0 && index === 3 ? (
                                                <div className={cn(styles['overlay'])}>+{remainingImages}</div>
                                            ) : (
                                                <Image
                                                    className={cn(styles['image'])}
                                                    src={img}
                                                    alt="image"
                                                    width={8000}
                                                    height={8000}
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <div></div>
                                    )}
                                </PhotoView>
                            );
                        })}
                    </div>
                </PhotoProvider>
            )}
            <div className="flex justify-between mt-3">
                <div className="flex items-center">
                    {postReactions.length > 0 && (
                        <>
                            {mostReactions.length > 0 && createElement(ReactionTypeIcon[mostReactions[0]])}
                            {mostReactions.length > 1 && createElement(ReactionTypeIcon[mostReactions[1]])}
                            <span className="text-gray ms-1 text-sm">{postReactions.length}</span>
                        </>
                    )}
                </div>
                <div className="flex items-center">
                    <div className="flex items-center group cursor-pointer" onClick={handleShowDialogPost}>
                        <ChatCircleDots className="w-4 h-4" />
                        <span className="text-gray ms-1 text-sm group-hover:underline">
                            {commentsCount || 0} {t('Post.comments')}
                        </span>
                    </div>
                    {/* <div className="flex items-center ms-4 group cursor-pointer">
                        <Share className="w-4 h-4" />
                        <span className="text-gray ms-1 text-sm group-hover:underline">0 {t('Post.shares')}</span>
                    </div> */}
                </div>
            </div>
            <div className="border-t mt-3 flex">
                <div
                    className="flex-1 hover:bg-input rounded-2xl cursor-pointer relative"
                    onMouseEnter={() => setShowListReactions(true)}
                    onMouseLeave={() => setShowListReactions(false)}
                >
                    <div className={cn('relative', showListReactions && styles['post-list-reactions'])}>
                        {currentReaction ? (
                            <div
                                className="flex items-center flex justify-center items-center py-2"
                                onClick={() => handleReactToPost(null)}
                            >
                                {createElement(ReactionTypeIcon[currentReaction], {
                                    width: 20,
                                    height: 20,
                                })}
                                <span className="ms-1 text-md" style={{ color: ReactionTypeColor[currentReaction] }}>
                                    {ReactionTypeName[currentReaction]}
                                </span>
                            </div>
                        ) : (
                            <div
                                className="flex items-center flex justify-center items-center py-2"
                                onClick={() => handleReactToPost('LIKE')}
                            >
                                <ThumbsUp className="me-1 text-xl" /> <span className="text-gray text-md">Thích</span>
                            </div>
                        )}
                    </div>
                    <div
                        className={cn(
                            `absolute flex -top-9 left-0 bg-background py-1 px-2 gap-x-2 border shadow-md rounded-full transition-opacity duration-300 ease-in-out ${
                                showListReactions
                                    ? 'opacity-100 visibility-visible'
                                    : 'visibility-hidden opacity-0 pointer-events-none'
                            }`,
                        )}
                    >
                        {Object.keys(postReactionType).map((reactionType) => {
                            const Icon = ReactionTypeIcon[reactionType];
                            return (
                                <div
                                    className="w-7"
                                    key={reactionType}
                                    onClick={() => handleReactToPost(reactionType as ReactionNameType)}
                                >
                                    <Icon width={28} height={28} />
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div
                    className="flex-1 flex justify-center items-center py-2 hover:bg-input rounded-2xl cursor-pointer"
                    onClick={handleShowDialogPost}
                >
                    <ChatCircle className="w-5 h-5" />
                    <span className="text-gray ms-1 text-md">{t('Post.comment')}</span>
                </div>
                {/* <div className="flex-1 flex justify-center items-center py-2 hover:bg-input rounded-2xl cursor-pointer">
                    <ShareFat className="w-5 h-5" />
                    <span className="text-gray ms-1 text-md">{t('Post.share')}</span>
                </div> */}
            </div>
        </div>
    );
}
