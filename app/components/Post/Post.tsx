'use client';

import { CommentType, PostInfoType } from '@/app/dataType';
import { useState } from 'react';
import PostContent from './PostContent';
import { Modal } from 'flowbite-react';
import Image from 'next/image';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { useTranslations } from 'next-intl';

const Comment = ({ comment }: { comment: CommentType }) => {
    return (
        <div className="flex mt-2" key={`comment-${comment.commentId}`}>
            <Image
                className="rounded-full w-10 h-10 me-3 object-cover"
                src={comment.commenterInfo.avatar || '/images/default-avatar.png'}
                width={800}
                height={800}
                alt=""
            />
            <div>
                <div className="text-sm font-bold">
                    {comment.commenterInfo.lastName} {comment.commenterInfo.firstName}
                </div>
                {comment.content && <div className="text-sm">{comment.content}</div>}
                {comment.image && (
                    <PhotoProvider>
                        <PhotoView src={comment.image}>
                            <Image
                                className="object-container h-40 w-fit rounded-xl"
                                src={comment.image}
                                width={800}
                                height={800}
                                alt=""
                            />
                        </PhotoView>
                    </PhotoProvider>
                )}
                {comment.commentChild && comment.commentChild.length > 0 && (
                    <div>
                        {comment.commentChild.map((commentChild: CommentType) => (
                            <Comment comment={commentChild} key={`comment-${commentChild.commentId}`} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default function Post({ postInfo }: { postInfo: PostInfoType }) {
    const t = useTranslations();

    const [isShowPostDialog, setIsShowPostDialog] = useState(false);
    const handleShowDialogPost = () => setIsShowPostDialog(true);
    const handleHideDialogPost = () => setIsShowPostDialog(false);

    const [comments, setComments] = useState<CommentType[]>([
        {
            commentId: '1',
            commenterInfo: {
                userId: '1',
                firstName: 'Việt',
                lastName: 'Hoàng',
                avatar: 'https://kynguyenlamdep.com/wp-content/uploads/2022/08/anh-anime-toc-hong-cute.jpg',
            },
            content: 'Chào mọi người',
            image: 'https://kynguyenlamdep.com/wp-content/uploads/2022/08/anh-anime-toc-hong-cute.jpg',
            commentChild: [
                {
                    commentId: '3',
                    commenterInfo: {
                        userId: '2',
                        firstName: 'Linh',
                        lastName: 'Vũ',
                        avatar: '/images/default-avatar.png',
                    },
                    content: 'Chào Việt',
                    image: 'https://cdn.donmai.us/sample/27/08/__kamisato_ayaka_genshin_impact_drawn_by_re0n__sample-270877f9d8f1c566c1a9e245b4890ffc.jpg',
                    commentChild: [
                        {
                            commentId: '4',
                            commenterInfo: {
                                userId: '1',
                                firstName: 'Việt',
                                lastName: 'Hoàng',
                                avatar: 'https://kynguyenlamdep.com/wp-content/uploads/2022/08/anh-anime-toc-hong-cute.jpg',
                            },
                            content: 'Hi',
                            image: 'https://th.bing.com/th/id/OIP.2Cp3FVsgVWkcDTwBeEdnuQHaHa?w=1536&h=1536&rs=1&pid=ImgDetMain',
                        },
                    ],
                },
            ],
        },
        {
            commentId: '2',
            commenterInfo: {
                userId: '2',
                firstName: 'Linh',
                lastName: 'Vũ',
                avatar: '/images/default-avatar.png',
            },
            content: 'Chào mọi người',
            image: 'https://img3.thuthuatphanmem.vn/uploads/2019/06/13/anh-nen-anime-cho-may-tinh-dep_095239016.jpg',
        },
    ]);

    return (
        <div className="bg-background rounded-xl px-2 py-2 mb-4">
            <PostContent postInfo={postInfo} handleShowDialogPost={handleShowDialogPost} />
            <Modal className="bg-foreground/50" dismissible show={isShowPostDialog} onClose={handleHideDialogPost}>
                <Modal.Body className="p-4">
                    <PostContent postInfo={postInfo} handleShowDialogPost={handleShowDialogPost} />
                    <div className="border-t pt-1">
                        {comments?.map((comment: CommentType) => (
                            <Comment comment={comment} key={`comment-${comment.commentId}`} />
                        ))}
                    </div>
                </Modal.Body>
                <Modal.Footer className="px-4 py-2">
                    <input
                        className="border w-full rounded-3xl py-1 px-4 outline-gray"
                        placeholder={`${t('Post.writeComment')}...`}
                    />
                </Modal.Footer>
            </Modal>
        </div>
    );
}
