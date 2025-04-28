import wordIcon from '@/public/icons/word.svg';
import excelIcon from '@/public/icons/excel.svg';
import pdfIcon from '@/public/icons/pdf.svg';
import fileAltIcon from '@/public/icons/file.svg';
import Image from 'next/image';

export enum FileType {
    FILE = 'file',
    IMAGE = 'image',
    WORD = 'word',
    EXDEL = 'excel',
    PDF = 'pdf',
    POWERPOINT = 'powerpoint',
    ARCHIVE = 'archive',
}

export default function FileIcon({ type }: { type: string }) {
    switch (type) {
        case FileType.WORD:
            return <Image priority src={wordIcon} className="w-6 h-6 text-blue-500 text-3xl" alt="Word" />;
        case FileType.EXDEL:
            return <Image priority src={excelIcon} className="w-6 h-6 text-green-500 text-3xl" alt="Excel" />;
        case FileType.PDF:
            return <Image priority src={pdfIcon} className="w-6 h-6 text-red-500 text-3xl" alt="Pdf" />;
        default:
            return <Image priority src={fileAltIcon} className="w-6 h-6 text-gray-500 text-3xl" alt="File" />;
    }
}
