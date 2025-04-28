import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import axios from 'axios';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string);

    const isImage = file.type.startsWith('image/');

    const uploadUrl = isImage
        ? `${process.env.NEXT_PUBLIC_CLOUDINARY_URL}/image/upload`
        : `${process.env.NEXT_PUBLIC_CLOUDINARY_URL}/raw/upload`;

    // formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_KEY as string);
    // formData.append('public_id', `file_${Date.now()}`);
    // formData.append('timestamp', (Date.now() / 1000).toString());

    try {
        const res = await axios.post(uploadUrl, formData);
        return {
            fileUrl: res.data?.secure_url,
            fileName: res.data?.original_filename,
        };
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
    }
};

interface Crop {
    x: number;
    y: number;
    width: number;
    height: number;
}

export const getCroppedImg = (imageSrc: string, crop: Crop): Promise<string> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = imageSrc;

        image.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                return reject(new Error('Canvas context is not available'));
            }

            canvas.width = crop.width;
            canvas.height = crop.height;

            ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);

            canvas.toBlob((blob) => {
                if (!blob) {
                    return reject(new Error('Canvas is empty'));
                }

                const fileUrl = URL.createObjectURL(blob);
                resolve(fileUrl);
            }, 'image/jpeg');
        };

        image.onerror = () => reject(new Error('Failed to load image'));
    });
};

export const convertSecondsToTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedHours = hours > 0 ? `${String(hours).padStart(2, '0')}:` : '';
    return `${formattedHours}${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

export const getTimeFromISO = (isoString: string | Date) => {
    const date = new Date(isoString);

    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();
    const milliseconds = date.getUTCMilliseconds();

    return { year, month, day, hours, minutes, seconds, milliseconds };
};

export const padNumber = (number: number | string, length = 2) => {
    return number.toString().padStart(length, '0');
};

export const getFileType = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();

    if (!extension) return 'file';

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) return 'image';
    if (['doc', 'docx'].includes(extension)) return 'word';
    if (['xls', 'xlsx'].includes(extension)) return 'excel';
    if (['pdf'].includes(extension)) return 'pdf';
    if (['ppt', 'pptx'].includes(extension)) return 'powerpoint';
    if (['zip', 'rar', '7z'].includes(extension)) return 'archive';

    return 'file';
};
