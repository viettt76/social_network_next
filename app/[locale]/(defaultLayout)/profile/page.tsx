'use client';

import Image from 'next/image';
import { ImageSquare, Newspaper, Users } from '@phosphor-icons/react';

export default function Profile() {
    return (
        <div className="bg-input">
            <div className="max-w-[1024px] mx-auto">
                <div
                    className="bg-norepeat bg-center relative h-36 rounded-ee-lg rounded-es-lg drop-shadow-xl"
                    style={{
                        background: 'url("/images/logo.png")',
                    }}
                >
                    <div className="flex items-center absolute -bottom-6 left-6">
                        <Image
                            className="w-32 h-32 rounded-full me-3"
                            src="/images/default-avatar.png"
                            width={800}
                            height={800}
                            alt="avatar"
                        />
                        <div className="text-3xl -translate-y-4 font-semibold text-background drop-shadow-2xl">
                            Hoàng Việt
                        </div>
                    </div>
                </div>
                <div className="w-fit flex justify-around items-center bg-background mt-10 rounded-xl">
                    <div className="py-2 px-6 flex items-center cursor-pointer hover:bg-primary rounded-xl hover:text-background">
                        <Newspaper className="me-2" />
                        Dòng thời gian
                    </div>
                    <div className="py-2 px-6 flex items-center cursor-pointer hover:bg-primary rounded-xl hover:text-background">
                        <Users className="me-2" />
                        Bạn bè
                    </div>
                    <div className="py-2 px-6 flex items-center cursor-pointer hover:bg-primary rounded-xl hover:text-background">
                        <ImageSquare className="me-2" />
                        Ảnh
                    </div>
                </div>
                <div className="mt-6 flex">
                    <div className="bg-background py-2 px-4">
                        <div className="font-semibold text-xl">Giới thiệu</div>
                        <div></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
