import { cn } from '@/lib/utils';
import React, { ChangeEventHandler, memo, TextareaHTMLAttributes, useEffect, useRef } from 'react';

const Textarea = memo(
    ({
        text,
        className,
        rows,
        placeholder,
        isFocus,
        handleChange,
        ...props
    }: {
        text: string;
        className?: string;
        rows?: number;
        placeholder?: string;
        isFocus?: boolean;
        handleChange: ChangeEventHandler<HTMLTextAreaElement>;
    } & TextareaHTMLAttributes<HTMLTextAreaElement>) => {
        const textareaRef = useRef<HTMLTextAreaElement>(null);

        const adjustHeight = () => {
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            }
        };

        useEffect(() => {
            if (textareaRef.current) {
                adjustHeight();
            }
        }, [text]);

        useEffect(() => {
            if (isFocus && textareaRef.current) {
                setTimeout(() => {
                    textareaRef.current?.focus();
                }, 0);
            }
        }, [isFocus]);

        return (
            <textarea
                ref={textareaRef}
                value={text}
                rows={rows || 1}
                className={cn(
                    'flex w-full bg-transparent p-0 text-base placeholder:text-muted-foreground md:text-sm resize-none',
                    className,
                )}
                placeholder={placeholder}
                onChange={handleChange}
                {...props}
            />
        );
    },
);

Textarea.displayName = 'Textarea';

export default Textarea;
