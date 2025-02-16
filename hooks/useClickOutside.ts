import { RefObject, useEffect } from 'react';

const useClickOutside = <T extends HTMLElement = HTMLElement>(
    ref: RefObject<T | null> | RefObject<T | null>[],
    callback: () => void,
) => {
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;

            const isOutside = Array.isArray(ref)
                ? ref.filter((r) => Boolean(r.current)).every((r) => r.current && !r.current.contains(target))
                : ref.current && !ref.current.contains(target);

            if (isOutside) callback();
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [ref, callback]);
};

export default useClickOutside;
