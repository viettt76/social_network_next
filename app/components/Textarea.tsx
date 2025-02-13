import { cn } from '@/lib/utils';
import { ChangeEventHandler, memo, useEffect, useRef } from 'react';

const Textarea = memo(
    ({
        text,
        className,
        rows,
        placeholder,
        handleChange,
    }: {
        text: string;
        className?: string;
        rows?: number;
        placeholder?: string;
        handleChange: ChangeEventHandler<HTMLTextAreaElement>;
    }) => {
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
            />
        );
    },
);

Textarea.displayName = 'Textarea';

export default Textarea;
