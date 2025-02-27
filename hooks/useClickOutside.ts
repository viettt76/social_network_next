import { RefObject, useEffect } from 'react';

const useClickOutside = <T extends HTMLElement = HTMLElement>(
    refs: RefObject<T | null> | RefObject<T | null>[],
    callback: () => void,
) => {
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;

            const refArray = Array.isArray(refs) ? refs : [refs];

            setTimeout(() => {
                const isOutside = refArray.every((ref) => !ref.current || !ref.current.contains(target));
                if (isOutside) callback();
            }, 0);
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [refs, callback]);
};

export default useClickOutside;
