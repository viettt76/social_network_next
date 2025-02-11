import { useEffect, useRef } from 'react';

interface UseInfiniteScrollProps {
    callback: () => void;
    threshold?: number;
    loading: boolean;
}

const useInfiniteScroll = ({ callback, threshold = 0.5, loading }: UseInfiniteScrollProps) => {
    const observerTarget = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading) {
                    callback();
                }
            },
            { threshold },
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [callback, threshold, loading]);

    return { observerTarget };
};

export default useInfiniteScroll;
