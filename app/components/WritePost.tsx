'use client';

import Image from 'next/image';
import { Modal } from 'flowbite-react';
import { Button } from '@/components/ui/button';
import { ChangeEvent, MouseEvent, useRef, useState, WheelEvent } from 'react';
import { Images, X } from 'lucide-react';
import { cn, uploadToCloudinary } from '@/lib/utils';
import { createPostService } from '@/lib/services/postService';
import { useAppDispatch } from '@/lib/hooks';
import { startLoadingApp, stopLoadingApp } from '@/lib/slices/loadingSlice';
import Textarea from '@/app/components/Textarea';

export default function WritePost() {
    const dispatch = useAppDispatch();

    const [openModal, setOpenModal] = useState(false);

    const [postContent, setPostContent] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [imagesUpload, setImagesUpload] = useState<File[]>([]);

    const imageWrapperRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setPostContent(e.target.value);
    };

    const handleChooseFile = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (files) {
            const imagesArray = Array.from(files).map((file) => {
                return URL.createObjectURL(file);
            });

            setImages([...images, ...imagesArray]);
            setImagesUpload([...imagesUpload, ...files]);
        }
    };

    const handleDelete = (index: number) => {
        setImages((prev) => {
            return [...prev.slice(0, index), ...prev.slice(index + 1)];
        });
        setImagesUpload((prev) => {
            return [...prev.slice(0, index), ...prev.slice(index + 1)];
        });
    };

    const handleSubmitPost = async () => {
        dispatch(startLoadingApp());
        try {
            const imageUrls = await Promise.all(
                imagesUpload.map(async (image) => {
                    return (await uploadToCloudinary(image))?.fileUrl;
                }),
            );

            await createPostService({ content: postContent, images: imageUrls });
            setOpenModal(false);
            setPostContent('');
            setImages([]);
            setImagesUpload([]);
        } catch (error) {
            console.error(error);
        } finally {
            dispatch(stopLoadingApp());
        }
    };

    // Scroll horizontal
    const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
        if (e.shiftKey && imageWrapperRef.current) {
            e.preventDefault();
            imageWrapperRef.current.scrollBy({
                left: e.deltaY * 1.8,
                behavior: 'smooth',
            });
        }
    };

    const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
        if (!imageWrapperRef.current) return;

        setIsDragging(true);
        setStartX(event.pageX - imageWrapperRef.current.offsetLeft);
        setScrollLeft(imageWrapperRef.current.scrollLeft);
    };

    const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !imageWrapperRef.current) return;

        event.preventDefault();
        const x = event.pageX - imageWrapperRef.current.offsetLeft;
        const walk = x - startX;
        imageWrapperRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    return (
        <div>
            <div className="bg-background rounded-xl flex items-center" onClick={() => setOpenModal(true)}>
                <Image
                    className="rounded-full w-8 h-8 m-2 me-1 border"
                    src="/images/default-avatar.png"
                    alt="avatar"
                    width={800}
                    height={800}
                />
                <div className="text-muted-foreground cursor-pointer hover:bg-input/50 flex-1 rounded-3xl px-3 py-1 me-2">
                    Bạn đang nghĩ gì
                </div>
            </div>
            <Modal className="bg-foreground/50" dismissible show={openModal} onClose={() => setOpenModal(false)}>
                <Modal.Header className="pt-2 pb-0">Write Post</Modal.Header>
                <Modal.Body className="py-2">
                    <div>
                        <Textarea
                            text={postContent}
                            className="max-h-48 outline-none border-none focus:shadow-none focus:ring-transparent"
                            handleChange={handleChange}
                        />

                        <div
                            className={cn(
                                'flex overflow-auto gap-2 scrollbar-none mt-4',
                                isDragging ? 'cursor-grabbing' : 'cursor-grab',
                            )}
                            ref={imageWrapperRef}
                            onWheel={handleWheel}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseLeave}
                        >
                            {images.map((image, index) => (
                                <div key={`image-${index}`} className="min-w-52 w-52 h-72 relative rounded-xl">
                                    <Image
                                        className="w-52 h-72 object-cover rounded-xl border"
                                        src={image}
                                        alt="image"
                                        width={800}
                                        height={800}
                                        draggable={false}
                                    />
                                    <div
                                        className="absolute top-2 right-2 bg-muted-foreground/70 rounded-full p-1 cursor-pointer"
                                        onClick={() => handleDelete(index)}
                                    >
                                        <X className="text-background w-5 h-5" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <label htmlFor="write-post-select-file" className="mt-2 block w-fit cursor-pointer">
                        <Images className="text-[#41b35d]" />
                    </label>
                    <input type="file" multiple hidden id="write-post-select-file" onChange={handleChooseFile} />
                    <Button
                        onClick={handleSubmitPost}
                        className="w-full mt-3"
                        disabled={!postContent.trim() && imagesUpload.length === 0}
                    >
                        Tạo
                    </Button>
                </Modal.Body>
            </Modal>
        </div>
    );
}
