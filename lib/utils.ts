import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import axios from 'axios';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const uploadToCloudinary = async (image: File) => {
    const formData = new FormData();

    formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_KEY as string);
    formData.append('file', image);
    formData.append('public_id', `file_${Date.now()}`);
    formData.append('timestamp', (Date.now() / 1000).toString());
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string);

    try {
        const res = await axios.post(process.env.NEXT_PUBLIC_CLOUDINARY_URL as string, formData);
        return res.data?.secure_url;
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
    }
};

export const convertSecondsToTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedHours = hours > 0 ? `${String(hours).padStart(2, '0')}:` : '';
    return `${formattedHours}${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};
